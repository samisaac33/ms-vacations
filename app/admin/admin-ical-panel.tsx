"use client";

import Link from "next/link";
import { useActionState } from "react";
import { triggerIcalSync, updateIcalUrl, type IcalActionState } from "./actions";
import { formatUsd } from "@/lib/pricing";

type PropertyRow = {
  id: string;
  slug: string;
  name: string;
  icalUrl: string;
  icalUrlMasked: string;
  lastIcalSyncAt: string | null;
  blockCount: number;
  priceUsd: number;
};

type LogRow = {
  id: string;
  level: string;
  message: string;
  createdAt: string;
  propertySlug: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "Nunca";
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Guayaquil",
  }).format(new Date(iso));
}

function PropertyIcalForm({ property }: { property: PropertyRow }) {
  const [state, formAction, pending] = useActionState(updateIcalUrl, {} as IcalActionState);

  return (
    <form action={formAction} className="mt-3 space-y-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
      <input type="hidden" name="propertyId" value={property.id} />
      <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        URL iCal (Airbnb → web)
      </label>
      <input
        name="icalUrl"
        type="url"
        required
        defaultValue={property.icalUrl}
        disabled={pending}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-950"
      />
      {state?.error && (
        <p className="text-xs text-red-700 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-xs text-green-700 dark:text-green-400" role="status">
          {state.success}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-60 dark:border-zinc-600"
      >
        {pending ? "Guardando…" : "Guardar URL"}
      </button>
    </form>
  );
}

function SyncButton() {
  const [state, formAction, pending] = useActionState(triggerIcalSync, {} as IcalActionState);

  return (
    <div className="mt-6">
      <form action={formAction}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "Sincronizando…" : "Sincronizar iCal ahora"}
        </button>
      </form>
      {state?.error && (
        <p className="mt-2 text-sm text-red-700 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="mt-2 text-sm text-green-700 dark:text-green-400" role="status">
          {state.success}
        </p>
      )}
    </div>
  );
}

export function AdminIcalPanel({
  properties,
  logs,
}: {
  properties: PropertyRow[];
  logs: LogRow[];
}) {
  return (
    <div className="mt-8 space-y-8">
      <section>
        <h2 className="text-lg font-semibold">Propiedades</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Precio por noche, calendarios iCal y sincronización con Airbnb.
        </p>
        <SyncButton />
        <ul className="mt-6 space-y-4">
          {properties.map((p) => (
            <li
              key={p.id}
              className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{p.slug}</p>
                </div>
                <div className="text-right text-xs text-zinc-600 dark:text-zinc-400">
                  <p>{p.blockCount} bloques importados</p>
                  <p>Última sync: {formatDate(p.lastIcalSyncAt)}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Precio base:{" "}
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    ~${formatUsd(p.priceUsd)}
                  </span>{" "}
                  / noche
                </p>
                <Link
                  href={`/admin/propiedades/${p.slug}/precios`}
                  className="text-xs font-medium text-zinc-800 underline hover:no-underline dark:text-zinc-200"
                >
                  Calendario de precios →
                </Link>
              </div>
              <p className="mt-3 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {p.icalUrlMasked}
              </p>
              <PropertyIcalForm property={p} />
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Logs recientes</h2>
        {logs.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Sin registros aún.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {logs.map((log) => (
              <li
                key={log.id}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{formatDate(log.createdAt)}</span>
                  <span
                    className={
                      log.level === "error"
                        ? "font-medium text-red-700 dark:text-red-400"
                        : "font-medium text-zinc-700 dark:text-zinc-300"
                    }
                  >
                    {log.level}
                  </span>
                  {log.propertySlug && <span>{log.propertySlug}</span>}
                </div>
                <p className="mt-1 text-zinc-800 dark:text-zinc-200">{log.message}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
