import { asc, eq, inArray, sql } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties, propertyImages } from "@/db/schema";

export type PropertyImageRow = {
  id: string;
  propertyId: string;
  storagePath: string;
  src: string;
  alt: string;
  sortOrder: number;
  createdAt: Date;
};

export type PropertyImageDto = {
  id: string;
  propertyId: string;
  storagePath: string;
  src: string;
  alt: string;
  sortOrder: number;
};

function toDto(row: PropertyImageRow): PropertyImageDto {
  return {
    id: row.id,
    propertyId: row.propertyId,
    storagePath: row.storagePath,
    src: row.src,
    alt: row.alt,
    sortOrder: row.sortOrder,
  };
}

export async function listPropertyImagesByPropertyId(propertyId: string): Promise<PropertyImageDto[]> {
  if (!hasDatabase()) return [];
  const db = getDb();
  const rows = await db
    .select()
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.createdAt));
  return rows.map(toDto);
}

export async function listPropertyImagesBySlug(slug: string): Promise<PropertyImageDto[]> {
  if (!hasDatabase()) return [];
  const db = getDb();
  const rows = await db
    .select({
      id: propertyImages.id,
      propertyId: propertyImages.propertyId,
      storagePath: propertyImages.storagePath,
      src: propertyImages.src,
      alt: propertyImages.alt,
      sortOrder: propertyImages.sortOrder,
      createdAt: propertyImages.createdAt,
    })
    .from(propertyImages)
    .innerJoin(properties, eq(propertyImages.propertyId, properties.id))
    .where(eq(properties.slug, slug))
    .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.createdAt));
  return rows.map(toDto);
}

export async function propertyUsesDbImages(propertyId: string): Promise<boolean> {
  if (!hasDatabase()) return false;
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId));
  return (row?.count ?? 0) > 0;
}

export async function getImagesBySlugs(
  slugs: string[],
): Promise<Map<string, { src: string; alt: string }[]>> {
  const result = new Map<string, { src: string; alt: string }[]>();
  if (!hasDatabase() || slugs.length === 0) return result;

  try {
    const db = getDb();
    const rows = await db
      .select({
        slug: properties.slug,
        src: propertyImages.src,
        alt: propertyImages.alt,
        sortOrder: propertyImages.sortOrder,
        createdAt: propertyImages.createdAt,
      })
      .from(propertyImages)
      .innerJoin(properties, eq(propertyImages.propertyId, properties.id))
      .where(inArray(properties.slug, slugs))
      .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.createdAt));

    for (const row of rows) {
      const list = result.get(row.slug) ?? [];
      list.push({ src: row.src, alt: row.alt });
      result.set(row.slug, list);
    }
  } catch {
    // Tabla property_images aún no migrada: usar imágenes del catálogo estático.
  }
  return result;
}

export async function insertPropertyImage(input: {
  propertyId: string;
  storagePath: string;
  src: string;
  alt: string;
  sortOrder?: number;
}): Promise<PropertyImageDto | null> {
  if (!hasDatabase()) return null;
  const db = getDb();

  let sortOrder = input.sortOrder;
  if (sortOrder === undefined) {
    const [maxRow] = await db
      .select({ max: sql<number | null>`max(${propertyImages.sortOrder})` })
      .from(propertyImages)
      .where(eq(propertyImages.propertyId, input.propertyId));
    sortOrder = (maxRow?.max ?? -1) + 1;
  }

  const [row] = await db
    .insert(propertyImages)
    .values({
      propertyId: input.propertyId,
      storagePath: input.storagePath,
      src: input.src,
      alt: input.alt,
      sortOrder,
    })
    .returning();
  return row ? toDto(row) : null;
}

export async function updatePropertyImageAlt(
  imageId: string,
  alt: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!hasDatabase()) return { ok: false, reason: "Base de datos no configurada." };
  const db = getDb();
  const updated = await db
    .update(propertyImages)
    .set({ alt: alt.trim() })
    .where(eq(propertyImages.id, imageId))
    .returning({ id: propertyImages.id });
  if (updated.length === 0) return { ok: false, reason: "Imagen no encontrada." };
  return { ok: true };
}

export async function deletePropertyImage(
  imageId: string,
): Promise<
  { ok: true; storagePath: string; propertyId: string } | { ok: false; reason: string }
