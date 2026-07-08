"use client";

import { useMemo, useState } from "react";
import { FilterPills } from "@/components/ui/FilterPills";
import { vacationRequests } from "@/lib/mock-data";
import { VacationRequestCard } from "@/components/vacations/VacationRequestCard";

export function VacationGrid() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredRequests = useMemo(() => {
    if (activeFilter === "all") return vacationRequests;
    return vacationRequests.filter((request) => request.status === activeFilter);
  }, [activeFilter]);

  return (
    <section aria-labelledby="requests-heading">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 id="requests-heading" className="text-2xl font-semibold tracking-tight text-foreground">
          Tus solicitudes
        </h2>
        <FilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>

      {filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="text-lg font-medium text-foreground">No hay solicitudes en esta categoría</p>
          <p className="mt-2 text-sm text-muted">
            Prueba con otro filtro o crea una nueva solicitud de vacaciones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRequests.map((request, index) => (
            <div
              key={request.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <VacationRequestCard request={request} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
