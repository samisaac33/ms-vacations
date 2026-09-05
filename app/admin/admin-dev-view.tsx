"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminIcalPanel } from "@/app/admin/admin-ical-panel";
import { AdminMaintenanceSection } from "@/app/admin/admin-maintenance-section";
import type { AdminDevDashboardPayload } from "@/lib/admin-dev-dashboard-data";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminDevDashboardPayload };

export function AdminDevView() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/admin/dev-dashboard", { cache: "no-store" });
      const body = (await res.json()) as AdminDevDashboardPayload & { ok?: boolean; error?: string };

      if (res.status === 401) {
        window.location.reload();
        return;
      }

      if (!res.ok || body.ok === false) {
        setState({
          status: "error",
          message: body.error ?? "No se pudo cargar la página Dev.",
        });
        return;
      }

      setState({ status: "ready", data: body });
    } catch {
      setState({
        status: "error",
        message: "No se pudo conectar con el servidor. Intenta de nuevo.",
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="h-40 animate-pulse rounded-xl bg-zinc-200" />
        <div className="h-56 animate-pulse rounded-xl bg-zinc-200" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="mx-auto max-w-5xl rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
        <p>{state.message}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-3 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { data } = state;
  const hasRecentIcalErrors = data.logs.some((l) => l.level === "error");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {data.dbConnected ? (
        <AdminIcalPanel
          properties={data.properties}
          logs={data.logs}
          defaultOpen={hasRecentIcalErrors}
          onDataChange={load}
        />
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Base de datos no conectada. Contacte soporte técnico para gestionar calendarios.
        </p>
      )}

      <AdminMaintenanceSection
        needsSplitPaymentMigration={data.needsSplitPaymentMigration}
        needsBillingMigration={data.needsBillingMigration}
        needsPropertyImagesMigration={data.needsPropertyImagesMigration}
        notificationEmail={data.notificationEmail}
        envFallback={data.envFallback}
        guestEmailFrom={data.guestEmailFrom}
        propertyCount={data.properties.length}
        hasRecentIcalErrors={hasRecentIcalErrors}
      />
    </div>
  );
}
