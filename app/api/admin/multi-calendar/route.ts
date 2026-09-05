import { hasDatabase } from "@/db/index";
import { isAdminSession } from "@/lib/admin-auth";
import { getAdminMultiCalendar } from "@/lib/admin-calendar-query";

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
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!from || !to || !ISO_DATE.test(from) || !ISO_DATE.test(to)) {
    return Response.json({ ok: false, error: "Fechas inválidas." }, { status: 400 });
  }

  const properties = await getAdminMultiCalendar(from, to);
  if (!properties) {
    return Response.json({ ok: false, error: "No se pudo cargar el calendario." }, { status: 500 });
  }

  return Response.json({ ok: true, properties }, { headers: { "Cache-Control": "no-store" } });
}
