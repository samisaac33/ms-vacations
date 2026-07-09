import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth";
import { applyBeachPricesToDatabase } from "@/lib/apply-beach-prices-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function revalidatePricingPaths() {
  revalidatePath("/");
  revalidatePath("/propiedades");
  revalidatePath("/admin");
  revalidatePath("/admin/configuracion");
}

async function authorize(request: Request): Promise<boolean> {
  if (await isAdminSession()) return true;
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export async function POST(request: Request) {
  if (!(await authorize(request))) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const results = await applyBeachPricesToDatabase();
    revalidatePricingPaths();
    return Response.json({ success: true, properties: results });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message }, { status: 500 });
  }
}
