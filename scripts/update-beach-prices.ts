import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { properties } from "../db/schema";
import { getPropertiesByDestination } from "../lib/properties";
import { basePriceFromPriorDirectUsd } from "../lib/pricing";

/**
 * Precios directos vigentes en producción (ago 2026) antes del ajuste +7 %.
 * Solo casas de San Clemente (playa).
 */
const PRIOR_BEACH_DIRECT_USD: Record<string, number> = {
  "alojamiento-en-arrecife": 250,
  "casa-vacacional-home-one-18-personas-max": 260,
  "casa-vacacional-home-two-21-personas": 280,
  "casa-rustica-18-personas-max": 300,
  "home-luxury-la-punta-18-personas-max": 500,
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Defina DATABASE_URL para actualizar precios.");
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  const beachSlugs = new Set(getPropertiesByDestination("beach").map((p) => p.slug));
  const updates: { slug: string; priorUsd: number; newUsd: number }[] = [];

  for (const [slug, priorUsd] of Object.entries(PRIOR_BEACH_DIRECT_USD)) {
    if (!beachSlugs.has(slug)) {
      throw new Error(`Slug de playa desconocido: ${slug}`);
    }
    const newUsd = basePriceFromPriorDirectUsd(priorUsd);
    updates.push({ slug, priorUsd, newUsd });

    await db
      .update(properties)
      .set({ basePricePerNightCents: newUsd * 100 })
      .where(eq(properties.slug, slug));
  }

  await client.end();

  console.log("Precios base actualizados (San Clemente):");
  for (const { slug, priorUsd, newUsd } of updates) {
    const transferUsd = Math.round(newUsd * 0.93 * 100) / 100;
    console.log(`  ${slug}: $${priorUsd} → $${newUsd} (transferencia ≈ $${transferUsd})`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
