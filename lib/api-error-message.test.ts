import { describe, expect, it } from "vitest";
import { bookingApiErrorMessage } from "@/lib/api-error-message";

describe("bookingApiErrorMessage", () => {
  it("detecta enum payphone faltante", () => {
    const error = new Error(
      'invalid input value for enum payment_method: "payphone"',
    );
    expect(bookingApiErrorMessage(error)).toContain("PayPhone no está habilitado");
  });

  it("detecta tabla inexistente", () => {
    expect(bookingApiErrorMessage(new Error('relation "bookings" does not exist'))).toContain(
      "base de datos",
    );
  });

  it("usa mensaje genérico para errores desconocidos", () => {
    expect(bookingApiErrorMessage(new Error("unexpected"))).toBe(
      "No se pudo completar la reserva. Intente de nuevo.",
    );
  });
});
