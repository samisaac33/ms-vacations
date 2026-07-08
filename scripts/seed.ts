import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { properties } from "../db/schema";
import { PROPERTIES } from "../lib/properties";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("Defina DATABASE_URL para ejecutar el seed.");
  }
  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  for (const p of PROPERTIES) {
    // basePricePerNightCents = precio por noche en USD (centavos), definido en admin
    await db
      .insert(properties)
      .values({
        slug: p.slug,
        icalUrl: p.icalUrl,
        basePricePerNightCents: p.basePricePerNightUsd * 100,
      })
      .onConflictDoUpdate({
        target: properties.slug,
        set: {
          icalUrl: sql`excluded.ical_url`,
          basePricePerNightCents: sql`excluded.base_price_per_night_cents`,
        },
      });
  }

  await client.end();
  console.log(`Seed: ${PROPERTIES.length} propiedades upsert.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
