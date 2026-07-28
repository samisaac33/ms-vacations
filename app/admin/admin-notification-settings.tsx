"use client";

import { useActionState } from "react";
import { updateAdminNotificationEmail, type AdminActionState } from "./actions";
import { AdminActionFeedback, AdminSectionCard } from "@/app/admin/admin-section-card";

type Props = {
  notificationEmail: string | null;
  envFallback: string | null;
  guestEmailFrom: string;
};

const initial: AdminActionState = {};

export function AdminNotificationSettingsPanel({
  notificationEmail,
  envFallback,
  guestEmailFrom,
}: Props) {
  const [state, action, pending] = useActionState(updateAdminNotificationEmail, initial);
  const effective = notificationEmail?.trim() || envFallback || "—";

  return (
    <AdminSectionCard
      id="correo"
      title="Correo de notificaciones"
      description="Alertas internas y confirmaciones automáticas a huéspedes."
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm">
          <p className="font-medium text-zinc-800">Confirmaciones al huésped</p>
          <p className="mt-1 text-zinc-600">
            Enviadas desde <span className="font-mono text-zinc-800">{guestEmailFrom}</span> vía Resend
            al confirmar el pago.
          </p>
        </div>

        <AdminActionFeedback error={state.error} success={state.success} />

        <form action={action} className="space-y-3">
          <div>
            <label htmlFor="notificationEmail" className="block text-sm font-medium text-zinc-800">
              Alertas al administrador
            </label>
            <p className="mt-0.5 text-xs text-zinc-500">
              Recibirás avisos cuando haya transferencias por verificar.
            </p>
            <input
              id="notificationEmail"
              name="notificationEmail"
              type="email"
              required
              defaultValue={notificationEmail ?? envFallback ?? ""}
              placeholder="reservacionsc@gmail.com"
              className="mt-2 w-full max-w-md rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
          </div>
          <p className="text-xs text-zinc-500">
            Valor activo: <span className="font-mono">{effective}</span>
            {!notificationEmail && envFallback && " (desde configuración del servidor)"}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            Guardar
          </button>
        </form>
      </div>
    </AdminSectionCard>
  );
}
