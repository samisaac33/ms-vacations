import postgres from "postgres";
import { hasDatabase } from "@/db/index";

export type BillingMigrationResult = {
  billingIdTypeCreated: boolean;
  columnsAdded: string[];
};

export async function billingColumnExists(column = "billing_name"): Promise<boolean> {
  if (!hasDatabase()) return false;
  const url = process.env.DATABASE_URL;
  if (!url) return false;

  const sql = postgres(url, { max: 1 });
  try {
    const rows = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'bookings'
          AND column_name = ${column}
      ) AS exists
    `;
    return rows[0]?.exists ?? false;
  } finally {
    await sql.end();
  }
}

export async function billingMigrationNeeded(): Promise<boolean> {
  if (!hasDatabase()) return false;
  try {
    return !(await billingColumnExists("billing_name"));
  } catch {
    return true;
  }
}

export async function applyBillingMigration(): Promise<BillingMigrationResult> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no configurada.");

  const sql = postgres(url, { max: 1 });

  try {
    const billingIdTypeBefore = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'billing_id_type'
      ) AS exists
    `;
    const billingIdTypeExisted = billingIdTypeBefore[0]?.exists ?? false;

    await sql`
      DO $$ BEGIN
        CREATE TYPE billing_id_type AS ENUM ('RUC', 'CEDULA', 'PASAPORTE');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `;

    await sql`
      ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS billing_name text,
        ADD COLUMN IF NOT EXISTS billing_id_type billing_id_type,
        ADD COLUMN IF NOT EXISTS billing_id_number text,
        ADD COLUMN IF NOT EXISTS billing_city text,
        ADD COLUMN IF NOT EXISTS billing_completed_at timestamptz,
        ADD COLUMN IF NOT EXISTS voucher_sent_at timestamptz
    `;

    return {
      billingIdTypeCreated: !billingIdTypeExisted,
      columnsAdded: [
        "billing_name",
        "billing_id_type",
        "billing_id_number",
        "billing_city",
        "billing_completed_at",
        "voucher_sent_at",
      ],
    };
  } finally {
    await sql.end();
  }
}
