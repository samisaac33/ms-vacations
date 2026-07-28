import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL requerida");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS high_season_periods (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      label text,
      start_date date NOT NULL,
      end_date date NOT NULL,
      min_nights integer NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS high_season_period_properties (
      period_id uuid NOT NULL REFERENCES high_season_periods(id) ON DELETE CASCADE,
      property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      UNIQUE (period_id, property_id)
    )
  `;

  console.log("Migración high_season_periods + high_season_period_properties completada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => sql.end());
