import { hasDatabase } from "@/db/index";
import { isAdminSession } from "@/lib/admin-auth";
import { getLastSuccessfulIcalSyncAt } from "@/lib/admin-dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ lastSyncAt: null }, { headers: { "Cache-Control": "no-store" } });
  }

  const lastSync = await getLastSuccessfulIcalSyncAt();
  return Response.json(
    { lastSyncAt: lastSync?.toISOString() ?? null },
    { headers: { "Cache-Control": "no-store" } },
  );
}
