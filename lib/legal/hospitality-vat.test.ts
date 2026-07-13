import { describe, expect, it } from "vitest";
import {
  HOSPITALITY_VAT_PROMOTIONAL_RATE,
  HOSPITALITY_VAT_STANDARD_RATE,
  isPromotionalVatDate,
  stayTouchesPromotionalVat,
} from "@/lib/legal/hospitality-vat";

describe("hospitality-vat", () => {
  it("aplica tarifa promocional en fechas decretadas", () => {
    expect(isPromotionalVatDate("2026-02-15")).toBe(true);
    expect(isPromotionalVatDate("2026-07-10")).toBe(false);
  });

  it("detecta estancias que cruzan feriado decretado", () => {
    expect(stayTouchesPromotionalVat("2026-02-13", "2026-02-18")).toBe(true);
    expect(stayTouchesPromotionalVat("2026-07-01", "2026-07-05")).toBe(false);
  });

  it("expone tarifas estándar y promocional", () => {
    expect(HOSPITALITY_VAT_STANDARD_RATE).toBe(0.15);
    expect(HOSPITALITY_VAT_PROMOTIONAL_RATE).toBe(0.08);
  });
});
