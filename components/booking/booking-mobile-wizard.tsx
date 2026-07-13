"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BookingEditSheet } from "@/components/booking/booking-edit-sheet";
import { BookingGuestConfirmationFields } from "@/components/booking/booking-guest-confirmation-fields";
import { BookingProgressBar } from "@/components/booking/booking-progress-bar";
import {
  BookingStepConfirm,
  paymentMethodLabel,
  type BankTransferSuccess,
} from "@/components/booking/booking-step-confirm";
import { BookingStepPayment } from "@/components/booking/booking-step-payment";
import {
  BookingStepPriceBreakdown,
  PriceBreakdownContent,
} from "@/components/booking/booking-step-price-breakdown";
import { PayPalPaymentButtons } from "@/components/booking/paypal-payment-buttons";
import { PayphonePaymentBox } from "@/components/booking/payphone-payment-box";
import { BookingStepReview } from "@/components/booking/booking-step-review";
import { useBookingCheckout } from "@/hooks/use-booking-checkout";
import { LEGAL_TERMS_VERSION } from "@/lib/legal/constants";
import { formatUsd } from "@/lib/pricing";
import {
  buildOnlineCheckoutSnapshot,
} from "@/lib/payments/online-checkout";
import { isSplitPaymentEligible } from "@/lib/payment-schedule";
import {
  buildBankTransferProofWhatsAppUrl,
  formatBookingReference,
  type BankAccountDetails,
} from "@/lib/payments/bank-transfer";
import type { PaymentMethod } from "@/lib/payments/types";
import { siteConfig } from "@/lib/site";

type PropertySummary = {
  slug: string;
  name: string;
  image?: { src: string; alt: string };
};

type Props = {
  slug: string;
  maxGuests: number;
  property: PropertySummary;
  bank: BankAccountDetails;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onPricingChange?: Parameters<typeof useBookingCheckout>[0]["onPricingChange"];
};

const STEP_TITLES = [
  "Revisa y continúa",
  "Método de pago",
  "Desglose del precio",
  "Confirma y reserva",
] as const;

type SheetMode = "dates" | "guests" | "details" | null;

function hasOnlinePaymentStep(method: PaymentMethod): boolean {
  return method === "paypal" || method === "payphone";
}

function onlinePaymentStepTitle(method: "paypal" | "payphone"): string {
  return method === "paypal" ? "Pago con PayPal" : "Pago con PayPhone";
}

