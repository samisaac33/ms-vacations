"use client";

import { useActionState } from "react";
import { applyBeachBasePrices, type IcalActionState } from "@/app/admin/actions";

export function AdminApplyBeachPricesPanel({ embedded = false }: { embedded?: boolean }) {
  const [state, formAction, pending] = useActionState(applyBeachBasePrices, {} as IcalActionState);

  const content = (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
        Acción requerida
      </p>
      <h3 className="mt-1 text-lg font-semibold text-amber-950">
        Aplicar tarifas de playa (San Clemente)
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
        Restaura la tarifa base de referencia (sin descuento) en playa. El precio huésped por
        transferencia no cambia. Ejecutar <strong>una vez</strong> si aún ves referencias antiguas
        (p. ej. $535 en La Punta).
      </p>
      <ul className="mt-3 list-inside list-disc text-xs text-amber-900/80">
        <li>La Punta: referencia $581 · huésped $500</li>
        <li>Arrecife: referencia $291 · huésped $250</li>
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
    return (
      <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-5">
        {content}
      </div>
    );
  }

  return (
    <section className="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-5 shadow-sm">
      {content}
    </section>
  );
}
