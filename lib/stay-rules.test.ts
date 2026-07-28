import { describe, expect, it } from "vitest";
import {
  minimumNightsForCheckIn,
  minimumNightsForStay,
  requiresMinTwoNights,
  stayOverlapsHighSeasonPeriod,
  validateStayLength,
  type HighSeasonPeriod,
} from "@/lib/stay-rules";

const CARNaval: HighSeasonPeriod = {
  startDate: "2026-02-14",
  endDate: "2026-02-18",
  minNights: 5,
  label: "Carnaval 2026",
};

const FIN_DE_ANO: HighSeasonPeriod = {
  startDate: "2026-12-26",
  endDate: "2027-01-03",
  minNights: 7,
  label: "Fin de año 2026",
};

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

describe("stayOverlapsHighSeasonPeriod", () => {
  it("detecta solape cuando la estancia entra en la temporada aunque el check-in sea antes", () => {
    expect(stayOverlapsHighSeasonPeriod("2026-12-24", "2026-12-27", FIN_DE_ANO)).toBe(true);
  });

  it("no detecta solape si la estancia termina antes de que empiece la temporada", () => {
    expect(stayOverlapsHighSeasonPeriod("2026-12-24", "2026-12-26", FIN_DE_ANO)).toBe(false);
  });
});

describe("minimumNightsForStay", () => {
  it("aplica temporada si la estancia toca el intervalo", () => {
    expect(minimumNightsForStay("2026-12-24", "2026-12-27", [FIN_DE_ANO])).toBe(7);
  });

  it("no aplica temporada si la estancia no toca el intervalo", () => {
    expect(minimumNightsForStay("2026-12-24", "2026-12-26", [FIN_DE_ANO])).toBe(1);
  });

  it("aplica el máximo entre regla base y temporada cuando el check-in cae en temporada", () => {
    expect(minimumNightsForStay("2026-02-14", "2026-02-19", [CARNaval])).toBe(5);
    expect(minimumNightsForStay("2026-07-10", "2026-07-12", [CARNaval])).toBe(2);
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

  it("rechaza estancias cortas en temporada alta", () => {
    expect(validateStayLength("2026-02-14", "2026-02-17", [CARNaval])).toMatch(/temporada alta/i);
    expect(validateStayLength("2026-02-14", "2026-02-19", [CARNaval])).toBeNull();
  });

  it("rechaza estancias cortas que solo rozan fin de año", () => {
    expect(validateStayLength("2026-12-24", "2026-12-27", [FIN_DE_ANO])).toMatch(/temporada alta/i);
    expect(validateStayLength("2026-12-24", "2026-12-28", [FIN_DE_ANO])).toMatch(/temporada alta/i);
    expect(validateStayLength("2026-12-24", "2026-12-26", [FIN_DE_ANO])).toBeNull();
    expect(validateStayLength("2026-12-20", "2026-12-27", [FIN_DE_ANO])).toBeNull();
  });
});
