"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import { isAdminSession, clearAdminSessionCookie, setAdminSessionCookie } from "@/lib/admin-auth";
import { isValidIcalUrl } from "@/lib/admin-dashboard";
import {
  getAdminMultiCalendar,
  getAdminPropertyCalendar,
  type CalendarStayBar,
} from "@/lib/admin-calendar-query";
import { getAvailabilityBySlug } from "@/lib/availability-query";
import {
  blockedNightsInRange,
  clearNightlyRatesForDates,
  getPropertyById,
  parseReferenceUsd,
  type PricingDay,
  upsertNightlyRates,
} from "@/lib/pricing-query";
import { syncAllPropertiesIcal } from "@/lib/ical-sync";
import { applyBeachPricesToDatabase } from "@/lib/apply-beach-prices-db";
import {
  applySplitPaymentMigration,
  bookingStatusHasValue,
} from "@/lib/apply-split-payment-migration";
import { eachDayIsoInclusive } from "@/lib/dates";
import {
  confirmBankTransferBooking,
  rejectBankTransferBooking,
} from "@/lib/booking-service";

function revalidatePricingPaths(slug?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  revalidatePath("/");
  revalidatePath("/propiedades");
  revalidatePath("/guia");
  revalidatePath("/propiedades", "layout");
  revalidatePath("/reservar", "layout");
  if (slug) {
    revalidatePath(`/admin/propiedades/${slug}/precios`);
  }
}

export type AdminLoginState = { error?: string };
export type AdminActionState = { error?: string; success?: string };
export type IcalActionState = AdminActionState;

export async function adminLogin(
  _prev: AdminLoginState | undefined,
  formData: FormData,
): Promise<AdminLoginState> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    return { error: "ADMIN_SECRET no está configurado en el servidor." };
  }
  const password = formData.get("password");
  if (typeof password !== "string" || password !== secret) {
    return { error: "Contraseña incorrecta." };
  }
  await setAdminSessionCookie();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSessionCookie();
  redirect("/admin");
}

export type AdminPricingMonthResult =
  | { ok: true; baseReferenceCents: number; days: PricingDay[]; bars: CalendarStayBar[] }
  | { ok: false; error: string };

export type AdminMultiCalendarResult =
  | {
      ok: true;
      properties: Awaited<ReturnType<typeof getAdminMultiCalendar>>;
    }
  | { ok: false; error: string };

