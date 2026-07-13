"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { rangeOverlapsAny, type DateRange } from "@/lib/availability-utils";
import { isValidDateOrder } from "@/lib/dates";
import { validateStayLength } from "@/lib/stay-rules";
import { LEGAL_TERMS_VERSION } from "@/lib/legal/constants";
import {
  HOSPITALITY_VAT_PROMOTIONAL_RATE,
  HOSPITALITY_VAT_STANDARD_RATE,
  stayTouchesPromotionalVat,
} from "@/lib/legal/hospitality-vat";
import type { PaymentMethod } from "@/lib/payments/types";
import {
  amountDueNowCents,
  isSplitPaymentEligible,
  splitScheduleForPaymentMethod,
  type PaymentTiming,
  type SplitSchedule,
} from "@/lib/payment-schedule";
import { formatUsd, totalCentsForPaymentMethod } from "@/lib/pricing";
import type { StayQuote } from "@/lib/pricing-query";

export type BookingPricingState = {
  quote: StayQuote | null;
  quoteLoading: boolean;
  paymentMethod: PaymentMethod;
  paymentTiming: PaymentTiming;
  dueNowUsd: number;
  splitSchedule: SplitSchedule | null;
};

type Options = {
  slug: string;
  maxGuests: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onPricingChange?: (state: BookingPricingState) => void;
};

