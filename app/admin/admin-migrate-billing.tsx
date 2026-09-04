"use client";

import { useActionState } from "react";
import { applyBillingSchema, type IcalActionState } from "@/app/admin/actions";

export function AdminMigrateBillingPanel({ embedded = false }: { embedded?: boolean }) {
  const [state, formAction, pending] = useActionState(applyBillingSchema, {} as IcalActionState);

  const content = (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-red-800">
        Acción requerida
      </p>
      {!embedded ? (
        <h3 className="mt-1 text-lg font-semibold text-red-950">
          Migrar esquema de facturación
        </h3>
      ) : null}
      <p className={`text-sm leading-relaxed text-red-900/90 ${embedded ? "mt-1" : "mt-2"}`}>
        Añade las columnas de facturación (
        <code className="rounded bg-red-100 px-1">billing_name</code>, datos fiscales y voucher) en
        PostgreSQL. Ejecutar <strong>una vez</strong> si las reservas fallan con error de columna
        inexistente o no se cargan datos de facturación.
      </p>
      <form action={formAction} className="mt-4">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-red-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-red-800 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Aplicando migración…" : "Aplicar migración de facturación"}
        </button>
      </form>
      {state?.error && (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-3 text-sm text-green-800" role="status">
          {state.success}
        </p>
      )}
    </>
  );

  if (embedded) {
    return <div>{content}</div>;
  }

  return (
    <section className="mt-6 rounded-2xl border-2 border-red-400 bg-red-50 p-5 shadow-sm">
      {content}
    </section>
  );
}
