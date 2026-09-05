import postgres from "postgres";
import { hasDatabase } from "@/db/index";

export type PropertyImagesMigrationResult = {
  tableCreated: boolean;
};

export async function propertyImagesTableExists(): Promise<boolean> {
  if (!hasDatabase()) return false;
  const url = process.env.DATABASE_URL;
  if (!url) return false;

  const sql = postgres(url, { max: 1 });
  try {
    const rows = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'property_images'
      ) AS exists
    `;
    return rows[0]?.exists ?? false;
  } finally {
    await sql.end();
  }
}

export async function propertyImagesMigrationNeeded(): Promise<boolean> {
  if (!hasDatabase()) return false;
  try {
    return !(await propertyImagesTableExists());
  } catch {
    return true;
  }
}

export async function applyPropertyImagesMigration(): Promise<PropertyImagesMigrationResult> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no configurada.");

  const sql = postgres(url, { max: 1 });
  try {
    const before = await propertyImagesTableExists();

    await sql`
      CREATE TABLE IF NOT EXISTS property_images (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        storage_path text NOT NULL,
        src text NOT NULL,
        alt text NOT NULL,
        sort_order integer NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        UNIQUE (property_id, storage_path)
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS property_images_property_sort_idx
        ON property_images (property_id, sort_order)
    `;

    return { tableCreated: !before };
  } finally {
    await sql.end();
  }
}
