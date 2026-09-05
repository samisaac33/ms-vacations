import { hasDatabase } from "@/db/index";
import { isAdminSession } from "@/lib/admin-auth";
import { getAdminPropertyCalendar } from "@/lib/admin-calendar-query";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ ok: false, error: "Base de datos no configurada." }, { status: 503 });
  }

  const url = new URL(request.url);
  const propertyId = url.searchParams.get("propertyId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!propertyId || !from || !to) {
    return Response.json({ ok: false, error: "Parámetros incompletos." }, { status: 400 });
  }
  if (!ISO_DATE.test(from) || !ISO_DATE.test(to)) {
    return Response.json({ ok: false, error: "Fechas inválidas." }, { status: 400 });
  }

  const data = await getAdminPropertyCalendar(propertyId, from, to);
  if (!data) {
    return Response.json({ ok: false, error: "Propiedad no encontrada." }, { status: 404 });
  }

  return Response.json(
    {
      ok: true,
      baseReferenceCents: data.baseReferenceCents,
      days: data.days,
      bars: data.bars,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
