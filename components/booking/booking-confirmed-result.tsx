import { CheckCircleIcon } from "@/components/booking/booking-result-icons";
import { BookingBillingForm } from "@/components/booking/booking-billing-form";
import {
  BookingResultSummaryCard,
  type BookingResultSummary,
} from "@/components/booking/booking-result-summary-card";

type Props = {
  summary: BookingResultSummary;
  subtitle?: string;
  bookingId?: string;
};

export function BookingConfirmedResult({
  summary,
  subtitle = "Recibirás la confirmación con los detalles en tu correo. Completa los datos de facturación abajo para recibir el comprobante en PDF.",
  bookingId,
}: Props) {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <div className="flex flex-col items-center text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
          aria-hidden
        >
          <CheckCircleIcon />
        </div>

        <h2 className="mt-5 font-display text-2xl font-semibold text-ink">
          Reserva confirmada
        </h2>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{subtitle}</p>
      </div>

      <BookingResultSummaryCard summary={summary} />

      {bookingId && summary.guestEmail && (
        <BookingBillingForm bookingId={bookingId} guestEmail={summary.guestEmail} />
      )}
    </div>
  );
}
