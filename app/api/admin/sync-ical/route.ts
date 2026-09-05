import { revalidatePath } from "next/cache";
import { hasDatabase } from "@/db/index";
import { isAdminSession } from "@/lib/admin-auth";
import { syncAllPropertiesIcal } from "@/lib/ical-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ error: "DATABASE_URL no configurada." }, { status: 503 });
  }

  try {
    const result = await syncAllPropertiesIcal();
    revalidatePath("/admin");
    revalidatePath("/admin/configuracion");
    revalidatePath("/admin/dev");

    if (result.failed > 0) {
      return Response.json({
        success: `Sync parcial: ${result.synced} OK, ${result.failed} fallidas. Revise los logs.`,
      });
    }

    return Response.json({
      success: `Sync completada: ${result.synced} propiedades importadas.`,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `Sync falló: ${message}` }, { status: 500 });
  }
}
