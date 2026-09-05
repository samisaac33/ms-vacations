import { eq } from "drizzle-orm";
import { getDb, hasDatabase } from "@/db/index";
import { properties } from "@/db/schema";
import { isAdminSession } from "@/lib/admin-auth";
import { reorderPropertyImages } from "@/lib/property-images-query";
import { revalidatePropertyImagePaths } from "@/lib/revalidate-property-images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function slugByPropertyId(propertyId: string): Promise<string | null> {
  const db = getDb();
  const [row] = await db
    .select({ slug: properties.slug })
    .from(properties)
    .where(eq(properties.id, propertyId))
    .limit(1);
  return row?.slug ?? null;
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada." }, { status: 503 });
  }

  let propertyId: unknown;
  let orderedIds: unknown;
  try {
    const body = (await request.json()) as { propertyId?: unknown; orderedIds?: unknown };
    propertyId = body.propertyId;
    orderedIds = body.orderedIds;
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  if (typeof propertyId !== "string" || !Array.isArray(orderedIds)) {
    return Response.json({ error: "Datos incompletos." }, { status: 400 });
  }

  if (!orderedIds.every((id): id is string => typeof id === "string")) {
    return Response.json({ error: "Orden inválido." }, { status: 400 });
  }

  try {
    const result = await reorderPropertyImages(propertyId, orderedIds);
    if (!result.ok) {
      return Response.json({ error: result.reason }, { status: 400 });
    }

    const slug = await slugByPropertyId(propertyId);
    if (slug) revalidatePropertyImagePaths(slug);

    return Response.json({ success: "Orden actualizado." });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message }, { status: 500 });
  }
}
