import postgres from "postgres";
import { paymentMethodHasValue } from "@/lib/apply-payphone-migration";
import { bookingStatusHasValue } from "@/lib/apply-split-payment-migration";

const SPLIT_COLUMNS = [
  "payment_timing",
  "deposit_cents",
  "balance_cents",
  "balance_due_at",
  "deposit_paid_at",
  "terms_accepted_at",
  "terms_version",
] as const;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL requerida.");
    process.exit(1);
  }

  const sql = postgres(url, { max: 1, prepare: false });
  const issues: string[] = [];

  try {
    const [{ exists: paymentTimingType }] = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_timing') AS exists
    `;
    if (!paymentTimingType) {
      issues.push("Falta el tipo enum payment_timing");
    }

    const columns = await sql<{ column_name: string }[]>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'bookings'
        AND column_name = ANY(${[...SPLIT_COLUMNS]})
    `;
    const found = new Set(columns.map((row) => row.column_name));
    for (const column of SPLIT_COLUMNS) {
      if (!found.has(column)) {
        issues.push(`Falta la columna bookings.${column}`);
      }
    }

    const payphoneOk = await paymentMethodHasValue("payphone");
    if (!payphoneOk) {
      issues.push('Falta el valor "payphone" en payment_method');
    }

    const pendingBalanceOk = await bookingStatusHasValue("pending_balance");
    if (!pendingBalanceOk) {
      issues.push('Falta el valor "pending_balance" en booking_status');
    }

    const usesTransactionPooler = url.includes(":6543") || url.includes("pgbouncer=true");
    if (usesTransactionPooler) {
      issues.push(
        "DATABASE_URL usa transaction pooler (puerto 6543). Use Session/Direct (5432) en Vercel.",
      );
    }

    if (issues.length === 0) {
      console.log("Esquema de reservas OK para PayPhone y pago fraccionado.");
      return;
    }

    console.error("Problemas detectados:");
    for (const issue of issues) {
      console.error(`- ${issue}`);
    }
    console.error("\nMigraciones sugeridas:");
    console.error("  npm run db:migrate:payphone");
    console.error("  npm run db:migrate:split-payment");
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
