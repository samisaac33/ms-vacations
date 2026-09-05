"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import { isAdminSession } from "@/lib/admin-auth";
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
  splitPaymentMigrationNeeded as checkSplitPaymentMigrationNeeded,
} from "@/lib/apply-split-payment-migration";
import { applyBillingMigration, billingMigrationNeeded as checkBillingMigrationNeeded } from "@/lib/apply-billing-migration";
import { eachDayIsoInclusive } from "@/lib/dates";
import {
  isVerificationMode,
  parsePartialAmountUsd,
} from "@/lib/bank-transfer-verification";
import {
  cancelBankTransferBookingAdmin,
  confirmBankTransferBooking,
  rejectBankTransferBooking,
} from "@/lib/booking-service";
import {
  getAdminSettings,
  getEnvNotificationEmailFallback,
  updateNotificationEmail,
} from "@/lib/admin-settings";
import {
  addPromotionalVatPeriod,
  deletePromotionalVatPeriod,
} from "@/lib/vat-periods-query";
import {
  addHighSeasonPeriod,
  deleteHighSeasonPeriod,
} from "@/lib/high-season-query";
import {
  applyPropertyImagesMigration,
  propertyImagesMigrationNeeded as checkPropertyImagesMigrationNeeded,
} from "@/lib/apply-property-images-migration";
import {
  deletePropertyImage,
  getPropertyImageById,
  importCatalogImagesForProperty,
  listPropertyImagesByPropertyId,
  reorderPropertyImages,
  resetPropertyImagesToCatalog,
  setPropertyImageAsCover,
  updatePropertyImageAlt,
} from "@/lib/property-images-query";
import { ensurePropertyRowBySlug } from "@/lib/property-db";
import { getPropertyBySlug } from "@/lib/properties";
import { deletePropertyImageFile } from "@/lib/storage";

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
    revalidatePath(`/admin/propiedades/${slug}/fotos`);
    revalidatePath(`/propiedades/${slug}`);
    revalidatePath(`/reservar/${slug}`);
  }
}

export type AdminActionState = { error?: string; success?: string };
export type IcalActionState = AdminActionState;

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

export async function applyBillingSchema(
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
    const result = await applyBillingMigration();
    revalidatePath("/admin/configuracion");
    revalidatePath("/admin/dev");
    return {
      success: `Migración de facturación aplicada. Tipo billing_id_type: ${result.billingIdTypeCreated ? "creado" : "ya existía"}.`,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `No se pudo aplicar la migración: ${message}` };
  }
}

export async function billingMigrationNeeded(): Promise<boolean> {
  return checkBillingMigrationNeeded();
}

export async function splitPaymentMigrationNeeded(): Promise<boolean> {
  return checkSplitPaymentMigrationNeeded();
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

  const verificationModeRaw = formData.get("verificationMode");
  if (typeof verificationModeRaw !== "string" || !verificationModeRaw) {
    return { error: "Seleccione el tipo de pago verificado." };
  }
  if (!isVerificationMode(verificationModeRaw)) {
    return { error: "Tipo de pago verificado inválido." };
  }

  let partialCents: number | undefined;
  if (verificationModeRaw === "partial") {
    const partialAmountUsd = formData.get("partialAmountUsd");
    if (typeof partialAmountUsd !== "string") {
      return { error: "Indique el monto parcial verificado." };
    }
    const parsed = parsePartialAmountUsd(partialAmountUsd);
    if (parsed == null) {
      return { error: "Monto parcial inválido." };
    }
    partialCents = parsed;
  }

  const result = await confirmBankTransferBooking(bookingId, {
    mode: verificationModeRaw,
    partialCents,
  });
  if (!result.ok) return { error: result.reason };
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");

  if (result.emailKind === "deposit" && result.balanceCents != null && result.balanceCents > 0) {
    const balanceUsd = (result.balanceCents / 100).toFixed(2);
    return { success: `Anticipo registrado. Saldo pendiente: $${balanceUsd}.` };
  }
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

export async function cancelBankTransfer(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const bookingId = formData.get("bookingId");
  if (typeof bookingId !== "string" || !bookingId) return { error: "Reserva no indicada." };
  const result = await cancelBankTransferBookingAdmin(bookingId);
  if (!result.ok) return { error: result.reason };
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  return { success: "Reserva cancelada y fechas liberadas." };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function updateAdminNotificationEmail(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const email = formData.get("notificationEmail");
  if (typeof email !== "string" || !email.trim()) {
    return { error: "Ingresa un correo válido." };
  }
  const trimmed = email.trim();
  if (!EMAIL_RE.test(trimmed)) {
    return { error: "Formato de correo inválido." };
  }
  try {
    await updateNotificationEmail(trimmed);
    revalidatePath("/admin/configuracion");
    return { success: "Correo de notificaciones actualizado." };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: message };
  }
}

export async function addPromotionalVatPeriodAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  const label = formData.get("label");
  if (typeof startDate !== "string" || typeof endDate !== "string") {
    return { error: "Fechas requeridas." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { error: "Formato de fecha inválido." };
  }
  const result = await addPromotionalVatPeriod({
    startDate,
    endDate,
    label: typeof label === "string" ? label : undefined,
  });
  if (!result.ok) return { error: result.reason };
  revalidatePath("/admin/configuracion");
  revalidatePath("/terminos");
  revalidatePath("/propiedades");
  revalidatePath("/reservar", "layout");
  return { success: "Período IVA 8 % agregado." };
}

export async function deletePromotionalVatPeriodAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const id = formData.get("periodId");
  if (typeof id !== "string" || !id) return { error: "Período no indicado." };
  const result = await deletePromotionalVatPeriod(id);
  if (!result.ok) return { error: result.reason };
  revalidatePath("/admin/configuracion");
  revalidatePath("/terminos");
  revalidatePath("/propiedades");
  revalidatePath("/reservar", "layout");
  return { success: "Período eliminado." };
}

