import axios, { isAxiosError } from "axios";
import { siteConfig } from "@/lib/site";

const PAYPHONE_BASE = "https://pay.payphonetodoesposible.com/api";
const PAYPHONE_BOX_CONFIRM = "https://paymentbox.payphonetodoesposible.com/api/confirm";

const payphoneClient = axios.create({
  baseURL: PAYPHONE_BASE,
  headers: { "Content-Type": "application/json" },
});

function getPayPhoneAuthHeaders() {
  const token = process.env.PAYPHONE_TOKEN;
  if (!token) throw new Error("PayPhone no configurado");
  return { Authorization: `Bearer ${token}` };
}

function payphoneErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") {
      const trimmed = data.replace(/\s+/g, " ").trim();
      return trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed;
    }
    if (data && typeof data === "object") {
      const row = data as { message?: string; errors?: { message?: string }[] };
      const detail = row.errors?.[0]?.message;
      if (detail) return detail;
      if (row.message) return row.message;
    }
    return error.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function isPayPhoneConfigured(): boolean {
  return Boolean(process.env.PAYPHONE_TOKEN && process.env.PAYPHONE_STORE_ID);
}

export function getPayPhoneBoxClientConfig(): { token: string; storeId: string } | null {
  const token = process.env.PAYPHONE_TOKEN;
  const storeId = process.env.PAYPHONE_STORE_ID;
  if (!token || !storeId) return null;
  return { token, storeId };
}

export type PayPhoneBoxAmounts = {
  amount: number;
  amountWithoutTax: number;
  amountWithTax: number;
  tax: number;
  service: number;
  tip: number;
};

export function buildPayPhoneBoxAmounts(params: {
  totalCents: number;
  subtotalBaseCents: number;
  vatCents: number;
}): PayPhoneBoxAmounts {
  const amount = Math.round(params.totalCents);
  const amountWithoutTax = Math.round(params.subtotalBaseCents);
  const tax = Math.round(params.vatCents);
  return {
    amount,
    amountWithoutTax,
    amountWithTax: 0,
    tax,
    service: 0,
    tip: 0,
  };
}

type PayPhonePrepareResponse = {
  paymentId?: string;
  payWithCard?: string;
  payWithPayPhone?: string;
};

type PayPhoneConfirmResponse = {
  statusCode?: number;
  transactionStatus?: string;
  amount?: number;
  transactionId?: number;
};

export async function createPayPhoneSale(params: {
  bookingId: string;
  totalCents: number;
  guestEmail: string;
  cancelPath: string;
}): Promise<{ redirectUrl: string; transactionId: string }> {
  const storeId = process.env.PAYPHONE_STORE_ID;
  if (!storeId) {
    throw new Error("PayPhone no configurado");
  }

  const baseUrl = siteConfig.url.replace(/\/$/, "");
  const amount = Math.round(params.totalCents);
  if (amount < 100) throw new Error("Monto PayPhone inválido");

  try {
    const { data } = await payphoneClient.post<PayPhonePrepareResponse>(
      "/button/Prepare",
      {
        amount,
        amountWithoutTax: amount,
        amountWithTax: 0,
        tax: 0,
        service: 0,
        tip: 0,
        currency: "USD",
        clientTransactionId: params.bookingId,
        storeId,
        reference: `MS Vacations ${params.bookingId.slice(0, 8)}`,
        lang: "es",
        email: params.guestEmail,
        responseUrl: `${baseUrl}/reserva/exito?provider=payphone&bookingId=${params.bookingId}`,
        cancellationUrl: `${baseUrl}${params.cancelPath}`,
        timeZone: -5,
      },
      { headers: getPayPhoneAuthHeaders() },
    );

    const redirectUrl = data.payWithCard ?? data.payWithPayPhone;
    if (!redirectUrl || !data.paymentId) {
      throw new Error("PayPhone no devolvió URL de pago");
    }
    return { redirectUrl, transactionId: data.paymentId };
  } catch (error) {
    throw new Error(`PayPhone Prepare failed: ${payphoneErrorMessage(error, "Error al preparar pago")}`);
  }
}

function parsePayPhoneConfirmResponse(data: PayPhoneConfirmResponse, payphoneId: number) {
  const approved = data.statusCode === 3 || data.transactionStatus === "Approved";
  const amountCents = data.amount != null ? Math.round(data.amount) : null;
  const transactionId =
    data.transactionId != null ? String(data.transactionId) : String(payphoneId);
  return { approved, amountCents, transactionId };
}

async function confirmPayPhonePaymentAt(
  url: string,
  params: { payphoneId: number; clientTransactionId: string },
): Promise<{
  approved: boolean;
  amountCents: number | null;
  transactionId: string | null;
} | null> {
  try {
    const { data } = await axios.post<PayPhoneConfirmResponse>(
      url,
      {
        id: params.payphoneId,
        clientTxId: params.clientTransactionId,
      },
      { headers: getPayPhoneAuthHeaders() },
    );
    return parsePayPhoneConfirmResponse(data, params.payphoneId);
  } catch {
    return null;
  }
}

export async function confirmPayPhonePayment(params: {
  payphoneId: number;
  clientTransactionId: string;
}): Promise<{
  approved: boolean;
  amountCents: number | null;
  transactionId: string | null;
}> {
  const boxResult = await confirmPayPhonePaymentAt(PAYPHONE_BOX_CONFIRM, params);
  if (boxResult?.approved) return boxResult;

  const buttonResult = await confirmPayPhonePaymentAt(
    `${PAYPHONE_BASE}/button/V2/Confirm`,
    params,
  );
  if (buttonResult) return buttonResult;

  return { approved: false, amountCents: null, transactionId: null };
}
