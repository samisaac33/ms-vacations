import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { properties } from "../db/schema";
import { beachBasePriceUpdates } from "../lib/beach-price-migration";
import { bankTransferTotalCents } from "../lib/pricing";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Defina DATABASE_URL para actualizar precios.");
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);
  const updates = beachBasePriceUpdates();

  for (const { slug, priorUsd, newUsd } of updates) {
    await db
      .update(properties)
      .set({ basePricePerNightCents: newUsd * 100 })
      .where(eq(properties.slug, slug));
    const transferUsd = bankTransferTotalCents(newUsd * 100) / 100;
    console.log(`  ${slug}: $${priorUsd} → base $${newUsd} (transferencia $${transferUsd})`);
  }

  await client.end();
  console.log(`\nActualizadas ${updates.length} propiedades de playa.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
