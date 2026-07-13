"use client";

import { useEffect, useState } from "react";
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
        const data = (await res.json()) as { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error ?? "No se pudo confirmar el pago");
          return;
        }
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

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ocean-light"
        aria-hidden
      >
        {status === "error" ? (
          <span className="text-2xl text-coral">!</span>
        ) : status === "loading" ? (
          <span className="text-sm font-medium text-ocean">…</span>
        ) : (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-ocean">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <h1 className="mt-6 text-2xl font-semibold text-ink">
        {status === "loading"
          ? "Confirmando pago…"
          : status === "error"
            ? "Pago pendiente de revisión"
            : "¡Gracias!"}
      </h1>
      <p className="mt-3 leading-relaxed text-muted">
        {status === "loading" && "Estamos verificando tu pago con " + providerLabel + "."}
        {status === "ok" &&
          (provider
            ? `Tu pago con ${providerLabel} fue recibido. Recibirás confirmación por correo.`
            : "Tu solicitud fue registrada. Recibirás confirmación por correo.")}
        {status === "error" &&
          (message ??
            "Si ya pagaste, contacta a MS Vacations con tu referencia de reserva.")}
      </p>
      {bookingId && (
        <p className="mt-4 text-xs text-muted">
          Referencia: <span className="font-mono">{bookingId.slice(0, 8)}</span>
        </p>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button href="/" variant="secondary">
          Ir al inicio
        </Button>
        <Button href="/propiedades">Volver al catálogo</Button>
      </div>
    </div>
  );
}
