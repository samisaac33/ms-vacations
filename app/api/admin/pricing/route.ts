import { hasDatabase } from "@/db/index";
import { isAdminSession } from "@/lib/admin-auth";
import { getAdminPricingDays } from "@/lib/pricing-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(r: Request) {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ error: "Base de datos no configurada" }, { status: 503 });
  }

  const url = new URL(r.url);
  const propertyId = url.searchParams.get("propertyId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!propertyId || !from || !to) {
    return Response.json({ error: "Parámetros propertyId, from y to requeridos" }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
    return Response.json({ error: "Fechas inválidas" }, { status: 400 });
  }

  const data = await getAdminPricingDays(propertyId, from, to);
  if (!data) {
    return Response.json({ error: "Propiedad no encontrada" }, { status: 404 });
  }

  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
