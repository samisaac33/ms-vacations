import { describe, expect, it } from "vitest";
import {
  clearNightlyRatesMutation,
  saveNightlyRatesMutation,
  updatePropertyBasePriceMutation,
} from "@/lib/admin-pricing-mutations";

describe("updatePropertyBasePriceMutation", () => {
  it("rechaza datos incompletos", async () => {
    const result = await updatePropertyBasePriceMutation(undefined, "100");
    expect(result).toEqual({ ok: false, error: "Datos incompletos.", status: 400 });
  });

  it("rechaza precio inválido", async () => {
    const result = await updatePropertyBasePriceMutation("prop-1", "abc");
    expect(result).toEqual({
      ok: false,
      error: "Ingrese un precio válido (1–10000 USD).",
      status: 400,
    });
  });
});

describe("saveNightlyRatesMutation", () => {
  it("rechaza fechas inválidas", async () => {
    const result = await saveNightlyRatesMutation({
      propertyId: "prop-1",
      startDate: "2026/09/01",
      endDate: "2026-09-02",
      referencePriceUsdRaw: "100",
    });
    expect(result).toEqual({ ok: false, error: "Fechas inválidas.", status: 400 });
  });
});

describe("clearNightlyRatesMutation", () => {
  it("rechaza datos incompletos", async () => {
    const result = await clearNightlyRatesMutation({
      propertyId: "prop-1",
      startDate: undefined,
      endDate: "2026-09-01",
    });
    expect(result).toEqual({ ok: false, error: "Datos incompletos.", status: 400 });
  });
});
