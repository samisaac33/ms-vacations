import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import { beachBasePriceUpdates } from "@/lib/beach-price-migration";
import { bankTransferTotalCents } from "@/lib/pricing";

export type BeachPriceApplyResult = {
  slug: string;
  priorUsd: number;
  newUsd: number;
  transferUsd: number;
};

export async function applyBeachPricesToDatabase(): Promise<BeachPriceApplyResult[]> {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL no configurada.");
  }

  const db = getDb();
  const updates = beachBasePriceUpdates();
  const results: BeachPriceApplyResult[] = [];

  for (const { slug, priorUsd, newUsd } of updates) {
    await db
      .update(properties)
      .set({ basePricePerNightCents: newUsd * 100 })
      .where(eq(properties.slug, slug));

    results.push({
      slug,
      priorUsd,
      newUsd,
      transferUsd: bankTransferTotalCents(newUsd * 100) / 100,
    });
  }

  return results;
}