export function useBookingCheckout({
  slug,
  maxGuests,
  initialCheckIn = "",
  initialCheckOut = "",
  initialGuests,
  onPricingChange,
}: Options) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(
    initialGuests ? Math.min(initialGuests, maxGuests) : Math.min(2, maxGuests),
  );
  const [guestEmail, setGuestEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [paymentTiming, setPaymentTiming] = useState<PaymentTiming>("full_now");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rangeHint, setRangeHint] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<DateRange[]>([]);
  const [quote, setQuote] = useState<StayQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const datesComplete = isValidDateOrder(checkIn, checkOut);
  const stayLengthError = datesComplete ? validateStayLength(checkIn, checkOut) : null;
  const datesValid = datesComplete && !stayLengthError;
  const step1Done = datesValid && Boolean(quote) && !quoteLoading;

  const totalCents =
    quote !== null ? totalCentsForPaymentMethod(quote.totalDirectCents, paymentMethod) : 0;

  const totalUsd = totalCents / 100;

  const splitEligible = datesValid && isSplitPaymentEligible(checkIn);

  const splitSchedule: SplitSchedule | null = useMemo(() => {
    if (!quote || !splitEligible) return null;
    return splitScheduleForPaymentMethod(quote.totalDirectCents, paymentMethod, checkIn);
  }, [quote, splitEligible, paymentMethod, checkIn]);

  const dueNowCents = quote
    ? amountDueNowCents(totalCents, paymentTiming, checkIn)
    : 0;

  const dueNowUsd = dueNowCents / 100;

  const step1TotalUsd = quote ? quote.totalDirectCents / 100 : 0;

  const step1SplitSchedule: SplitSchedule | null = useMemo(() => {
    if (!quote || !splitEligible) return null;
    return splitScheduleForPaymentMethod(quote.totalDirectCents, "paypal", checkIn);
  }, [quote, splitEligible, checkIn]);

  const handleBlocksLoaded = useCallback((loaded: DateRange[]) => {
    setBlocks(loaded);
  }, []);

  const handleRangeChange = useCallback((inDate: string, outDate: string) => {
    setCheckIn(inDate);
    setCheckOut(outDate);
    setError(null);
    setRangeHint(null);
    setQuote(null);
    setQuoteError(null);
  }, []);

  useEffect(() => {
    if (!splitEligible && paymentTiming === "split") {
      setPaymentTiming("full_now");
    }
  }, [splitEligible, paymentTiming]);

  useEffect(() => {
    if (!datesComplete) {
      setQuote(null);
      return;
    }

    if (stayLengthError) {
      setQuote(null);
      setQuoteError(stayLengthError);
      setQuoteLoading(false);
      return;
    }

    let cancelled = false;
    setQuoteLoading(true);
    setQuoteError(null);

    fetch(
      `/api/pricing?slug=${encodeURIComponent(slug)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`,
      { cache: "no-store" },
    )
      .then(async (res) => {
        const data = (await res.json()) as StayQuote & { error?: string };
        if (!res.ok) throw new Error(data.error ?? "No se pudo calcular el precio");
        if (!cancelled) setQuote(data);
      })
      .catch((e) => {
        if (!cancelled) {
          setQuote(null);
          setQuoteError(e instanceof Error ? e.message : "Error al calcular precio");
        }
      })
      .finally(() => {
        if (!cancelled) setQuoteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, checkIn, checkOut, datesComplete, stayLengthError]);

  useEffect(() => {
    onPricingChange?.({
      quote,
      quoteLoading,
      paymentMethod,
      paymentTiming,
      dueNowUsd,
      splitSchedule,
    });
  }, [quote, quoteLoading, paymentMethod, paymentTiming, dueNowUsd, splitSchedule, onPricingChange]);

  const vatNote = useMemo(() => {
    if (!datesValid) return null;
    const promotional = stayTouchesPromotionalVat(checkIn, checkOut);
    if (promotional) {
      return `Precios con IVA incluido. Parte de tu estancia puede aplicar tarifa reducida del ${HOSPITALITY_VAT_PROMOTIONAL_RATE * 100} % (feriados decretados) en lugar del ${HOSPITALITY_VAT_STANDARD_RATE * 100} % general.`;
    }
    return `Precios con IVA incluido (${HOSPITALITY_VAT_STANDARD_RATE * 100} % tarifa general de alojamiento turístico).`;
  }, [datesValid, checkIn, checkOut]);

  const submitBooking = useCallback(async (options?: {
    skipRedirect?: boolean;
    bankTransferInit?: "whatsapp" | "standard";
    guestNotes?: string;
  }) => {
    setError(null);

    if (!isValidDateOrder(checkIn, checkOut)) {
      setError("Selecciona check-in y check-out en el calendario.");
      return { ok: false as const };
    }

    const lengthError = validateStayLength(checkIn, checkOut);
    if (lengthError) {
      setError(lengthError);
      return { ok: false as const };
    }

    if (!quote) {
      setError(quoteError ?? "Espera a que se calcule el precio de tu estancia.");
      return { ok: false as const };
    }

    if (blocks.length > 0 && rangeOverlapsAny(checkIn, checkOut, blocks)) {
      setError("Las fechas seleccionadas coinciden con noches no disponibles.");
      return { ok: false as const };
    }

    if (!guestEmail.trim()) {
      setError("Ingresa tu correo electrónico.");
      return { ok: false as const };
    }

    if (!termsAccepted) {
      setError("Debes aceptar los términos y condiciones para continuar.");
      return { ok: false as const };
    }

    const effectiveTiming =
      paymentTiming === "split" && isSplitPaymentEligible(checkIn) ? "split" : "full_now";

    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          checkIn,
          checkOut,
          guests,
          guestEmail: guestEmail.trim(),
          paymentMethod,
          paymentTiming: effectiveTiming,
          termsAccepted: true,
          termsVersion: LEGAL_TERMS_VERSION,
          ...(options?.bankTransferInit ? { bankTransferInit: options.bankTransferInit } : {}),
          ...(options?.guestNotes ? { guestNotes: options.guestNotes } : {}),
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        bookingId?: string;
        redirectUrl?: string;
        next?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo completar la reserva");
        return { ok: false as const };
      }
      if (data.next === "payphone_box" && data.bookingId) {
        return {
          ok: true as const,
          bookingId: data.bookingId,
          next: "payphone_box" as const,
          redirectUrl: data.redirectUrl,
        };
      }
      if (data.next === "paypal_buttons" && data.bookingId) {
        return {
          ok: true as const,
          bookingId: data.bookingId,
          next: "paypal_buttons" as const,
          redirectUrl: data.redirectUrl,
        };
      }
      if (options?.skipRedirect && data.bookingId) {
        return {
          ok: true as const,
          bookingId: data.bookingId,
          redirectUrl: data.redirectUrl,
          next: data.next,
        };
      }
      if (data.redirectUrl && data.next === "redirect") {
        window.location.href = data.redirectUrl;
        return { ok: true as const, bookingId: data.bookingId, redirectUrl: data.redirectUrl };
      }
      setError("No se recibió la URL del siguiente paso.");
      return { ok: false as const };
    } catch {
      setError("Error de red. Intente de nuevo.");
      return { ok: false as const };
    } finally {
      setLoading(false);
    }
  }, [
    blocks,
    checkIn,
    checkOut,
    guestEmail,
    guests,
    paymentMethod,
    paymentTiming,
    quote,
    quoteError,
    slug,
    termsAccepted,
  ]);

  const uploadProof = useCallback(async (bookingId: string, file: File) => {
    const body = new FormData();
    body.append("proof", file);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/proof`, {
        method: "POST",
        body,
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        return { ok: false as const, error: data.error ?? "No se pudo subir el comprobante" };
      }
      return { ok: true as const };
    } catch {
      return { ok: false as const, error: "Error de red. Intente de nuevo." };
    }
  }, []);

  return {
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
    blocks,
    quote,
    quoteLoading,
    quoteError,
    datesComplete,
    step1Done,
    totalUsd,
    totalCents,
    dueNowUsd,
    dueNowCents,
    splitSchedule,
    splitEligible,
    step1TotalUsd,
    step1SplitSchedule,
    vatNote,
    handleBlocksLoaded,
    handleRangeChange,
    submitBooking,
    uploadProof,
    formatTotalLabel: () => {
      if (loading) return "Procesando…";
      if (!datesComplete) return "Selecciona fechas para continuar";
      if (stayLengthError) return stayLengthError;
      if (quoteLoading) return "Calculando precio…";
      if (quoteError || !quote) return "Precio no disponible";
      const labelUsd = paymentTiming === "split" && splitEligible ? dueNowUsd : totalUsd;
      if (paymentMethod === "bank_transfer") {
        return `Continuar · $${formatUsd(labelUsd)} USD (transferencia)`;
      }
      if (paymentMethod === "paypal" || paymentMethod === "payphone") {
        return `Ir al pago · $${formatUsd(labelUsd)} USD`;
      }
      return `Continuar al pago · $${formatUsd(labelUsd)} USD`;
    },
  };
}

