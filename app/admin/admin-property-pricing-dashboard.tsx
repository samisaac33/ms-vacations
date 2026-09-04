import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminPricingCalendar } from "@/app/admin/admin-pricing-calendar";
import { AdminPropertyStrip } from "@/app/admin/admin-property-strip";
import { listAdminCalendarProperties } from "@/lib/admin-calendar-query";
import { getPropertyBySlug } from "@/lib/properties";
import { getPropertyRowBySlug } from "@/lib/property-db";

type Props = { params: Promise<{ slug: string }> };

export async function AdminPropertyPricingDashboard({ params }: Props) {
  const { slug } = await params;
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
