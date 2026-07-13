import { getPayPhoneBoxClientConfig, isPayPhoneConfigured } from "@/lib/payments/payphone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isPayPhoneConfigured()) {
    return Response.json({ configured: false }, { status: 503 });
  }

  const config = getPayPhoneBoxClientConfig();
  if (!config) {
    return Response.json({ configured: false }, { status: 503 });
  }

  return Response.json({
    configured: true,
    token: config.token,
    storeId: config.storeId,
  });
}
