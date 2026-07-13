import { getPayPalPublicConfig, isPayPalConfigured } from "@/lib/payments/paypal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isPayPalConfigured()) {
    return Response.json({ configured: false }, { status: 503 });
  }

  const config = getPayPalPublicConfig();
  if (!config) {
    return Response.json({ configured: false }, { status: 503 });
  }

  return Response.json({
    configured: true,
    clientId: config.clientId,
    mode: config.mode,
  });
}
