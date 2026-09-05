import { revalidatePath } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth";
import { updatePropertyIcalUrl, parseIcalUrlUpdate } from "@/lib/admin-ical-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: { propertyId?: unknown; icalUrl?: unknown };
  try {
    body = (await request.json()) as { propertyId?: unknown; icalUrl?: unknown };
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = parseIcalUrlUpdate(body.propertyId, body.icalUrl);
  if (!parsed.valid) {
    return Response.json({ error: parsed.error }, { status: parsed.status });
  }

  try {
    const result = await updatePropertyIcalUrl(parsed.propertyId, parsed.icalUrl);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    revalidatePath("/admin");
    revalidatePath("/admin/configuracion");
    revalidatePath("/admin/dev");

    return Response.json({ success: result.message });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message }, { status: 500 });
  }
}
