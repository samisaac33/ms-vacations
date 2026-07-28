"use client";

import { useEffect, useState } from "react";
import { BookingConfirmedResult } from "@/components/booking/booking-confirmed-result";
import type { BookingResultSummary } from "@/components/booking/booking-result-summary-card";
import { Button } from "@/components/ui/button";

type Props = {
  provider: string | null;
  bookingId: string | null;
  paypalOrderId: string | null;
  payphoneTransactionId: string | null;
  payphoneClientTransactionId: string | null;
};

export function PaymentSuccessClient({
  provider,
  bookingId,
  paypalOrderId,
  payphoneTransactionId,
  payphoneClientTransactionId,
}: Props) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">(
    provider && bookingId ? "loading" : "ok",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<BookingResultSummary | null>(null);

  useEffect(() => {
    if (!provider || !bookingId) return;
    if (provider === "payphone" && !payphoneTransactionId) {
      setStatus("error");
      setMessage("No se recibió confirmación de PayPhone. Si ya pagaste, contacta a MS Vacations.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/payments/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider,
            bookingId,
            orderId: paypalOrderId,
            payphoneId: payphoneTransactionId,
            clientTransactionId: payphoneClientTransactionId ?? bookingId,
          }),
        });
        const data = (await res.json()) as {
          error?: string;
          summary?: BookingResultSummary;
        };
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "No se pudo confirmar el pago");
          return;
        }
        if (data.summary) setSummary(data.summary);
        setStatus("ok");
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("Error de red al confirmar el pago");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [provider, bookingId, paypalOrderId, payphoneTransactionId, payphoneClientTransactionId]);

  const providerLabel =
    provider === "paypal" ? "PayPal" : provider === "payphone" ? "PayPhone" : "MS Vacations";

  const showConfirmed =
    status === "ok" && summary && (provider === "paypal" || provider === "payphone");

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-20">
      {status === "loading" && (
        <div className="text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ocean-light"
            aria-hidden
          >
            <span className="text-sm font-medium text-ocean">…</span>
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-ink">Confirmando pago…</h1>
          <p className="mt-3 leading-relaxed text-muted">
            Estamos verificando tu pago con {providerLabel}.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ocean-light"
            aria-hidden
          >
            <span className="text-2xl text-coral">!</span>
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-ink">Pago pendiente de revisión</h1>
          <p className="mt-3 leading-relaxed text-muted">
            {message ?? "Si ya pagaste, contacta a MS Vacations con tu referencia de reserva."}
          </p>
          {bookingId && (
            <p className="mt-4 text-xs text-muted">
              Referencia: <span className="font-mono">{bookingId.slice(0, 8)}</span>
            </p>
          )}
        </div>
      )}

      {showConfirmed && (
        <BookingConfirmedResult summary={summary} bookingId={bookingId ?? undefined} />
      )}

      {status === "ok" && !showConfirmed && (
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-ink">¡Gracias!</h1>
          <p className="mt-3 leading-relaxed text-muted">
            {provider
              ? `Tu pago con ${providerLabel} fue recibido. Recibirás confirmación por correo.`
              : "Tu solicitud fue registrada. Recibirás confirmación por correo."}
          </p>
          {bookingId && (
            <p className="mt-4 text-xs text-muted">
              Referencia: <span className="font-mono">{bookingId.slice(0, 8)}</span>
            </p>
          )}
        </div>
      )}

      {status !== "loading" && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button href="/" variant="secondary">
            Ir al inicio
          </Button>
          <Button href="/propiedades">Volver al catálogo</Button>
        </div>
      )}
    </div>
  );
}
