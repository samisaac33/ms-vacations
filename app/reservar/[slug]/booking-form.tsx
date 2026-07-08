"use client";

import { parseISO } from "date-fns";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { BookingCalendar } from "@/components/booking-calendar";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { rangeOverlapsAny, type DateRange } from "@/lib/availability-utils";
import { isValidDateOrder } from "@/lib/dates";
import type { PaymentMethod } from "@/lib/payments/types";
import {
  BANK_TRANSFER_DISCOUNT_PERCENT,
  formatUsd,
  totalUsdForPaymentMethod,
} from "@/lib/pricing";

type StayQuote = {
  nights: number;
  totalDirectCents: number;
  nightly: { date: string; directCents: number; isOverride: boolean }[];
};

export type BookingPricingState = {
  quote: StayQuote | null;
  quoteLoading: boolean;
  paymentMethod: PaymentMethod;
};

type Props = {
  slug: string;
  maxGuests: number;
  onPricingChange?: (state: BookingPricingState) => void;
};

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  badge?: string;
}[] = [
  {
    id: "bank_transfer",
    label: "Transferencia bancaria",
    description: "Transfiere y sube tu comprobante. Confirmación manual.",
    badge: `−${BANK_TRANSFER_DISCOUNT_PERCENT}% off`,
  },
  {
    id: "paypal",
    label: "PayPal",
    description: "Pago seguro con tu cuenta PayPal.",
  },
  {
    id: "payphone",
    label: "PayPhone",
    description: "Tarjeta débito/crédito vía PayPhone (Ecuador).",
  },
];

function formatStayDate(iso: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(parseISO(iso));
}

