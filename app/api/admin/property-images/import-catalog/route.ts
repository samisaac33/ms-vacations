import { hasDatabase } from "@/db/index";
import { isAdminSession } from "@/lib/admin-auth";
import { ensurePropertyRowBySlug } from "@/lib/property-db";
import { importCatalogImagesForProperty } from "@/lib/property-images-query";
import { getPropertyBySlug } from "@/lib/properties";
import { revalidatePropertyImagePaths } from "@/lib/revalidate-property-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada." }, { status: 503 });
  }

  let slug: unknown;
  try {
    const body = (await request.json()) as { slug?: unknown };
    slug = body.slug;
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (typeof slug !== "string" || !slug) {
    return Response.json({ error: "Propiedad no indicada." }, { status: 400 });
  }

  const catalog = getPropertyBySlug(slug);
  if (!catalog) {
    return Response.json({ error: "Propiedad no encontrada." }, { status: 404 });
  }

  const row = await ensurePropertyRowBySlug(slug);
  if (!row) {
    return Response.json({ error: "Propiedad no encontrada en la base de datos." }, { status: 404 });
  }

  try {
    const result = await importCatalogImagesForProperty(row.id, catalog.images);
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 400 });
    }

    revalidatePropertyImagePaths(slug);
    return Response.json({ success: `${result.count} fotos importadas del catálogo.` });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message }, { status: 500 });
  }
}
