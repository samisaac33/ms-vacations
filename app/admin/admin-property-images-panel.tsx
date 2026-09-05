"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AdminPropertyImagesGallery } from "@/app/admin/admin-property-images-gallery";
import { AdminActionFeedback, AdminSectionCard } from "@/app/admin/admin-section-card";
import {
  PROPERTY_IMAGE_CATEGORIES,
  type PropertyImageCategory,
} from "@/lib/property-image-categories";
import { PROPERTY_IMAGE_ACCEPT } from "@/lib/property-image-upload";
import type { PropertyImageDto } from "@/lib/property-images-query";

type Props = {
  slug: string;
  propertyId: string;
  propertyName: string;
  images: PropertyImageDto[];
  usesCatalogFallback: boolean;
  catalogImageCount: number;
  storageConfigured: boolean;
  onDataChange?: () => void;
};

export function AdminPropertyImagesPanel({
  slug,
  propertyId,
  propertyName,
  images,
  usesCatalogFallback,
  catalogImageCount,
  storageConfigured,
  onDataChange,
}: Props) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<PropertyImageCategory>("exterior");
  const [customLabel, setCustomLabel] = useState("");

  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importPending, setImportPending] = useState(false);

  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetPending, setResetPending] = useState(false);

  const busy = uploading || importPending || resetPending;

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images],
  );

  async function handleImportCatalog() {
    setImportError(null);
    setImportSuccess(null);
    setImportPending(true);

    try {
      const res = await fetch("/api/admin/property-images/import-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { success?: string; error?: string };

      if (!res.ok) {
        setImportError(data.error ?? "No se pudo importar el catálogo.");
        return;
      }

      setImportSuccess(data.success ?? "Catálogo importado.");
      onDataChange?.();
    } catch {
      setImportError("No se pudo conectar con el servidor.");
    } finally {
      setImportPending(false);
    }
  }

  async function handleResetCatalog() {
    setResetError(null);
    setResetSuccess(null);
    setResetPending(true);

    try {
      const res = await fetch("/api/admin/property-images/reset-catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { success?: string; error?: string };

      if (!res.ok) {
        setResetError(data.error ?? "No se pudo restablecer el catálogo.");
        return;
      }

      setResetSuccess(data.success ?? "Catálogo restablecido.");
      onDataChange?.();
    } catch {
      setResetError("No se pudo conectar con el servidor.");
    } finally {
      setResetPending(false);
    }
  }

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(null);

    if (!storageConfigured) {
      setUploadError("Configure SUPABASE_SERVICE_ROLE_KEY para subir fotos.");
      return;
    }

    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setUploadError("Selecciona una imagen.");
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.set("slug", slug);
      body.set("category", category);
      body.set("file", file);
      if (category === "otro" && customLabel.trim()) {
        body.set("customLabel", customLabel.trim());
      }

      const res = await fetch("/api/admin/property-images", { method: "POST", body });
      let data: { error?: string; ok?: boolean } = {};
      try {
        data = (await res.json()) as { error?: string; ok?: boolean };
      } catch {
        if (res.status === 413) {
          setUploadError("La imagen es demasiado pesada (máximo 4 MB). Pruebe con otra foto.");
          return;
        }
        setUploadError("Error del servidor al subir. Intente de nuevo.");
        return;
      }
      if (!res.ok) {
        setUploadError(data.error ?? "No se pudo subir la imagen.");
        return;
      }

      setUploadSuccess("Foto subida correctamente.");
      fileInput.value = "";
      onDataChange?.();
    } catch {
      setUploadError("Error de red al subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      {usesCatalogFallback ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <p className="font-medium">Usando catálogo estático</p>
          <p className="mt-1">
            Esta propiedad muestra {catalogImageCount} foto(s) del código fuente. Importe el catálogo
            o suba nuevas fotos para gestionarlas desde aquí.
          </p>
          <div className="mt-3">
            <button
              type="button"
              disabled={busy || catalogImageCount === 0}
              onClick={() => void handleImportCatalog()}
              className="rounded-lg bg-sky-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-900 disabled:opacity-60"
            >
              {importPending ? "Importando…" : `Importar ${catalogImageCount} fotos del catálogo`}
            </button>
          </div>
          <AdminActionFeedback error={importError} success={importSuccess} />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          <p>
            Galería gestionada en base de datos ({sortedImages.length} foto
            {sortedImages.length === 1 ? "" : "s"}). La primera imagen es la portada en listados y
            redes.
          </p>
          <div className="mt-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleResetCatalog()}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
            >
              {resetPending ? "Restableciendo…" : "Volver al catálogo estático"}
            </button>
          </div>
          <AdminActionFeedback error={resetError} success={resetSuccess} />
        </div>
      )}

      <AdminSectionCard
        title="Subir foto"
        description={`Se optimiza automáticamente a WebP (máx. 2400 px, calidad 82 %) y se guarda en Supabase Storage para ${propertyName}.`}
      >
        {!storageConfigured ? (
          <p className="text-sm text-amber-800">
            Defina <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> en el
            servidor para habilitar subidas.
          </p>
        ) : null}

        <form onSubmit={handleUpload} className="mt-2 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-zinc-800">Categoría / ambiente</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PropertyImageCategory)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              >
                {PROPERTY_IMAGE_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>

            {category === "otro" ? (
              <label className="block text-sm">
                <span className="font-medium text-zinc-800">Descripción</span>
                <input
                  type="text"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="Ej. terraza, jardín…"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </label>
            ) : null}
          </div>

          <label className="block text-sm">
            <span className="font-medium text-zinc-800">Archivo</span>
            <input
              name="file"
              type="file"
              accept={PROPERTY_IMAGE_ACCEPT}
              disabled={!storageConfigured || uploading}
              className="mt-1 block w-full text-sm"
            />
            <span className="mt-1 block text-xs text-zinc-500">
              JPG, PNG, WEBP o HEIC. Máximo 4 MB antes de subir (el servidor la comprime a WebP).
            </span>
          </label>

          <button
            type="submit"
            disabled={!storageConfigured || uploading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {uploading ? "Subiendo…" : "Subir foto"}
          </button>

          <AdminActionFeedback error={uploadError} success={uploadSuccess} />
        </form>
      </AdminSectionCard>

      <AdminSectionCard
        title="Galería"
        description="Arrastre para reordenar, edite textos alternativos o elimine fotos. El texto alternativo agrupa el recorrido fotográfico en la ficha pública."
        badge={sortedImages.length}
      >
        {sortedImages.length === 0 ? (
          <p className="text-sm text-zinc-600">Sin fotos en la galería administrada.</p>
        ) : (
          <AdminPropertyImagesGallery
            key={sortedImages.map((i) => `${i.id}:${i.sortOrder}`).join("|")}
            propertyId={propertyId}
            images={sortedImages}
            disabled={busy}
            onDataChange={onDataChange}
          />
        )}
      </AdminSectionCard>
    </div>
  );
}
