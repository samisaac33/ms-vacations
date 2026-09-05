import { listAdminCalendarProperties } from "@/lib/admin-calendar-query";
import { getPropertyRowBySlug } from "@/lib/property-db";
import { getPropertyBySlug } from "@/lib/properties";
import { propertyImagesMigrationNeeded } from "@/lib/apply-property-images-migration";
import { listPropertyImagesByPropertyId, type PropertyImageDto } from "@/lib/property-images-query";
import { isStorageConfigured } from "@/lib/storage-config";
import type { AdminCalendarPropertyMeta } from "@/lib/admin-calendar-query";

export type AdminPropertyImagesPayload = {
  slug: string;
  propertyName: string;
  propertyId: string | null;
  propertyList: AdminCalendarPropertyMeta[];
  needsMigration: boolean;
  images: PropertyImageDto[];
  usesCatalogFallback: boolean;
  catalogImageCount: number;
  storageConfigured: boolean;
  dbMissing: boolean;
};

export async function getAdminPropertyImagesPayload(
  slug: string,
): Promise<AdminPropertyImagesPayload | null> {
  const catalog = getPropertyBySlug(slug);
  if (!catalog) return null;

  const propertyList = listAdminCalendarProperties();

  let needsMigration = false;
  try {
    needsMigration = await propertyImagesMigrationNeeded();
  } catch {
    needsMigration = true;
  }

  const row = await getPropertyRowBySlug(slug);
  if (!row) {
    return {
      slug,
      propertyName: catalog.name,
      propertyId: null,
      propertyList,
      needsMigration,
      images: [],
      usesCatalogFallback: true,
      catalogImageCount: catalog.images.length,
      storageConfigured: isStorageConfigured(),
      dbMissing: true,
    };
  }

  let images: PropertyImageDto[] = [];
  if (!needsMigration) {
    try {
      images = await listPropertyImagesByPropertyId(row.id);
    } catch {
      images = [];
    }
  }

  return {
    slug,
    propertyName: catalog.name,
    propertyId: row.id,
    propertyList,
    needsMigration,
    images,
    usesCatalogFallback: images.length === 0,
    catalogImageCount: catalog.images.length,
    storageConfigured: isStorageConfigured(),
    dbMissing: false,
  };
}
