import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import type { StaySearch } from "@/lib/stay-search";
import { siteConfig } from "@/lib/site";

type Props = {
  search: StaySearch;
};

function formatDate(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy", { locale: es });
}

export function StaySearchBanner({ search }: Props) {
  const destinoLabel =
    search.destino === "beach"
      ? siteConfig.destinations.beach.area
      : siteConfig.destinations.city.area;

  return (
    <div className="mt-6 rounded-2xl border border-ocean-light bg-ocean-light/60 px-4 py-4 sm:px-5">
      <p className="text-sm font-semibold text-ocean">Búsqueda desde el inicio</p>
      <p className="mt-1 text-sm text-ink">
        {destinoLabel} · {formatDate(search.checkIn)} → {formatDate(search.checkOut)} ·{" "}
        {search.huespedes} {search.huespedes === 1 ? "huésped" : "huéspedes"}
      </p>
      <p className="mt-1 text-xs text-muted">
        Elige un alojamiento y continúa con las mismas fechas en la reserva.
      </p>
    </div>
  );
}
