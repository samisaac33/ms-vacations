import { getDb, hasDatabase } from "@/db/index";
import { syncLogs } from "@/db/schema";

export async function logEmailEvent(
  propertyId: string | null,
  level: "info" | "error",
  message: string,
): Promise<void> {
  if (!hasDatabase()) {
    console.info(`[email:${level}]`, message);
    return;
  }
  const db = getDb();
  await db.insert(syncLogs).values({ propertyId, level, message });
}