export function BookingMobileWizard({
  slug,
  maxGuests,
  property,
  bank,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  onPricingChange,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [sheet, setSheet] = useState<SheetMode>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<BankTransferSuccess | null>(null);
  const [whatsAppLoading, setWhatsAppLoading] = useState(false);

  const checkout = useBookingCheckout({
    slug,
    maxGuests,
    initialCheckIn,
    initialCheckOut,
    initialGuests,
    onPricingChange,
  });

  const {
    checkIn,
    checkOut,
    guests,
    setGuests,
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
    setError,
    rangeHint,
    setRangeHint,
    quote,
    quoteLoading,
    step1Done,
    totalUsd,
    dueNowUsd,
    dueNowCents,
    splitSchedule,
    step1TotalUsd,
    step1SplitSchedule,
    handleBlocksLoaded,
    handleRangeChange,
    submitBooking,
    uploadProof,
  } = checkout;

  const isSplitDeposit = paymentTiming === "split" && splitSchedule !== null;
  const isOnlinePayment = hasOnlinePaymentStep(paymentMethod);
  const isBankTransfer = paymentMethod === "bank_transfer";
  const totalSteps = 4;
  const stepTitle =
    step === 4 && isOnlinePayment
      ? onlinePaymentStepTitle(paymentMethod as "paypal" | "payphone")
      : STEP_TITLES[step - 1];

  const isOnlinePaymentStep = step === 4 && isOnlinePayment && quote !== null;

  const onlineCheckoutSnapshot =
    quote && isOnlinePayment
      ? buildOnlineCheckoutSnapshot({
          slug,
          checkIn,
          checkOut,
          guests,
          guestEmail,
          paymentMethod: paymentMethod as "paypal" | "payphone",
          paymentTiming:
            paymentTiming === "split" && isSplitPaymentEligible(checkIn) ? "split" : "full_now",
          termsVersion: LEGAL_TERMS_VERSION,
        })
      : null;
  const bankTransferComplete = isBankTransfer && transferSuccess !== null;

  function handleBack() {
    setError(null);
    if (bankTransferComplete) {
      router.push(`/propiedades/${property.slug}`);
      return;
    }
    if (step > 1) {
      setStep((s) => s - 1);
      return;
    }
    router.push(`/propiedades/${property.slug}`);
  }

  function handleClose() {
    router.push(`/propiedades/${property.slug}`);
  }

  function canAdvance(): boolean {
    if (step === 1) return step1Done;
    if (step === 2) return Boolean(paymentMethod);
    if (step === 3) {
      if (!quote) return false;
      if (isOnlinePayment) {
        return Boolean(guestEmail.trim()) && termsAccepted && !loading;
      }
      return true;
    }
    if (step === 4 && isBankTransfer) {
      return (
        Boolean(guestEmail.trim()) &&
        termsAccepted &&
        Boolean(proofFile) &&
        !loading &&
        !bankTransferComplete
      );
    }
    return false;
  }

  async function handleWhatsAppTransfer() {
    setError(null);
    if (!guestEmail.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    if (!termsAccepted) {
      setError("Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    setWhatsAppLoading(true);
    try {
      const result = await submitBooking({ skipRedirect: true, bankTransferInit: "whatsapp" });
      if (!result.ok || !result.bookingId) return;

      const reference = formatBookingReference(result.bookingId);
      const url = buildBankTransferProofWhatsAppUrl(
        {
          propertyName: property.name,
          checkIn,
          checkOut,
          guests,
          totalUsd: isSplitDeposit ? dueNowUsd : totalUsd,
          reference,
          guestEmail: guestEmail.trim(),
        },
        siteConfig.contact.whatsapp,
      );

      if (!url) {
        setError("WhatsApp no configurado. Contacta a MS Vacations.");
        return;
      }

      window.open(url, "_blank", "noopener,noreferrer");
      setTransferSuccess({ reference, via: "whatsapp" });
    } finally {
      setWhatsAppLoading(false);
    }
  }

  async function handlePrimaryAction() {
    setError(null);

    if (step < 3) {
      if (canAdvance()) setStep((s) => s + 1);
      return;
    }

    if (step === 3) {
      if (canAdvance()) setStep(4);
      return;
    }

    if (step === 4 && isBankTransfer) {
      if (!canAdvance() || !proofFile) return;

      const result = await submitBooking({ skipRedirect: true, bankTransferInit: "standard" });
      if (!result.ok || !result.bookingId) return;

      const upload = await uploadProof(result.bookingId, proofFile);
      if (!upload.ok) {
        setError(upload.error);
        return;
      }

      setTransferSuccess({
        reference: formatBookingReference(result.bookingId),
        via: "upload",
      });
    }
  }

  const checkoutAmountUsd = isSplitDeposit ? dueNowUsd : totalUsd;

  const primaryLabel =
    step < 3
      ? "Siguiente"
      : isOnlinePaymentStep || bankTransferComplete
        ? null
        : loading
          ? "Procesando…"
          : step === 3
            ? "Siguiente"
            : isBankTransfer
              ? `Confirmar compra · $${formatUsd(checkoutAmountUsd)} USD`
              : `Confirmar compra · $${formatUsd(checkoutAmountUsd)} USD`;

  const showPrimaryButton = !isOnlinePaymentStep && !(isBankTransfer && bankTransferComplete);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden">
      <header className="flex shrink-0 items-center justify-between border-b border-sand-dark px-4 py-3">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-dark"
          aria-label={
            bankTransferComplete
              ? "Volver a la propiedad"
              : step === 1
                ? "Volver a la propiedad"
                : "Paso anterior"
          }
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
        </button>
        <p className="text-sm font-medium text-muted">{stepTitle}</p>
        <button
          type="button"
          onClick={handleClose}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-dark"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {step === 1 && (
          <BookingStepReview
            property={property}
            checkIn={checkIn}
            checkOut={checkOut}
            guests={guests}
            quote={quote}
            quoteLoading={quoteLoading}
            step1TotalUsd={step1TotalUsd}
            step1SplitSchedule={step1SplitSchedule}
            paymentTiming={paymentTiming}
            onPaymentTimingChange={setPaymentTiming}
            onEditDates={() => setSheet("dates")}
            onEditGuests={() => setSheet("guests")}
            onShowDetails={() => setSheet("details")}
          />
        )}

        {step === 2 && (
          <BookingStepPayment paymentMethod={paymentMethod} onChange={setPaymentMethod} />
        )}

        {step === 3 && quote && (
          <div className="space-y-6">
            <BookingStepPriceBreakdown
              quote={quote}
              paymentMethod={paymentMethod}
              paymentTiming={paymentTiming}
              splitSchedule={splitSchedule}
            />
            {isOnlinePayment && (
              <BookingGuestConfirmationFields
                guestEmail={guestEmail}
                onEmailChange={setGuestEmail}
                termsAccepted={termsAccepted}
                onTermsChange={setTermsAccepted}
              />
            )}
          </div>
        )}

        {step === 4 && quote && isBankTransfer && (
          <BookingStepConfirm
            guestEmail={guestEmail}
            onEmailChange={setGuestEmail}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
            totalUsd={checkoutAmountUsd}
            paymentMethodLabel={paymentMethodLabel(paymentMethod)}
            paymentMethod={paymentMethod}
            nights={quote.nights}
            bank={bank}
            bankTransfer={{
              propertyName: property.name,
              checkIn,
              checkOut,
              guests,
              chargeUsd: checkoutAmountUsd,
              whatsappNumber: siteConfig.contact.whatsapp,
              onProofReady: setProofFile,
              onWhatsApp: handleWhatsAppTransfer,
              whatsAppLoading,
              disabled: loading || whatsAppLoading || bankTransferComplete,
              success: transferSuccess,
            }}
          />
        )}

        {isOnlinePaymentStep && paymentMethod === "payphone" && (
          <PayphonePaymentBox
            guestEmail={guestEmail}
            quote={quote}
            chargeUsd={dueNowUsd}
            chargeCents={dueNowCents}
            isSplitDeposit={isSplitDeposit}
            onCreateBooking={async () => {
              const result = await submitBooking({ skipRedirect: true });
              if (!result.ok || !result.bookingId) {
                return { ok: false as const, error: error ?? "No se pudo crear la reserva" };
              }
              return { ok: true as const, bookingId: result.bookingId };
            }}
          />
        )}

        {isOnlinePaymentStep && paymentMethod === "paypal" && onlineCheckoutSnapshot && (
          <PayPalPaymentButtons
            checkout={onlineCheckoutSnapshot}
            chargeUsd={dueNowUsd}
            isSplitDeposit={isSplitDeposit}
          />
        )}

        {rangeHint && (
          <p
            className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            {rangeHint}
          </p>
        )}

        {error && (
          <p
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <footer className="shrink-0 border-t border-sand-dark bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <BookingProgressBar currentStep={step} totalSteps={totalSteps} />
        {showPrimaryButton && primaryLabel && (
          <button
            type="button"
            disabled={!canAdvance() || loading}
            onClick={handlePrimaryAction}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-ocean text-base font-semibold text-white transition-colors hover:bg-ocean-dark disabled:opacity-50"
          >
            {primaryLabel}
          </button>
        )}
      </footer>

      <BookingEditSheet
        mode={sheet}
        onClose={() => setSheet(null)}
        slug={slug}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        maxGuests={maxGuests}
        onRangeChange={handleRangeChange}
        onBlocksLoaded={handleBlocksLoaded}
        onRangeError={setRangeHint}
        onGuestsChange={setGuests}
        rangeError={rangeHint}
      >
        {sheet === "details" && quote ? (
          <PriceBreakdownContent
            quote={quote}
            paymentMethod={paymentMethod}
            paymentTiming={paymentTiming}
            splitSchedule={splitSchedule}
            compact
          />
        ) : null}
      </BookingEditSheet>
    </div>
  );
}
