const items = [
  {
    title: "Reserva directa",
    description:
      "Reserva con MS Vacations sin intermediarios. Atención personalizada y mejor trato en tu estancia.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ocean">
        <path
          d="M3 9.5 12 4l9 5.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Atención personalizada",
    description:
      "Te ayudamos por WhatsApp antes, durante y después de tu viaje.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ocean">
        <path
          d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Casas para grupos",
    description:
      "Casas amplias con piscina, ideal para familias y reuniones de hasta 18–21 huéspedes.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-ocean">
        <path
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Mejor precio directo",
    description:
      "Reserva en nuestro sitio y evita comisiones de plataformas externas.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="text-coral">
        <path
          d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="7" r="1.5" fill="currentColor" />
      </svg>
    ),
  },
] as const;

export function HomeWhyBookDirect() {
  return (
    <section className="section-alt border-y border-sand-dark/60">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-ocean">Ventajas</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            ¿Por qué reservar directo?
          </h2>
          <p className="mt-3 text-muted leading-relaxed">
            Reserva directa con propiedades en <strong className="text-ink">San Clemente y Portoviejo</strong>:
            calendario en línea, tarifas claras y atención personalizada en cada etapa.
          </p>
        </div>

        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {items.map(({ title, description, icon }) => (
            <li
              key={title}
              className="card flex gap-4 p-5 transition-shadow hover:shadow-md sm:p-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ocean-light">
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
