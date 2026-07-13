"use client";

import { useEffect, useState } from "react";
import type { DateRange } from "@/lib/availability-utils";

type AvailabilityResponse = {
  blocks: DateRange[];
  lastIcalSyncAt: string | null;
};

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) {
    throw new Error("No se pudo cargar disponibilidad");
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("No se pudo cargar disponibilidad");
  }
}

export function useBookingAvailability(
  slug: string,
  onBlocksLoaded?: (blocks: DateRange[]) => void,
) {
  const [blocks, setBlocks] = useState<DateRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);

    fetch(`/api/availability?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await parseJsonResponse<{ error?: string }>(res);
          throw new Error(data.error ?? "No se pudo cargar disponibilidad");
        }
        return parseJsonResponse<AvailabilityResponse>(res);
      })
      .then((data) => {
        if (cancelled) return;
        setBlocks(data.blocks);
        setLastSyncAt(data.lastIcalSyncAt);
        onBlocksLoaded?.(data.blocks);
      })
      .catch((e) => {
        if (cancelled) return;
        setFetchError(e instanceof Error ? e.message : "Error al cargar calendario");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, onBlocksLoaded]);

  return { blocks, loading, fetchError, lastSyncAt };
}
