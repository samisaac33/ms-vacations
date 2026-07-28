"use client";

import Image from "next/image";
import Link from "next/link";
import {
  formatDateRange,
  guestsLabel,
  SummaryRow,
} from "@/components/booking/booking-summary-rows";
import { BookingRangeErrorAlert } from "@/components/booking/booking-range-error-alert";
import { GuaranteeIncludedNote } from "@/components/booking/guarantee-included-note";
import { formatBreakdownUsd, buildStayPriceBreakdown } from "@/lib/pricing-breakdown";
import { appliesRefundableGuarantee, formatUsd } from "@/lib/pricing";
import type { PaymentMethod } from "@/lib/payments/types";
import type { PaymentTiming, SplitSchedule } from "@/lib/payment-schedule";
import type { StayQuote } from "@/lib/pricing-query";
import type { DesktopEditModal } from "@/components/booking/booking-desktop-edit-modals";

type PropertySummary = {
  name: string;
  image?: { src: string; alt: string };
};

type Props = {
  property: PropertySummary;
  checkIn: string;
  checkOut: string;
  guests: number;
  quote: StayQuote | null;
  quoteLoading: boolean;
  paymentMethod: PaymentMethod;
  paymentTiming: PaymentTiming;
  splitSchedule: SplitSchedule | null;
  totalUsd: number;
  dateRangeError?: string | null;
  onEdit: (mode: Exclude<DesktopEditModal, null>) => void;
};

function compactNightlyLine(quote: StayQuote): { label: string; amountCents: number } | null {
  const directAmounts = [...new Set(quote.nightly.map((n) => n.directCents))];
  if (directAmounts.length === 1) {
    const perNight = directAmounts[0]!;
    return {
      label: `${quote.nights} ${quote.nights === 1 ? "noche" : "noches"} × ${formatBreakdownUsd(perNight)} USD`,
      amountCents: quote.nightlyTotalDirectCents,
    };
  }
  return {
    label: `${quote.nights} noches`,
    amountCents: quote.nightlyTotalDirectCents,
  };
}

export function BookingSummarySidebar({
  property,
  checkIn,
  checkOut,
  guests,
  quote,
  quoteLoading,
  paymentMethod,
  paymentTiming,
  splitSchedule,
  totalUsd,
  dateRangeError,
  onEdit,
}: Props) {
  const breakdown = quote ? buildStayPriceBreakdown(quote, paymentMethod) : null;
  const nightlyLine = quote ? compactNightlyLine(quote) : null;

  return (
    <aside className="space-y-4 lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-2xl border border-sand-dark bg-white shadow-sm">
        <div className="flex gap-3 border-b border-sand-dark p-4">
          {property.image && (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-dark">
              <Image
                src={property.image.src}
                alt={property.image.alt}
                fill
                className="object-cover"
                sizes="80px"
              />
            </div>
          )}
          <p className="line-clamp-3 text-sm font-semibold leading-snug text-ink">{property.name}</p>
        </div>

        <div className="border-b border-sand-dark px-4 py-3 text-sm text-muted">
          <span className="font-semibold text-ink">Reembolso 100 %</span>
          {" · "}
          Cancelación sin penalización dentro de las primeras 24 h tras confirmar. Consulta la{" "}
          <Link href="/cancelaciones" className="font-medium text-ink underline underline-offset-2">
            política completa
          </Link>
          .
        </div>

        <div className="px-4">
          <SummaryRow
            label="Fechas"
            value={formatDateRange(checkIn, checkOut)}
            actionLabel="Cambiar"
            onAction={() => onEdit("dates")}
          />
          {dateRangeError ? (
            <BookingRangeErrorAlert message={dateRangeError} className="mb-3" />
          ) : null}
          <SummaryRow
            label="Huéspedes"
            value={guestsLabel(guests)}
            actionLabel="Cambiar"
            onAction={() => onEdit("guests")}
          />
        </div>

        <div className="border-t border-sand-dark px-4 py-4">
          <p className="font-semibold text-ink">Información del precio</p>
          {quoteLoading && <p className="mt-2 text-sm text-muted">Calculando…</p>}
          {!quoteLoading && quote && breakdown && nightlyLine && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted underline decoration-dotted underline-offset-2">{nightlyLine.label}</span>
                <span className="text-ink">{formatBreakdownUsd(nightlyLine.amountCents)} USD</span>
              </div>
              {quote.cleaningFeeCents > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted">Recargo de limpieza</span>
                  <span className="text-ink">{formatBreakdownUsd(quote.cleaningFeeCents)} USD</span>
                </div>
              )}
              {breakdown.markupCents > 0 && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted">Recargo tarjeta</span>
                  <span className="text-ink">+{formatBreakdownUsd(breakdown.markupCents)} USD</span>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 border-t border-sand-dark pt-2 text-base font-semibold text-ink">
                <span>Total USD</span>
                <span>${formatUsd(totalUsd)}</span>
              </div>
              {quote && appliesRefundableGuarantee(quote.slug) && (
                <GuaranteeIncludedNote className="pt-1" />
              )}
              {paymentTiming === "split" && splitSchedule && (
                <div className="space-y-1 border-t border-sand-dark pt-2 text-xs text-muted">
                  <div className="flex justify-between">
                    <span>Depósito (hoy)</span>
                    <span className="text-ink">{formatBreakdownUsd(splitSchedule.depositCents)} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saldo pendiente</span>
                    <span className="text-ink">{formatBreakdownUsd(splitSchedule.balanceCents)} USD</span>
                  </div>
                </div>
              )}
              <button
                type="button"
                onClick={() => onEdit("details")}
                className="text-sm font-semibold text-ink underline underline-offset-2"
              >
                Desglose del precio
              </button>
            </div>
          )}
          {!quoteLoading && !quote && dateRangeError && (
            <BookingRangeErrorAlert message={dateRangeError} className="mt-2" />
          )}
          {!quoteLoading && !quote && !dateRangeError && (
            <p className="mt-2 text-sm text-muted">Selecciona fechas para ver el precio.</p>
          )}
        </div>
      </div>

    </aside>
  );
}
