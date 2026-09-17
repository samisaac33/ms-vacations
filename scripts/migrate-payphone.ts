import { applyPayPhoneMigration } from "@/lib/apply-payphone-migration";

async function main() {
  const result = await applyPayPhoneMigration();
  console.log("Migración aplicada:", result);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
