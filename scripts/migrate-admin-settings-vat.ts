import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL requerida");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_settings (
      id text PRIMARY KEY DEFAULT 'default',
      notification_email text,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS promotional_vat_periods (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      label text,
      start_date date NOT NULL,
      end_date date NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `;

  console.log("Migración admin_settings + promotional_vat_periods completada (sin seed de períodos).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => sql.end());
