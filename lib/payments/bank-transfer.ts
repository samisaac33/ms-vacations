import { formatBookingDateRange } from "@/lib/booking-dates";
import { formatUsd } from "@/lib/pricing";

export type BankAccountDetails = {
  holder: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  idType: string;
  idNumber: string;
  email?: string;
};

const DEFAULT_BANK_ACCOUNT_DETAILS: BankAccountDetails = {
  holder: "SAGON S.A.",
  bankName: "Produbanco (Grupo Promerica)",
  accountNumber: "02-30301921-9",
  accountType: "Cta. Corriente",
  idType: "RUC",
  idNumber: "1391769075001",
  email: "reservacionsc@gmail.com",
};

export function getBankAccountDetails(): BankAccountDetails {
  return {
    holder: process.env.BANK_ACCOUNT_HOLDER ?? DEFAULT_BANK_ACCOUNT_DETAILS.holder,
    bankName: process.env.BANK_NAME ?? DEFAULT_BANK_ACCOUNT_DETAILS.bankName,
    accountNumber: process.env.BANK_ACCOUNT_NUMBER ?? DEFAULT_BANK_ACCOUNT_DETAILS.accountNumber,
    accountType: process.env.BANK_ACCOUNT_TYPE ?? DEFAULT_BANK_ACCOUNT_DETAILS.accountType,
    idType: process.env.BANK_ID_TYPE ?? DEFAULT_BANK_ACCOUNT_DETAILS.idType,
    idNumber: process.env.BANK_ID_NUMBER ?? DEFAULT_BANK_ACCOUNT_DETAILS.idNumber,
    email: process.env.BANK_EMAIL ?? DEFAULT_BANK_ACCOUNT_DETAILS.email,
  };
}

export function formatBookingReference(bookingId: string): string {
  return bookingId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

export type BankTransferProofMessage = {
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalUsd: number;
  reference: string;
  guestEmail: string;
};

export function buildBankTransferProofMessage({
  propertyName,
  checkIn,
  checkOut,
  guests,
  totalUsd,
  reference,
  guestEmail,
}: BankTransferProofMessage): string {
  const dates = formatBookingDateRange(checkIn, checkOut);
  const guestLabel = guests === 1 ? "1 huésped" : `${guests} huéspedes`;

  return [
    "Hola MS Vacations, envío comprobante de transferencia bancaria.",
    "",
    `Propiedad: ${propertyName}`,
    `Fechas: ${dates}`,
    `Huéspedes: ${guestLabel}`,
    `Total: $${formatUsd(totalUsd)} USD`,
    `Referencia: ${reference}`,
    `Correo: ${guestEmail}`,
  ].join("\n");
}

export function buildBankTransferProofWhatsAppUrl(
  message: BankTransferProofMessage,
  whatsappNumber?: string,
): string | null {
  const raw = whatsappNumber?.replace(/\D/g, "");
  if (!raw) return null;
  const text = buildBankTransferProofMessage(message);
  return `https://wa.me/${raw}?text=${encodeURIComponent(text)}`;
}
