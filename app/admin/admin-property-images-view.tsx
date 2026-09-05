"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminMigratePropertyImagesPanel } from "@/app/admin/admin-migrate-property-images";
import { AdminPropertyImagesPanel } from "@/app/admin/admin-property-images-panel";
import { AdminPropertyStrip } from "@/app/admin/admin-property-strip";
import { AdminPropertySubnav } from "@/app/admin/admin-property-subnav";
import type { AdminPropertyImagesPayload } from "@/lib/admin-property-images-data";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminPropertyImagesPayload };

type Props = {
  slug: string;
};

export function AdminPropertyImagesView({ slug }: Props) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  const load = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch(`/api/admin/property-images/${encodeURIComponent(slug)}`, {
        cache: "no-store",
      });
      const body = (await res.json()) as AdminPropertyImagesPayload & { ok?: boolean; error?: string };

      if (res.status === 401) {
        window.location.reload();
        return;
      }

      if (res.status === 404) {
        setState({ status: "error", message: "Propiedad no encontrada." });
        return;
      }

      if (!res.ok || body.ok === false) {
        setState({
          status: "error",
          message: body.error ?? "No se pudo cargar la galería de fotos.",
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
  }, [slug]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="h-64 w-full animate-pulse rounded-xl bg-zinc-200 lg:w-72" />
        <div className="min-w-0 flex-1 space-y-4">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-96 animate-pulse rounded-xl bg-zinc-200" />
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
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

  if (data.dbMissing) {
    return (
      <p className="text-sm text-amber-800">
        Propiedad no encontrada en la base de datos. Ejecute{" "}
        <code className="rounded bg-amber-100 px-1">npm run db:seed</code>.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <AdminPropertyStrip
        properties={data.propertyList}
        activeSlug={slug}
        activeSection="fotos"
      />
      <div className="min-w-0 flex-1">
        <AdminPropertySubnav slug={slug} active="fotos" />

        {data.needsMigration ? (
          <AdminMigratePropertyImagesPanel onSuccess={load} />
        ) : data.propertyId ? (
          <AdminPropertyImagesPanel
            slug={slug}
            propertyId={data.propertyId}
            propertyName={data.propertyName}
            images={data.images}
            usesCatalogFallback={data.usesCatalogFallback}
            catalogImageCount={data.catalogImageCount}
            storageConfigured={data.storageConfigured}
            onDataChange={load}
          />
        ) : null}
      </div>
    </div>
  );
}
