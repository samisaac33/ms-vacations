import { count, desc, eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { externalBlocks, properties, syncLogs } from "@/db/schema";
import { formatUsd } from "@/lib/pricing";
import { PROPERTIES } from "@/lib/properties";

export function maskIcalUrl(url: string): string {
  try {
    const u = new URL(url);
    const token = u.searchParams.get("t");
    const file = u.pathname.split("/").pop() ?? "calendar.ics";
    if (token && token.length >= 8) {
      return `…/${file}?t=…${token.slice(-8)}`;
    }
    return `…/${file}`;
  } catch {
    return "URL inválida";
  }
}

export function isValidIcalUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && u.pathname.endsWith(".ics");
  } catch {
    return false;
  }
}

export type AdminPropertyRow = {
  id: string;
  slug: string;
  name: string;
  icalUrl: string;
  icalUrlMasked: string;
  lastIcalSyncAt: Date | null;
  blockCount: number;
  priceUsd: number;
};

export type AdminSyncLogRow = {
  id: string;
  level: string;
  message: string;
  createdAt: Date;
  propertySlug: string | null;
};

export async function getAdminIcalDashboard(): Promise<{
  properties: AdminPropertyRow[];
  logs: AdminSyncLogRow[];
} | null> {
  if (!hasDatabase()) return null;

  const db = getDb();
  const propertyRows = await db.select().from(properties);
  const blockCounts = await db
    .select({ propertyId: externalBlocks.propertyId, blockCount: count() })
    .from(externalBlocks)
    .groupBy(externalBlocks.propertyId);

  const countByProperty = new Map(blockCounts.map((r) => [r.propertyId, r.blockCount]));
  const nameBySlug = new Map(PROPERTIES.map((p) => [p.slug, p.name]));

  const adminProperties: AdminPropertyRow[] = propertyRows
    .map((row) => {
      const priceUsd = row.basePricePerNightCents / 100;
      return {
        id: row.id,
        slug: row.slug,
        name: nameBySlug.get(row.slug) ?? row.slug,
        icalUrl: row.icalUrl,
        icalUrlMasked: maskIcalUrl(row.icalUrl),
        lastIcalSyncAt: row.lastIcalSyncAt,
        blockCount: countByProperty.get(row.id) ?? 0,
        priceUsd,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));

  const logRows = await db
    .select({
      id: syncLogs.id,
      level: syncLogs.level,
      message: syncLogs.message,
      createdAt: syncLogs.createdAt,
      propertySlug: properties.slug,
    })
    .from(syncLogs)
    .leftJoin(properties, eq(syncLogs.propertyId, properties.id))
    .orderBy(desc(syncLogs.createdAt))
    .limit(20);

  return { properties: adminProperties, logs: logRows };
}
