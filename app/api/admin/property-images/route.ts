import { isAdminSession } from "@/lib/admin-auth";
import { hasDatabase } from "@/db/index";
import {
  buildPropertyImageAlt,
  categoryToAltSuffix,
  nextStorageFileName,
  type PropertyImageCategory,
} from "@/lib/property-image-categories";
import { insertPropertyImage, listPropertyImagesByPropertyId } from "@/lib/property-images-query";
import { getPropertyBySlug } from "@/lib/properties";
import { ensurePropertyRowBySlug } from "@/lib/property-db";
import { getPropertyStoragePrefix } from "@/lib/property-storage-prefix";
import { isStorageConfigured } from "@/lib/storage-config";
import { uploadPropertyImage } from "@/lib/storage";
import { revalidatePropertyImagePaths } from "@/lib/revalidate-property-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_CATEGORIES = new Set<PropertyImageCategory>([
  "exterior",
  "piscina",
  "sala",
  "comedor",
  "cocina",
  "bar",
  "interior",
  "balcon",
  "rooftop",
  "garaje",
  "bano-social",
  "bbq",
  "habitacion-1",
  "habitacion-2",
  "habitacion-3",
  "habitacion-4",
  "habitacion-5",
  "adicional",
  "otro",
]);


export async function POST(request: Request) {
  try {
    if (!(await isAdminSession())) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    if (!hasDatabase()) {
      return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
    }
    if (!isStorageConfigured()) {
      return Response.json(
        { error: "Almacenamiento no configurado (SUPABASE_SERVICE_ROLE_KEY)." },
        { status: 503 },
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return Response.json(
        {
          error:
            "No se pudo leer la imagen. Si pesa más de 4 MB, el servidor la rechaza antes de procesarla.",
        },
        { status: 413 },
      );
    }

    const slug = formData.get("slug");
    const categoryRaw = formData.get("category");
    const customLabel = formData.get("customLabel");
    const file = formData.get("file");

    if (typeof slug !== "string" || !slug) {
      return Response.json({ error: "Propiedad no indicada" }, { status: 400 });
    }
    if (!(file instanceof File) || file.size === 0) {
      return Response.json({ error: "Selecciona una imagen" }, { status: 400 });
    }
    if (typeof categoryRaw !== "string" || !VALID_CATEGORIES.has(categoryRaw as PropertyImageCategory)) {
      return Response.json({ error: "Categoría inválida" }, { status: 400 });
    }

    const category = categoryRaw as PropertyImageCategory;
    const catalog = getPropertyBySlug(slug);
    if (!catalog) {
      return Response.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    const storagePrefix = getPropertyStoragePrefix(slug);
    if (!storagePrefix) {
      return Response.json(
        { error: "Carpeta de almacenamiento no configurada para esta propiedad." },
        { status: 400 },
      );
    }

    const row = await ensurePropertyRowBySlug(slug);
    if (!row) {
      return Response.json({ error: "Propiedad no encontrada en la base de datos." }, { status: 404 });
    }

    const existing = await listPropertyImagesByPropertyId(row.id);
    const existingPaths = existing.map((i) => i.storagePath);
    const fileName = nextStorageFileName(existingPaths, storagePrefix, category);
    const storagePath = `${storagePrefix}/${fileName}`;

    const uploaded = await uploadPropertyImage(storagePath, file);
    if (!uploaded.ok) {
      return Response.json({ error: uploaded.message }, { status: 400 });
    }

    const alt =
      category === "otro" && typeof customLabel === "string" && customLabel.trim()
        ? buildPropertyImageAlt(catalog.name, category, customLabel)
        : buildPropertyImageAlt(
            catalog.name,
            category,
            typeof customLabel === "string" ? customLabel : categoryToAltSuffix(category),
          );

    const inserted = await insertPropertyImage({
      propertyId: row.id,
      storagePath: uploaded.storagePath,
      src: uploaded.publicUrl,
      alt,
    });

    if (!inserted) {
      return Response.json({ error: "No se pudo registrar la imagen." }, { status: 500 });
    }

    revalidatePropertyImagePaths(slug);

    return Response.json({ ok: true, image: inserted });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al subir la imagen.";
    return Response.json({ error: message }, { status: 500 });
  }
}
