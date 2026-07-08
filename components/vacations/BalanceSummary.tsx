import { balanceSummary } from "@/lib/mock-data";

const stats = [
  {
    label: "Días disponibles",
    value: balanceSummary.availableDays,
    accent: "text-primary",
    bg: "bg-primary-light",
  },
  {
    label: "Días usados",
    value: balanceSummary.usedDays,
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Pendientes",
    value: balanceSummary.pendingDays,
    accent: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Total anual",
    value: balanceSummary.totalDays,
    accent: "text-foreground",
    bg: "bg-surface",
  },
];

export function BalanceSummary() {
  return (
    <section aria-labelledby="balance-heading">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 id="balance-heading" className="text-2xl font-semibold tracking-tight text-foreground">
            Tu saldo de vacaciones
          </h2>
          <p className="mt-1 text-sm text-muted">
            Año 2026 · Actualizado hoy
          </p>
        </div>
        <button
          type="button"
          className="hidden text-sm font-semibold text-foreground underline underline-offset-4 transition-colors hover:text-primary sm:block"
        >
          Ver detalle
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`animate-fade-in-up rounded-2xl border border-border p-5 ${stat.bg}`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <p className="text-sm font-medium text-muted">{stat.label}</p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${stat.accent}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
