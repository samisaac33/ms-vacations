import { asc, eq, inArray } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { highSeasonPeriodProperties, highSeasonPeriods, properties } from "@/db/schema";
import { vatPeriodOverlaps } from "@/lib/legal/hospitality-vat";
import type { HighSeasonPeriod } from "@/lib/stay-rules";

export type HighSeasonPeriodRow = {
  id: string;
  label: string | null;
  startDate: string;
  endDate: string;
  minNights: number;
  propertyIds: string[];
};

const MAX_MIN_NIGHTS = 30;

let cachedByProperty = new Map<string, { periods: HighSeasonPeriod[]; at: number }>();
const CACHE_TTL_MS = 60_000;

function invalidateCache(): void {
  cachedByProperty = new Map();
}

function isMissingDbRelationError(e: unknown): boolean {
  if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "42P01") {
    return true;
  }
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("does not exist") || msg.includes("42P01");
}

function rowToHighSeasonPeriod(row: HighSeasonPeriodRow): HighSeasonPeriod {
  return {
    startDate: row.startDate,
    endDate: row.endDate,
    minNights: row.minNights,
    label: row.label,
  };
}

function periodsOverlapForProperty(
  a: { startDate: string; endDate: string; propertyIds: string[] },
  b: { startDate: string; endDate: string; propertyIds: string[] },
): boolean {
  const sharedProperty = a.propertyIds.some((id) => b.propertyIds.includes(id));
  if (!sharedProperty) return false;
  return vatPeriodOverlaps(
    { start: a.startDate, end: a.endDate, label: "" },
    { start: b.startDate, end: b.endDate, label: "" },
  );
}

export async function listHighSeasonPeriodRows(): Promise<HighSeasonPeriodRow[]> {
  if (!hasDatabase()) return [];
  try {
    const db = getDb();
    const periodRows = await db
      .select({
        id: highSeasonPeriods.id,
        label: highSeasonPeriods.label,
        startDate: highSeasonPeriods.startDate,
        endDate: highSeasonPeriods.endDate,
        minNights: highSeasonPeriods.minNights,
      })
      .from(highSeasonPeriods)
      .orderBy(asc(highSeasonPeriods.startDate));

    if (periodRows.length === 0) return [];

    const periodIds = periodRows.map((p) => p.id);
    const propertyRows = await db
      .select({
        periodId: highSeasonPeriodProperties.periodId,
        propertyId: highSeasonPeriodProperties.propertyId,
      })
      .from(highSeasonPeriodProperties)
      .where(inArray(highSeasonPeriodProperties.periodId, periodIds));

    const propertyIdsByPeriod = new Map<string, string[]>();
    for (const row of propertyRows) {
      const list = propertyIdsByPeriod.get(row.periodId) ?? [];
      list.push(row.propertyId);
      propertyIdsByPeriod.set(row.periodId, list);
    }

    return periodRows.map((p) => ({
      id: p.id,
      label: p.label,
      startDate: p.startDate,
      endDate: p.endDate,
      minNights: p.minNights,
      propertyIds: propertyIdsByPeriod.get(p.id) ?? [],
    }));
  } catch (e) {
    if (isMissingDbRelationError(e)) return [];
    throw e;
  }
}

export async function loadHighSeasonPeriodsForProperty(
  propertyId: string,
): Promise<HighSeasonPeriod[]> {
  if (!hasDatabase()) return [];

  const cached = cachedByProperty.get(propertyId);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return cached.periods;
  }

  const rows = await listHighSeasonPeriodRows();
  const periods = rows
    .filter((row) => row.propertyIds.includes(propertyId))
    .map(rowToHighSeasonPeriod);

  cachedByProperty.set(propertyId, { periods, at: Date.now() });
  return periods;
}

export async function loadHighSeasonPeriodsForPropertySlug(
  slug: string,
): Promise<HighSeasonPeriod[]> {
  if (!hasDatabase()) return [];
  const db = getDb();
  const propertyRows = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.slug, slug))
    .limit(1);
  const propertyId = propertyRows[0]?.id;
  if (!propertyId) return [];
  return loadHighSeasonPeriodsForProperty(propertyId);
}

export async function addHighSeasonPeriod(params: {
  startDate: string;
  endDate: string;
  minNights: number;
  label?: string;
  propertyIds: string[];
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!hasDatabase()) return { ok: false, reason: "Base de datos no configurada" };
  if (params.startDate > params.endDate) {
    return { ok: false, reason: "La fecha de inicio debe ser anterior o igual a la de fin." };
  }
  if (!Number.isInteger(params.minNights) || params.minNights < 1) {
    return { ok: false, reason: "El mínimo de noches debe ser al menos 1." };
  }
  if (params.minNights > MAX_MIN_NIGHTS) {
    return { ok: false, reason: `El mínimo de noches no puede superar ${MAX_MIN_NIGHTS}.` };
  }

  const uniquePropertyIds = [...new Set(params.propertyIds.filter(Boolean))];
  if (uniquePropertyIds.length === 0) {
    return { ok: false, reason: "Selecciona al menos una propiedad." };
  }

  const existing = await listHighSeasonPeriodRows();
  const candidate = {
    startDate: params.startDate,
    endDate: params.endDate,
    propertyIds: uniquePropertyIds,
  };
  if (existing.some((row) => periodsOverlapForProperty(candidate, row))) {
    return {
      ok: false,
      reason: "El período se solapa con uno existente para alguna de las propiedades seleccionadas.",
    };
  }

  const db = getDb();
  const [inserted] = await db
    .insert(highSeasonPeriods)
    .values({
      label: params.label?.trim() || null,
      startDate: params.startDate,
      endDate: params.endDate,
      minNights: params.minNights,
    })
    .returning({ id: highSeasonPeriods.id });

  if (!inserted) {
    return { ok: false, reason: "No se pudo crear el período." };
  }

  await db.insert(highSeasonPeriodProperties).values(
    uniquePropertyIds.map((propertyId) => ({
      periodId: inserted.id,
      propertyId,
    })),
  );

  invalidateCache();
  return { ok: true };
}

export async function deleteHighSeasonPeriod(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!hasDatabase()) return { ok: false, reason: "Base de datos no configurada" };
  const db = getDb();
  const deleted = await db
    .delete(highSeasonPeriods)
    .where(eq(highSeasonPeriods.id, id))
    .returning({ id: highSeasonPeriods.id });
  if (deleted.length === 0) return { ok: false, reason: "Período no encontrado" };
  invalidateCache();
  return { ok: true };
}
