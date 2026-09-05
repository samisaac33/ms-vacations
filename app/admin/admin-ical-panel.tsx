"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
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

type ActionState = { error?: string; success?: string };

function formatDate(iso: string | null): string {
  if (!iso) return "Nunca";
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Guayaquil",
  }).format(new Date(iso));
}

function PropertyIcalForm({
  property,
  onSaved,
}: {
  property: PropertyRow;
  onSaved?: () => void;
}) {
  const [state, setState] = useState<ActionState>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setState({});

    const formData = new FormData(event.currentTarget);
    const propertyId = formData.get("propertyId");
    const icalUrl = formData.get("icalUrl");

    try {
      const res = await fetch("/api/admin/ical-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, icalUrl }),
      });
      const data = (await res.json()) as ActionState;

      if (!res.ok) {
        setState({ error: data.error ?? "No se pudo guardar la URL." });
        return;
      }

      setState({ success: data.success });
      onSaved?.();
    } catch {
      setState({ error: "No se pudo conectar con el servidor." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2 border-t border-zinc-100 pt-3">
      <input type="hidden" name="propertyId" value={property.id} />
      <label className="block text-xs font-medium text-zinc-600">URL iCal (Airbnb → web)</label>
      <input
        name="icalUrl"
        type="url"
        required
        defaultValue={property.icalUrl}
        disabled={pending}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
      />
      {state.error && (
        <p className="text-xs text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-xs text-emerald-700" role="status">
          {state.success}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium disabled:opacity-60"
      >
        {pending ? "Guardando…" : "Guardar URL"}
      </button>
    </form>
  );
}

function SyncButton({ compact = false, onSynced }: { compact?: boolean; onSynced?: () => void }) {
  const [state, setState] = useState<ActionState>({});
  const [pending, setPending] = useState(false);

  async function handleSync() {
    setPending(true);
    setState({});

    try {
      const res = await fetch("/api/admin/sync-ical", { method: "POST" });
      const data = (await res.json()) as ActionState;

      if (!res.ok) {
        setState({ error: data.error ?? "No se pudo sincronizar." });
        return;
      }

      setState({ success: data.success });
      onSynced?.();
    } catch {
      setState({ error: "No se pudo conectar con el servidor." });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={compact ? "" : "mt-4"}>
      <button
        type="button"
        disabled={pending}
        onClick={() => void handleSync()}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sincronizando…" : "Sincronizar iCal ahora"}
      </button>
      {state.error && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-2 text-sm text-emerald-700" role="status">
          {state.success}
        </p>
      )}
    </div>
  );
}

function PropertyRowCompact({
  property,
  onSaved,
}: {
  property: PropertyRow;
  onSaved?: () => void;
}) {
  return (
    <details className="rounded-lg border border-zinc-200 bg-white">
      <summary className="cursor-pointer list-none px-4 py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-medium text-zinc-900">{property.name}</p>
            <p className="text-xs text-zinc-500">
              {property.blockCount} bloques · Última sync: {formatDate(property.lastIcalSyncAt)} · ~
              ${formatUsd(property.priceUsd)}/noche
            </p>
          </div>
          <Link
            href={`/admin/propiedades/${property.slug}/precios`}
            className="text-xs font-medium text-zinc-800 underline hover:no-underline"
            onClick={(e) => e.stopPropagation()}
          >
            Precios →
          </Link>
        </div>
      </summary>
      <div className="border-t border-zinc-100 px-4 pb-4">
        <p className="mt-2 font-mono text-xs text-zinc-500">{property.icalUrlMasked}</p>
        <PropertyIcalForm property={property} onSaved={onSaved} />
      </div>
    </details>
  );
}

export function AdminIcalPanel({
  properties,
  logs,
  defaultOpen = false,
  onDataChange,
}: {
  properties: PropertyRow[];
  logs: LogRow[];
  defaultOpen?: boolean;
  onDataChange?: () => void;
}) {
  const hasRecentErrors = logs.some((l) => l.level === "error");

  return (
    <details
      id="ical"
      className="scroll-mt-24 rounded-xl border border-zinc-200 bg-white shadow-sm"
      open={defaultOpen || hasRecentErrors}
    >
      <summary className="cursor-pointer list-none px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="font-semibold text-zinc-900">
          Calendarios y sincronización ({properties.length} propiedades)
        </span>
        <span className="mt-1 block text-sm font-normal text-zinc-600">
          Importación iCal desde Airbnb y logs recientes.
        </span>
      </summary>

      <div className="space-y-6 border-t border-zinc-100 px-5 pb-5 pt-4">
        <SyncButton compact onSynced={onDataChange} />

        <ul className="space-y-2">
          {properties.map((p) => (
            <li key={p.id}>
              <PropertyRowCompact property={p} onSaved={onDataChange} />
            </li>
          ))}
        </ul>

        <section>
          <h3 className="text-sm font-semibold text-zinc-900">Logs recientes</h3>
          {logs.length === 0 ? (
            <p className="mt-2 text-sm text-zinc-600">Sin registros aún.</p>
          ) : (
            <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
              {logs.map((log) => (
                <li key={log.id} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                    <span>{formatDate(log.createdAt)}</span>
                    <span
                      className={
                        log.level === "error"
                          ? "font-medium text-red-700"
                          : "font-medium text-zinc-700"
                      }
                    >
                      {log.level}
                    </span>
                    {log.propertySlug && <span>{log.propertySlug}</span>}
                  </div>
                  <p className="mt-1 text-zinc-800">{log.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </details>
  );
}
