import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, externalBlocks, properties, propertyNightlyRates } from "@/db/schema";
import { activeBookingStatus } from "@/lib/availability";
import type { AvailabilityBlock } from "@/lib/availability-query";
import { eachDayIsoInclusive } from "@/lib/dates";
import { directPricePerNightCents } from "@/lib/pricing";
import { getPropertyBySlug, PROPERTIES } from "@/lib/properties";
import {
  referenceCentsForNight,
  type PricingDay,
} from "@/lib/pricing-query";

export type CalendarStayBar = {
  id: string;
  start: string;
  end: string;
  source: "external" | "booking";
  label: string;
  status?: string;
  totalCents?: number;
};

export type AdminCalendarProperty = {
  id: string;
  slug: string;
  name: string;
  imageSrc: string;
  baseReferenceCents: number;
  days: PricingDay[];
  bars: CalendarStayBar[];
};

const BOOKING_STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmado",
  pending_verification: "Pendiente verificaciÃ³n",
  pending_payment: "Pendiente pago",
};

function guestLabelFromEmail(email: string | null | undefined): string {
  if (!email) return "HuÃ©sped";
  const local = email.split("@")[0] ?? "HuÃ©sped";
  const parts = local.replace(/[._-]+/g, " ").trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

function barOverlapsRange(start: string, end: string, from: string, to: string): boolean {
  return start < to && end > from;
}

function buildBarsForProperty(
  from: string,
  to: string,
  external: { id: string; startDate: string; endDate: string }[],
  activeBookings: {
    id: string;
    checkIn: string;
    checkOut: string;
    status: string;
    guestEmail: string | null;
    totalCents: number;
  }[],
): CalendarStayBar[] {
  const bars: CalendarStayBar[] = [];

  for (const block of external) {
    if (!barOverlapsRange(block.startDate, block.endDate, from, to)) continue;
    bars.push({
      id: block.id,
      start: block.startDate,
      end: block.endDate,
      source: "external",
      label: "Airbnb",
    });
  }

  for (const b of activeBookings) {
    if (!barOverlapsRange(b.checkIn, b.checkOut, from, to)) continue;
    const statusLabel = BOOKING_STATUS_LABEL[b.status] ?? b.status;
    bars.push({
      id: b.id,
      start: b.checkIn,
      end: b.checkOut,
      source: "booking",
      label: `${guestLabelFromEmail(b.guestEmail)} Â· ${statusLabel}`,
      status: b.status,
      totalCents: b.totalCents,
    });
  }

  return bars.sort((a, b) => a.start.localeCompare(b.start));
}

function buildPricingDays(
  from: string,
  to: string,
  baseReferenceCents: number,
  overrides: Map<string, number>,
  blocks: AvailabilityBlock[],
): PricingDay[] {
  return eachDayIsoInclusive(from, to).map((date) => {
    const { referenceCents, isOverride } = referenceCentsForNight(date, baseReferenceCents, overrides);
    let blockSource: "external" | "booking" | undefined;
    for (const b of blocks) {
      if (b.start <= date && b.end > date) {
        blockSource = b.source;
        break;
      }
    }
    return {
      date,
      referenceCents,
      directCents: directPricePerNightCents(referenceCents),
      isOverride,
      blocked: blockSource !== undefined,
      blockSource,
    };
  });
}

async function loadCalendarBatch(from: string, to: string, propertyIds?: string[]) {
  const db = getDb();
  const propertyRows =
    propertyIds && propertyIds.length > 0
      ? await db.select().from(properties).where(inArray(properties.id, propertyIds))
      : await db.select().from(properties);

  if (propertyRows.length === 0) return [];

  const ids = propertyRows.map((p) => p.id);

  const overrideRows = await db
    .select({
      propertyId: propertyNightlyRates.propertyId,
      date: propertyNightlyRates.date,
      referencePriceCents: propertyNightlyRates.referencePriceCents,
    })
    .from(propertyNightlyRates)
    .where(
      and(
        inArray(propertyNightlyRates.propertyId, ids),
        gte(propertyNightlyRates.date, from),
        lte(propertyNightlyRates.date, to),
      ),
    );

  const overridesByProperty = new Map<string, Map<string, number>>();
  for (const row of overrideRows) {
    let map = overridesByProperty.get(row.propertyId);
    if (!map) {
      map = new Map();
      overridesByProperty.set(row.propertyId, map);
    }
    map.set(row.date, row.referencePriceCents);
  }

  const externalRows = await db
    .select({
      id: externalBlocks.id,
      propertyId: externalBlocks.propertyId,
      startDate: externalBlocks.startDate,
      endDate: externalBlocks.endDate,
    })
    .from(externalBlocks)
    .where(
      and(
        inArray(externalBlocks.propertyId, ids),
        lte(externalBlocks.startDate, to),
        gte(externalBlocks.endDate, from),
      ),
    );

  const bookingRows = await db
    .select({
      id: bookings.id,
      propertyId: bookings.propertyId,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      status: bookings.status,
      guestEmail: bookings.guestEmail,
      totalCents: bookings.totalCents,
    })
    .from(bookings)
    .where(
      and(
        inArray(bookings.propertyId, ids),
        lte(bookings.checkIn, to),
        gte(bookings.checkOut, from),
        activeBookingStatus,
      ),
    );

  const nameBySlug = new Map(PROPERTIES.map((p) => [p.slug, p.name]));
  const imageBySlug = new Map(PROPERTIES.map((p) => [p.slug, p.images[0]?.src ?? "/properties/placeholder-1.svg"]));

  return propertyRows
    .map((prop) => {
      const blocks: AvailabilityBlock[] = [
        ...externalRows
          .filter((e) => e.propertyId === prop.id)
          .map((e) => ({ start: e.startDate, end: e.endDate, source: "external" as const })),
        ...bookingRows
          .filter((b) => b.propertyId === prop.id)
          .map((b) => ({ start: b.checkIn, end: b.checkOut, source: "booking" as const })),
      ];

      const overrides = overridesByProperty.get(prop.id) ?? new Map();
      const days = buildPricingDays(from, to, prop.basePricePerNightCents, overrides, blocks);

      const bars = buildBarsForProperty(
        from,
        to,
        externalRows.filter((e) => e.propertyId === prop.id),
        bookingRows.filter((b) => b.propertyId === prop.id),
      );

      return {
        id: prop.id,
        slug: prop.slug,
        name: nameBySlug.get(prop.slug) ?? prop.slug,
        imageSrc: imageBySlug.get(prop.slug) ?? "/properties/placeholder-1.svg",
        baseReferenceCents: prop.basePricePerNightCents,
        days,
        bars,
      } satisfies AdminCalendarProperty;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function getAdminMultiCalendar(from: string, to: string): Promise<AdminCalendarProperty[] | null> {
  if (!hasDatabase()) return null;
  return loadCalendarBatch(from, to);
}

export async function getAdminPropertyCalendar(
  propertyId: string,
  from: string,
  to: string,
): Promise<AdminCalendarProperty | null> {
  if (!hasDatabase()) return null;
  const rows = await loadCalendarBatch(from, to, [propertyId]);
  return rows[0] ?? null;
}

export function getAdminCalendarPropertyMeta(slug: string) {
  const catalog = getPropertyBySlug(slug);
  if (!catalog) return null;
  return {
    slug: catalog.slug,
    name: catalog.name,
    imageSrc: catalog.images[0]?.src ?? "/properties/placeholder-1.svg",
  };
}

export type AdminCalendarPropertyMeta = NonNullable<ReturnType<typeof getAdminCalendarPropertyMeta>>;

export function listAdminCalendarProperties(): AdminCalendarPropertyMeta[] {
  return PROPERTIES.map((p) => ({
    slug: p.slug,
    name: p.name,
    imageSrc: p.images[0]?.src ?? "/properties/placeholder-1.svg",
  })).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

