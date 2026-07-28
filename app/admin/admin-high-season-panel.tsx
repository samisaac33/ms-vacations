"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useActionState } from "react";
import {
  addHighSeasonPeriodAction,
  deleteHighSeasonPeriodAction,
  type AdminActionState,
} from "./actions";
import { AdminActionFeedback, AdminSectionCard } from "@/app/admin/admin-section-card";
import type { HighSeasonPeriodRow } from "@/lib/high-season-query";

type PropertyOption = {
  id: string;
  name: string;
};

type Props = {
  periods: HighSeasonPeriodRow[];
  properties: PropertyOption[];
};

const initial: AdminActionState = {};

function formatPeriodRange(start: string, end: string): string {
  const startDate = parseISO(start);
  const endDate = parseISO(end);
  const sameYear = startDate.getFullYear() === endDate.getFullYear();
  const startStr = format(startDate, "d MMM", { locale: es });
  const endStr = format(endDate, sameYear ? "d MMM yyyy" : "d MMM yyyy", { locale: es });
  return `${startStr} – ${endStr}`;
}

function propertyNamesForPeriod(
  propertyIds: string[],
  properties: PropertyOption[],
): string[] {
  const nameById = new Map(properties.map((p) => [p.id, p.name]));
  return propertyIds.map((id) => nameById.get(id) ?? id);
}

export function AdminHighSeasonPanel({ periods, properties }: Props) {
  const [addState, addAction, addPending] = useActionState(addHighSeasonPeriodAction, initial);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteHighSeasonPeriodAction,
    initial,
  );

  return (
    <AdminSectionCard
      id="temporadas"
      title="Temporadas altas"
      description="Intervalos con estancia mínima por propiedad. Aplica si la reserva incluye al menos una noche dentro del intervalo."
      collapsible="mobile"
      badge={periods.length}
    >
      <div className="space-y-4">
        {addState.error || addState.success ? (
          <AdminActionFeedback error={addState.error} success={addState.success} />
        ) : null}
        {deleteState.error || deleteState.success ? (
          <AdminActionFeedback error={deleteState.error} success={deleteState.success} />
        ) : null}

        {periods.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center">
            <p className="text-sm font-medium text-zinc-800">Sin temporadas configuradas</p>
            <p className="mt-1 text-sm text-zinc-600">
              Agrega fechas de feriados o temporada alta con el mínimo de noches requerido.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {periods.map((p) => {
              const names = propertyNamesForPeriod(p.propertyIds, properties);
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
                >
                  <div className="min-w-0 space-y-1">
                    <p>
                      <span className="font-medium text-zinc-900">{p.label ?? "Sin etiqueta"}</span>
                      <span className="text-zinc-600"> · {formatPeriodRange(p.startDate, p.endDate)}</span>
                    </p>
                    <p className="text-zinc-600">
                      Mín. {p.minNights} {p.minNights === 1 ? "noche" : "noches"}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {names.map((name) => (
                        <span
                          key={name}
                          className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-700"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <form
                    action={deleteAction}
                    onSubmit={(e) => {
                      if (!confirm("¿Eliminar esta temporada alta?")) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="periodId" value={p.id} />
                    <button
                      type="submit"
                      disabled={deletePending || addPending}
                      className="text-sm text-red-700 hover:underline disabled:opacity-60"
                    >
                      Eliminar
                    </button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}

        <form action={addAction} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Agregar temporada</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="season-start" className="block text-xs font-medium text-zinc-700">
                Inicio
              </label>
              <input
                id="season-start"
                name="startDate"
                type="date"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="season-end" className="block text-xs font-medium text-zinc-700">
                Fin (inclusive)
              </label>
              <input
                id="season-end"
                name="endDate"
                type="date"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="season-min-nights" className="block text-xs font-medium text-zinc-700">
                Mínimo de noches
              </label>
              <input
                id="season-min-nights"
                name="minNights"
                type="number"
                min={1}
                max={30}
                defaultValue={3}
                required
                className="mt-1 w-full max-w-[8rem] rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="season-label" className="block text-xs font-medium text-zinc-700">
                Etiqueta (opcional)
              </label>
              <input
                id="season-label"
                name="label"
                type="text"
                placeholder="Semana Santa 2026"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <fieldset>
            <legend className="text-xs font-medium text-zinc-700">Propiedades</legend>
            {properties.length === 0 ? (
              <p className="mt-2 text-sm text-zinc-600">No hay propiedades en la base de datos.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {properties.map((property) => (
                  <li key={property.id}>
                    <label className="flex items-center gap-2 text-sm text-zinc-800">
                      <input
                        type="checkbox"
                        name="propertyIds"
                        value={property.id}
                        className="rounded border-zinc-300"
                      />
                      {property.name}
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </fieldset>
          <button
            type="submit"
            disabled={addPending || deletePending || properties.length === 0}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Agregar temporada
          </button>
        </form>
      </div>
    </AdminSectionCard>
  );
}
