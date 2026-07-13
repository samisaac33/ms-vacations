"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildStayPriceBreakdown } from "@/lib/pricing-breakdown";
import { buildPayPhoneBoxAmounts } from "@/lib/payments/payphone";
import { formatUsd } from "@/lib/pricing";
import type { StayQuote } from "@/lib/pricing-query";

const BOX_CONTAINER_ID = "ms-payphone-box";
const PAY_BUTTON_ID = "ms-payphone-pay";
const CSS_URL = "https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.css";
const JS_URL = "https://cdn.payphonetodoesposible.com/box/v2.0/payphone-payment-box.js";

type CreateBookingResult =
  | { ok: true; bookingId: string }
  | { ok: false; error?: string };

type Props = {
  guestEmail: string;
  quote: StayQuote;
  chargeUsd: number;
  chargeCents: number;
  isSplitDeposit?: boolean;
  onCreateBooking: () => Promise<CreateBookingResult>;
};

function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error("No se pudo cargar estilos de PayPhone"));
    document.head.appendChild(link);
  });
}

function loadPayPhoneScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PPaymentButtonBox) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${JS_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("No se pudo cargar PayPhone")), {
        once: true,
      });
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = JS_URL;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No se pudo cargar PayPhone"));
    document.head.appendChild(script);
  });
}

export function PayphonePaymentBox({
  guestEmail,
  quote,
  chargeUsd,
  chargeCents,
  isSplitDeposit = false,
  onCreateBooking,
}: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [boxVisible, setBoxVisible] = useState(false);
  const ppbRef = useRef<PayPhonePaymentBoxInstance | null>(null);
  const bookingIdRef = useRef<string | null>(null);
  const configRef = useRef<{ token: string; storeId: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function preload() {
      try {
        const configRes = await fetch("/api/payments/payphone/box-config", { cache: "no-store" });
        const configData = (await configRes.json()) as {
          configured?: boolean;
          token?: string;
          storeId?: string;
        };
        if (!configRes.ok || !configData.configured || !configData.token || !configData.storeId) {
          throw new Error("PayPhone no está configurado");
        }

        await Promise.all([loadStylesheet(CSS_URL), loadPayPhoneScript()]);
        if (cancelled) return;

        configRef.current = { token: configData.token, storeId: configData.storeId };
        setStatus("ready");
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setErrorMessage(error instanceof Error ? error.message : "Error al cargar PayPhone");
        }
      }
    }

    preload();

    return () => {
      cancelled = true;
    };
  }, []);

  const mountBox = useCallback(
    async (bookingId: string) => {
      const config = configRef.current;
      const BoxCtor = window.PPaymentButtonBox;
      if (!config || !BoxCtor) {
        throw new Error("PayPhone no está disponible");
      }

      const container = document.getElementById(BOX_CONTAINER_ID);
      if (container) container.innerHTML = "";

      const breakdown = buildStayPriceBreakdown(quote, "payphone");
      const ratio = chargeCents / breakdown.totalCents;
      const scaledSubtotal = Math.round(breakdown.subtotalBaseCents * ratio);
      const scaledVat = chargeCents - scaledSubtotal;
      const amounts = buildPayPhoneBoxAmounts({
        totalCents: chargeCents,
        subtotalBaseCents: scaledSubtotal,
        vatCents: scaledVat,
      });

      ppbRef.current = new BoxCtor({
        token: config.token,
        storeId: config.storeId,
        clientTransactionId: bookingId,
        currency: "USD",
        reference: `MS Vacations ${bookingId.slice(0, 8)}`,
        lang: "es",
        email: guestEmail.trim(),
        defaultMethod: "card",
        timeZone: -5,
        showMainButton: false,
        showFooter: false,
        customButtonId: PAY_BUTTON_ID,
        ...amounts,
      });
      ppbRef.current.render(BOX_CONTAINER_ID);
      setBoxVisible(true);
    },
    [chargeCents, guestEmail, quote],
  );

  async function handlePayClick() {
    setErrorMessage(null);
    setStatus("processing");

    try {
      if (!bookingIdRef.current) {
        const created = await onCreateBooking();
        if (!created.ok) {
          throw new Error(created.error ?? "No se pudo crear la reserva");
        }
        bookingIdRef.current = created.bookingId;
        await mountBox(created.bookingId);
      }

      if (!ppbRef.current) {
        throw new Error("PayPhone no está listo");
      }

      ppbRef.current.startProcessPayment();
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "No se pudo iniciar el pago");
    }
  }

  const payDisabled = status === "loading" || status === "processing" || status === "idle";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Pago con PayPhone</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {isSplitDeposit
            ? "Paga el depósito hoy con tarjeta o saldo PayPhone: "
            : "Completa el pago con tarjeta o saldo PayPhone. Total: "}
          <span className="font-semibold text-ink">${formatUsd(chargeUsd)} USD</span>
        </p>
      </div>

      {status === "idle" && (
        <p className="rounded-xl border border-sand-dark bg-sand/40 px-4 py-3 text-sm text-muted">
          Cargando PayPhone…
        </p>
      )}

      {errorMessage && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        id={PAY_BUTTON_ID}
        type="button"
        disabled={payDisabled}
        onClick={handlePayClick}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-ocean text-base font-semibold text-white transition-colors hover:bg-ocean-dark disabled:opacity-50"
      >
        {status === "processing"
          ? "Preparando pago…"
          : `Pagar · $${formatUsd(chargeUsd)} USD`}
      </button>

      <div
        id={BOX_CONTAINER_ID}
        className={boxVisible ? "min-h-[280px]" : "hidden min-h-[280px]"}
      />
    </div>
  );
}
