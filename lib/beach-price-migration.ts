import {
  BEACH_PROPERTY_SLUGS,
  catalogReferencePriceUsd,
  guestDirectPriceUsd,
} from "@/lib/property-pricing";

/** Precios huésped vigentes en playa / San Clemente (transferencia, −14 % vs referencia). */
export const PRIOR_BEACH_DIRECT_USD = Object.fromEntries(
  BEACH_PROPERTY_SLUGS.map((slug) => [slug, guestDirectPriceUsd(slug)]),
) as Record<(typeof BEACH_PROPERTY_SLUGS)[number], number>;

export function beachBasePriceUpdates(): {
  slug: string;
  priorUsd: number;
  newUsd: number;
  transferUsd: number;
}[] {
  return BEACH_PROPERTY_SLUGS.map((slug) => ({
    slug,
    priorUsd: guestDirectPriceUsd(slug),
    newUsd: catalogReferencePriceUsd(slug),
    transferUsd: guestDirectPriceUsd(slug),
  }));
}
