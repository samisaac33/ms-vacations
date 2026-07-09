import { describe, expect, it } from "vitest";
import {
  healthHttpStatus,
  hoursSince,
  isIcalSyncStale,
  resolveHealthStatus,
} from "@/lib/health";

const now = new Date("2026-07-09T12:00:00.000Z");

describe("isIcalSyncStale", () => {
  it("marca como stale si nunca hubo sync", () => {
    expect(isIcalSyncStale(null, now)).toBe(true);
  });

  it("marca como stale si supera el umbral", () => {
    const old = new Date("2026-07-07T00:00:00.000Z");
    expect(isIcalSyncStale(old, now, 26)).toBe(true);
  });

  it("acepta sync reciente dentro del umbral", () => {
    const recent = new Date("2026-07-09T10:00:00.000Z");
    expect(isIcalSyncStale(recent, now, 26)).toBe(false);
  });
});

describe("resolveHealthStatus", () => {
  it("down si la base de datos falla", () => {
    expect(resolveHealthStatus(false, 0, 0, 0)).toBe("down");
  });

  it("degraded con propiedades desactualizadas o errores", () => {
    expect(resolveHealthStatus(true, 1, 0, 0)).toBe("degraded");
    expect(resolveHealthStatus(true, 0, 2, 0)).toBe("degraded");
    expect(resolveHealthStatus(true, 0, 0, 1)).toBe("degraded");
  });

  it("ok cuando todo está sano", () => {
    expect(resolveHealthStatus(true, 0, 0, 0)).toBe("ok");
  });
});

describe("healthHttpStatus", () => {
  it("devuelve 503 solo en down", () => {
    expect(healthHttpStatus("ok")).toBe(200);
    expect(healthHttpStatus("degraded")).toBe(200);
    expect(healthHttpStatus("down")).toBe(503);
  });
});

describe("hoursSince", () => {
  it("calcula horas transcurridas", () => {
    const past = new Date("2026-07-09T06:00:00.000Z");
    expect(hoursSince(past, now)).toBe(6);
  });
});
