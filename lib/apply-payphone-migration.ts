import postgres from "postgres";
import { hasDatabase } from "@/db/index";

export type PayPhoneMigrationResult = {
  payphoneAdded: boolean;
};

async function addPaymentMethodValue(sql: postgres.Sql, value: string): Promise<boolean> {
  const existing = await sql<{ enumlabel: string }[]>`
    SELECT e.enumlabel
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'payment_method' AND e.enumlabel = ${value}
  `;
  if (existing.length > 0) return false;

  try {
    await sql.unsafe(`ALTER TYPE payment_method ADD VALUE IF NOT EXISTS '${value}'`);
  } catch {
    try {
      await sql.unsafe(`ALTER TYPE payment_method ADD VALUE '${value}'`);
    } catch {
      // Already present.
    }
  }
  return true;
}

export async function paymentMethodHasValue(value: string): Promise<boolean> {
  if (!hasDatabase()) return false;
  const url = process.env.DATABASE_URL;
  if (!url) return false;

  const sql = postgres(url, { max: 1 });
  try {
    const rows = await sql<{ enumlabel: string }[]>`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'payment_method' AND e.enumlabel = ${value}
    `;
    return rows.length > 0;
  } finally {
    await sql.end();
  }
}

export async function payphoneMigrationNeeded(): Promise<boolean> {
  if (!hasDatabase()) return false;
  try {
    return !(await paymentMethodHasValue("payphone"));
  } catch {
    return true;
  }
}

export async function applyPayPhoneMigration(): Promise<PayPhoneMigrationResult> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL no configurada.");

  const sql = postgres(url, { max: 1 });
  try {
    const payphoneAdded = await addPaymentMethodValue(sql, "payphone");
    return { payphoneAdded };
  } finally {
    await sql.end();
  }
}
