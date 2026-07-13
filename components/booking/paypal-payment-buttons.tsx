"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatUsd } from "@/lib/pricing";
import type { OnlinePaymentCheckoutSnapshot } from "@/lib/payments/online-checkout";

const CONTAINER_ID = "ms-paypal-buttons";

type Props = {
  chargeUsd: number;
  isSplitDeposit?: boolean;
} & (
  | { bookingId: string; checkout?: never }
  | { checkout: OnlinePaymentCheckoutSnapshot; bookingId?: never }
);

function loadPayPalSdk(clientId: string): Promise<void> {
  const sdkUrl = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture`;

  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve();
      return;
    }

    const existing = document.querySelector(`script[src^="https://www.paypal.com/sdk/js"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("No se pudo cargar PayPal")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = sdkUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar PayPal"));
    document.head.appendChild(script);
  });
}

export function PayPalPaymentButtons({ bookingId, checkout, chargeUsd, isSplitDeposit = false }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const renderedRef = useRef(false);
  const bookingIdRef = useRef(bookingId ?? "");

  useEffect(() => {
    let cancelled = false;

    async function mountButtons() {
      try {
        const configRes = await fetch("/api/payments/paypal/sdk-config", { cache: "no-store" });
        const configData = (await configRes.json()) as {
          configured?: boolean;
          clientId?: string;
        };
        if (!configRes.ok || !configData.configured || !configData.clientId) {
          throw new Error("PayPal no está configurado");
        }

        await loadPayPalSdk(configData.clientId);
        if (cancelled || renderedRef.current) return;

        const paypal = window.paypal;
        if (!paypal) {
          throw new Error("PayPal no está disponible");
        }

        await paypal
          .Buttons({
            style: {
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "paypal",
            },
            createOrder: async () => {
              const payload = checkout
                ? { ...checkout, termsAccepted: true }
                : { bookingId: bookingIdRef.current };

              const res = await fetch("/api/payments/paypal/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });
              const data = (await res.json()) as {
                orderId?: string;
                bookingId?: string;
                error?: string;
              };
              if (!res.ok || !data.orderId) {
                throw new Error(data.error ?? "No se pudo iniciar el pago con PayPal");
              }
              if (data.bookingId) {
                bookingIdRef.current = data.bookingId;
              }
              return data.orderId;
            },
            onApprove: async (data) => {
              const id = bookingIdRef.current;
              if (!id) {
                setStatus("error");
                setErrorMessage("No se encontró la reserva. Intenta de nuevo.");
                return;
              }
              router.push(
                `/reserva/exito?provider=paypal&bookingId=${encodeURIComponent(id)}&token=${encodeURIComponent(data.orderID)}`,
              );
            },
            onError: () => {
              if (!cancelled) {
                setStatus("error");
                setErrorMessage("Ocurrió un error con PayPal. Intenta de nuevo.");
              }
            },
          })
          .render(`#${CONTAINER_ID}`);

        renderedRef.current = true;
        if (!cancelled) setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "Error al cargar PayPal");
        }
      }
    }

    mountButtons();

    return () => {
      cancelled = true;
    };
  }, [checkout, router, bookingId]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Pago con PayPal</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {isSplitDeposit ? "Paga el depósito hoy con PayPal: " : "Usa tu cuenta PayPal o una tarjeta vinculada. Total: "}
          <span className="font-semibold text-ink">${formatUsd(chargeUsd)} USD</span>
        </p>
      </div>

      {status === "loading" && (
        <p className="rounded-xl border border-sand-dark bg-sand/40 px-4 py-3 text-sm text-muted">
          Cargando PayPal…
        </p>
      )}

      {status === "error" && errorMessage && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      )}

      <div id={CONTAINER_ID} className="min-h-[120px]" />
    </div>
  );
}
