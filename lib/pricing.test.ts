import { describe, expect, it } from "vitest";
import {
  bankTransferTotalCents,
  basePriceFromPriorDirectUsd,
  bookingTotalCentsForPaymentMethod,
  cardPaymentTotalCents,
  catalogDirectPriceUsd,
  catalogDisplayPriceUsd,
  catalogDisplayReferenceUsd,
  catalogSavingsPercentVsAirbnb,
  formatUsd,
  REFUNDABLE_GUARANTEE_CENTS,
  stayTotalCentsForPaymentMethod,
  totalCentsForPaymentMethod,
  totalUsdForPaymentMethod,
} from "@/lib/pricing";

const LA_PUNTA = "home-luxury-la-punta-18-personas-max";
const ARRECIFE = "alojamiento-en-arrecife";

describe("formatUsd", () => {
  it("omite decimales en enteros", () => {
    expect(formatUsd(120)).toBe("120");
  });

  it("muestra dos decimales cuando hace falta", () => {
    expect(formatUsd(99.5)).toBe("99.50");
  });
});

describe("totalCentsForPaymentMethod", () => {
  const guestTotal = 50_000;

  it("mantiene el total huésped en transferencia bancaria", () => {
    expect(totalCentsForPaymentMethod(guestTotal, "bank_transfer")).toBe(50_000);
  });

  it("aplica recargo del 5,75 % en PayPal y PayPhone", () => {
    expect(totalCentsForPaymentMethod(guestTotal, "paypal")).toBe(
      cardPaymentTotalCents(guestTotal),
    );
    expect(totalCentsForPaymentMethod(guestTotal, "payphone")).toBe(52_900);
    expect(totalCentsForPaymentMethod(10_000, "paypal")).toBe(10_600);
  });
});

describe("totalUsdForPaymentMethod", () => {
  it("convierte centavos a USD", () => {
    expect(totalUsdForPaymentMethod(50_000, "bank_transfer")).toBe(500);
    expect(totalUsdForPaymentMethod(50_000, "paypal")).toBe(529);
  });
});

describe("basePriceFromPriorDirectUsd (legacy)", () => {
  it("conserva el helper +7 % para scripts antiguos", () => {
    expect(basePriceFromPriorDirectUsd(500)).toBe(535);
  });
});

describe("cardPaymentTotalCents + bankTransferTotalCents", () => {
  it("revierte el markup legacy del 7 % en ida y vuelta", () => {
    expect(cardPaymentTotalCents(bankTransferTotalCents(53_500))).not.toBe(53_500);
    expect(bankTransferTotalCents(cardPaymentTotalCents(50_000))).not.toBe(50_000);
    expect(bankTransferTotalCents(53_500)).toBe(50_000);
    expect(cardPaymentTotalCents(50_000)).toBe(52_900);
  });
});

describe("catalogDirectPriceUsd", () => {
  it("devuelve el precio huésped por slug", () => {
    expect(catalogDirectPriceUsd(LA_PUNTA)).toBe(500);
    expect(catalogDirectPriceUsd(ARRECIFE)).toBe(250);
  });
});

describe("catalogSavingsPercentVsAirbnb", () => {
  it("calcula el ahorro redondeado vs precio referencia", () => {
    expect(catalogSavingsPercentVsAirbnb(LA_PUNTA)).toBe(14);
    expect(catalogSavingsPercentVsAirbnb(ARRECIFE)).toBe(14);
  });
});

describe("catalogDisplayPriceUsd", () => {
  it("redondea el precio transferencia a USD entero", () => {
    expect(catalogDisplayPriceUsd(LA_PUNTA)).toBe(500);
    expect(catalogDisplayPriceUsd(ARRECIFE)).toBe(250);
    expect(catalogDisplayPriceUsd("casa-vacacional-home-one-18-personas-max")).toBe(260);
  });
});

describe("catalogDisplayReferenceUsd", () => {
  it("devuelve la referencia sin descuento", () => {
    expect(catalogDisplayReferenceUsd(LA_PUNTA)).toBe(581);
    expect(catalogDisplayReferenceUsd(ARRECIFE)).toBe(291);
  });
});

describe("stayTotalCentsForPaymentMethod", () => {
  it("La Punta 1 noche: transferencia $540, tarjeta $571", () => {
    const nightly = 50_000;
    const cleaning = 4_000;
    expect(stayTotalCentsForPaymentMethod(nightly, cleaning, "bank_transfer")).toBe(54_000);
    expect(stayTotalCentsForPaymentMethod(nightly, cleaning, "payphone")).toBe(57_100);
  });

  it("Arrecife: recargo tarjeta sobre noches + limpieza", () => {
    const nightly = 25_000;
    const cleaning = 3_000;
    expect(stayTotalCentsForPaymentMethod(nightly, cleaning, "bank_transfer")).toBe(28_000);
    expect(stayTotalCentsForPaymentMethod(nightly, cleaning, "paypal")).toBe(29_600);
  });
});

describe("bookingTotalCentsForPaymentMethod", () => {
  it("suma garantía fija sin recargo tarjeta", () => {
    const nightly = 50_000;
    const cleaning = 4_000;
    const slug = "home-luxury-la-punta-18-personas-max";
    expect(bookingTotalCentsForPaymentMethod(nightly, cleaning, "bank_transfer", slug)).toBe(
      54_000 + REFUNDABLE_GUARANTEE_CENTS,
    );
    expect(bookingTotalCentsForPaymentMethod(nightly, cleaning, "payphone", slug)).toBe(
      57_100 + REFUNDABLE_GUARANTEE_CENTS,
    );
  });

  it("containers sin garantía reembolsable", () => {
    const nightly = 6_500;
    const cleaning = 500;
    const slug = "container-stay-1-san-clemente";
    expect(bookingTotalCentsForPaymentMethod(nightly, cleaning, "bank_transfer", slug)).toBe(
      7_000,
    );
  });
});
