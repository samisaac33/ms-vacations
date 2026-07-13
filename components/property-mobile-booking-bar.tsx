import Link from "next/link";
import { formatUsd } from "@/lib/pricing";

type Props = {
  slug: string;
  pricePerNightUsd: number;
  stayQuery: string;
  quote?: {
    nights: number;
    totalUsd: number;
  } | null;
  hasStay: boolean;
};

export function PropertyMobileBookingBar({
  slug,
  pricePerNightUsd,
  stayQuery,
  quote,
  hasStay,
}: Props) {
  const nights = quote?.nights;
  const totalUsd = quote?.totalUsd;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-dark bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgb(26_43_43/0.08)] lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          {hasStay && totalUsd != null && nights ? (
            <>
              <p className="font-display text-lg font-semibold text-ink">
                ${formatUsd(totalUsd)}
                <span className="ml-1 text-sm font-normal text-muted">USD</span>
              </p>
              <p className="text-xs text-muted">
                {nights} {nights === 1 ? "noche" : "noches"} · total
              </p>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-semibold text-ink">
                ~${formatUsd(pricePerNightUsd)}
                <span className="text-sm font-normal text-muted"> / noche</span>
              </p>
              <p className="text-xs text-muted">Reserva directa · USD</p>
            </>
          )}
        </div>
        <Link
          href={`/reservar/${slug}${stayQuery}`}
          className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-ocean px-8 text-base font-semibold text-white transition-colors hover:bg-ocean-dark"
        >
          Reservar
        </Link>
      </div>
    </div>
  );
}
