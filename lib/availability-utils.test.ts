import { describe, expect, it } from "vitest";
import {
  isNightBlocked,
  rangeOverlapsAny,
  rangesOverlap,
} from "@/lib/availability-utils";

const block = { start: "2026-07-10", end: "2026-07-15" };

describe("rangesOverlap", () => {
  it("detecta solapamiento parcial", () => {
    expect(rangesOverlap("2026-07-12", "2026-07-14", block)).toBe(true);
  });

  it("no solapa si la estancia termina al inicio del bloque", () => {
    expect(rangesOverlap("2026-07-08", "2026-07-10", block)).toBe(false);
  });

  it("no solapa si la estancia empieza al final del bloque", () => {
    expect(rangesOverlap("2026-07-15", "2026-07-17", block)).toBe(false);
  });
});

describe("rangeOverlapsAny", () => {
  it("devuelve true si cualquier bloque choca", () => {
    expect(rangeOverlapsAny("2026-07-12", "2026-07-14", [block])).toBe(true);
    expect(rangeOverlapsAny("2026-07-01", "2026-07-05", [block])).toBe(false);
  });
});

describe("isNightBlocked", () => {
  it("marca noches dentro de [start, end)", () => {
    expect(isNightBlocked("2026-07-10", [block])).toBe(true);
    expect(isNightBlocked("2026-07-14", [block])).toBe(true);
    expect(isNightBlocked("2026-07-15", [block])).toBe(false);
  });
});
