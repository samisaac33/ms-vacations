"use client";

import { useState } from "react";
import { BankTransferProofUpload } from "@/components/booking/bank-transfer-proof-upload";
import { BookingConfirmedResult } from "@/components/booking/booking-confirmed-result";
import { BookingBillingForm } from "@/components/booking/booking-billing-form";
import { BookingPendingResult } from "@/components/booking/booking-pending-result";
import { Button } from "@/components/ui/button";
import { guestBookingToResultSummary } from "@/lib/booking-result-summary";
import { formatUsd } from "@/lib/pricing";
import type { BankAccountDetails } from "@/lib/payments/bank-transfer";
import type { PaymentTiming } from "@/lib/payment-schedule";

type Props = {
  bookingId: string;
  reference: string;
  totalUsd: number;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestEmail: string;
  paymentTiming: PaymentTiming;
  depositCents: number | null;
  balanceCents: number | null;
  balanceDueAt: string | null;
  bank: BankAccountDetails;
  status: string;
  proofUrl: string | null;
};

export function BankTransferUploadForm({
  bookingId,
  reference,
  totalUsd,
  propertyName,
  checkIn,
  checkOut,
  guests,
  guestEmail,
  paymentTiming,
  depositCents,
  balanceCents,
  balanceDueAt,
  bank,
  status,
  proofUrl,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploaded, setUploaded] = useState(
    status === "pending_verification" || status === "confirmed" || Boolean(proofUrl),
  );

  const summary = guestBookingToResultSummary({
    propertyName,
    checkIn,
    checkOut,
    guests,
    reference,
    totalUsd,
    guestEmail,
    paymentMethod: "bank_transfer",
    paymentTiming,
    depositCents,
    balanceCents,
    balanceDueAt,
  });

  async function onSubmit() {
    setError(null);
    if (!proofFile) {
      setError("Selecciona una imagen de comprobante.");
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("proof", proofFile);
      const res = await fetch(`/api/bookings/${bookingId}/proof`, {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "No se pudo subir el comprobante");
        return;
      }
      setUploaded(true);
    } catch {
      setError("Error de red. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "confirmed" || status === "pending_balance") {
    return (
      <BookingConfirmedResult
        summary={summary}
        bookingId={bookingId}
        subtitle="Tu transferencia fue verificada. Revisa tu correo para más detalles y completa los datos de facturación para recibir el comprobante en PDF."
      />
    );
  }

  if (uploaded || status === "pending_verification") {
    return (
      <div className="space-y-4">
        <BookingPendingResult reference={reference} via="upload" />
        {guestEmail && (
          <BookingBillingForm bookingId={bookingId} guestEmail={guestEmail} />
        )}
        {proofUrl && (
          <p className="text-center text-sm text-muted">
            <a
              href={proofUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ocean hover:underline"
            >
              Ver comprobante
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-sand-dark bg-white p-5">
        <p className="text-sm text-muted">Total a transferir</p>
        <p className="mt-1 text-2xl font-semibold text-ink">${formatUsd(totalUsd)} USD</p>
        <p className="mt-2 text-sm text-muted">
          Referencia / concepto: <strong className="text-ink">{reference}</strong>
        </p>
      </div>

      <dl className="grid gap-3 rounded-xl border border-sand-dark bg-sand/40 p-5 text-sm">
        <div>
          <dt className="text-muted">Titular</dt>
          <dd className="font-medium text-ink">{bank.holder}</dd>
        </div>
        <div>
          <dt className="text-muted">Banco</dt>
          <dd className="font-medium text-ink">{bank.bankName}</dd>
        </div>
        <div>
          <dt className="text-muted">Cuenta ({bank.accountType})</dt>
          <dd className="font-medium text-ink">{bank.accountNumber}</dd>
        </div>
        <div>
          <dt className="text-muted">{bank.idType}</dt>
          <dd className="font-medium text-ink">{bank.idNumber}</dd>
        </div>
        {bank.email && (
          <div>
            <dt className="text-muted">Correo</dt>
            <dd className="font-medium text-ink">{bank.email}</dd>
          </div>
        )}
      </dl>

      <BankTransferProofUpload
        disabled={loading}
        onReady={(file) => setProofFile(file)}
      />

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}

      <Button type="button" disabled={loading || !proofFile} onClick={onSubmit} className="w-full">
        {loading ? "Subiendo…" : "Enviar comprobante"}
      </Button>

      {guestEmail && (
        <BookingBillingForm bookingId={bookingId} guestEmail={guestEmail} />
      )}
    </div>
  );
}
