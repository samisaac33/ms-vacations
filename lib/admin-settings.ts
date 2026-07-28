import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { adminSettings } from "@/db/schema";

const SETTINGS_ID = "default";

export type AdminSettings = {
  notificationEmail: string | null;
};

function envNotificationEmailFallback(): string | undefined {
  const admin = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  if (admin) return admin;
  const bank = process.env.BANK_EMAIL?.trim();
  if (bank) return bank;
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || undefined;
}

export async function getAdminSettings(): Promise<AdminSettings> {
  if (!hasDatabase()) {
    return { notificationEmail: envNotificationEmailFallback() ?? null };
  }
  try {
    const db = getDb();
    const [row] = await db
      .select({ notificationEmail: adminSettings.notificationEmail })
      .from(adminSettings)
      .where(eq(adminSettings.id, SETTINGS_ID))
      .limit(1);
    return { notificationEmail: row?.notificationEmail ?? null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const missing =
      (e && typeof e === "object" && "code" in e && (e as { code: string }).code === "42P01") ||
      msg.includes("does not exist");
    if (missing) {
      return { notificationEmail: envNotificationEmailFallback() ?? null };
    }
    throw e;
  }
}

export async function getEffectiveNotificationEmail(): Promise<string | undefined> {
  const settings = await getAdminSettings();
  const fromDb = settings.notificationEmail?.trim();
  if (fromDb) return fromDb;
  return envNotificationEmailFallback();
}

export async function updateNotificationEmail(email: string): Promise<void> {
  if (!hasDatabase()) throw new Error("Base de datos no configurada");
  const trimmed = email.trim();
  const db = getDb();
  await db
    .insert(adminSettings)
    .values({
      id: SETTINGS_ID,
      notificationEmail: trimmed,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: adminSettings.id,
      set: { notificationEmail: trimmed, updatedAt: new Date() },
    });
}

export function getEnvNotificationEmailFallback(): string | undefined {
  return envNotificationEmailFallback();
}