> {
  if (!hasDatabase()) return { ok: false, reason: "Base de datos no configurada." };
  const db = getDb();
  const deleted = await db
    .delete(propertyImages)
    .where(eq(propertyImages.id, imageId))
    .returning({
      id: propertyImages.id,
      storagePath: propertyImages.storagePath,
      propertyId: propertyImages.propertyId,
    });
  if (deleted.length === 0) return { ok: false, reason: "Imagen no encontrada." };
  const row = deleted[0]!;

  const remaining = await db
    .select({ id: propertyImages.id })
    .from(propertyImages)
    .where(eq(propertyImages.propertyId, row.propertyId))
    .orderBy(asc(propertyImages.sortOrder), asc(propertyImages.createdAt));

  for (let i = 0; i < remaining.length; i++) {
    await db
      .update(propertyImages)
      .set({ sortOrder: i })
      .where(eq(propertyImages.id, remaining[i]!.id));
  }

  return { ok: true, storagePath: row.storagePath, propertyId: row.propertyId };
}

export async function reorderPropertyImages(
  propertyId: string,
  orderedIds: string[],
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!hasDatabase()) return { ok: false, reason: "Base de datos no configurada." };
  const db = getDb();

  const existing = await listPropertyImagesByPropertyId(propertyId);
  if (existing.length === 0) return { ok: false, reason: "Sin imágenes." };
  if (orderedIds.length !== existing.length) {
    return { ok: false, reason: "Lista de orden incompleta." };
  }

  const existingIds = new Set(existing.map((i) => i.id));
  for (const id of orderedIds) {
    if (!existingIds.has(id)) return { ok: false, reason: "Imagen inválida en el orden." };
  }

  for (let i = 0; i < orderedIds.length; i++) {
    await db
      .update(propertyImages)
      .set({ sortOrder: i })
      .where(eq(propertyImages.id, orderedIds[i]!));
  }

  return { ok: true };
}

export async function setPropertyImageAsCover(
  propertyId: string,
  imageId: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const images = await listPropertyImagesByPropertyId(propertyId);
  const idx = images.findIndex((i) => i.id === imageId);
  if (idx === -1) return { ok: false, reason: "Imagen no encontrada." };
  const ordered = [imageId, ...images.filter((i) => i.id !== imageId).map((i) => i.id)];
  return reorderPropertyImages(propertyId, ordered);
}

export async function importCatalogImagesForProperty(
  propertyId: string,
  catalogImages: { src: string; alt: string }[],
): Promise<{ ok: true; count: number } | { ok: false; reason: string }> {
  if (!hasDatabase()) return { ok: false, reason: "Base de datos no configurada." };
  if (catalogImages.length === 0) return { ok: false, reason: "El catálogo no tiene fotos." };

  const existing = await listPropertyImagesByPropertyId(propertyId);
  if (existing.length > 0) {
    return { ok: false, reason: "La propiedad ya tiene fotos en la base de datos." };
  }

  const db = getDb();
  const { parseStoragePathFromPublicUrl } = await import("@/lib/property-storage-prefix");

  for (let i = 0; i < catalogImages.length; i++) {
    const img = catalogImages[i]!;
    const storagePath = parseStoragePathFromPublicUrl(img.src);
    if (!storagePath) {
      return { ok: false, reason: `URL de imagen no reconocida: ${img.src}` };
    }
    await db.insert(propertyImages).values({
      propertyId,
      storagePath,
      src: img.src,
      alt: img.alt,
      sortOrder: i,
    });
  }

  return { ok: true, count: catalogImages.length };
}

export async function resetPropertyImagesToCatalog(
  propertyId: string,
): Promise<{ ok: true; deleted: number } | { ok: false; reason: string }> {
  if (!hasDatabase()) return { ok: false, reason: "Base de datos no configurada." };
  const db = getDb();
  const deleted = await db
    .delete(propertyImages)
    .where(eq(propertyImages.propertyId, propertyId))
    .returning({ storagePath: propertyImages.storagePath });
  return { ok: true, deleted: deleted.length };
}

export async function getPropertyImageById(imageId: string): Promise<
  | (PropertyImageDto & { slug: string })
  | null
> {
  if (!hasDatabase()) return null;
  const db = getDb();
  const [row] = await db
    .select({
      id: propertyImages.id,
      propertyId: propertyImages.propertyId,
      storagePath: propertyImages.storagePath,
      src: propertyImages.src,
      alt: propertyImages.alt,
      sortOrder: propertyImages.sortOrder,
      slug: properties.slug,
    })
    .from(propertyImages)
    .innerJoin(properties, eq(propertyImages.propertyId, properties.id))
    .where(eq(propertyImages.id, imageId))
    .limit(1);
  return row ?? null;
}
