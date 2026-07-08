import { siteConfig } from "@/lib/site";

const PAYPHONE_BASE = "https://pay.payphonetodoesposible.com/api";

export function isPayPhoneConfigured(): boolean {
  return Boolean(process.env.PAYPHONE_TOKEN && process.env.PAYPHONE_STORE_ID);
}

type PayPhoneSaleResponse = {
  transactionId?: number;
  payWithCard?: string;
  payWithPayPhone?: string;
};

export async function createPayPhoneSale(params: {
  bookingId: string;
  totalCents: number;
  guestEmail: string;
  cancelPath: string;
}): Promise<{ redirectUrl: string; transactionId: string }> {
  const token = process.env.PAYPHONE_TOKEN;
  const storeId = process.env.PAYPHONE_STORE_ID;
  if (!token || !storeId) {
    throw new Error("PayPhone no configurado");
  }

  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const amount = Math.round(params.totalCents / 100);
  if (amount < 1) throw new Error("Monto PayPhone inválido");

  const res = await fetch(`${PAYPHONE_BASE}/Sale`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumber: process.env.PAYPHONE_DEFAULT_PHONE ?? "+593999999999",
      countryCode: "593",
      amount,
      amountWithoutTax: amount,
      amountWithTax: 0,
      tax: 0,
      service: 0,
      tip: 0,
      currency: "USD",
      clientTransactionId: params.bookingId,
      storeId: Number(storeId),
      reference: `MS Vacations ${params.bookingId.slice(0, 8)}`,
      lang: "es",
      email: params.guestEmail,
      documentId: process.env.PAYPHONE_DEFAULT_DOCUMENT ?? "9999999999",
      responseUrl: `${baseUrl}/reserva/exito?provider=payphone&bookingId=${params.bookingId}`,
      cancellationUrl: `${baseUrl}${params.cancelPath}`,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPhone Sale failed: ${text}`);
  }

  const data = (await res.json()) as PayPhoneSaleResponse;
  const redirectUrl = data.payWithCard ?? data.payWithPayPhone;
  if (!redirectUrl || !data.transactionId) {
    throw new Error("PayPhone no devolvió URL de pago");
  }
  return { redirectUrl, transactionId: String(data.transactionId) };
}

type PayPhoneStatusResponse = {
  statusCode?: number;
  transactionStatus?: string;
  amount?: number;
};

export async function getPayPhoneSaleStatus(clientTransactionId: string): Promise<{
  approved: boolean;
  amountCents: number | null;
  transactionId: string | null;
}> {
  const token = process.env.PAYPHONE_TOKEN;
  if (!token) {
    return { approved: false, amountCents: null, transactionId: null };
  }

  const res = await fetch(`${PAYPHONE_BASE}/Sale/client/${clientTransactionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    return { approved: false, amountCents: null, transactionId: null };
  }

  const data = (await res.json()) as PayPhoneStatusResponse | PayPhoneStatusResponse[];
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return { approved: false, amountCents: null, transactionId: null };

  const approved = row.statusCode === 3 || row.transactionStatus === "Approved";
  const amountCents = row.amount != null ? Math.round(row.amount * 100) : null;
  return { approved, amountCents, transactionId: null };
}
