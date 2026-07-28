import { applyBillingMigration } from "@/lib/apply-billing-migration";

async function main() {
  const result = await applyBillingMigration();
  console.log("Migración aplicada:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
