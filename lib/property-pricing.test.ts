import { describe, expect, it } from "vitest";
import { refundableGuaranteeCents } from "@/lib/pricing";
import {
  catalogReferencePriceUsd,
  cleaningFeeCents,
  cleaningFeeUsd,
  CATALOG_DISCOUNT_PERCENT,
  guestDirectCentsFromReference,
  guestDirectFromReferenceUsd,
  guestDirectPriceUsd,
} from "@/lib/property-pricing";

const LA_PUNTA = "home-luxury-la-punta-18-personas-max";
const CONTAINER_STAY_1 = "container-stay-1-san-clemente";

describe("guestDirectCentsFromReference", () => {
  it("La Punta: referencia catálogo → $500 (50000 centavos)", () => {
    expect(guestDirectCentsFromReference(58_100, LA_PUNTA, 58_100)).toBe(50_000);
  });

  it("override distinto aplica −14 % sobre la referencia de la noche", () => {
    expect(guestDirectCentsFromReference(60_000, LA_PUNTA, 58_100)).toBe(51_600);
  });
});

describe("guestDirectFromReferenceUsd", () => {
  it("aplica −14 % redondeado", () => {
    expect(guestDirectFromReferenceUsd(581)).toBe(500);
    expect(guestDirectFromReferenceUsd(291)).toBe(250);
    expect(guestDirectFromReferenceUsd(302)).toBe(260);
    expect(guestDirectFromReferenceUsd(233)).toBe(200);
  });
});

describe("catalogReferencePriceUsd", () => {
  it("expone las referencias Airbnb actualizadas", () => {
    expect(catalogReferencePriceUsd("home-luxury-la-punta-18-personas-max")).toBe(581);
    expect(catalogReferencePriceUsd("alojamiento-en-arrecife")).toBe(291);
    expect(catalogReferencePriceUsd("casa-vacacional-home-one-18-personas-max")).toBe(302);
    expect(catalogReferencePriceUsd("villa-palmera")).toBe(465);
    expect(catalogReferencePriceUsd("porto-norte")).toBe(372);
    expect(catalogReferencePriceUsd("container-stay-1-san-clemente")).toBe(75);
    expect(catalogReferencePriceUsd("container-stay-2-san-clemente")).toBe(70);
  });
});

describe("guestDirectPriceUsd", () => {
  it("deriva el precio huésped desde la referencia", () => {
    expect(guestDirectPriceUsd("home-luxury-la-punta-18-personas-max")).toBe(500);
    expect(guestDirectPriceUsd("casa-rustica-18-personas-max")).toBe(300);
    expect(guestDirectPriceUsd("las-hamacas-portoviejo")).toBe(150);
    expect(guestDirectPriceUsd("alojamiento-en-arrecife")).toBe(250);
    expect(guestDirectPriceUsd("casa-vacacional-home-one-18-personas-max")).toBe(260);
    expect(guestDirectPriceUsd("casa-vacacional-home-two-21-personas")).toBe(280);
    expect(guestDirectPriceUsd("villa-palmera")).toBe(400);
    expect(guestDirectPriceUsd("porto-norte")).toBe(320);
    expect(guestDirectPriceUsd("los-pinos-portoviejo")).toBe(200);
    expect(guestDirectPriceUsd("container-stay-1-san-clemente")).toBe(65);
    expect(guestDirectPriceUsd("container-stay-2-san-clemente")).toBe(60);
  });

  it("usa descuento del 14 %", () => {
    expect(CATALOG_DISCOUNT_PERCENT).toBe(14);
  });
});

describe("cleaningFeeUsd", () => {
  it("La Punta y Rústica: $40", () => {
    expect(cleaningFeeUsd("home-luxury-la-punta-18-personas-max")).toBe(40);
    expect(cleaningFeeUsd("casa-rustica-18-personas-max")).toBe(40);
  });

  it("resto de propiedades: $30", () => {
    expect(cleaningFeeUsd("alojamiento-en-arrecife")).toBe(30);
    expect(cleaningFeeUsd("las-hamacas-portoviejo")).toBe(30);
    expect(cleaningFeeUsd("porto-norte")).toBe(30);
  });

  it("containers: limpieza $5", () => {
    expect(cleaningFeeUsd("container-stay-1-san-clemente")).toBe(5);
    expect(cleaningFeeUsd("container-stay-2-san-clemente")).toBe(5);
    expect(cleaningFeeCents("container-stay-1-san-clemente")).toBe(500);
  });

  it("convierte a centavos", () => {
    expect(cleaningFeeCents("home-luxury-la-punta-18-personas-max")).toBe(4_000);
    expect(cleaningFeeCents("villa-palmera")).toBe(3_000);
  });
});

describe("refundableGuaranteeCents", () => {
  it("containers sin garantía reembolsable", () => {
    expect(refundableGuaranteeCents(CONTAINER_STAY_1)).toBe(0);
    expect(refundableGuaranteeCents("container-stay-2-san-clemente")).toBe(0);
  });

  it("resto del catálogo mantiene USD 300", () => {
    expect(refundableGuaranteeCents(LA_PUNTA)).toBe(30_000);
  });
});
