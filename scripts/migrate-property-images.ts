import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL requerida");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

async function main() {
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

  console.log("Migración property_images completada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => sql.end());
