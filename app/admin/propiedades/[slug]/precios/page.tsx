import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminLoginForm } from "@/app/admin/admin-login-form";
import { AdminPricingCalendar } from "@/app/admin/admin-pricing-calendar";
import { AdminPropertyStrip } from "@/app/admin/admin-property-strip";
import { listAdminCalendarProperties } from "@/lib/admin-calendar-query";
import { getPropertyBySlug } from "@/lib/properties";
import { getPropertyRowBySlug } from "@/lib/property-db";

export const metadata = {
  title: "Calendario de precios",
  robots: { index: false, follow: false },
};

type Props = { params: Promise<{ slug: string }> };

export default async function AdminPropertyPricingPage(props: Props) {
  const store = await cookies();
  const ok = store.get("admin_session")?.value === "1";

  if (!ok) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16">
        <h1 className="text-xl font-semibold">Acceso equipo</h1>
        <AdminLoginForm />
      </div>
    );
  }

  const { slug } = await props.params;
  const catalog = getPropertyBySlug(slug);
  if (!catalog) notFound();

  const row = await getPropertyRowBySlug(slug);
  const propertyList = listAdminCalendarProperties();

  if (!row) {
    return (
      <AdminCalendarShell activeTab="calendario" title="Calendario de precios">
        <p className="text-sm text-amber-800">
          Propiedad no encontrada en la base de datos. Ejecute{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:seed</code>.
        </p>
      </AdminCalendarShell>
    );
  }

  return (
    <AdminCalendarShell activeTab="calendario" title={catalog.name}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <AdminPropertyStrip properties={propertyList} activeSlug={slug} />
        <div className="min-w-0 flex-1">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-zinc-200" />}>
            <AdminPricingCalendar
              propertyId={row.id}
              propertyName={catalog.name}
              propertySlug={slug}
              initialBaseReferenceUsd={row.basePricePerNightCents / 100}
              minNights={1}
              maxNights={30}
            />
          </Suspense>
        </div>
      </div>
    </AdminCalendarShell>
  );
}
