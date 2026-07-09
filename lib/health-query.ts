import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties, syncLogs } from "@/db/schema";
import {
  type HealthPropertyIcal,
  type HealthReport,
  hoursSince,
  isIcalSyncStale,
  resolveHealthStatus,
} from "@/lib/health";

const APP_VERSION = process.env.npm_package_version ?? "0.1.0";

async function checkDatabase(): Promise<HealthReport["checks"]["database"]> {
  if (!hasDatabase()) {
    return { ok: false, error: "DATABASE_URL no configurada" };
  }

  const started = Date.now();
  try {
    const db = getDb();
    await db.execute(sql`select 1`);
    return { ok: true, latencyMs: Date.now() - started };
  } catch (e) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function checkIcal(now = new Date()): Promise<HealthReport["checks"]["ical"]> {
  if (!hasDatabase()) {
    return {
      ok: false,
      propertyCount: 0,
      staleCount: 0,
      neverSyncedCount: 0,
      lastErrorAt: null,
      recentErrorCount: 0,
      properties: [],
    };
  }

  const db = getDb();
  const rows = await db
    .select({
      slug: properties.slug,
      lastIcalSyncAt: properties.lastIcalSyncAt,
    })
    .from(properties);

  const propertyChecks: HealthPropertyIcal[] = rows.map((row) => {
    const stale = isIcalSyncStale(row.lastIcalSyncAt, now);
    return {
      slug: row.slug,
      lastSyncAt: row.lastIcalSyncAt?.toISOString() ?? null,
      stale,
      hoursSinceSync: hoursSince(row.lastIcalSyncAt, now),
    };
  });

  const staleCount = propertyChecks.filter((p) => p.stale && p.lastSyncAt !== null).length;
  const neverSyncedCount = propertyChecks.filter((p) => p.lastSyncAt === null).length;

  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentErrors = await db
    .select({
      createdAt: syncLogs.createdAt,
    })
    .from(syncLogs)
    .where(and(eq(syncLogs.level, "error"), gte(syncLogs.createdAt, since)))
    .orderBy(desc(syncLogs.createdAt))
    .limit(50);

  const [lastError] = await db
    .select({ createdAt: syncLogs.createdAt })
    .from(syncLogs)
    .where(eq(syncLogs.level, "error"))
    .orderBy(desc(syncLogs.createdAt))
    .limit(1);

  const icalOk = staleCount === 0 && neverSyncedCount === 0 && recentErrors.length === 0;

  return {
    ok: icalOk,
    propertyCount: propertyChecks.length,
    staleCount,
    neverSyncedCount,
    lastErrorAt: lastError?.createdAt?.toISOString() ?? null,
    recentErrorCount: recentErrors.length,
    properties: propertyChecks,
  };
}

export async function getHealthReport(): Promise<HealthReport> {
  const now = new Date();
  const database = await checkDatabase();
  const ical = database.ok ? await checkIcal(now) : {
    ok: false,
    propertyCount: 0,
    staleCount: 0,
    neverSyncedCount: 0,
    lastErrorAt: null,
    recentErrorCount: 0,
    properties: [],
  };
  const cron = { configured: Boolean(process.env.CRON_SECRET) };

  const status = resolveHealthStatus(
    database.ok,
    ical.staleCount,
    ical.neverSyncedCount,
    ical.recentErrorCount,
  );

  return {
    status,
    timestamp: now.toISOString(),
    version: APP_VERSION,
    checks: {
      database,
      ical,
      cron,
    },
  };
}