function revalidateHighSeasonPaths() {
  revalidatePath("/admin/configuracion");
  revalidatePath("/propiedades");
  revalidatePath("/propiedades", "layout");
  revalidatePath("/reservar", "layout");
}

export async function addHighSeasonPeriodAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const startDate = formData.get("startDate");
  const endDate = formData.get("endDate");
  const label = formData.get("label");
  const minNightsRaw = formData.get("minNights");
  const propertyIds = formData.getAll("propertyIds").filter((v): v is string => typeof v === "string");

  if (typeof startDate !== "string" || typeof endDate !== "string") {
    return { error: "Fechas requeridas." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { error: "Formato de fecha inválido." };
  }

  const minNights = typeof minNightsRaw === "string" ? Number.parseInt(minNightsRaw, 10) : NaN;
  if (!Number.isFinite(minNights)) {
    return { error: "Indica el mínimo de noches." };
  }

  const result = await addHighSeasonPeriod({
    startDate,
    endDate,
    minNights,
    label: typeof label === "string" ? label : undefined,
    propertyIds,
  });
  if (!result.ok) return { error: result.reason };
  revalidateHighSeasonPaths();
  return { success: "Temporada alta agregada." };
}

export async function deleteHighSeasonPeriodAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const id = formData.get("periodId");
  if (typeof id !== "string" || !id) return { error: "Período no indicado." };
  const result = await deleteHighSeasonPeriod(id);
  if (!result.ok) return { error: result.reason };
  revalidateHighSeasonPaths();
  return { success: "Temporada alta eliminada." };
}

export async function getAdminNotificationSettingsForPanel() {
  const settings = await getAdminSettings();
  return {
    notificationEmail: settings.notificationEmail,
    envFallback: getEnvNotificationEmailFallback() ?? null,
  };
}

export async function propertyImagesMigrationNeeded(): Promise<boolean> {
  return checkPropertyImagesMigrationNeeded();
}

export async function applyPropertyImagesSchema(
  _prev: AdminActionState | undefined,
  _formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  if (!hasDatabase()) return { error: "DATABASE_URL no configurada." };

  try {
    const result = await applyPropertyImagesMigration();
    revalidatePath("/admin/configuracion");
    revalidatePath("/admin/dev");
    return {
      success: result.tableCreated
        ? "Tabla property_images creada."
        : "Tabla property_images ya existía.",
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { error: `No se pudo aplicar la migración: ${message}` };
  }
}

export async function updatePropertyImageAltAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const imageId = formData.get("imageId");
  const alt = formData.get("alt");
  if (typeof imageId !== "string" || typeof alt !== "string" || !alt.trim()) {
    return { error: "Datos incompletos." };
  }

  const image = await getPropertyImageById(imageId);
  if (!image) return { error: "Imagen no encontrada." };

  const result = await updatePropertyImageAlt(imageId, alt);
  if (!result.ok) return { error: result.reason };

  revalidatePricingPaths(image.slug);
  return { success: "Texto alternativo actualizado." };
}

