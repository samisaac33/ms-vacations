import { siteConfig } from "@/lib/site";

const PAYPAL_API = {
  sandbox: "https://api-m.sandbox.paypal.com",
  live: "https://api-m.paypal.com",
} as const;

function getMode(): "sandbox" | "live" {
  return process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
}

export function isPayPalConfigured(): boolean {
  return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PayPal no configurado");
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${PAYPAL_API[getMode()]}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error("No se pudo autenticar con PayPal");
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalOrder(params: {
  bookingId: string;
  totalCents: number;
  description: string;
  cancelPath: string;
}): Promise<{ approvalUrl: string; orderId: string }> {
  const token = await getAccessToken();
  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const res = await fetch(`${PAYPAL_API[getMode()]}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: params.bookingId,
          description: params.description,
          amount: {
            currency_code: "USD",
            value: (params.totalCents / 100).toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${baseUrl}/reserva/exito?provider=paypal&bookingId=${params.bookingId}`,
        cancel_url: `${baseUrl}${params.cancelPath}`,
        user_action: "PAY_NOW",
      },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal order failed: ${text}`);
  }
  const data = (await res.json()) as {
    id: string;
    links: { rel: string; href: string }[];
  };
  const approve = data.links.find((l) => l.rel === "approve");
  if (!approve?.href) throw new Error("PayPal no devolvió URL de aprobación");
  return { approvalUrl: approve.href, orderId: data.id };
}

export async function capturePayPalOrder(orderId: string): Promise<{
  captured: boolean;
  amountCents: number | null;
}> {
  const token = await getAccessToken();
  const res = await fetch(`${PAYPAL_API[getMode()]}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    return { captured: false, amountCents: null };
  }
  const data = (await res.json()) as {
    status: string;
    purchase_units?: { payments?: { captures?: { amount?: { value?: string } }[] } }[];
  };
  const value = data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
  const amountCents = value ? Math.round(Number.parseFloat(value) * 100) : null;
  return { captured: data.status === "COMPLETED", amountCents };
}
