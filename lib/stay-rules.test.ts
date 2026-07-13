import { describe, expect, it } from "vitest";
import {
  minimumNightsForCheckIn,
  requiresMinTwoNights,
  validateStayLength,
} from "@/lib/stay-rules";

describe("requiresMinTwoNights", () => {
  it("detecta entrada viernes y sábado", () => {
    expect(requiresMinTwoNights("2026-07-10")).toBe(true);
    expect(requiresMinTwoNights("2026-07-11")).toBe(true);
  });

  it("no aplica con entrada domingo ni entre semana", () => {
    expect(requiresMinTwoNights("2026-07-06")).toBe(false);
    expect(requiresMinTwoNights("2026-07-07")).toBe(false);
    expect(requiresMinTwoNights("2026-07-08")).toBe(false);
    expect(requiresMinTwoNights("2026-07-09")).toBe(false);
    expect(requiresMinTwoNights("2026-07-12")).toBe(false);
  });
});

describe("minimumNightsForCheckIn", () => {
  it("exige 2 noches con entrada viernes o sábado", () => {
    expect(minimumNightsForCheckIn("2026-07-10")).toBe(2);
    expect(minimumNightsForCheckIn("2026-07-11")).toBe(2);
  });

  it("permite 1 noche con entrada domingo o entre semana", () => {
    expect(minimumNightsForCheckIn("2026-07-06")).toBe(1);
    expect(minimumNightsForCheckIn("2026-07-09")).toBe(1);
    expect(minimumNightsForCheckIn("2026-07-12")).toBe(1);
  });
});

describe("validateStayLength", () => {
  it("acepta 1 noche con entrada lun–jue o domingo", () => {
    expect(validateStayLength("2026-07-06", "2026-07-07")).toBeNull();
    expect(validateStayLength("2026-07-09", "2026-07-10")).toBeNull();
    expect(validateStayLength("2026-07-12", "2026-07-13")).toBeNull();
  });

  it("rechaza 1 noche con entrada viernes o sábado", () => {
    expect(validateStayLength("2026-07-10", "2026-07-11")).toMatch(/viernes o sábado/i);
    expect(validateStayLength("2026-07-11", "2026-07-12")).toMatch(/viernes o sábado/i);
  });

  it("acepta 2+ noches con entrada viernes o sábado", () => {
    expect(validateStayLength("2026-07-10", "2026-07-12")).toBeNull();
    expect(validateStayLength("2026-07-11", "2026-07-14")).toBeNull();
  });
});
