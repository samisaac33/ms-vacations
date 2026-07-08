import type { Property } from "@/lib/properties";
import { toGoogleMapsEmbedUrl } from "@/lib/google-maps";

type Props = {
  property: Property;
};

const SHARED_LOCATION_SLUGS = new Set([
  "casa-vacacional-home-one-18-personas-max",
  "casa-vacacional-home-two-21-personas",
]);

export function PropertyLocationMap({ property: p }: Props) {
  const sharedLocation = SHARED_LOCATION_SLUGS.has(p.slug);
  const { lat, lng } = p.location.coordinates;
  const embedUrl = toGoogleMapsEmbedUrl(lat, lng);

  return (
    <div>
      <h3 className="text-lg font-semibold text-ink">Ubicación</h3>
      <p className="mt-2 text-sm text-muted">
        {p.location.area}, {p.location.province}.
        {sharedLocation && " Home One y Home Two comparten la misma ubicación en mapa."}
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-sand-dark bg-sand-dark/30 shadow-sm">
        <iframe
          title={`Mapa de Google Maps — ${p.name}`}
          src={embedUrl}
          className="h-[300px] w-full sm:h-[380px]"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <p className="mt-2 text-right text-xs text-muted">
        <a
          href={p.location.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ocean hover:underline"
        >
          Abrir en la app de Google Maps →
        </a>
      </p>
    </div>
  );
}
