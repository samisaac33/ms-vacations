import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import { getAvailabilityBySlug } from "@/lib/availability-query";
import { eachDayIsoInclusive } from "@/lib/dates";
import {
  blockedNightsInRange,
  clearNightlyRatesForDates,
  getPropertyById,
  parseReferenceUsd,
  upsertNightlyRates,
} from "@/lib/pricing-query";

export type AdminPricingMutationResult =
  | { ok: true; success: string; slug?: string }
  | { ok: false; error: string; status: number };

export function revalidatePricingPaths(slug?: string) {
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

export async function updatePropertyBasePriceMutation(
  propertyId: unknown,
  referencePriceUsdRaw: unknown,
): Promise<AdminPricingMutationResult> {
  if (typeof propertyId !== "string" || typeof referencePriceUsdRaw !== "string") {
    return { ok: false, error: "Datos incompletos.", status: 400 };
  }

  const referencePriceUsd = Number.parseFloat(referencePriceUsdRaw.replace(",", "."));
  if (!Number.isFinite(referencePriceUsd) || referencePriceUsd < 1 || referencePriceUsd > 10_000) {
    return { ok: false, error: "Ingrese un precio válido (1–10000 USD).", status: 400 };
  }

  if (!hasDatabase()) {
    return { ok: false, error: "DATABASE_URL no configurada.", status: 503 };
  }

  const basePricePerNightCents = Math.round(referencePriceUsd * 100);
  const db = getDb();
  const updated = await db
    .update(properties)
    .set({ basePricePerNightCents })
    .where(eq(properties.id, propertyId))
    .returning({ slug: properties.slug });

  if (updated.length === 0) {
    return { ok: false, error: "Propiedad no encontrada.", status: 404 };
  }

  const slug = updated[0]!.slug;
  revalidatePricingPaths(slug);

  return {
    ok: true,
    slug,
    success: `Tarifa base actualizada ($${referencePriceUsd.toFixed(2)}/noche).`,
  };
}

export async function saveNightlyRatesMutation(input: {
  propertyId: unknown;
  startDate: unknown;
  endDate: unknown;
  referencePriceUsdRaw: unknown;
}): Promise<AdminPricingMutationResult> {
  const { propertyId, startDate, endDate, referencePriceUsdRaw } = input;
  if (
    typeof propertyId !== "string" ||
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    typeof referencePriceUsdRaw !== "string"
  ) {
    return { ok: false, error: "Datos incompletos.", status: 400 };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { ok: false, error: "Fechas inválidas.", status: 400 };
  }

  const referencePriceUsd = parseReferenceUsd(referencePriceUsdRaw);
  if (referencePriceUsd === null) {
    return { ok: false, error: "Ingrese un precio válido (1–10000 USD).", status: 400 };
  }

  if (!hasDatabase()) {
    return { ok: false, error: "DATABASE_URL no configurada.", status: 503 };
  }

  const prop = await getPropertyById(propertyId);
  if (!prop) return { ok: false, error: "Propiedad no encontrada.", status: 404 };

  const dates = eachDayIsoInclusive(startDate, endDate);
  const availability = await getAvailabilityBySlug(prop.slug);
  const blocked = blockedNightsInRange(dates, availability?.blocks ?? []);
  if (blocked.length > 0) {
    return {
      ok: false,
      error: `No se puede editar precio en ${blocked.length} noche(s) bloqueada(s) (Airbnb o reserva).`,
      status: 400,
    };
  }

  await upsertNightlyRates(propertyId, dates, Math.round(referencePriceUsd * 100));
  revalidatePricingPaths(prop.slug);

  return {
    ok: true,
    slug: prop.slug,
    success: `Precio guardado en ${dates.length} noche(s): $${referencePriceUsd.toFixed(2)}/noche.`,
  };
}

export async function clearNightlyRatesMutation(input: {
  propertyId: unknown;
  startDate: unknown;
  endDate: unknown;
}): Promise<AdminPricingMutationResult> {
  const { propertyId, startDate, endDate } = input;
  if (typeof propertyId !== "string" || typeof startDate !== "string" || typeof endDate !== "string") {
    return { ok: false, error: "Datos incompletos.", status: 400 };
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
    return { ok: false, error: "Fechas inválidas.", status: 400 };
  }

  if (!hasDatabase()) {
    return { ok: false, error: "DATABASE_URL no configurada.", status: 503 };
  }

  const prop = await getPropertyById(propertyId);
  if (!prop) return { ok: false, error: "Propiedad no encontrada.", status: 404 };

  const dates = eachDayIsoInclusive(startDate, endDate);
  await clearNightlyRatesForDates(propertyId, dates);
  revalidatePricingPaths(prop.slug);

  return {
    ok: true,
    slug: prop.slug,
    success: `${dates.length} noche(s) restablecidas a la tarifa base.`,
  };
}
