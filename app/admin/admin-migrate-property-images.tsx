"use client";

import { useActionState } from "react";
import { applyPropertyImagesSchema, type AdminActionState } from "@/app/admin/actions";
import { AdminActionFeedback, AdminSectionCard } from "@/app/admin/admin-section-card";

const initial: AdminActionState = {};

export function AdminMigratePropertyImagesPanel({ embedded = false }: { embedded?: boolean }) {
  const [state, action, pending] = useActionState(applyPropertyImagesSchema, initial);

  const body = (
    <div className="space-y-3">
      <AdminActionFeedback error={state.error} success={state.success} />
      <p className="text-sm text-zinc-600">
        Crea la tabla <code className="rounded bg-zinc-100 px-1">property_images</code> en PostgreSQL.
        También puede ejecutar{" "}
        <code className="rounded bg-zinc-100 px-1">npm run db:migrate:property-images</code>.
      </p>
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {pending ? "Aplicando…" : "Aplicar migración de fotos"}
        </button>
      </form>
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
