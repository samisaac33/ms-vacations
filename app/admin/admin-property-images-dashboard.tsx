import { notFound } from "next/navigation";
import { AdminCalendarShell } from "@/app/admin/admin-calendar-shell";
import { AdminMigratePropertyImagesPanel } from "@/app/admin/admin-migrate-property-images";
import { AdminPropertyImagesPanel } from "@/app/admin/admin-property-images-panel";
import { AdminPropertyStrip } from "@/app/admin/admin-property-strip";
import { AdminPropertySubnav } from "@/app/admin/admin-property-subnav";
import { propertyImagesMigrationNeeded } from "@/lib/apply-property-images-migration";
import { listAdminCalendarProperties } from "@/lib/admin-calendar-query";
import { listPropertyImagesByPropertyId } from "@/lib/property-images-query";
import { getPropertyRowBySlug } from "@/lib/property-db";
import { getPropertyBySlug } from "@/lib/properties";
import { isStorageConfigured } from "@/lib/storage";

type Props = { params: Promise<{ slug: string }> };

export async function AdminPropertyImagesDashboard({ params }: Props) {
  const { slug } = await params;
  const catalog = getPropertyBySlug(slug);
  if (!catalog) notFound();

  const row = await getPropertyRowBySlug(slug);
  const propertyList = listAdminCalendarProperties();
  const needsMigration = await propertyImagesMigrationNeeded();

  if (!row) {
    return (
      <AdminCalendarShell activeTab="calendario" title={`Fotos · ${catalog.name}`}>
        <p className="text-sm text-amber-800">
          Propiedad no encontrada en la base de datos. Ejecute{" "}
          <code className="rounded bg-amber-100 px-1">npm run db:seed</code>.
        </p>
      </AdminCalendarShell>
    );
  }

  const images = needsMigration ? [] : await listPropertyImagesByPropertyId(row.id);
  const usesCatalogFallback = images.length === 0;

  return (
    <AdminCalendarShell activeTab="calendario" title={`Fotos · ${catalog.name}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <AdminPropertyStrip properties={propertyList} activeSlug={slug} />
        <div className="min-w-0 flex-1">
          <AdminPropertySubnav slug={slug} active="fotos" />

          {needsMigration ? (
            <AdminMigratePropertyImagesPanel />
          ) : (
            <AdminPropertyImagesPanel
              slug={slug}
              propertyId={row.id}
              propertyName={catalog.name}
              images={images}
              usesCatalogFallback={usesCatalogFallback}
              catalogImageCount={catalog.images.length}
              storageConfigured={isStorageConfigured()}
            />
          )}
        </div>
      </div>
    </AdminCalendarShell>
  );
}
