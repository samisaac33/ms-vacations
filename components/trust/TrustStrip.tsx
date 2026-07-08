import { trustFeatures } from "@/lib/catalog";

export function TrustStrip() {
  return (
    <section aria-labelledby="trust-heading" className="bg-surface">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Ventajas
          </p>
          <h2
            id="trust-heading"
            className="font-display mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl"
          >
            ¿Por qué reservar directo?
          </h2>
          <p className="mt-3 text-muted">
            Propiedades seleccionadas en Manabí con atención personalizada en cada
            etapa de tu viaje.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="animate-fade-in-up rounded-2xl border border-border bg-white p-6"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
