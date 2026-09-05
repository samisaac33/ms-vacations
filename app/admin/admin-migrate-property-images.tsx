"use client";

import { useState } from "react";
import { AdminActionFeedback, AdminSectionCard } from "@/app/admin/admin-section-card";

type Props = {
  embedded?: boolean;
  onSuccess?: () => void;
};

export function AdminMigratePropertyImagesPanel({ embedded = false, onSuccess }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleMigrate() {
    setError(null);
    setSuccess(null);
    setPending(true);

    try {
      const res = await fetch("/api/admin/migrate-property-images", { method: "POST" });
      const data = (await res.json()) as { success?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "No se pudo aplicar la migración.");
        return;
      }

      setSuccess(data.success ?? "Migración aplicada.");
      onSuccess?.();
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setPending(false);
    }
  }

  const body = (
    <div className="space-y-3">
      <AdminActionFeedback error={error} success={success} />
      <p className="text-sm text-zinc-600">
        Es un paso único: crea la tabla <code className="rounded bg-zinc-100 px-1">property_images</code>{" "}
        en PostgreSQL para poder subir, reordenar y eliminar fotos desde aquí. Después de pulsar el botón,
        la galería quedará disponible en todas las propiedades.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => void handleMigrate()}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
      >
        {pending ? "Aplicando…" : "Aplicar migración de fotos"}
      </button>
    </div>
  );

  if (embedded) return body;

  return (
    <AdminSectionCard
      title="Migrar galería de fotos"
      description="Requisito previo para gestionar fotos desde el panel admin."
      variant="alert"
    >
      {body}
    </AdminSectionCard>
  );
}