export async function fetchAdminPricingMonth(
  propertyId: string,
  from: string,
  to: string,
): Promise<AdminPricingMonthResult> {
  if (!(await isAdminSession())) {
    return { ok: false, error: "No autorizado." };
  }
  if (!hasDatabase()) {
    return { ok: false, error: "Base de datos no configurada." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return { ok: false, error: "Fechas inválidas." };
  }

  const data = await getAdminPropertyCalendar(propertyId, from, to);
  if (!data) {
    return { ok: false, error: "Propiedad no encontrada." };
  }

  return {
    ok: true,
    baseReferenceCents: data.baseReferenceCents,
    days: data.days,
    bars: data.bars,
  };
}

export async function fetchAdminMultiCalendar(from: string, to: string): Promise<AdminMultiCalendarResult> {
  if (!(await isAdminSession())) {
    return { ok: false, error: "No autorizado." };
  }
  if (!hasDatabase()) {
    return { ok: false, error: "Base de datos no configurada." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return { ok: false, error: "Fechas inválidas." };
  }

  const properties = await getAdminMultiCalendar(from, to);
  if (!properties) {
    return { ok: false, error: "No se pudo cargar el calendario." };
  }

  return { ok: true, properties };
}

export async function updateIcalUrl(
  _prev: IcalActionState | undefined,
  formData: FormData,
): Promise<IcalActionState> {
  if (!(await isAdminSession())) {
    return { error: "No autorizado." };
  }
  if (!hasDatabase()) {
    return { error: "DATABASE_URL no configurada." };
  }

  const propertyId = formData.get("propertyId");
  const icalUrl = formData.get("icalUrl");
  if (typeof propertyId !== "string" || typeof icalUrl !== "string") {
    return { error: "Datos incompletos." };
  }

  const trimmed = icalUrl.trim();
  if (!isValidIcalUrl(trimmed)) {
    return { error: "La URL debe ser https:// y terminar en .ics" };
  }

  const db = getDb();
  const updated = await db
    .update(properties)
    .set({ icalUrl: trimmed })
    .where(eq(properties.id, propertyId))
    .returning({ id: properties.id });

  if (updated.length === 0) {
    return { error: "Propiedad no encontrada." };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  return { success: "URL iCal actualizada." };
}

export async function updatePropertyBasePrice(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  return updatePropertyPrice(_prev, formData);
}

export async function updatePropertyPrice(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) {
    return { error: "No autorizado." };
  }
  if (!hasDatabase()) {
    return { error: "DATABASE_URL no configurada." };
  }

  const propertyId = formData.get("propertyId");
  const raw = formData.get("referencePriceUsd");
  if (typeof propertyId !== "string" || typeof raw !== "string") {
    return { error: "Datos incompletos." };
  }

  const referencePriceUsd = Number.parseFloat(raw.replace(",", "."));
  if (!Number.isFinite(referencePriceUsd) || referencePriceUsd < 1 || referencePriceUsd > 10_000) {
    return { error: "Ingrese un precio válido (1–10000 USD)." };
  }

  const basePricePerNightCents = Math.round(referencePriceUsd * 100);
  const db = getDb();
  const updated = await db
    .update(properties)
    .set({ basePricePerNightCents })
    .where(eq(properties.id, propertyId))
    .returning({ slug: properties.slug });

  if (updated.length === 0) {
    return { error: "Propiedad no encontrada." };
  }

  revalidatePricingPaths(updated[0]!.slug);

  return {
    success: `Tarifa base actualizada ($${referencePriceUsd.toFixed(2)}/noche).`,
  };
}

export async function saveNightlyRates(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) {
    return { error: "No autorizado." };
  }
  if (!hasDatabase()) {
    return { error: "DATABASE_URL no configurada." };
  }

  const propertyId = formData.get("propertyId");
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  const raw = formData.get("referencePriceUsd");

  if (
    typeof propertyId !== "string" ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    typeof raw !== "string"
  ) {
    return { error: "Datos incompletos." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { error: "Fechas inválidas." };
  }

  const referencePriceUsd = parseReferenceUsd(raw);
  if (referencePriceUsd === null) {
    return { error: "Ingrese un precio válido (1–10000 USD)." };
  }

  const prop = await getPropertyById(propertyId);
  if (!prop) return { error: "Propiedad no encontrada." };

  const dates = eachDayIsoInclusive(startDate, endDate);
  const availability = await getAvailabilityBySlug(prop.slug);
  const blocked = blockedNightsInRange(dates, availability?.blocks ?? []);
  if (blocked.length > 0) {
    return {
      error: `No se puede editar precio en ${blocked.length} noche(s) bloqueada(s) (Airbnb o reserva).`,
    };
  }

  await upsertNightlyRates(propertyId, dates, Math.round(referencePriceUsd * 100));
  revalidatePricingPaths(prop.slug);

  return {
    success: `Precio guardado en ${dates.length} noche(s): $${referencePriceUsd.toFixed(2)}/noche.`,
  };
}

export async function clearNightlyRates(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) {
    return { error: "No autorizado." };
  }
  if (!hasDatabase()) {
    return { error: "DATABASE_URL no configurada." };
  }

  const propertyId = formData.get("propertyId");
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");

  if (typeof propertyId !== "string" || typeof startDate !== "string" || typeof endDate !== "string") {
    return { error: "Datos incompletos." };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { error: "Fechas inválidas." };
  }

  const prop = await getPropertyById(propertyId);
  if (!prop) return { error: "Propiedad no encontrada." };

  const dates = eachDayIsoInclusive(startDate, endDate);
  await clearNightlyRatesForDates(propertyId, dates);
  revalidatePricingPaths(prop.slug);

  return { success: `${dates.length} noche(s) restablecidas a la tarifa base.` };
}

export async function applyBeachBasePrices(
  _prev: IcalActionState | undefined,
  _formData: FormData,
): Promise<IcalActionState> {
  if (!(await isAdminSession())) {
    return { error: "No autorizado." };
  }
  if (!hasDatabase()) {
    return { error: "DATABASE_URL no configurada." };
  }

  try {
    const results = await applyBeachPricesToDatabase();
    revalidatePricingPaths();
    const summary = results
      .map(({ slug, priorUsd, newUsd, transferUsd }) =>
        `${slug}: $${priorUsd}→base $${newUsd} (transfer. $${transferUsd})`,
      )
      .join(" · ");

    return { success: `Tarifas de playa actualizadas. ${summary}` };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `No se pudieron actualizar tarifas: ${message}` };
  }
}

export async function applySplitPaymentSchema(
  _prev: IcalActionState | undefined,
  _formData: FormData,
): Promise<IcalActionState> {
  if (!(await isAdminSession())) {
    return { error: "No autorizado." };
  }
  if (!hasDatabase()) {
    return { error: "DATABASE_URL no configurada." };
  }

  try {
    const result = await applySplitPaymentMigration();
    revalidatePricingPaths();
    return {
      success: `Migración aplicada. pending_balance: ${result.pendingBalanceAdded ? "añadido" : "ya existía"}.`,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `No se pudo aplicar la migración: ${message}` };
  }
}

export async function splitPaymentMigrationNeeded(): Promise<boolean> {
  if (!hasDatabase()) return false;
  try {
    return !(await bookingStatusHasValue("pending_balance"));
  } catch {
    return true;
  }
}

export async function triggerIcalSync(
  _prev: IcalActionState | undefined,
  _formData: FormData,
): Promise<IcalActionState> {
  if (!(await isAdminSession())) {
    return { error: "No autorizado." };
  }
  if (!hasDatabase()) {
    return { error: "DATABASE_URL no configurada." };
  }

  try {
    const result = await syncAllPropertiesIcal();
    revalidatePath("/admin");
    revalidatePath("/admin/configuracion");
    if (result.failed > 0) {
      return {
        success: `Sync parcial: ${result.synced} OK, ${result.failed} fallidas. Revise los logs.`,
      };
    }
    return { success: `Sync completada: ${result.synced} propiedades importadas.` };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `Sync falló: ${message}` };
  }
}

export async function confirmBankTransfer(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string" || !bookingId) return { error: "Reserva no indicada." };
  const result = await confirmBankTransferBooking(bookingId);
  if (!result.ok) return { error: result.reason };
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  return { success: "Reserva confirmada." };
}

export async function rejectBankTransfer(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string" || !bookingId) return { error: "Reserva no indicada." };
  const result = await rejectBankTransferBooking(bookingId);
  if (!result.ok) return { error: result.reason };
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  return { success: "Reserva rechazada y fechas liberadas." };
}
