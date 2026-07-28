import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import {
  buildStayPriceBreakdown,
  formatBreakdownUsd,
} from "@/lib/pricing-breakdown";
import { formatBalanceDueDate, type PaymentTiming, type SplitSchedule } from "@/lib/payment-schedule";
import type { StayQuote } from "@/lib/pricing-query";
import type { PaymentMethod } from "@/lib/payments/types";

type Props = {
  quote: StayQuote;
  paymentMethod: PaymentMethod;
  paymentTiming?: PaymentTiming;
  splitSchedule?: SplitSchedule | null;
  compact?: boolean;
};

function formatNightDate(iso: string): string {
  return format(parseISO(iso), "EEE d MMM", { locale: es });
}

export function PriceBreakdownContent({
  quote,
  paymentMethod,
  paymentTiming = "full_now",
  splitSchedule = null,
  compact = false,
}: Props) {
  const breakdown = buildStayPriceBreakdown(quote, paymentMethod);
  const showSplit = paymentTiming === "split" && splitSchedule !== null;

  return (
    <div className="space-y-4">
      {!compact && (
        <h2 className="font-display text-2xl font-semibold text-ink">Desglose del precio</h2>
      )}

      <div className="rounded-2xl border border-sand-dark bg-surface p-4">
        {!compact && (
          <div className="mb-4 space-y-2 border-b border-sand-dark pb-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Por noche</p>
            {quote.nightly.map((night) => (
              <div key={night.date} className="flex items-center justify-between text-sm">
                <span className="text-muted">
                  {formatNightDate(night.date)}
                  {night.isNewYearsEve ? (
                    <span className="ml-1.5 text-xs font-medium text-amber-800">Fin de año ×2</span>
                  ) : null}
                </span>
                <span className="font-medium text-ink">{formatBreakdownUsd(night.directCents)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          {breakdown.lines.map((line, index) => (
            <div key={`${line.label}-${index}`}>
              <div
                className={`flex items-center justify-between text-sm ${
                  line.indent ? "pl-2 text-muted" : ""
                } ${line.emphasis ? "border-t border-sand-dark pt-3 text-base font-semibold text-ink" : ""}`}
              >
                <span>{line.label}</span>
                <span className={line.emphasis ? "text-ink" : ""}>
                  {formatBreakdownUsd(line.amountCents)}
                </span>
              </div>
              {line.label === "Garantía reembolsable" && (
                <p className="mt-1 pl-2 text-xs text-muted">
                  <Link href="/garantia" className="font-medium text-ocean underline underline-offset-2">
                    Ver política
                  </Link>
                </p>
              )}
            </div>
          ))}
        </div>

        {showSplit && splitSchedule && (
          <div className="mt-4 space-y-2 border-t border-sand-dark pt-4">
            <div className="flex items-center justify-between text-sm font-medium text-ink">
              <span>Depósito (hoy)</span>
              <span>{formatBreakdownUsd(splitSchedule.depositCents)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Saldo ({formatBalanceDueDate(splitSchedule.balanceDueDate)})</span>
              <span>{formatBreakdownUsd(splitSchedule.balanceCents)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BookingStepPriceBreakdown({
  quote,
  paymentMethod,
  paymentTiming,
  splitSchedule,
}: Omit<Props, "compact">) {
  return (
    <PriceBreakdownContent
      quote={quote}
      paymentMethod={paymentMethod}
      paymentTiming={paymentTiming}
      splitSchedule={splitSchedule}
    />
  );
}
