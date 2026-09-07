import { isAdminSession } from "@/lib/admin-auth";
import {
  clearNightlyRatesMutation,
  saveNightlyRatesMutation,
} from "@/lib/admin-pricing-mutations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return Response.json({ error: "No autorizado." }, { status: 401 });
  }

  let body: {
    mode?: unknown;
    propertyId?: unknown;
    startDate?: unknown;
    endDate?: unknown;
    referencePriceUsd?: unknown;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  try {
    const result =
      body.mode === "clear"
        ? await clearNightlyRatesMutation({
            propertyId: body.propertyId,
            startDate: body.startDate,
            endDate: body.endDate,
          })
        : await saveNightlyRatesMutation({
            propertyId: body.propertyId,
            startDate: body.startDate,
            endDate: body.endDate,
            referencePriceUsdRaw: body.referencePriceUsd,
          });

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json({ success: result.success });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ error: message }, { status: 500 });
  }
}
