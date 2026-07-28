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
    const availability = await getAvailabilityBySlug(slug);
    if (!availability) {
      return Response.json({ error: "Propiedad no encontrada" }, { status: 404 });
    }

    return Response.json(availability, {
      headers: { "Cache-Control": "private, max-age=60" },
    });
  } catch (e) {
    console.error("[availability]", e);
    return Response.json({ error: "No se pudo cargar disponibilidad" }, { status: 500 });
  }
}
