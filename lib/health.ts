/** Horas sin sync antes de marcar iCal como desactualizado (cron diario + margen). */
export const ICAL_STALE_HOURS = 26;

export type HealthStatus = "ok" | "degraded" | "down";

export type HealthPropertyIcal = {
  slug: string;
  lastSyncAt: string | null;
  stale: boolean;
  hoursSinceSync: number | null;
};

export type HealthReport = {
  status: HealthStatus;
  timestamp: string;
  version: string;
  checks: {
    database: {
      ok: boolean;
      latencyMs?: number;
      error?: string;
    };
    ical: {
      ok: boolean;
      propertyCount: number;
      staleCount: number;
      neverSyncedCount: number;
      lastErrorAt: string | null;
      recentErrorCount: number;
      properties: HealthPropertyIcal[];
    };
    cron: {
      configured: boolean;
    };
  };
};

export function hoursSince(date: Date | null, now = new Date()): number | null {
  if (!date) return null;
  return (now.getTime() - date.getTime()) / (1000 * 60 * 60);
}

export function isIcalSyncStale(
  lastSyncAt: Date | null,
  now = new Date(),
  staleHours = ICAL_STALE_HOURS,
): boolean {
  if (!lastSyncAt) return true;
  const ageHours = hoursSince(lastSyncAt, now);
  return ageHours === null || ageHours > staleHours;
}

export function resolveHealthStatus(
  databaseOk: boolean,
  staleCount: number,
  neverSyncedCount: number,
  recentErrorCount: number,
): HealthStatus {
  if (!databaseOk) return "down";
  if (staleCount > 0 || neverSyncedCount > 0 || recentErrorCount > 0) return "degraded";
  return "ok";
}

export function healthHttpStatus(status: HealthStatus): number {
  return status === "down" ? 503 : 200;
}
