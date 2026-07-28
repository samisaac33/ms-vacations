"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useActionState } from "react";
import {
  addPromotionalVatPeriodAction,
  deletePromotionalVatPeriodAction,
  type AdminActionState,
} from "./actions";
import { AdminActionFeedback, AdminSectionCard } from "@/app/admin/admin-section-card";
import type { PromotionalVatPeriodRow } from "@/lib/vat-periods-query";

type Props = {
  periods: PromotionalVatPeriodRow[];
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

export function AdminVatPeriodsPanel({ periods }: Props) {
  const [addState, addAction, addPending] = useActionState(addPromotionalVatPeriodAction, initial);
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePromotionalVatPeriodAction,
    initial,
  );

  return (
    <AdminSectionCard
      id="iva"
      title="Períodos IVA 8 %"
      description="Fechas con tarifa reducida en todas las propiedades. El precio final por noche baja automáticamente."
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
            <p className="text-sm font-medium text-zinc-800">Sin períodos configurados</p>
            <p className="mt-1 text-sm text-zinc-600">
              Agrega fechas de feriado cuando el Ejecutivo decrete IVA al 8 %.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {periods.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm"
              >
                <span>
                  <span className="font-medium text-zinc-900">{p.label ?? "Sin etiqueta"}</span>
                  <span className="text-zinc-600"> · {formatPeriodRange(p.startDate, p.endDate)}</span>
                </span>
                <form
                  action={deleteAction}
                  onSubmit={(e) => {
                    if (!confirm("¿Eliminar este período de IVA 8 %?")) {
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
            ))}
          </ul>
        )}

        <form action={addAction} className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50/50 p-4">
          <h3 className="text-sm font-semibold text-zinc-900">Agregar período</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="vat-start" className="block text-xs font-medium text-zinc-700">
                Inicio
              </label>
              <input
                id="vat-start"
                name="startDate"
                type="date"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="vat-end" className="block text-xs font-medium text-zinc-700">
                Fin (inclusive)
              </label>
              <input
                id="vat-end"
                name="endDate"
                type="date"
                required
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="vat-label" className="block text-xs font-medium text-zinc-700">
              Etiqueta (opcional)
            </label>
            <input
              id="vat-label"
              name="label"
              type="text"
              placeholder="Carnaval 2026"
              className="mt-1 w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={addPending || deletePending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Agregar período
          </button>
        </form>
      </div>
    </AdminSectionCard>
  );
}
