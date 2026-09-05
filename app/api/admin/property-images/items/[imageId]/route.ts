import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import { isAdminSession } from "@/lib/admin-auth";
import {
  deletePropertyImage,
  getPropertyImageById,
  setPropertyImageAsCover,
  updatePropertyImageAlt,
} from "@/lib/property-images-query";
import { revalidatePropertyImagePaths } from "@/lib/revalidate-property-images";
import { deletePropertyImageFile } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ imageId: string }> };

async function slugByPropertyId(propertyId: string): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select({ slug: properties.slug })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  return row?.slug ?? null;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada." }, { status: 503 });
  }

  const { imageId } = await context.params;
  let alt: unknown;
  try {
    const body = (await request.json()) as { alt?: unknown };
    alt = body.alt;
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (typeof alt !== "string" || !alt.trim()) {
    return Response.json({ error: "Datos incompletos." }, { status: 400 });
  }

  const image = await getPropertyImageById(imageId);
  if (!image) {
    return Response.json({ error: "Imagen no encontrada." }, { status: 404 });
  }

  try {
    const result = await updatePropertyImageAlt(imageId, alt);
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 400 });
    }

    revalidatePropertyImagePaths(image.slug);
    return Response.json({ success: "Texto alternativo actualizado." });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada." }, { status: 503 });
  }

  const { imageId } = await context.params;
  let deleteFile = false;
  try {
    const body = (await request.json()) as { deleteFile?: unknown };
    deleteFile = body.deleteFile === true;
  } catch {
    // Sin cuerpo: solo eliminar registro en BD
  }

  const before = await getPropertyImageById(imageId);
  if (!before) {
    return Response.json({ error: "Imagen no encontrada." }, { status: 404 });
  }

  try {
    const result = await deletePropertyImage(imageId);
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 400 });
    }

    if (deleteFile) {
      const removed = await deletePropertyImageFile(result.storagePath);
      if (!removed.ok) {
        revalidatePropertyImagePaths(before.slug);
        return Response.json({
          success: "Imagen eliminada del catálogo. No se pudo borrar el archivo en storage.",
        });
      }
    }

    revalidatePropertyImagePaths(before.slug);
    return Response.json({
      success: deleteFile ? "Imagen y archivo eliminados." : "Imagen eliminada del catálogo.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada." }, { status: 503 });
  }

  const { imageId } = await context.params;
  let propertyId: unknown;
  try {
    const body = (await request.json()) as { propertyId?: unknown };
    propertyId = body.propertyId;
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (typeof propertyId !== "string") {
    return Response.json({ error: "Datos incompletos." }, { status: 400 });
  }

  try {
    const result = await setPropertyImageAsCover(propertyId, imageId);
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 400 });
    }

    const slug = await slugByPropertyId(propertyId);
    if (slug) revalidatePropertyImagePaths(slug);

    return Response.json({ success: "Imagen establecida como portada." });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message }, { status: 500 });
  }
}
