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

  it("detecta columnas de pago fraccionado faltantes", () => {
    expect(
      bookingApiErrorMessage(new Error('column "deposit_cents" of relation "bookings" does not exist')),
    ).toContain("pago fraccionado");
  });

  it("detecta enum payment_timing faltante", () => {
    expect(
      bookingApiErrorMessage(new Error('type "payment_timing" does not exist')),
    ).toContain("pago fraccionado");
  });

  it("detecta enum split inválido", () => {
    expect(
      bookingApiErrorMessage(new Error('invalid input value for enum payment_timing: "split"')),
    ).toContain("pago fraccionado");
  });

  it("detecta error de prepared statement con pooler", () => {
    expect(
      bookingApiErrorMessage(new Error("prepared statement \"s0\" already exists")),
    ).toContain("conexión");
  });

  it("usa mensaje genérico para errores desconocidos", () => {
    expect(bookingApiErrorMessage(new Error("unexpected"))).toBe(
      "No se pudo completar la reserva. Intente de nuevo.",
    );
  });
});
