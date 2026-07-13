import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { formatUsd } from "@/lib/pricing";

type StayDates = {
  checkIn: string;
  checkOut: string;
  huespedes?: number;
};

type Props = {
  slug: string;
  pricePerNightUsd: number;
  stay?: StayDates;
  stayQuery: string;
  quote?: {
    nights: number;
    totalUsd: number;
  } | null;
};

function formatStayDate(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy", { locale: es });
}

function DateField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-xl bg-sand/80 px-4 py-3 ring-1 ring-sand-dark">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink">{formatStayDate(value)}</p>
    </div>
  );
}

export function PropertyBookingPanel({
  slug,
  pricePerNightUsd,
  stay,
  stayQuery,
  quote,
}: Props) {
  const hasStay = Boolean(stay?.checkIn && stay?.checkOut);
  const nights = quote?.nights;
  const totalUsd = quote?.totalUsd;

  return (
    <div className="card p-5 shadow-[var(--shadow-card)] sm:p-6">
      {hasStay && stay && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-ocean">
            Tu búsqueda
          </p>
          <div className="flex gap-2">
            <DateField label="Entrada" value={stay.checkIn} />
            <DateField label="Salida" value={stay.checkOut} />
          </div>
          {(stay.huespedes || nights) && (
            <p className="text-sm text-muted">
              {stay.huespedes
                ? `${stay.huespedes} ${stay.huespedes === 1 ? "huésped" : "huéspedes"}`
                : null}
              {stay.huespedes && nights ? " · " : null}
              {nights ? `${nights} ${nights === 1 ? "noche" : "noches"}` : null}
            </p>
          )}
        </div>
      )}

      <div className={hasStay ? "mt-5 border-t border-sand-dark pt-5" : ""}>
        {hasStay && totalUsd != null && nights ? (
          <div>
            <p className="font-display text-3xl font-semibold text-ink">
              ${formatUsd(totalUsd)}
              <span className="ml-2 text-base font-normal text-muted">total · USD</span>
            </p>
            <p className="mt-1 text-sm text-muted">
              {nights} {nights === 1 ? "noche" : "noches"} · reserva directa
            </p>
          </div>
        ) : (
          <div>
            <p className="font-display text-3xl font-semibold text-ink">
              ~${formatUsd(pricePerNightUsd)}
              <span className="text-lg font-normal text-muted"> / noche</span>
            </p>
            <p className="mt-1 text-sm text-muted">Reserva directa · precio en USD</p>
          </div>
        )}
      </div>

      <Button
        href={`/reservar/${slug}${stayQuery}`}
        className="mt-5 h-12 w-full rounded-full text-base font-semibold"
      >
        Reservar
      </Button>
    </div>
  );
}
