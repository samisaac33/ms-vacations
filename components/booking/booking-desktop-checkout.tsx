"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CardNetworkLogos,
  CreditCardIcon,
  PayPalLogoIcon,
  ProdubancoIcon,
} from "@/components/booking/payment-brand-icons";
import { PayPalPaymentButtons } from "@/components/booking/paypal-payment-buttons";
import { PayphonePaymentBox } from "@/components/booking/payphone-payment-box";
import { PaymentTimingSelector } from "@/components/booking/payment-timing-selector";
import type { DesktopEditModal } from "@/components/booking/booking-desktop-edit-modals";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LEGAL_TERMS_VERSION } from "@/lib/legal/constants";
import { PAYMENT_OPTIONS } from "@/lib/payment-options";
import { isSplitPaymentEligible } from "@/lib/payment-schedule";
import { buildOnlineCheckoutSnapshot } from "@/lib/payments/online-checkout";
import type { PaymentMethod } from "@/lib/payments/types";
import { formatUsd } from "@/lib/pricing";
import type { useBookingCheckout } from "@/hooks/use-booking-checkout";

type Checkout = ReturnType<typeof useBookingCheckout>;

type Props = {
  slug: string;
  propertySlug: string;
  checkout: Checkout;
  onOpenModal: (mode: Exclude<DesktopEditModal, null>) => void;
  autoOpenDates?: boolean;
};

function PaymentMethodBrandIcon({ method }: { method: PaymentMethod }) {
  if (method === "bank_transfer") return <ProdubancoIcon className="shrink-0" />;
  if (method === "payphone") return <CreditCardIcon className="shrink-0" />;
  return <PayPalLogoIcon className="shrink-0" />;
}

function paymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_OPTIONS.find((o) => o.id === method)?.label ?? method;
}

