import { describe, expect, it } from "vitest";
import {
  getBookingRangeValidationError,
  isBookingRangeValidWithRules,
  isValidBookingRange,
  selectBookingDateRange,
} from "@/lib/booking-date-selection";
import type { HighSeasonPeriod } from "@/lib/stay-rules";

const RESERVA_9_10 = [{ start: "2026-08-09", end: "2026-08-10" }];
const RESERVA_10_11 = [{ start: "2026-08-10", end: "2026-08-11" }];
const TODAY = "2026-07-31";

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

describe("selectBookingDateRange turnover", () => {
  it("permite check-out el mismo día que el check-in de otra reserva", () => {
    const checkIn = selectBookingDateRange("2026-08-09", { checkIn: "", checkOut: "" }, RESERVA_10_11, TODAY);
    expect(checkIn).toEqual({ ok: true, range: { checkIn: "2026-08-09", checkOut: "" } });

    const checkOut = selectBookingDateRange(
      "2026-08-10",
      { checkIn: "2026-08-09", checkOut: "" },
      RESERVA_10_11,
      TODAY,
    );
    expect(checkOut).toEqual({ ok: true, range: { checkIn: "2026-08-09", checkOut: "2026-08-10" } });
  });

  it("rechaza check-in en noche ocupada", () => {
    const result = selectBookingDateRange("2026-08-09", { checkIn: "", checkOut: "" }, RESERVA_9_10, TODAY);
    expect(result).toEqual({ ok: false, error: "Esa fecha no está disponible." });
  });

  it("permite check-in el día de check-out de otra reserva", () => {
    const result = selectBookingDateRange("2026-08-10", { checkIn: "", checkOut: "" }, RESERVA_9_10, TODAY);
    expect(result).toEqual({ ok: true, range: { checkIn: "2026-08-10", checkOut: "" } });
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
