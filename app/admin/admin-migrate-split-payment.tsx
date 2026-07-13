"use client";

import { useActionState } from "react";
import { applySplitPaymentSchema, type IcalActionState } from "@/app/admin/actions";

export function AdminMigrateSplitPaymentPanel() {
  const [state, formAction, pending] = useActionState(applySplitPaymentSchema, {} as IcalActionState);

  return (
    <section className="mt-6 rounded-2xl border-2 border-red-400 bg-red-50 p-5 shadow-sm dark:border-red-600 dark:bg-red-950/50">
      <p className="text-xs font-bold uppercase tracking-widest text-red-800 dark:text-red-300">
        Acción requerida
      </p>
      <h2 className="mt-1 text-lg font-semibold text-red-950 dark:text-red-50">
        Migrar esquema de pago fraccionado
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-red-900/90 dark:text-red-100/90">
        Añade el estado <code className="rounded bg-red-100 px-1">pending_balance</code> y las columnas de
        pago fraccionado en PostgreSQL. Ejecutar <strong>una vez</strong> si el calendario de reservas muestra
        &quot;No se pudo cargar disponibilidad&quot;.
      </p>
      <form action={formAction} className="mt-4">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-red-800 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Aplicando migración…" : "Aplicar migración de pago fraccionado"}
        </button>
      </form>
      {state?.error && (
        <p className="mt-3 text-sm text-red-700 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-3 text-sm text-green-800 dark:text-green-400" role="status">
          {state.success}
        </p>
      )}
    </section>
  );
}
