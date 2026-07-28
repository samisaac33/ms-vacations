import { upsertCatalogProperties } from "../lib/seed-properties-db";

async function main() {
  const count = await upsertCatalogProperties();
  console.log(`Seed: ${count} propiedades upsert.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