export function BookingDesktopCheckout({
  slug,
  propertySlug,
  checkout,
  onOpenModal,
  autoOpenDates,
}: Props) {
  const [showOnlinePayment, setShowOnlinePayment] = useState(false);
  const [guestNotes, setGuestNotes] = useState("");

  const {
    checkIn,
    checkOut,
    guests,
    guestEmail,
    setGuestEmail,
    paymentMethod,
    paymentTiming,
    setPaymentTiming,
    termsAccepted,
    setTermsAccepted,
    loading,
    error,
    quote,
    quoteLoading,
    step1Done,
    dueNowUsd,
    dueNowCents,
    splitSchedule,
    step1TotalUsd,
    step1SplitSchedule,
    totalUsd,
    submitBooking,
  } = checkout;

  const isSplitDeposit = paymentTiming === "split" && splitSchedule !== null;

  useEffect(() => {
    if (autoOpenDates && !checkIn && !checkOut) {
      onOpenModal("dates");
    }
  }, [autoOpenDates, checkIn, checkOut, onOpenModal]);

  const checkoutAmountUsd = isSplitDeposit ? dueNowUsd : totalUsd;

  const onlineCheckoutSnapshot =
    quote && (paymentMethod === "paypal" || paymentMethod === "payphone")
      ? buildOnlineCheckoutSnapshot({
          slug,
          checkIn,
          checkOut,
          guests,
          guestEmail,
          paymentMethod,
          paymentTiming:
            paymentTiming === "split" && isSplitPaymentEligible(checkIn) ? "split" : "full_now",
          termsVersion: LEGAL_TERMS_VERSION,
        })
      : null;

  const submitLabel = useMemo(() => {
    if (loading) return "Procesando…";
    if (!step1Done) return "Confirma y paga";
    return `Confirma y paga · $${formatUsd(checkoutAmountUsd)} USD`;
  }, [loading, step1Done, checkoutAmountUsd]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (paymentMethod === "paypal" || paymentMethod === "payphone") {
      setShowOnlinePayment(true);
      return;
    }
    await submitBooking({ guestNotes: guestNotes.trim() || undefined });
  }

  return (
    <div className="min-w-0 space-y-8">
      <header className="flex items-center gap-4">
        <Link
          href={`/propiedades/${propertySlug}`}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-sand-dark"
          aria-label="Volver a la propiedad"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="font-display text-2xl font-semibold text-ink">Confirma y paga</h1>
      </header>

      {quote && !quoteLoading && step1Done && (
        <PaymentTimingSelector
          totalUsd={step1TotalUsd}
          splitSchedule={step1SplitSchedule}
          paymentTiming={paymentTiming}
          onChange={setPaymentTiming}
        />
      )}

      <section className={`space-y-3 ${!step1Done ? "pointer-events-none opacity-50" : ""}`}>
        <p className="text-base font-semibold text-ink">Método de pago</p>
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-sand-dark bg-white px-4 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <PaymentMethodBrandIcon method={paymentMethod} />
            <span className="text-sm font-medium text-ink">{paymentMethodLabel(paymentMethod)}</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenModal("payment")}
            disabled={!step1Done}
            className="shrink-0 rounded-lg border border-sand-dark bg-sand/80 px-3 py-1.5 text-sm font-semibold text-ink disabled:opacity-40"
          >
            Cambia
          </button>
        </div>
        {paymentMethod === "payphone" && <CardNetworkLogos className="px-1" />}
      </section>

      <form onSubmit={onSubmit} className={`space-y-6 ${!step1Done ? "pointer-events-none opacity-50" : ""}`}>
        <div>
          <Label htmlFor="desktop-email">Correo electrónico</Label>
          <Input
            id="desktop-email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            disabled={!step1Done}
            className="mt-2"
          />
          <p className="mt-1.5 text-xs text-muted">Enviaremos la confirmación a este correo.</p>
        </div>

        <div>
          <Label htmlFor="desktop-notes">Notas para MS Vacations (opcional)</Label>
          <textarea
            id="desktop-notes"
            rows={4}
            placeholder="Cuéntanos sobre tu viaje, quién te acompaña y cuándo planeas llegar…"
            value={guestNotes}
            onChange={(e) => setGuestNotes(e.target.value)}
            disabled={!step1Done}
            className="mt-2 w-full resize-none rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20"
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            disabled={!step1Done}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-sand-dark accent-ocean"
          />
          <span className="text-sm leading-relaxed text-muted">
            Al seleccionar el botón, acepto los{" "}
            <Link href="/terminos" className="text-ink underline underline-offset-2">
              términos de la reservación
            </Link>
            , la{" "}
            <Link href="/privacidad" className="text-ink underline underline-offset-2">
              política de privacidad
            </Link>{" "}
            y la{" "}
            <Link href="/cancelaciones" className="text-ink underline underline-offset-2">
              política de cancelación
            </Link>
            .
          </span>
        </label>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}

        {!step1Done && !error && (
          <p className="text-sm text-muted">
            Selecciona fechas en el resumen para continuar con el pago.
          </p>
        )}

        {!showOnlinePayment && (
          <Button
            type="submit"
            disabled={
              loading ||
              !step1Done ||
              !guestEmail.trim() ||
              quoteLoading ||
              !quote ||
              !termsAccepted
            }
            className="w-full max-w-xs"
          >
            {submitLabel}
          </Button>
        )}
      </form>

      {showOnlinePayment && quote && paymentMethod === "payphone" && (
        <section className="rounded-2xl border border-sand-dark bg-white p-6">
          <PayphonePaymentBox
            guestEmail={guestEmail}
            quote={quote}
            chargeUsd={dueNowUsd}
            chargeCents={dueNowCents}
            isSplitDeposit={isSplitDeposit}
            onCreateBooking={async () => {
              const result = await submitBooking({
                skipRedirect: true,
                guestNotes: guestNotes.trim() || undefined,
              });
              if (!result.ok || !result.bookingId) {
                return { ok: false as const, error: error ?? "No se pudo crear la reserva" };
              }
              return { ok: true as const, bookingId: result.bookingId };
            }}
          />
        </section>
      )}

      {showOnlinePayment && onlineCheckoutSnapshot && paymentMethod === "paypal" && (
        <section className="rounded-2xl border border-sand-dark bg-white p-6">
          <PayPalPaymentButtons
            checkout={onlineCheckoutSnapshot}
            chargeUsd={dueNowUsd}
            isSplitDeposit={isSplitDeposit}
          />
        </section>
      )}
    </div>
  );
}
