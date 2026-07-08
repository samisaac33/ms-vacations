import postgres from "postgres";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Defina DATABASE_URL.");

  const sql = postgres(url, { max: 1 });

  try {
    await sql`ALTER TYPE booking_status ADD VALUE IF NOT EXISTS 'pending_verification'`;
  } catch {
    // Enum value may already exist on older Postgres without IF NOT EXISTS support.
    try {
      await sql`ALTER TYPE booking_status ADD VALUE 'pending_verification'`;
    } catch {
      // Already present.
    }
  }

  await sql`
    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS payment_proof_url text,
      ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at timestamptz
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS property_nightly_rates (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      date date NOT NULL,
      reference_price_cents integer NOT NULL
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS property_nightly_rates_property_date_idx
      ON property_nightly_rates (property_id, date)
  `;

  console.log("Migración aplicada: payment_proof_* y property_nightly_rates.");
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
