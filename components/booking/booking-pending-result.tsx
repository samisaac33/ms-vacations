import { CheckCircleIcon, ClockIcon } from "@/components/booking/booking-result-icons";

type Props = {
  reference: string;
  via: "upload" | "whatsapp";
};

const MESSAGES: Record<Props["via"], string> = {
  upload:
    "Recibimos tu comprobante. Revisaremos la transferencia y te confirmaremos por correo.",
  whatsapp:
    "Envía el comprobante por WhatsApp. Tienes 30 minutos antes de que se liberen las fechas.",
};

export function BookingPendingResult({ reference, via }: Props) {
  return (
    <div
      className="flex flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50/60 px-5 py-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
        aria-hidden
      >
        <CheckCircleIcon />
      </div>

      <h3 className="mt-5 font-display text-xl font-semibold text-ink">Reserva en proceso</h3>

      <div className="mt-3 flex items-start justify-center gap-2 text-sm leading-relaxed text-muted">
        <ClockIcon className="mt-0.5 shrink-0 text-amber-600" />
        <p>{MESSAGES[via]}</p>
      </div>

      <p className="mt-4 text-sm text-muted">
        Referencia:{" "}
        <span className="font-mono font-semibold text-ink">{reference}</span>
      </p>
    </div>
  );
}
