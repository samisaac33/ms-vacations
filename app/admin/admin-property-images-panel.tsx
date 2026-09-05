"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useMemo, useState } from "react";
import {
  deletePropertyImageAction,
  importCatalogImagesAction,
  movePropertyImageAction,
  resetPropertyImagesAction,
  setPropertyImageCoverAction,
  updatePropertyImageAltAction,
  type AdminActionState,
} from "@/app/admin/actions";
import { AdminActionFeedback, AdminSectionCard } from "@/app/admin/admin-section-card";
import {
  PROPERTY_IMAGE_CATEGORIES,
  type PropertyImageCategory,
} from "@/lib/property-image-categories";
import type { PropertyImageDto } from "@/lib/property-images-query";

type Props = {
  slug: string;
  propertyId: string;
  propertyName: string;
  images: PropertyImageDto[];
  usesCatalogFallback: boolean;
  catalogImageCount: number;
  storageConfigured: boolean;
};

const initial: AdminActionState = {};

export function AdminPropertyImagesPanel({
  slug,
  propertyId,
  propertyName,
  images,
  usesCatalogFallback,
  catalogImageCount,
  storageConfigured,
}: Props) {
  const router = useRouter();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState<PropertyImageCategory>("exterior");
  const [customLabel, setCustomLabel] = useState("");

  const [importState, importAction, importPending] = useActionState(importCatalogImagesAction, initial);
  const [resetState, resetAction, resetPending] = useActionState(resetPropertyImagesAction, initial);
  const [altState, altAction, altPending] = useActionState(updatePropertyImageAltAction, initial);
  const [deleteState, deleteAction, deletePending] = useActionState(deletePropertyImageAction, initial);
  const [moveState, moveAction, movePending] = useActionState(movePropertyImageAction, initial);
  const [coverState, coverAction, coverPending] = useActionState(setPropertyImageCoverAction, initial);

  const busy = uploading || importPending || resetPending || altPending || deletePending || movePending || coverPending;

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images],
  );

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
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
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setUploadError(data.error ?? "No se pudo subir la imagen.");
        return;
      }

      setUploadSuccess("Foto subida correctamente.");
      fileInput.value = "";
      router.refresh();
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
          <form action={importAction} className="mt-3">
            <input type="hidden" name="slug" value={slug} />
            <button
              type="submit"
              disabled={busy || catalogImageCount === 0}
              className="rounded-lg bg-sky-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-900 disabled:opacity-60"
            >
              {importPending ? "Importando…" : `Importar ${catalogImageCount} fotos del catálogo`}
            </button>
          </form>
          <AdminActionFeedback error={importState.error} success={importState.success} />
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          <p>
            Galería gestionada en base de datos ({sortedImages.length} foto
            {sortedImages.length === 1 ? "" : "s"}). La primera imagen es la portada en listados y
            redes.
          </p>
          <form action={resetAction} className="mt-3">
            <input type="hidden" name="slug" value={slug} />
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-60"
            >
              {resetPending ? "Restableciendo…" : "Volver al catálogo estático"}
            </button>
          </form>
          <AdminActionFeedback error={resetState.error} success={resetState.success} />
        </div>
      )}

      <AdminSectionCard
        title="Subir foto"
        description={`Las imágenes se optimizan a WebP y se guardan en Supabase Storage para ${propertyName}.`}
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
              accept="image/jpeg,image/png,image/webp"
              disabled={!storageConfigured || uploading}
              className="mt-1 block w-full text-sm"
            />
            <span className="mt-1 block text-xs text-zinc-500">JPG, PNG o WEBP. Máximo 12 MB.</span>
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
        description="Reordene, edite textos alternativos o elimine fotos. El texto alternativo agrupa el recorrido fotográfico en la ficha pública."
        badge={sortedImages.length}
      >
        <AdminActionFeedback
          error={altState.error ?? deleteState.error ?? moveState.error ?? coverState.error}
          success={altState.success ?? deleteState.success ?? moveState.success ?? coverState.success}
        />

        {sortedImages.length === 0 ? (
          <p className="text-sm text-zinc-600">Sin fotos en la galería administrada.</p>
        ) : (
          <ul className="space-y-4">
            {sortedImages.map((image, index) => (
              <li
                key={image.id}
                className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 sm:flex-row sm:items-start"
              >
                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-24 sm:w-36">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="144px"
                  />
                  {index === 0 ? (
                    <span className="absolute left-2 top-2 rounded bg-zinc-900/85 px-2 py-0.5 text-xs font-medium text-white">
                      Portada
                    </span>
                  ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-xs text-zinc-500">{image.storagePath}</p>
                  <form action={altAction} className="flex flex-col gap-2 sm:flex-row">
                    <input type="hidden" name="imageId" value={image.id} />
                    <input
                      name="alt"
                      defaultValue={image.alt}
                      required
                      className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
                    >
                      Guardar texto
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {index > 0 ? (
                      <form action={coverAction}>
                        <input type="hidden" name="propertyId" value={propertyId} />
                        <input type="hidden" name="imageId" value={image.id} />
                        <button
                          type="submit"
                          disabled={busy}
                          className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60"
                        >
                          Usar como portada
                        </button>
                      </form>
                    ) : null}

                    <form action={moveAction}>
                      <input type="hidden" name="propertyId" value={propertyId} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="direction" value="up" />
                      <button
                        type="submit"
                        disabled={busy || index === 0}
                        className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60"
                      >
                        ↑
                      </button>
                    </form>

                    <form action={moveAction}>
                      <input type="hidden" name="propertyId" value={propertyId} />
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="direction" value="down" />
                      <button
                        type="submit"
                        disabled={busy || index === sortedImages.length - 1}
                        className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60"
                      >
                        ↓
                      </button>
                    </form>

                    <form action={deleteAction}>
                      <input type="hidden" name="imageId" value={image.id} />
                      <input type="hidden" name="deleteFile" value="1" />
                      <button
                        type="submit"
                        disabled={busy}
                        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminSectionCard>
    </div>
  );
}
