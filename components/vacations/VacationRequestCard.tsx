import { Badge } from "@/components/ui/Badge";
import type { VacationRequest } from "@/lib/mock-data";

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function formatDateRange(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  });

  return `${formatter.format(new Date(start))} – ${formatter.format(new Date(end))}`;
}

interface VacationRequestCardProps {
  request: VacationRequest;
}

export function VacationRequestCard({ request }: VacationRequestCardProps) {
  return (
    <article className="card-hover group cursor-pointer overflow-hidden rounded-xl">
      <div
        className={`relative aspect-[4/3] bg-gradient-to-br ${request.gradient} transition-transform duration-300 group-hover:scale-[1.02]`}
      >
        <div className="absolute inset-0 bg-black/5" />
        <div className="absolute left-3 top-3">
          <Badge status={request.status} />
        </div>
        <button
          type="button"
          aria-label="Guardar solicitud"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-foreground opacity-0 shadow-sm transition-all duration-200 hover:scale-110 group-hover:opacity-100"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      <div className="pt-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-foreground line-clamp-1">{request.title}</h3>
          <span className="shrink-0 text-sm text-muted">
            {request.days} {request.days === 1 ? "día" : "días"}
          </span>
        </div>
        <p className="mt-1 text-sm text-muted line-clamp-1">{request.location}</p>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <CalendarIcon />
          <time dateTime={`${request.startDate}/${request.endDate}`}>
            {formatDateRange(request.startDate, request.endDate)}
          </time>
        </div>
      </div>
    </article>
  );
}
