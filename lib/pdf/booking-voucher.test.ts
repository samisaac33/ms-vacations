import { describe, expect, it } from "vitest";
import { renderVoucherPdf } from "@/lib/pdf/booking-voucher";
import type { BookingVoucherContext } from "@/lib/pdf/voucher-context";

const sampleContext: BookingVoucherContext = {
  bookingId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  reference: "A1B2C3D4",
  issueDate: "22 de junio de 2025",
  propertyName: "La Punta",
  checkIn: "2025-08-11",
  checkOut: "2025-08-15",
  nights: 4,
  guests: 8,
  guestEmail: "cliente@example.com",
  billingName: "Jctech Ascensores S.A.S.",
  billingIdType: "RUC",
  billingIdNumber: "1793220111001",
  billingCity: "Quito",
  lodgingCents: 132_000,
  cleaningFeeCents: 4_000,
  guaranteeCents: 30_000,
  totalCents: 166_000,
  depositCents: 66_000,
  balanceCents: 100_000,
  paymentMethod: "bank_transfer",
  paymentTiming: "split",
  status: "pending_balance",
  stayDetailLine: "4 noches · 8 huéspedes · Piscina temperada incluida",
};

const accentedContext: BookingVoucherContext = {
  ...sampleContext,
  reference: "BFAEB669",
  billingName: "Luis Fernández",
  billingCity: "Portoviejo",
  checkIn: "2026-07-27",
  checkOut: "2026-07-29",
  nights: 2,
  guests: 2,
  lodgingCents: 52_000,
  cleaningFeeCents: 3_000,
  totalCents: 85_000,
  depositCents: null,
  balanceCents: null,
  paymentTiming: "full_now",
  status: "confirmed",
  stayDetailLine: "2 noches · 2 huéspedes · Piscina temperada incluida",
};

function pdfLatin1(buffer: Buffer): string {
  return buffer.toString("latin1");
}

describe("renderVoucherPdf", () => {
  it("genera un PDF valido", async () => {
    const buffer = await renderVoucherPdf(sampleContext);
    expect(buffer.subarray(0, 5).toString("utf8")).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(1500);
  });

  it("incluye limpieza y total como lineas separadas", async () => {
    const pdf = pdfLatin1(await renderVoucherPdf(accentedContext));
    expect(pdf).toContain("Limpieza final");
    expect(pdf).toContain("(TOTAL)");
  });

  it("omite garantía reembolsable cuando guaranteeCents es 0", async () => {
    const pdf = pdfLatin1(
      await renderVoucherPdf({ ...sampleContext, guaranteeCents: 0, totalCents: 136_000 }),
    );
    expect(pdf).not.toContain("Garant\\355a reembolsable");
  });

  it("codifica tildes en WinAnsi dentro del PDF", async () => {
    const pdf = pdfLatin1(await renderVoucherPdf(accentedContext));
    expect(pdf).toMatch(/Fern\\341ndez/);
    expect(pdf).toContain("Garant\\355a reembolsable");
    expect(pdf).toContain("POL\\315TICAS IMPORTANTES");
  });

  it("codifica guiones y punto medio en fechas y detalle", async () => {
    const pdf = pdfLatin1(await renderVoucherPdf(accentedContext));
    expect(pdf).toContain("\\226");
    expect(pdf).toContain("\\267");
  });
});