function StepBadge({ step, label, active, done }: { step: number; label: string; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
          done
            ? "bg-ocean text-white"
            : active
              ? "bg-ocean text-white ring-4 ring-ocean-light"
              : "bg-sand-dark text-muted"
        }`}
      >
        {done ? "✓" : step}
      </span>
      <span className={`text-sm font-semibold ${active || done ? "text-ink" : "text-muted"}`}>{label}</span>
    </div>
  );
}

function GuestStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Menos huéspedes"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sand-dark bg-white text-lg text-ink transition-colors hover:bg-sand-dark disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-[3rem] text-center text-lg font-semibold text-ink">{value}</span>
      <button
        type="button"
        aria-label="Más huéspedes"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sand-dark bg-white text-lg text-ink transition-colors hover:bg-sand-dark disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}

function formatNightlySummary(quote: StayQuote): string {
  const directAmounts = [...new Set(quote.nightly.map((n) => n.directCents))];
  if (directAmounts.length <= 1) {
    const perNight = (quote.nightly[0]?.directCents ?? 0) / 100;
    return `$${formatUsd(perNight)}/noche`;
  }
  return "precio variable por noche";
}

export function BookingForm({ slug, maxGuests, onPricingChange }: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(Math.min(2, maxGuests));
  const [guestEmail, setGuestEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rangeHint, setRangeHint] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<DateRange[]>([]);
  const [quote, setQuote] = useState<StayQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);

  const datesComplete = isValidDateOrder(checkIn, checkOut);

  const totalUsd =
    quote !== null ? totalUsdForPaymentMethod(quote.totalDirectCents, paymentMethod) : 0;

  const handleBlocksLoaded = useCallback((loaded: DateRange[]) => {
    setBlocks(loaded);
  }, []);

  function handleRangeChange(inDate: string, outDate: string) {
    setCheckIn(inDate);
    setCheckOut(outDate);
    setError(null);
    setRangeHint(null);
    setQuote(null);
    setQuoteError(null);
  }

  useEffect(() => {
    if (!datesComplete) {
      setQuote(null);
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
  }, [slug, checkIn, checkOut, datesComplete]);

  useEffect(() => {
    onPricingChange?.({ quote, quoteLoading, paymentMethod });
  }, [quote, quoteLoading, paymentMethod, onPricingChange]);

  const step1Done = datesComplete && Boolean(quote) && !quoteLoading;

  const submitLabel = useMemo(() => {
    if (loading) return "Procesando…";
    if (!datesComplete) return "Selecciona fechas para continuar";
    if (quoteLoading) return "Calculando precio…";
    if (quoteError || !quote) return "Precio no disponible";
    if (paymentMethod === "bank_transfer") {
      return `Continuar · $${formatUsd(totalUsd)} USD (transferencia)`;
    }
    return `Continuar al pago · $${formatUsd(totalUsd)} USD`;
  }, [loading, datesComplete, quoteLoading, quoteError, quote, totalUsd, paymentMethod]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidDateOrder(checkIn, checkOut)) {
      setError("Selecciona check-in y check-out en el calendario.");
      return;
    }

    if (!quote) {
      setError(quoteError ?? "Espera a que se calcule el precio de tu estancia.");
      return;
    }

    if (blocks.length > 0 && rangeOverlapsAny(checkIn, checkOut, blocks)) {
      setError("Las fechas seleccionadas coinciden con noches no disponibles.");
      return;
    }

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
          guestEmail,
          paymentMethod,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        redirectUrl?: string;
        next?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "No se pudo completar la reserva");
        return;
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      setError("No se recibió la URL del siguiente paso.");
    } catch {
      setError("Error de red. Intente de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <section className="p-6 sm:p-8">
        <StepBadge step={1} label="Elige tus fechas" active={!step1Done} done={step1Done} />

        <div className="mt-6">
          <BookingCalendar
            slug={slug}
            checkIn={checkIn}
            checkOut={checkOut}
            onRangeChange={handleRangeChange}
            onBlocksLoaded={handleBlocksLoaded}
            onRangeError={setRangeHint}
          />
        </div>

        {rangeHint && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="alert">
            {rangeHint}
          </p>
        )}

        {checkIn && (
          <div className="mt-5 rounded-xl border border-ocean/15 bg-ocean-light/50 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-6">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ocean">Check-in</p>
                  <p className="mt-0.5 font-semibold text-ink">{formatStayDate(checkIn)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-ocean">Check-out</p>
                  <p className="mt-0.5 font-semibold text-ink">
                    {checkOut ? formatStayDate(checkOut) : "Pendiente…"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRangeChange("", "")}
                className="text-sm font-medium text-ocean hover:underline"
              >
                Cambiar fechas
              </button>
            </div>
            {datesComplete && (
              <p className="mt-3 border-t border-ocean/10 pt-3 text-sm text-muted">
                {quoteLoading && "Calculando total…"}
                {quoteError && <span className="text-red-700">{quoteError}</span>}
                {quote && !quoteLoading && (
                  <>
                    {quote.nights} {quote.nights === 1 ? "noche" : "noches"} · {formatNightlySummary(quote)} ·{" "}
                    <strong className="text-ink">
                      Total ${formatUsd(totalUsdForPaymentMethod(quote.totalDirectCents, paymentMethod))} USD
                    </strong>
                  </>
                )}
              </p>
            )}
          </div>
        )}
      </section>

      <form onSubmit={onSubmit} className="border-t border-sand-dark bg-sand/40 p-6 sm:p-8">
        <StepBadge step={2} label="Datos y pago" active={step1Done && !loading} done={false} />

        <div className={`mt-6 space-y-5 ${!step1Done ? "pointer-events-none opacity-50" : ""}`}>
          <div>
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@correo.com"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              disabled={!step1Done}
            />
            <p className="mt-1.5 text-xs text-muted">Enviaremos la confirmación a este correo.</p>
          </div>

          <div>
            <Label htmlFor="guests">Huéspedes</Label>
            <div className="mt-2 flex items-center justify-between rounded-xl border border-sand-dark bg-white px-4 py-2">
              <GuestStepper value={guests} min={1} max={maxGuests} onChange={setGuests} />
              <span className="text-sm text-muted">Máx. {maxGuests}</span>
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-ink">Método de pago</legend>
            <div className="mt-3 space-y-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition-colors ${
                    paymentMethod === opt.id
                      ? "border-ocean bg-ocean-light/30"
                      : "border-sand-dark bg-white hover:border-ocean/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="mt-1"
                  />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-ink">{opt.label}</span>
                      {opt.badge && (
                        <span className="rounded-full bg-ocean px-2 py-0.5 text-xs font-medium text-white">
                          {opt.badge}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-sm text-muted">{opt.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {(error || !step1Done) && (
          <div className="mt-5 space-y-3">
            {error && (
              <p
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                {error}
              </p>
            )}
            {!step1Done && !error && (
              <p className="text-sm text-muted">
                Completa el paso 1 seleccionando check-in y check-out en el calendario.
              </p>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={loading || !step1Done || !guestEmail.trim() || quoteLoading || !quote}
          className="mt-6 w-full"
        >
          {submitLabel}
        </Button>

        <p className="mt-4 text-center text-xs text-muted">
          Total según el precio de cada noche. Transferencia bancaria: −{BANK_TRANSFER_DISCOUNT_PERCENT}% off.
        </p>
      </form>
    </div>
  );
}
