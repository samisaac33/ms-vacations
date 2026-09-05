import { isAdminSession } from "@/lib/admin-auth";
import { getAdminPropertyImagesPayload } from "@/lib/admin-property-images-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  const { slug } = await context.params;
  if (!slug) {
    return Response.json({ ok: false, error: "Propiedad no indicada." }, { status: 400 });
  }

  try {
    const data = await getAdminPropertyImagesPayload(slug);
    if (!data) {
      return Response.json({ ok: false, error: "Propiedad no encontrada." }, { status: 404 });
    }

    return Response.json({ ok: true, ...data }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cargar fotos.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
