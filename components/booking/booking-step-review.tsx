import Image from "next/image";
import { PaymentTimingSelector } from "@/components/booking/payment-timing-selector";
import {
  formatDateRange,
  guestsLabel,
  SummaryRow,
} from "@/components/booking/booking-summary-rows";
import { formatUsd } from "@/lib/pricing";
import type { PaymentTiming, SplitSchedule } from "@/lib/payment-schedule";
import type { StayQuote } from "@/lib/pricing-query";

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
  step1TotalUsd: number;
  step1SplitSchedule: SplitSchedule | null;
  paymentTiming: PaymentTiming;
  onPaymentTimingChange: (timing: PaymentTiming) => void;
  onEditDates: () => void;
  onEditGuests: () => void;
  onShowDetails: () => void;
};

export function BookingStepReview({
  property,
  checkIn,
  checkOut,
  guests,
  quote,
  quoteLoading,
  step1TotalUsd,
  step1SplitSchedule,
  paymentTiming,
  onPaymentTimingChange,
  onEditDates,
  onEditGuests,
  onShowDetails,
}: Props) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-ink">Revisa y continúa</h2>

      <div className="rounded-2xl border border-sand-dark bg-white">
        <div className="flex gap-3 border-b border-sand-dark p-4">
          {property.image && (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sand-dark">
              <Image
                src={property.image.src}
                alt={property.image.alt}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          )}
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{property.name}</p>
        </div>

        <div className="px-4">
          <SummaryRow
            label="Fechas"
            value={formatDateRange(checkIn, checkOut)}
            actionLabel="Cambiar"
            onAction={onEditDates}
          />
          <SummaryRow
            label="Huéspedes"
            value={guestsLabel(guests)}
            actionLabel="Cambiar"
            onAction={onEditGuests}
          />
          <SummaryRow
            label="Precio total"
            value={
              quoteLoading
                ? "Calculando…"
                : quote
                  ? `USD $${formatUsd(step1TotalUsd)}`
                  : "Selecciona fechas"
            }
            actionLabel="Detalles"
            onAction={onShowDetails}
            actionDisabled={!quote || quoteLoading}
          />
        </div>
      </div>

      {quote && !quoteLoading && (
        <PaymentTimingSelector
          totalUsd={step1TotalUsd}
          splitSchedule={step1SplitSchedule}
          paymentTiming={paymentTiming}
          onChange={onPaymentTimingChange}
        />
      )}
    </div>
  );
}