export async function deletePropertyImageAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const imageId = formData.get("imageId");
  const deleteFile = formData.get("deleteFile") === "1";
  if (typeof imageId !== "string" || !imageId) return { error: "Imagen no indicada." };

  const before = await getPropertyImageById(imageId);
  if (!before) return { error: "Imagen no encontrada." };

  const result = await deletePropertyImage(imageId);
  if (!result.ok) return { error: result.reason };

  if (deleteFile) {
    const removed = await deletePropertyImageFile(result.storagePath);
    if (!removed.ok) {
      revalidatePricingPaths(before.slug);
      return {
        success: "Imagen eliminada del catálogo. No se pudo borrar el archivo en storage.",
      };
    }
  }

  revalidatePricingPaths(before.slug);
  return { success: deleteFile ? "Imagen y archivo eliminados." : "Imagen eliminada del catálogo." };
}

export async function movePropertyImageAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const propertyId = formData.get("propertyId");
  const imageId = formData.get("imageId");
  const direction = formData.get("direction");
  if (
    typeof propertyId !== "string" ||
    typeof imageId !== "string" ||
    (direction !== "up" && direction !== "down")
  ) {
    return { error: "Datos incompletos." };
  }

  const images = await listPropertyImagesByPropertyId(propertyId);
  const idx = images.findIndex((i) => i.id === imageId);
  if (idx === -1) return { error: "Imagen no encontrada." };

  const swapWith = direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= images.length) {
    return { error: "No se puede mover más en esa dirección." };
  }

  const ordered = images.map((i) => i.id);
  [ordered[idx], ordered[swapWith]] = [ordered[swapWith]!, ordered[idx]!];

  const result = await reorderPropertyImages(propertyId, ordered);
  if (!result.ok) return { error: result.reason };

  const slug = await getSlugByPropertyId(propertyId);
  if (slug) revalidatePricingPaths(slug);
  else revalidatePath("/admin");

  return { success: direction === "up" ? "Imagen movida arriba." : "Imagen movida abajo." };
}

export async function reorderPropertyImagesAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const propertyId = formData.get("propertyId");
  const orderedIdsRaw = formData.get("orderedIds");
  if (typeof propertyId !== "string" || typeof orderedIdsRaw !== "string") {
    return { error: "Datos incompletos." };
  }

  let orderedIds: string[];
  try {
    orderedIds = JSON.parse(orderedIdsRaw) as string[];
    if (!Array.isArray(orderedIds) || !orderedIds.every((id) => typeof id === "string")) {
      return { error: "Orden inválido." };
    }
  } catch {
    return { error: "Orden inválido." };
  }

  const result = await reorderPropertyImages(propertyId, orderedIds);
  if (!result.ok) return { error: result.reason };

  const slug = await getSlugByPropertyId(propertyId);
  if (slug) revalidatePricingPaths(slug);
  return { success: "Orden actualizado." };
}

async function getSlugByPropertyId(propertyId: string): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select({ slug: properties.slug })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  return row?.slug ?? null;
}

export async function setPropertyImageCoverAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const propertyId = formData.get("propertyId");
  const imageId = formData.get("imageId");
  if (typeof propertyId !== "string" || typeof imageId !== "string") {
    return { error: "Datos incompletos." };
  }

  const result = await setPropertyImageAsCover(propertyId, imageId);
  if (!result.ok) return { error: result.reason };

  const slug = await getSlugByPropertyId(propertyId);
  if (slug) revalidatePricingPaths(slug);
  return { success: "Imagen establecida como portada." };
}

export async function importCatalogImagesAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const slug = formData.get("slug");
  if (typeof slug !== "string" || !slug) return { error: "Propiedad no indicada." };

  const catalog = getPropertyBySlug(slug);
  if (!catalog) return { error: "Propiedad no encontrada." };

  const row = await ensurePropertyRowBySlug(slug);
  if (!row) return { error: "Propiedad no encontrada en la base de datos." };

  const result = await importCatalogImagesForProperty(row.id, catalog.images);
  if (!result.ok) return { error: result.reason };

  revalidatePricingPaths(slug);
  return { success: `${result.count} fotos importadas del catálogo.` };
}

export async function resetPropertyImagesAction(
  _prev: AdminActionState | undefined,
  formData: FormData,
): Promise<AdminActionState> {
  if (!(await isAdminSession())) return { error: "No autorizado." };
  const slug = formData.get("slug");
  if (typeof slug !== "string" || !slug) return { error: "Propiedad no indicada." };

  const row = await ensurePropertyRowBySlug(slug);
  if (!row) return { error: "Propiedad no encontrada en la base de datos." };

  const result = await resetPropertyImagesToCatalog(row.id);
  if (!result.ok) return { error: result.reason };

  revalidatePricingPaths(slug);
  return {
    success:
      result.deleted > 0
        ? `${result.deleted} foto(s) eliminadas. El sitio usa el catálogo estático.`
        : "Sin fotos en base de datos; el catálogo estático ya estaba activo.",
  };
}
