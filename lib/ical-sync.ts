import { eq } from "drizzle-orm";
import ical from "node-ical";
import { getDb } from "@/db/index";
import { externalBlocks, properties, syncLogs } from "@/db/schema";

function formatDateGuayaquil(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: "America/Guayaquil" });
}

function formatUtcYmd(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toJsDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string" || typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

/** Convierte DTSTART/DTEND iCal a YYYY-MM-DD sin desfase por zona horaria en eventos DATE. */
function toCivilDateFromIcal(value: unknown): string | null {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const d = toJsDate(value);
  if (!d) return null;
  // node-ical representa VALUE=DATE como medianoche UTC
  if (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0
  ) {
    return formatUtcYmd(d);
  }
  return formatDateGuayaquil(d);
}

function extractRange(ev: Record<string, unknown>): { uid: string; start: string; end: string } | null {
  if (ev.type !== "VEVENT") return null;

  const status = String(ev.status ?? "").toUpperCase();
  if (status === "CANCELLED") return null;

  const startStr = toCivilDateFromIcal(ev.start);
  let endStr = toCivilDateFromIcal(ev.end);
  if (!startStr || !endStr) return null;

  if (endStr <= startStr) {
    const d = toJsDate(ev.end) ?? toJsDate(ev.start);
    if (d) {
      const bumped = new Date(d);
      bumped.setUTCDate(bumped.getUTCDate() + 1);
      endStr = formatUtcYmd(bumped);
    }
  }

  const uid = String(ev.uid ?? `gen-${startStr}-${endStr}`);
  return { uid, start: startStr, end: endStr };
}

export async function syncPropertyIcal(propertyId: string): Promise<void> {
  const db = getDb();
  const [prop] = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  if (!prop) {
    throw new Error("Propiedad no encontrada");
  }

  let body: string;
  try {
    const res = await fetch(prop.icalUrl, { cache: "no-store" });
    body = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (e) {
    await db.insert(syncLogs).values({
      propertyId,
      level: "error",
      message: `Fetch iCal falló: ${e instanceof Error ? e.message : String(e)}`,
    });
    throw e;
  }

  const parsed = ical.parseICS(body);
  const ranges: { uid: string; start: string; end: string }[] = [];
  for (const key of Object.keys(parsed)) {
    const ev = parsed[key] as Record<string, unknown>;
    const range = extractRange(ev);
    if (range) ranges.push(range);
  }

  const deduped = new Map<string, { uid: string; start: string; end: string }>();
  for (const r of ranges) deduped.set(r.uid, r);
  const uniqueRanges = [...deduped.values()];

  await db.transaction(async (tx) => {
    await tx.delete(externalBlocks).where(eq(externalBlocks.propertyId, propertyId));
    if (uniqueRanges.length > 0) {
      await tx.insert(externalBlocks).values(
        uniqueRanges.map((r) => ({
          propertyId,
          uid: r.uid,
          startDate: r.start,
          endDate: r.end,
        })),
      );
    }
    await tx
      .update(properties)
      .set({ lastIcalSyncAt: new Date() })
      .where(eq(properties.id, propertyId));
  });

  await db.insert(syncLogs).values({
    propertyId,
    level: "info",
    message: `Sync iCal: ${uniqueRanges.length} bloques importados.`,
  });
}

export async function syncAllPropertiesIcal(): Promise<{ synced: number; failed: number }> {
  const db = getDb();
  const all = await db.select({ id: properties.id }).from(properties);
  let synced = 0;
  let failed = 0;
  for (const row of all) {
    try {
      await syncPropertyIcal(row.id);
      synced += 1;
    } catch {
      failed += 1;
    }
  }
  return { synced, failed };
}
