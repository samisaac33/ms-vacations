import { hasDatabase } from "@/db/index";
import { getAvailabilityBySlug } from "@/lib/availability-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(r: Request) {
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const slug = new URL(r.url).searchParams.get("slug");
  if (!slug) {
    return Response.json({ error: "Parámetro slug requerido" }, { status: 400 });
  }

  try {
    // #region agent log
    fetch('http://127.0.0.1:7301/ingest/b7c4f0e2-1c6e-4803-8834-979f15ef881f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'729085'},body:JSON.stringify({sessionId:'729085',location:'availability/route.ts:GET',message:'availability request start',data:{slug},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    const availability = await getAvailabilityBySlug(slug);
    if (!availability) {
      return Response.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    return Response.json(availability, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (e) {
    const err = e as { code?: string; message?: string };
    // #region agent log
    fetch('http://127.0.0.1:7301/ingest/b7c4f0e2-1c6e-4803-8834-979f15ef881f',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'729085'},body:JSON.stringify({sessionId:'729085',location:'availability/route.ts:catch',message:'availability request failed',data:{slug,code:err.code,errorMessage:err.message},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    console.error("[availability]", e);
    return Response.json({ error: "No se pudo cargar disponibilidad" }, { status: 500 });
  }
}
