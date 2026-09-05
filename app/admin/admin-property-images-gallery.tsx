"use client";

import Image from "next/image";
import { useMemo, useState, useTransition, type FormEvent } from "react";
import { AdminActionFeedback } from "@/app/admin/admin-section-card";
import type { PropertyImageDto } from "@/lib/property-images-query";

type Props = {
  propertyId: string;
  images: PropertyImageDto[];
  disabled?: boolean;
  onDataChange?: () => void;
};

function DragHandle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="text-zinc-400">
      <path
        d="M9 7h.01M9 12h.01M9 17h.01M15 7h.01M15 12h.01M15 17h.01"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function reorderList<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved!);
  return next;
}

export function AdminPropertyImagesGallery({
  propertyId,
  images,
  disabled = false,
  onDataChange,
}: Props) {
  const sortedFromProps = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images],
  );
  const [ordered, setOrdered] = useState(sortedFromProps);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ error?: string; success?: string }>({});
  const [isPending, startTransition] = useTransition();
  const [altPendingId, setAltPendingId] = useState<string | null>(null);
  const [deletePendingId, setDeletePendingId] = useState<string | null>(null);
  const [coverPendingId, setCoverPendingId] = useState<string | null>(null);

  const busy =
    disabled ||
    isPending ||
    altPendingId != null ||
    deletePendingId != null ||
    coverPendingId != null;

  function persistOrder(nextOrder: PropertyImageDto[]) {
    const orderedIds = nextOrder.map((i) => i.id);

    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/property-images/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId, orderedIds }),
        });
        const data = (await res.json()) as { success?: string; error?: string };

        if (!res.ok) {
          setFeedback({ error: data.error ?? "No se pudo reordenar." });
          setOrdered(sortedFromProps);
          return;
        }

        setFeedback({ success: data.success ?? "Orden actualizado." });
        onDataChange?.();
      } catch {
        setFeedback({ error: "No se pudo conectar con el servidor." });
        setOrdered(sortedFromProps);
      }
    });
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex == null || dragIndex === targetIndex) {
      setDragIndex(null);
      setDropIndex(null);
      return;
    }

    const next = reorderList(ordered, dragIndex, targetIndex);
    setOrdered(next);
    setDragIndex(null);
    setDropIndex(null);
    persistOrder(next);
  }

  async function handleAltSubmit(imageId: string, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback({});
    setAltPendingId(imageId);

    const alt = new FormData(event.currentTarget).get("alt");
    try {
      const res = await fetch(`/api/admin/property-images/items/${encodeURIComponent(imageId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt }),
      });
      const data = (await res.json()) as { success?: string; error?: string };

      if (!res.ok) {
        setFeedback({ error: data.error ?? "No se pudo guardar el texto." });
        return;
      }

      setFeedback({ success: data.success });
      onDataChange?.();
    } catch {
      setFeedback({ error: "No se pudo conectar con el servidor." });
    } finally {
      setAltPendingId(null);
    }
  }

  async function handleSetCover(imageId: string) {
    setFeedback({});
    setCoverPendingId(imageId);

    try {
      const res = await fetch(`/api/admin/property-images/items/${encodeURIComponent(imageId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });
      const data = (await res.json()) as { success?: string; error?: string };

      if (!res.ok) {
        setFeedback({ error: data.error ?? "No se pudo establecer la portada." });
        return;
      }

      setFeedback({ success: data.success });
      onDataChange?.();
    } catch {
      setFeedback({ error: "No se pudo conectar con el servidor." });
    } finally {
      setCoverPendingId(null);
    }
  }

  async function handleDelete(imageId: string) {
    setFeedback({});
    setDeletePendingId(imageId);

    try {
      const res = await fetch(`/api/admin/property-images/items/${encodeURIComponent(imageId)}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deleteFile: true }),
      });
      const data = (await res.json()) as { success?: string; error?: string };

      if (!res.ok) {
        setFeedback({ error: data.error ?? "No se pudo eliminar la imagen." });
        return;
      }

      setFeedback({ success: data.success });
      onDataChange?.();
    } catch {
      setFeedback({ error: "No se pudo conectar con el servidor." });
    } finally {
      setDeletePendingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        Arrastre por el icono ≡ para reordenar. La primera foto es la portada.
      </p>

      <AdminActionFeedback error={feedback.error} success={feedback.success} />

      <ul className="space-y-3">
        {ordered.map((image, index) => {
          const isDragging = dragIndex === index;
          const isDropTarget = dropIndex === index && dragIndex !== index;
          const itemBusy =
            busy ||
            altPendingId === image.id ||
            deletePendingId === image.id ||
            coverPendingId === image.id;

          return (
            <li
              key={image.id}
              draggable={!itemBusy}
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setDropIndex(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDropIndex(index);
              }}
              onDragLeave={() => {
                if (dropIndex === index) setDropIndex(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                handleDrop(index);
              }}
              className={`overflow-hidden rounded-xl border bg-white p-3 transition-shadow ${
                isDragging ? "border-zinc-400 opacity-60" : "border-zinc-200"
              } ${isDropTarget ? "ring-2 ring-zinc-900 ring-offset-2" : ""}`}
            >
              <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg bg-zinc-100 sm:hidden">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 144px"
                  draggable={false}
                />
                {index === 0 ? (
                  <span className="absolute left-2 top-2 rounded bg-zinc-900/85 px-2 py-0.5 text-xs font-medium text-white">
                    Portada
                  </span>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex min-w-0 items-start gap-2 sm:w-auto sm:shrink-0 sm:flex-col sm:items-center">
                  <button
                    type="button"
                    draggable={!itemBusy}
                    onDragStart={() => setDragIndex(index)}
                    disabled={itemBusy}
                    aria-label={`Reordenar ${image.alt}`}
                    className="mt-0.5 flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 active:cursor-grabbing disabled:opacity-50 sm:mt-1"
                  >
                    <DragHandle />
                  </button>

                  <div className="relative hidden h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:block">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="144px"
                      draggable={false}
                    />
                    {index === 0 ? (
                      <span className="absolute left-2 top-2 rounded bg-zinc-900/85 px-2 py-0.5 text-xs font-medium text-white">
                        Portada
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <p className="truncate text-xs text-zinc-500">{image.storagePath}</p>
                  <form
                    onSubmit={(e) => void handleAltSubmit(image.id, e)}
                    className="flex flex-col gap-2 sm:flex-row"
                  >
                    <input type="hidden" name="imageId" value={image.id} />
                    <input
                      name="alt"
                      defaultValue={image.alt}
                      required
                      disabled={itemBusy}
                      className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={itemBusy}
                      className="shrink-0 rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50 disabled:opacity-60"
                    >
                      {altPendingId === image.id ? "Guardando…" : "Guardar texto"}
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {index > 0 ? (
                      <button
                        type="button"
                        disabled={itemBusy}
                        onClick={() => void handleSetCover(image.id)}
                        className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium hover:bg-zinc-50 disabled:opacity-60"
                      >
                        {coverPendingId === image.id ? "Aplicando…" : "Usar como portada"}
                      </button>
                    ) : null}

                    <button
                      type="button"
                      disabled={itemBusy}
                      onClick={() => void handleDelete(image.id)}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      {deletePendingId === image.id ? "Eliminando…" : "Eliminar"}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
