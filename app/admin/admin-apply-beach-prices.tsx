"use client";

import { useActionState } from "react";
import { applyBeachBasePrices, type IcalActionState } from "@/app/admin/actions";

export function AdminApplyBeachPricesPanel() {
  const [state, formAction, pending] = useActionState(applyBeachBasePrices, {} as IcalActionState);

  return (
    <section className="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 shadow-sm dark:border-amber-600 dark:bg-amber-950/50">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300">
        Acción requerida
      </p>
      <h2 className="mt-1 text-lg font-semibold text-amber-950 dark:text-amber-50">
        Aplicar tarifas de playa (San Clemente)
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-amber-900/90 dark:text-amber-100/90">
        Sube el precio base un 7 % (PayPal/PayPhone) y mantiene el precio anterior en
        transferencia bancaria. Ejecutar <strong>una vez</strong> si aún ves $250–$500 en las
        fichas.
      </p>
      <ul className="mt-3 list-inside list-disc text-xs text-amber-900/80 dark:text-amber-200/90">
        <li>La Punta: base $535 · transferencia $500</li>
        <li>Arrecife: base $268 · transferencia ≈ $250</li>
      </ul>
      <form action={formAction} className="mt-4">
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-amber-800 disabled:opacity-60 sm:w-auto"
        >
          {pending ? "Actualizando tarifas…" : "Aplicar tarifas de playa"}
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
