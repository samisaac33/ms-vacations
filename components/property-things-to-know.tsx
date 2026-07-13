import Link from "next/link";

type Props = {
  rules: string[];
};

export function PropertyThingsToKnow({ rules }: Props) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">Lo que debes saber</h2>
      <ul className="mt-4 divide-y divide-sand-dark">
        <li className="py-4">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 shrink-0 text-ink">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-ink">Política de cancelación</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Cancelación gratuita hasta 5 días antes del check-in. Después, se reembolsa el 50 %
                hasta 24 horas antes de la llegada.
              </p>
              <Link href="/cancelaciones" className="mt-2 inline-block text-sm font-medium text-ocean hover:underline">
                Ver política completa
              </Link>
            </div>
          </div>
        </li>

        {rules.length > 0 && (
          <li className="py-4">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 shrink-0 text-ink">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M15 7l-3 3-2-2M7 11V7a2 2 0 012-2h8l2 2h2a2 2 0 012 2v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-ink">Reglas de la casa</p>
                <ul className="mt-2 space-y-1 text-sm text-muted">
                  {rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        )}

        <li className="py-4">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 shrink-0 text-ink">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-ink">Seguridad y propiedad</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Reserva directa con confirmación por MS Vacations. Consulta condiciones de depósito y
                normas de uso al confirmar tu estadía.
              </p>
            </div>
          </div>
        </li>
      </ul>
    </section>
  );
}
