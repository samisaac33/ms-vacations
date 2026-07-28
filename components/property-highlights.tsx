import type { PropertyHighlight } from "@/lib/properties";

type Props = {
  highlights?: PropertyHighlight[];
};

function OutdoorIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3c3 4 6 7 6 11a6 6 0 11-12 0c0-4 3-7 6-11z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 11l9 9M16 16l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DefaultHighlightIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function highlightIcon(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("aire libre") || lower.includes("piscina") || lower.includes("playa")) return OutdoorIcon;
  if (lower.includes("ingreso") || lower.includes("llaves") || lower.includes("cerradura")) return KeyIcon;
  return DefaultHighlightIcon;
}

export function PropertyHighlights({ highlights = [] }: Props) {
  return (
    <section className="space-y-6 border-y border-sand-dark py-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ocean text-sm font-bold text-white">
          MS
        </div>
        <div>
          <p className="font-semibold text-ink">MS Vacations</p>
          <p className="text-sm text-muted">Alquiler vacacional directo en Manabí</p>
        </div>
      </div>

      {highlights.length > 0 ? (
        <ul className="space-y-5">
          {highlights.map((item) => {
            const Icon = highlightIcon(item.title);
            return (
              <li key={item.title} className="flex items-start gap-4">
                <span className="mt-0.5 shrink-0 text-ink">
                  <Icon />
                </span>
                <div>
                  <p className="font-semibold text-ink">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm leading-relaxed text-muted">
          Reserva directa con MS Vacations. Te confirmamos la ubicación exacta y las normas de uso al
          confirmar tu estadía.
        </p>
      )}
    </section>
  );
}
