import { describe, expect, it } from "vitest";
import {
  eachDayIsoInclusive,
  eachNightIso,
  isValidDateOrder,
  nightsBetween,
} from "@/lib/dates";

describe("nightsBetween", () => {
  it("cuenta noches entre check-in y check-out (fin exclusivo)", () => {
    expect(nightsBetween("2026-07-10", "2026-07-12")).toBe(2);
    expect(nightsBetween("2026-07-10", "2026-07-11")).toBe(1);
  });

  it("devuelve 0 si check-out no es posterior a check-in", () => {
    expect(nightsBetween("2026-07-10", "2026-07-10")).toBe(0);
    expect(nightsBetween("2026-07-12", "2026-07-10")).toBe(0);
  });
});

describe("isValidDateOrder", () => {
  it("requiere al menos una noche", () => {
    expect(isValidDateOrder("2026-07-10", "2026-07-11")).toBe(true);
    expect(isValidDateOrder("2026-07-10", "2026-07-10")).toBe(false);
  });
});

describe("eachNightIso", () => {
  it("lista cada noche en el rango [checkIn, checkOut)", () => {
    expect(eachNightIso("2026-07-10", "2026-07-13")).toEqual([
      "2026-07-10",
      "2026-07-11",
      "2026-07-12",
    ]);
  });
});

describe("eachDayIsoInclusive", () => {
  it("incluye ambos extremos del rango", () => {
    expect(eachDayIsoInclusive("2026-07-10", "2026-07-12")).toEqual([
      "2026-07-10",
      "2026-07-11",
      "2026-07-12",
    ]);
  });

  it("ordena fechas invertidas", () => {
    expect(eachDayIsoInclusive("2026-07-12", "2026-07-10")).toEqual([
      "2026-07-10",
      "2026-07-11",
      "2026-07-12",
    ]);
  });
});
