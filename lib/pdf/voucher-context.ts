import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { bookings, properties } from "@/db/schema";
import type { BillingIdType } from "@/lib/billing-validation";
import { billingIdTypeLabel } from "@/lib/billing-validation";
import { formatBookingDateRange } from "@/lib/booking-dates";
import { formatBookingReference } from "@/lib/payments/bank-transfer";
import type { PaymentMethod } from "@/lib/payments/types";
import type { PaymentTiming } from "@/lib/payment-schedule";
import { getStayQuoteByPropertyId } from "@/lib/pricing-query";
import { getPropertyBySlug } from "@/lib/properties";
import { REFUNDABLE_GUARANTEE_CENTS, refundableGuaranteeCents } from "@/lib/pricing";
import { siteConfig } from "@/lib/site";

export { REFUNDABLE_GUARANTEE_CENTS };

export type BookingVoucherContext = {
  bookingId: string;
  reference: string;
  issueDate: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guestEmail: string;
  billingName: string;
  billingIdType: BillingIdType;
  billingIdNumber: string;
  billingCity: string;
  lodgingCents: number;
  cleaningFeeCents: number;
  guaranteeCents: number;
  totalCents: number;
  depositCents: number | null;
  balanceCents: number | null;
  paymentMethod: PaymentMethod;
  paymentTiming: PaymentTiming;
  status: string;
  stayDetailLine: string;
};

function formatIssueDate(date: Date): string {
  return date.toLocaleDateString("es-EC", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Guayaquil",
  });
}

function buildStayDetailLine(propertySlug: string, nights: number, guests: number): string {
  const catalog = getPropertyBySlug(propertySlug);
  const hasPool = catalog?.amenities.some((a) => /piscina/i.test(a)) ?? false;
  const poolNote = hasPool ? " · Piscina temperada incluida" : "";
  const guestLabel = guests === 1 ? "1 huésped" : `${guests} huéspedes`;
  return `${nights} ${nights === 1 ? "noche" : "noches"} · ${guestLabel}${poolNote}`;
}

export async function loadBookingVoucherContext(
  bookingId: string,
): Promise<BookingVoucherContext | null> {
  if (!hasDatabase()) return null;

  const db = getDb();
  const [row] = await db
    .select({
      propertySlug: properties.slug,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      guests: bookings.guests,
      guestEmail: bookings.guestEmail,
      totalCents: bookings.totalCents,
      depositCents: bookings.depositCents,
      balanceCents: bookings.balanceCents,
      paymentMethod: bookings.paymentMethod,
      paymentTiming: bookings.paymentTiming,
      status: bookings.status,
      billingName: bookings.billingName,
      billingIdType: bookings.billingIdType,
      billingIdNumber: bookings.billingIdNumber,
      billingCity: bookings.billingCity,
      propertyId: bookings.propertyId,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (
    !row?.guestEmail ||
    !row.billingName ||
    !row.billingIdType ||
    !row.billingIdNumber ||
    !row.billingCity
  ) {
    return null;
  }

  const quote = await getStayQuoteByPropertyId(
    row.propertyId,
    row.checkIn,
    row.checkOut,
  );
  const catalog = getPropertyBySlug(row.propertySlug);

  return {
    bookingId,
    reference: formatBookingReference(bookingId),
    issueDate: formatIssueDate(new Date()),
    propertyName: catalog?.name ?? row.propertySlug,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    nights: quote.nights,
    guests: row.guests,
    guestEmail: row.guestEmail,
    billingName: row.billingName,
    billingIdType: row.billingIdType,
    billingIdNumber: row.billingIdNumber,
    billingCity: row.billingCity,
    lodgingCents: quote.nightlyTotalDirectCents,
    cleaningFeeCents: quote.cleaningFeeCents,
    guaranteeCents: refundableGuaranteeCents(row.propertySlug),
    totalCents: row.totalCents,
    depositCents: row.depositCents,
    balanceCents: row.balanceCents,
    paymentMethod: row.paymentMethod,
    paymentTiming: row.paymentTiming,
    status: row.status,
    stayDetailLine: buildStayDetailLine(row.propertySlug, quote.nights, row.guests),
  };
}

export function voucherDateRangeLabel(ctx: BookingVoucherContext): string {
  return formatBookingDateRange(ctx.checkIn, ctx.checkOut);
}

export function voucherBillingIdLabel(ctx: BookingVoucherContext): string {
  return `${billingIdTypeLabel(ctx.billingIdType)} ${ctx.billingIdNumber}`;
}

export function voucherSiteHost(): string {
  try {
    return new URL(siteConfig.url).host.replace(/^www\./, "");
  } catch {
    return "ms-vacations.com";
  }
}
