import { describe, expect, it } from "vitest";
import {
  getBookingRangeValidationError,
  isBookingRangeValidWithRules,
  isValidBookingRange,
} from "@/lib/booking-date-selection";
import type { HighSeasonPeriod } from "@/lib/stay-rules";

const FIN_DE_ANO: HighSeasonPeriod = {
  startDate: "2026-12-26",
  endDate: "2027-01-03",
  minNights: 7,
  label: "Fin de año",
};

describe("getBookingRangeValidationError", () => {
  it("devuelve null si falta entrada o salida", () => {
    expect(getBookingRangeValidationError("", "")).toBeNull();
    expect(getBookingRangeValidationError("2026-07-10", "")).toBeNull();
  });

  it("rechaza salida anterior o igual a entrada", () => {
    expect(getBookingRangeValidationError("2026-07-10", "2026-07-10")).toMatch(/después de la entrada/i);
  });

  it("aplica regla vie/sáb", () => {
    expect(getBookingRangeValidationError("2026-07-10", "2026-07-11")).toMatch(/viernes o sábado/i);
  });

  it("aplica temporada alta cuando la estancia toca el intervalo", () => {
    expect(getBookingRangeValidationError("2026-12-24", "2026-12-27", [FIN_DE_ANO])).toMatch(
      /temporada alta/i,
    );
  });

  it("acepta rango válido", () => {
    expect(getBookingRangeValidationError("2026-07-06", "2026-07-07")).toBeNull();
    expect(getBookingRangeValidationError("2026-07-10", "2026-07-12")).toBeNull();
  });
});

describe("isBookingRangeValidWithRules", () => {
  it("coincide con ausencia de error de validación", () => {
    expect(isBookingRangeValidWithRules("2026-07-06", "2026-07-07")).toBe(true);
    expect(isBookingRangeValidWithRules("2026-07-10", "2026-07-11")).toBe(false);
  });

  it("es más estricto que isValidBookingRange", () => {
    expect(isValidBookingRange("2026-07-10", "2026-07-11")).toBe(true);
    expect(isBookingRangeValidWithRules("2026-07-10", "2026-07-11")).toBe(false);
  });
});
