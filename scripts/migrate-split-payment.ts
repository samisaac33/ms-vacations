import { applySplitPaymentMigration } from "@/lib/apply-split-payment-migration";

async function main() {
  const result = await applySplitPaymentMigration();
  console.log("Migración aplicada:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
