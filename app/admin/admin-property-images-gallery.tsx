"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, useActionState } from "react";
import {
  deletePropertyImageAction,
  reorderPropertyImagesAction,
  setPropertyImageCoverAction,
  updatePropertyImageAltAction,
  type AdminActionState,
} from "@/app/admin/actions";
import { AdminActionFeedback } from "@/app/admin/admin-section-card";
import type { PropertyImageDto } from "@/lib/property-images-query";

type Props = {
  propertyId: string;
  images: PropertyImageDto[];
  disabled?: boolean;
};

const initial: AdminActionState = {};

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

export function AdminPropertyImagesGallery({ propertyId, images, disabled = false }: Props) {
  const router = useRouter();
  const sortedFromProps = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images],
  );
  const [ordered, setOrdered] = useState(sortedFromProps);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const [reorderFeedback, setReorderFeedback] = useState<AdminActionState>({});
  const [isPending, startTransition] = useTransition();
  const [altState, altAction, altPending] = useActionState(updatePropertyImageAltAction, initial);
  const [deleteState, deleteAction, deletePending] = useActionState(deletePropertyImageAction, initial);
  const [coverState, coverAction, coverPending] = useActionState(setPropertyImageCoverAction, initial);

  const busy = disabled || isPending || altPending || deletePending || coverPending;

  function persistOrder(nextOrder: PropertyImageDto[]) {
    const orderedIds = nextOrder.map((i) => i.id);
    const fd = new FormData();
    fd.set("propertyId", propertyId);
    fd.set("orderedIds", JSON.stringify(orderedIds));

    startTransition(async () => {
      const result = await reorderPropertyImagesAction(undefined, fd);
      if (result.error) {
        setReorderFeedback({ error: result.error });
        setOrdered(sortedFromProps);
        return;
      }
      setReorderFeedback({ success: "Orden actualizado." });
      router.refresh();
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

  return (
    <div className="space-y-3">
      <p className="text-xs text-zinc-500">
        Arrastre por el icono ≡ para reordenar. La primera foto es la portada.
      </p>

      <AdminActionFeedback
        error={reorderFeedback.error ?? altState.error ?? deleteState.error ?? coverState.error}
        success={reorderFeedback.success ?? altState.success ?? deleteState.success ?? coverState.success}
      />

      <ul className="space-y-3">
        {ordered.map((image, index) => {
          const isDragging = dragIndex === index;
          const isDropTarget = dropIndex === index && dragIndex !== index;
          return (
            <li
              key={image.id}
              draggable={!busy}
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
              className={`flex flex-col gap-3 rounded-xl border bg-white p-3 transition-shadow sm:flex-row sm:items-start ${
                isDragging ? "border-zinc-400 opacity-60" : "border-zinc-200"
              } ${isDropTarget ? "ring-2 ring-zinc-900 ring-offset-2" : ""}`}
            >
              <div className="flex items-start gap-2 sm:flex-col sm:items-center">
                <button
                  type="button"
                  draggable={!busy}
                  onDragStart={() => setDragIndex(index)}
                  disabled={busy}
                  aria-label={`Reordenar ${image.alt}`}
                  className="mt-1 flex h-9 w-9 shrink-0 cursor-grab items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 active:cursor-grabbing disabled:opacity-50"
                >
                  <DragHandle />
                </button>

                <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 sm:h-24 sm:w-36">
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
                <p className="text-xs text-zinc-500">{image.storagePath}</p>
                <form action={altAction} className="flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="imageId" value={image.id} />
                  <input
                    name="alt"
                    defaultValue={image.alt}
                    required
                    disabled={busy}
                    className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:opacity-60"
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
          );
        })}
      </ul>
    </div>
  );
}
