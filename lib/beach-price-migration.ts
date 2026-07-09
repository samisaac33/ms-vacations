import { basePriceFromPriorDirectUsd } from "@/lib/pricing";

/** Precios directos vigentes antes del ajuste +7 % (solo playa / San Clemente). */
export const PRIOR_BEACH_DIRECT_USD: Record<string, number> = {
  "alojamiento-en-arrecife": 250,
  "casa-vacacional-home-one-18-personas-max": 260,
  "casa-vacacional-home-two-21-personas": 280,
  "casa-rustica-18-personas-max": 300,
  "home-luxury-la-punta-18-personas-max": 500,
};

export function beachBasePriceUpdates(): { slug: string; priorUsd: number; newUsd: number }[] {
  return Object.entries(PRIOR_BEACH_DIRECT_USD).map(([slug, priorUsd]) => ({
    slug,
    priorUsd,
    newUsd: basePriceFromPriorDirectUsd(priorUsd),
  }));
}
