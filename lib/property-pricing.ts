/** Precio de referencia sin descuento (tipo Airbnb / tachado en ficha). */
export const PROPERTY_CATALOG_REFERENCE_USD: Record<string, number> = {
  "alojamiento-en-arrecife": 291,
  "casa-vacacional-home-one-18-personas-max": 302,
  "casa-vacacional-home-two-21-personas": 326,
  "casa-rustica-18-personas-max": 349,
  "home-luxury-la-punta-18-personas-max": 581,
  "villa-palmera": 465,
  "porto-norte": 372,
  "las-hamacas-portoviejo": 174,
  "los-pinos-portoviejo": 233,
  "container-stay-1-san-clemente": 75,
  "container-stay-2-san-clemente": 70,
};

/** Recargo de limpieza por estancia (USD). */
export const PROPERTY_CLEANING_FEE_USD: Record<string, 5 | 30 | 40> = {
  "alojamiento-en-arrecife": 30,
  "casa-vacacional-home-one-18-personas-max": 30,
  "casa-vacacional-home-two-21-personas": 30,
  "casa-rustica-18-personas-max": 40,
  "home-luxury-la-punta-18-personas-max": 40,
  "villa-palmera": 30,
  "porto-norte": 30,
  "las-hamacas-portoviejo": 30,
  "los-pinos-portoviejo": 30,
  "container-stay-1-san-clemente": 5,
  "container-stay-2-san-clemente": 5,
};

export const BEACH_PROPERTY_SLUGS = [
  "alojamiento-en-arrecife",
  "casa-vacacional-home-one-18-personas-max",
  "casa-vacacional-home-two-21-personas",
  "casa-rustica-18-personas-max",
  "home-luxury-la-punta-18-personas-max",
  "villa-palmera",
  "porto-norte",
  "container-stay-1-san-clemente",
  "container-stay-2-san-clemente",
] as const;

/** Propiedades sin garantía reembolsable en reserva directa. */
export const SLUGS_WITHOUT_REFUNDABLE_GUARANTEE = new Set<string>([
  "container-stay-1-san-clemente",
  "container-stay-2-san-clemente",
]);

export const CATALOG_DISCOUNT_PERCENT = 14;
export const CATALOG_DISCOUNT_RATE = 1 - CATALOG_DISCOUNT_PERCENT / 100;

export function guestDirectFromReferenceUsd(referenceUsd: number): number {
  return Math.round(referenceUsd * CATALOG_DISCOUNT_RATE);
}

export function catalogReferencePriceUsd(slug: string): number {
  const price = PROPERTY_CATALOG_REFERENCE_USD[slug];
  if (price === undefined) {
    throw new Error(`Precio referencia no definido para ${slug}`);
  }
  return price;
}

export function guestDirectPriceUsd(slug: string): number {
  return guestDirectFromReferenceUsd(catalogReferencePriceUsd(slug));
}

export function cleaningFeeUsd(slug: string): number {
  const fee = PROPERTY_CLEANING_FEE_USD[slug];
  if (fee === undefined) {
    throw new Error(`Recargo de limpieza no definido para ${slug}`);
  }
  return fee;
}

export function cleaningFeeCents(slug: string): number {
  return cleaningFeeUsd(slug) * 100;
}

/** Precio huésped en centavos a partir de la referencia de la noche (−14 %). */
export function guestDirectCentsFromReference(
  referenceCents: number,
  slug: string,
  catalogReferenceCents: number,
): number {
  if (referenceCents === catalogReferenceCents) {
    return Math.round(guestDirectPriceUsd(slug) * 100);
  }
  return Math.round(referenceCents * CATALOG_DISCOUNT_RATE);
}
