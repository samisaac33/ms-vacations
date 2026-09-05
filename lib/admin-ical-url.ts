import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import { isValidIcalUrl } from "@/lib/admin-dashboard";

export type IcalUrlInput =
  | { valid: true; propertyId: string; icalUrl: string }
  | { valid: false; error: string; status: number };

export function parseIcalUrlUpdate(propertyId: unknown, icalUrl: unknown): IcalUrlInput {
  if (typeof propertyId !== "string" || typeof icalUrl !== "string") {
    return { valid: false, error: "Datos incompletos.", status: 400 };
  }

  const trimmed = icalUrl.trim();
  if (!isValidIcalUrl(trimmed)) {
    return { valid: false, error: "La URL debe ser https:// y terminar en .ics", status: 400 };
  }

  return { valid: true, propertyId, icalUrl: trimmed };
}

export type UpdateIcalUrlResult =
  | { ok: true; message: string }
  | { ok: false; error: string; status: number };

export async function updatePropertyIcalUrl(
  propertyId: string,
  icalUrl: string,
): Promise<UpdateIcalUrlResult> {
  if (!hasDatabase()) {
    return { ok: false, error: "DATABASE_URL no configurada.", status: 503 };
  }

  const db = getDb();
  const updated = await db
    .update(properties)
    .set({ icalUrl })
    .where(eq(properties.id, propertyId))
    .returning({ id: properties.id });

  if (updated.length === 0) {
    return { ok: false, error: "Propiedad no encontrada.", status: 404 };
  }

  return { ok: true, message: "URL iCal actualizada." };
}
