import { revalidatePath } from "next/cache";
import { hasDatabase } from "@/db/index";
import { isAdminSession } from "@/lib/admin-auth";
import { applyPropertyImagesMigration } from "@/lib/apply-property-images-migration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function revalidatePropertyImagesPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
  revalidatePath("/admin/dev");
  revalidatePath("/propiedades");
  revalidatePath("/");
}

export async function POST() {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!hasDatabase()) {
    return Response.json({ error: "DATABASE_URL no configurada." }, { status: 503 });
  }

  try {
    const result = await applyPropertyImagesMigration();
    revalidatePropertyImagesPaths();

    return Response.json({
      success: result.tableCreated
        ? "Tabla property_images creada."
        : "Tabla property_images ya existía.",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: `No se pudo aplicar la migración: ${message}` }, { status: 500 });
  }
}
