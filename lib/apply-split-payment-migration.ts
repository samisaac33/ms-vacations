import postgres from "postgres";
import { hasDatabase } from "@/db/index";

export type SplitPaymentMigrationResult = {
  pendingBalanceAdded: boolean;
  paymentTimingCreated: boolean;
  columnsAdded: string[];
};

async function addBookingStatusValue(sql: postgres.Sql, value: string): Promise<boolean> {
  const existing = await sql<{ enumlabel: string }[]>`
    SELECT e.enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'booking_status' AND e.enumlabel = ${value}
  `;
  if (existing.length > 0) return false;

  try {
    await sql.unsafe(`ALTER TYPE booking_status ADD VALUE IF NOT EXISTS '${value}'`);
  } catch {
    try {
      await sql.unsafe(`ALTER TYPE booking_status ADD VALUE '${value}'`);
    } catch {
      // Already present.
    }
  }
  return true;
}

export async function bookingStatusHasValue(value: string): Promise<boolean> {
  if (!hasDatabase()) return false;
  const url = process.env.DATABASE_URL;
  if (!url) return false;

  const sql = postgres(url, { max: 1 });
  try {
    const rows = await sql<{ enumlabel: string }[]>`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'booking_status' AND e.enumlabel = ${value}
    `;
    return rows.length > 0;
  } finally {
    await sql.end();
  }
}

export async function applySplitPaymentMigration(): Promise<SplitPaymentMigrationResult> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no configurada.");

  const sql = postgres(url, { max: 1 });

  try {
    const pendingBalanceAdded = await addBookingStatusValue(sql, "pending_balance");

    const paymentTimingBefore = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'payment_timing'
      ) AS exists
    `;
    const paymentTimingExisted = paymentTimingBefore[0]?.exists ?? false;

    await sql`
      DO $$ BEGIN
        CREATE TYPE payment_timing AS ENUM ('full_now', 'split');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `;

    await sql`
      ALTER TABLE bookings
        ADD COLUMN IF NOT EXISTS payment_timing payment_timing NOT NULL DEFAULT 'full_now',
        ADD COLUMN IF NOT EXISTS deposit_cents integer,
        ADD COLUMN IF NOT EXISTS balance_cents integer,
        ADD COLUMN IF NOT EXISTS balance_due_at date,
        ADD COLUMN IF NOT EXISTS deposit_paid_at timestamptz,
        ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz,
        ADD COLUMN IF NOT EXISTS terms_version text
    `;

    return {
      pendingBalanceAdded,
      paymentTimingCreated: !paymentTimingExisted,
      columnsAdded: [
        "payment_timing",
        "deposit_cents",
        "balance_cents",
        "balance_due_at",
        "deposit_paid_at",
        "terms_accepted_at",
        "terms_version",
      ],
    };
  } finally {
    await sql.end();
  }
}
