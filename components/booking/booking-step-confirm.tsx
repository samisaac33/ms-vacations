"use client";

import { useState } from "react";
import { BankAccountDetailsModal } from "@/components/booking/bank-account-details-modal";
import { BankTransferProofUpload } from "@/components/booking/bank-transfer-proof-upload";
import { BookingGuestConfirmationFields } from "@/components/booking/booking-guest-confirmation-fields";
import { PaymentMethodConfirmCard } from "@/components/booking/payment-method-confirm-card";
import { formatUsd } from "@/lib/pricing";
import { PAYMENT_OPTIONS } from "@/lib/payment-options";
import type { BankAccountDetails } from "@/lib/payments/bank-transfer";
import type { PaymentMethod } from "@/lib/payments/types";

export type BankTransferSuccess = {
  reference: string;
  via: "upload" | "whatsapp";
};

type BankTransferProps = {
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  chargeUsd: number;
  whatsappNumber?: string;
  onProofReady: (file: File | null) => void;
  onWhatsApp: () => void;
  whatsAppLoading?: boolean;
  disabled?: boolean;
  success?: BankTransferSuccess | null;
};

type Props = {
  guestEmail: string;
  onEmailChange: (email: string) => void;
  termsAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  totalUsd: number;
  paymentMethodLabel: string;
  paymentMethod: PaymentMethod;
  nights: number;
  bank: BankAccountDetails;
  bankTransfer?: BankTransferProps;
};

export function BookingStepConfirm({
  guestEmail,
  onEmailChange,
  termsAccepted,
  onTermsChange,
  totalUsd,
  paymentMethodLabel,
  paymentMethod,
  nights,
  bank,
  bankTransfer,
}: Props) {
  const isBankTransfer = paymentMethod === "bank_transfer";
  const isOnlinePayment = paymentMethod === "paypal" || paymentMethod === "payphone";
  const [bankModalOpen, setBankModalOpen] = useState(false);
  const completed = Boolean(bankTransfer?.success);

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-ink">Confirma y reserva</h2>

      <div className="rounded-2xl border border-sand-dark bg-sand/50 p-4 text-sm">
        <p className="text-muted">
          {nights} {nights === 1 ? "noche" : "noches"} · {paymentMethodLabel}
        </p>
        <p className="mt-1 font-display text-xl font-semibold text-ink">
          ${formatUsd(totalUsd)} <span className="text-sm font-normal text-muted">USD</span>
        </p>
      </div>

      {isOnlinePayment && <PaymentMethodConfirmCard paymentMethod={paymentMethod} />}

      <BookingGuestConfirmationFields
        guestEmail={guestEmail}
        onEmailChange={onEmailChange}
        termsAccepted={termsAccepted}
        onTermsChange={onTermsChange}
      />

      {isBankTransfer && bankTransfer && (
        <>
          {completed && bankTransfer.success ? (
            <div className="rounded-2xl border border-ocean/20 bg-ocean-light/40 p-4 text-sm text-ink">
              <p className="font-medium">Reserva registrada</p>
              <p className="mt-1 text-muted">
                Referencia: <strong className="text-ink">{bankTransfer.success.reference}</strong>
              </p>
              <p className="mt-2 text-muted">
                {bankTransfer.success.via === "upload"
                  ? "Recibimos tu comprobante. MS Vacations revisará la transferencia y confirmará tu reserva por correo."
                  : "Abre WhatsApp y envía el comprobante cuando lo tengas. Tienes 30 minutos para completar el pago; luego las fechas se liberan."}
              </p>
            </div>
          ) : (
            <>
              <button
                type="button"
                disabled={bankTransfer.disabled}
                onClick={() => setBankModalOpen(true)}
                className="flex h-12 w-full items-center justify-center rounded-xl border border-sand-dark bg-white text-base font-semibold text-ink transition-colors hover:bg-sand/50 disabled:opacity-50"
              >
                Ver datos
              </button>

              <BankTransferProofUpload
                disabled={bankTransfer.disabled}
                onReady={(file) => bankTransfer.onProofReady(file)}
              />

              <button
                type="button"
                disabled={
                  bankTransfer.disabled ||
                  bankTransfer.whatsAppLoading ||
                  !guestEmail.trim() ||
                  !termsAccepted
                }
                onClick={bankTransfer.onWhatsApp}
                className="flex h-12 w-full items-center justify-center rounded-xl border border-[#25D366] bg-[#25D366]/10 text-base font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/20 disabled:opacity-50"
              >
                {bankTransfer.whatsAppLoading
                  ? "Registrando reserva…"
                  : "Enviar comprobante vía WhatsApp"}
              </button>
            </>
          )}

          <BankAccountDetailsModal
            open={bankModalOpen}
            onClose={() => setBankModalOpen(false)}
            bank={bank}
            reference={bankTransfer.success?.reference}
          />
        </>
      )}
    </div>
  );
}

export function paymentMethodLabel(method: string): string {
  return PAYMENT_OPTIONS.find((o) => o.id === method)?.label ?? method;
}
