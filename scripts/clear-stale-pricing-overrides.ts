import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { clearMismatchedNightlyRateOverrides } from "../lib/pricing-query";

function parseArgs(argv: string[]) {
  const apply = argv.includes("--apply");
  const slugArg = argv.find((arg) => arg.startsWith("--slug="));
  const slug = slugArg?.slice("--slug=".length);
  return { apply, slug: slug || undefined, dryRun: !apply };
}

function printSummary(
  rows: Awaited<ReturnType<typeof clearMismatchedNightlyRateOverrides>>,
  dryRun: boolean,
) {
  if (rows.length === 0) {
    console.log("No hay overrides inconsistentes con la tarifa base.");
    return;
  }

  const bySlug = new Map<string, typeof rows>();
  for (const row of rows) {
    const group = bySlug.get(row.propertySlug) ?? [];
    group.push(row);
    bySlug.set(row.propertySlug, group);
  }

  const mode = dryRun ? "DRY-RUN" : "APLICADO";
  console.log(`\n[${mode}] ${rows.length} override(s) inconsistente(s) en ${bySlug.size} propiedad(es):\n`);

  for (const [propertySlug, group] of bySlug) {
    console.log(`  ${propertySlug} (base $${group[0]!.baseUsd}, ${group.length} día(s)):`);
    for (const row of group) {
      console.log(`    ${row.date}: override $${row.overrideUsd} → base $${row.baseUsd}`);
    }
  }

  if (dryRun) {
    console.log("\nEjecute con --apply para eliminar estos overrides.");
  } else {
    console.log("\nOverrides inconsistentes eliminados.");
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Defina DATABASE_URL para auditar o limpiar precios.");
  }

  const { apply, slug, dryRun } = parseArgs(process.argv.slice(2));
  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    const rows = await clearMismatchedNightlyRateOverrides({ slug, dryRun }, db);
    printSummary(rows, dryRun);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
