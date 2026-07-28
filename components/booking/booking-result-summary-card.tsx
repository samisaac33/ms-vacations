import { formatDateRange, guestsLabel } from "@/components/booking/booking-summary-rows";
import { formatUsd } from "@/lib/pricing";
import type { PaymentTiming } from "@/lib/payment-schedule";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export type BookingResultSummary = {
  propertyName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  reference: string;
  totalUsd: number;
  guestEmail: string;
  paymentMethodLabel: string;
  paymentTiming?: PaymentTiming;
  depositUsd?: number;
  balanceUsd?: number;
  balanceDueAt?: string | null;
};

function formatBalanceDueDate(iso: string): string {
  return format(parseISO(iso), "d 'de' MMMM yyyy", { locale: es });
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-sand-dark py-3 first:border-t-0 first:pt-0">
      <dt className="shrink-0 text-sm text-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}

export function BookingResultSummaryCard({ summary }: { summary: BookingResultSummary }) {
  const isSplit =
    summary.paymentTiming === "split" &&
    summary.depositUsd != null &&
    summary.balanceUsd != null;

  return (
    <dl className="rounded-2xl border border-sand-dark bg-surface p-4 text-sm">
      <SummaryRow label="Propiedad" value={summary.propertyName} />
      <SummaryRow label="Fechas" value={formatDateRange(summary.checkIn, summary.checkOut)} />
      <SummaryRow label="Huéspedes" value={guestsLabel(summary.guests)} />
      <SummaryRow label="Referencia" value={summary.reference} />
      {isSplit ? (
        <>
          <SummaryRow
            label="Anticipo pagado"
            value={`$${formatUsd(summary.depositUsd!)} USD`}
          />
          <SummaryRow
            label="Saldo pendiente"
            value={`$${formatUsd(summary.balanceUsd!)} USD`}
          />
          {summary.balanceDueAt && (
            <SummaryRow
              label="Vence el saldo"
              value={formatBalanceDueDate(summary.balanceDueAt)}
            />
          )}
        </>
      ) : (
        <SummaryRow label="Total" value={`$${formatUsd(summary.totalUsd)} USD`} />
      )}
      <SummaryRow label="Correo" value={summary.guestEmail} />
      <SummaryRow label="Método de pago" value={summary.paymentMethodLabel} />
    </dl>
  );
}
