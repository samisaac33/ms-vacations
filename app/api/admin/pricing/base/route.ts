import { isAdminSession } from "@/lib/admin-auth";
import { updatePropertyBasePriceMutation } from "@/lib/admin-pricing-mutations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: { propertyId?: unknown; referencePriceUsd?: unknown };
  try {
    body = (await request.json()) as { propertyId?: unknown; referencePriceUsd?: unknown };
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const result = await updatePropertyBasePriceMutation(body.propertyId, body.referencePriceUsd);
    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json({ success: result.success });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message }, { status: 500 });
  }
}
