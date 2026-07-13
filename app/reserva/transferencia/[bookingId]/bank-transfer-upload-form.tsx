"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/pricing";
import type { BankAccountDetails } from "@/lib/payments/bank-transfer";

type Props = {
  bookingId: string;
  reference: string;
  totalUsd: number;
  bank: BankAccountDetails;
  status: string;
  proofUrl: string | null;
};

export function BankTransferUploadForm({
  bookingId,
  reference,
  totalUsd,
  bank,
  status,
  proofUrl,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(
    status === "pending_verification" || status === "confirmed" || Boolean(proofUrl),
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("proof") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError("Selecciona un archivo.");
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.append("proof", file);
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

  if (status === "confirmed") {
    return (
      <p className="rounded-xl border border-ocean/20 bg-ocean-light/40 px-4 py-3 text-sm text-ink">
        Tu reserva está confirmada. Revisa tu correo para más detalles.
      </p>
    );
  }

  if (uploaded || status === "pending_verification") {
    return (
      <p className="rounded-xl border border-ocean/20 bg-ocean-light/40 px-4 py-3 text-sm text-ink">
        Comprobante recibido. MS Vacations revisará tu transferencia y confirmará la reserva por correo.
        {proofUrl && (
          <>
            {" "}
            <a href={proofUrl} target="_blank" rel="noopener noreferrer" className="text-ocean hover:underline">
              Ver comprobante
            </a>
          </>
        )}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-sand-dark bg-white p-5">
        <p className="text-sm text-muted">Total a transferir (incluye −7% por transferencia)</p>
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

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="proof" className="text-sm font-medium text-ink">
            Subir comprobante (JPG, PNG, WEBP o PDF, máx. 5 MB)
          </label>
          <input
            id="proof"
            name="proof"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            required
            className="mt-2 block w-full text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-ocean file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
        </div>
        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Subiendo…" : "Enviar comprobante"}
        </Button>
      </form>
    </div>
  );
}
