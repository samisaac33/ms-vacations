import { asc, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { promotionalVatPeriods } from "@/db/schema";
import { type VatPeriod, vatPeriodOverlaps } from "@/lib/legal/hospitality-vat";

export type PromotionalVatPeriodRow = {
  id: string;
  label: string | null;
  startDate: string;
  endDate: string;
};

let cachedPeriods: VatPeriod[] | null = null;
let cacheAt = 0;
const CACHE_TTL_MS = 60_000;

function rowToVatPeriod(row: PromotionalVatPeriodRow): VatPeriod {
  return {
    start: row.startDate,
    end: row.endDate,
    label: row.label ?? `${row.startDate} – ${row.endDate}`,
  };
}

function invalidateCache(): void {
  cachedPeriods = null;
  cacheAt = 0;
}

function isMissingDbRelationError(e: unknown): boolean {
  if (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "42P01") {
    return true;
  }
  const msg = e instanceof Error ? e.message : String(e);
  return msg.includes("does not exist") || msg.includes("42P01");
}

export async function listPromotionalVatPeriodRows(): Promise<PromotionalVatPeriodRow[]> {
  if (!hasDatabase()) return [];
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: promotionalVatPeriods.id,
        label: promotionalVatPeriods.label,
        startDate: promotionalVatPeriods.startDate,
        endDate: promotionalVatPeriods.endDate,
      })
      .from(promotionalVatPeriods)
      .orderBy(asc(promotionalVatPeriods.startDate));
    return rows;
  } catch (e) {
    if (isMissingDbRelationError(e)) return [];
    throw e;
  }
}

export async function loadPromotionalVatPeriods(): Promise<VatPeriod[]> {
  if (!hasDatabase()) return [];
  if (cachedPeriods && Date.now() - cacheAt < CACHE_TTL_MS) {
    return cachedPeriods;
  }
  const rows = await listPromotionalVatPeriodRows();
  cachedPeriods = rows.map(rowToVatPeriod);
  cacheAt = Date.now();
  return cachedPeriods;
}

export async function addPromotionalVatPeriod(params: {
  startDate: string;
  endDate: string;
  label?: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!hasDatabase()) return { ok: false, reason: "Base de datos no configurada" };
  if (params.startDate > params.endDate) {
    return { ok: false, reason: "La fecha de inicio debe ser anterior o igual a la de fin." };
  }

  const existing = await listPromotionalVatPeriodRows();
  const candidate: VatPeriod = {
    start: params.startDate,
    end: params.endDate,
    label: params.label?.trim() || `${params.startDate} – ${params.endDate}`,
  };
  if (existing.some((row) => vatPeriodOverlaps(candidate, rowToVatPeriod(row)))) {
    return { ok: false, reason: "El período se solapa con uno existente." };
  }

  const db = getDb();
  await db.insert(promotionalVatPeriods).values({
    label: params.label?.trim() || null,
    startDate: params.startDate,
    endDate: params.endDate,
  });
  invalidateCache();
  return { ok: true };
}

export async function deletePromotionalVatPeriod(
  id: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!hasDatabase()) return { ok: false, reason: "Base de datos no configurada" };
  const db = getDb();
  const deleted = await db.delete(promotionalVatPeriods).where(eq(promotionalVatPeriods.id, id)).returning({
    id: promotionalVatPeriods.id,
  });
  if (deleted.length === 0) return { ok: false, reason: "Período no encontrado" };
  invalidateCache();
  return { ok: true };
}

export function buildPromotionalVatPeriodsSummary(periods: VatPeriod[]): string {
  if (periods.length === 0) return "ninguno configurado";
  return periods
    .map((p) => `${p.label}: ${p.start} a ${p.end}`)
    .join("; ");
}
