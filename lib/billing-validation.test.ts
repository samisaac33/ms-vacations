import { describe, expect, it } from "vitest";
import { validateBillingInput } from "@/lib/billing-validation";

describe("validateBillingInput", () => {
  it("acepta RUC valido", () => {
    const result = validateBillingInput({
      billingName: "Jctech Ascensores S.A.S.",
      billingIdType: "RUC",
      billingIdNumber: "1793220111001",
      billingCity: "Quito",
      guestEmail: "cliente@example.com",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.billingIdNumber).toBe("1793220111001");
    }
  });

  it("rechaza RUC corto", () => {
    const result = validateBillingInput({
      billingName: "Empresa Demo",
      billingIdType: "RUC",
      billingIdNumber: "123",
      billingCity: "Quito",
      guestEmail: "cliente@example.com",
    });
    expect(result.ok).toBe(false);
  });

  it("acepta cedula de 10 digitos", () => {
    const result = validateBillingInput({
      billingName: "Maria Lopez",
      billingIdType: "CEDULA",
      billingIdNumber: "1712345678",
      billingCity: "Portoviejo",
      guestEmail: "maria@example.com",
    });
    expect(result.ok).toBe(true);
  });
});
