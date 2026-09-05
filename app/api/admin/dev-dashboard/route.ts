import { isAdminSession } from "@/lib/admin-auth";
import { getAdminDevDashboardPayload } from "@/lib/admin-dev-dashboard-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSession())) {
    return Response.json({ ok: false, error: "No autorizado." }, { status: 401 });
  }

  try {
    const data = await getAdminDevDashboardPayload();
    return Response.json({ ok: true, ...data }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al cargar la página Dev.";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
