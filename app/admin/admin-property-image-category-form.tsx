"use client";

import { useState } from "react";
import {
  PROPERTY_IMAGE_CATEGORIES,
  inferPropertyImageCategoryFromAlt,
  type PropertyImageCategory,
} from "@/lib/property-image-categories";

type Props = {
  imageId: string;
  propertyName: string;
  currentAlt: string;
  disabled?: boolean;
  onCancel: () => void;
  onSaved: () => void;
  onError: (message: string) => void;
};

export function AdminPropertyImageCategoryForm({
  imageId,
  propertyName,
  currentAlt,
  disabled = false,
  onCancel,
  onSaved,
  onError,
}: Props) {
  const inferred = inferPropertyImageCategoryFromAlt(propertyName, currentAlt);
  const [category, setCategory] = useState<PropertyImageCategory>(inferred?.category ?? "exterior");
  const [customLabel, setCustomLabel] = useState(inferred?.customLabel ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/property-images/items/${encodeURIComponent(imageId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          customLabel: category === "otro" ? customLabel.trim() : undefined,
        }),
      });
      const data = (await res.json()) as { success?: string; error?: string };

      if (!res.ok) {
        onError(data.error ?? "No se pudo actualizar la categoría.");
        return;
      }

      onSaved();
    } catch {
      onError("No se pudo conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <p className="text-xs font-medium text-zinc-700">Cambiar categoría</p>
      <p className="mt-0.5 text-xs text-zinc-500">
        Actualiza cómo se agrupa la foto en la ficha pública. El nombre del archivo en R2 no cambia.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block text-xs sm:col-span-2">
          <span className="font-medium text-zinc-800">Categoría</span>
          <select
            value={category}
            disabled={disabled || saving}
            onChange={(e) => setCategory(e.target.value as PropertyImageCategory)}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
          >
            {PROPERTY_IMAGE_CATEGORIES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {category === "otro" ? (
          <label className="block text-xs sm:col-span-2">
            <span className="font-medium text-zinc-800">Etiqueta personalizada</span>
            <input
              type="text"
              value={customLabel}
              disabled={disabled || saving}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Ej. terraza, jardín…"
              className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm"
            />
          </label>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={disabled || saving}
          onClick={() => void handleSubmit()}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar categoría"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={onCancel}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium hover:bg-white disabled:opacity-60"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
