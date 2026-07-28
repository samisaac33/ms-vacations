export type BillingIdType = "RUC" | "CEDULA" | "PASAPORTE";

export type BillingInput = {
  billingName: string;
  billingIdType: BillingIdType;
  billingIdNumber: string;
  billingCity: string;
  guestEmail: string;
};

export type BillingValidationResult =
  | { ok: true; data: BillingInput }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function validateBillingInput(raw: unknown): BillingValidationResult {
  if (!raw || typeof raw !== "object") {
    return { ok: false, error: "Datos inválidos." };
  }

  const body = raw as Record<string, unknown>;
  const billingName = typeof body.billingName === "string" ? body.billingName.trim() : "";
  const billingIdType = body.billingIdType;
  const billingIdNumberRaw =
    typeof body.billingIdNumber === "string" ? body.billingIdNumber.trim() : "";
  const billingCity = typeof body.billingCity === "string" ? body.billingCity.trim() : "";
  const guestEmail = typeof body.guestEmail === "string" ? body.guestEmail.trim() : "";

  if (!billingName || billingName.length < 3) {
    return { ok: false, error: "Ingresa el nombre o razón social." };
  }
  if (!billingCity || billingCity.length < 2) {
    return { ok: false, error: "Ingresa la ciudad." };
  }
  if (!guestEmail || !EMAIL_RE.test(guestEmail)) {
    return { ok: false, error: "Ingresa un correo electrónico válido." };
  }
  if (billingIdType !== "RUC" && billingIdType !== "CEDULA" && billingIdType !== "PASAPORTE") {
    return { ok: false, error: "Selecciona un tipo de identificación válido." };
  }

  if (billingIdType === "RUC") {
    const digits = cleanDigits(billingIdNumberRaw);
    if (digits.length !== 13) {
      return { ok: false, error: "El RUC debe tener 13 dígitos." };
    }
    return {
      ok: true,
      data: {
        billingName,
        billingIdType,
        billingIdNumber: digits,
        billingCity,
        guestEmail,
      },
    };
  }

  if (billingIdType === "CEDULA") {
    const digits = cleanDigits(billingIdNumberRaw);
    if (digits.length !== 10) {
      return { ok: false, error: "La cédula debe tener 10 dígitos." };
    }
    return {
      ok: true,
      data: {
        billingName,
        billingIdType,
        billingIdNumber: digits,
        billingCity,
        guestEmail,
      },
    };
  }

  if (billingIdNumberRaw.length < 5 || billingIdNumberRaw.length > 20) {
    return { ok: false, error: "El pasaporte debe tener entre 5 y 20 caracteres." };
  }
  return {
    ok: true,
    data: {
      billingName,
      billingIdType,
      billingIdNumber: billingIdNumberRaw.toUpperCase(),
      billingCity,
      guestEmail,
    },
  };
}

export function billingIdTypeLabel(type: BillingIdType): string {
  if (type === "RUC") return "RUC";
  if (type === "CEDULA") return "Cédula";
  return "Pasaporte";
}

export const VOUCHER_STATUSES = ["confirmed", "pending_balance"] as const;
export type VoucherEligibleStatus = (typeof VOUCHER_STATUSES)[number];

export function canSendVoucher(status: string): status is VoucherEligibleStatus {
  return status === "confirmed" || status === "pending_balance";
}

export const BILLING_SAVE_STATUSES = [
  "pending_payment",
  "pending_verification",
  "confirmed",
  "pending_balance",
] as const;

export function canSaveBilling(status: string): boolean {
  return (BILLING_SAVE_STATUSES as readonly string[]).includes(status);
}
