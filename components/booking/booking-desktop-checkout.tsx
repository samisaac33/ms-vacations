"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PayPalPaymentButtons } from "@/components/booking/paypal-payment-buttons";
import { PayphonePaymentBox } from "@/components/booking/payphone-payment-box";
import { PaymentMethodList } from "@/components/booking/payment-method-list";
import { PaymentTimingSelector } from "@/components/booking/payment-timing-selector";
import { GuaranteeIncludedNote } from "@/components/booking/guarantee-included-note";
import type { DesktopEditModal } from "@/components/booking/booking-desktop-edit-modals";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LEGAL_TERMS_VERSION } from "@/lib/legal/constants";
import { isSplitPaymentEligible } from "@/lib/payment-schedule";
import { buildOnlineCheckoutSnapshot } from "@/lib/payments/online-checkout";
import { formatUsd, appliesRefundableGuarantee } from "@/lib/pricing";
import type { useBookingCheckout } from "@/hooks/use-booking-checkout";

type Checkout = ReturnType<typeof useBookingCheckout>;

type Props = {
  slug: string;
  propertySlug: string;
  checkout: Checkout;
  onOpenModal: (mode: Exclude<DesktopEditModal, null>) => void;
  autoOpenDates?: boolean;
};

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
    setPaymentMethod,
    paymentTiming,
    setPaymentTiming,
    termsAccepted,
    setTermsAccepted,
    loading,
    error,
    quote,
    quoteLoading,
    quoteError,
    dateRangeError,
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

  useEffect(() => {
    setShowOnlinePayment(false);
  }, [paymentMethod]);

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
        <div className="space-y-2">
          {appliesRefundableGuarantee(slug) && <GuaranteeIncludedNote />}
          <PaymentTimingSelector
            totalUsd={step1TotalUsd}
            splitSchedule={step1SplitSchedule}
            paymentTiming={paymentTiming}
            onChange={setPaymentTiming}
          />
        </div>
      )}

      <section className={`space-y-3 ${!step1Done ? "pointer-events-none opacity-50" : ""}`}>
        <p className="text-base font-semibold text-ink">Método de pago</p>
        <PaymentMethodList
          paymentMethod={paymentMethod}
          onChange={setPaymentMethod}
          disabled={!step1Done}
          name="desktop-paymentMethod"
        />
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
            className="mt-2 w-full resize-none rounded-xl border border-sand-dark bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-ocean focus:outline-none focus:ring-2 focus:ring-ocean/20"
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
            </Link>
            , la{" "}
            <Link href="/cancelaciones" className="text-ink underline underline-offset-2">
              política de cancelación
            </Link>{" "}
            y la{" "}
            <Link href="/garantia" className="text-ink underline underline-offset-2">
              política de garantía reembolsable
            </Link>
            .
          </span>
        </label>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {error}
          </p>
        )}

        {!step1Done && !error && (dateRangeError || quoteError) && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {dateRangeError || quoteError}
          </p>
        )}

        {!step1Done && !error && !dateRangeError && !quoteError && (
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
        <section className="rounded-2xl border border-sand-dark bg-surface p-6">
          <PayphonePaymentBox
            guestEmail={guestEmail}
            quote={quote}
            chargeUsd={dueNowUsd}
            chargeCents={dueNowCents}
            isSplitDeposit={isSplitDeposit}
            bookingPersistKey={`ms-payphone:${slug}:${checkIn}:${checkOut}:${guestEmail.trim().toLowerCase()}`}
            onCreateBooking={async () => {
              const result = await submitBooking({
                skipRedirect: true,
                guestNotes: guestNotes.trim() || undefined,
              });
              if (!result.ok || !result.bookingId) {
                return {
                  ok: false as const,
                  error: result.error ?? "No se pudo crear la reserva",
                };
              }
              return { ok: true as const, bookingId: result.bookingId };
            }}
          />
        </section>
      )}

      {showOnlinePayment && onlineCheckoutSnapshot && paymentMethod === "paypal" && (
        <section className="rounded-2xl border border-sand-dark bg-surface p-6">
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
