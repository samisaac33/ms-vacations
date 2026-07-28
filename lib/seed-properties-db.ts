import { sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import { getPropertyBySlug, PROPERTIES, type Property } from "@/lib/properties";

async function upsertCatalogProperty(db: ReturnType<typeof getDb>, p: Property): Promise<void> {
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

export async function upsertCatalogPropertyBySlug(slug: string): Promise<boolean> {
  if (!hasDatabase()) return false;

  const p = getPropertyBySlug(slug);
  if (!p) return false;

  const db = getDb();
  await upsertCatalogProperty(db, p);
  return true;
}

export async function upsertCatalogProperties(): Promise<number> {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL no configurada.");
  }

  const db = getDb();

  for (const p of PROPERTIES) {
    await upsertCatalogProperty(db, p);
  }

  return PROPERTIES.length;
}

/** Inserta propiedades nuevas y actualiza solo `ical_url` en las existentes. */
export async function syncCatalogIcalUrls(): Promise<number> {
  if (!hasDatabase()) {
    throw new Error("DATABASE_URL no configurada.");
  }

  const db = getDb();

  for (const p of PROPERTIES) {
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
        },
      });
  }

  return PROPERTIES.length;
}
