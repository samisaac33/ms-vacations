"use client";

import {
  addMonths,
  differenceInCalendarDays,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";
import {
  isNightBlocked,
  rangeOverlapsAny,
  todayInGuayaquil,
  type DateRange,
} from "@/lib/availability-utils";

type AvailabilityResponse = {
  blocks: DateRange[];
  lastIcalSyncAt: string | null;
};

type Props = {
  slug: string;
  checkIn: string;
  checkOut: string;
  onRangeChange: (checkIn: string, checkOut: string) => void;
  onBlocksLoaded?: (blocks: DateRange[]) => void;
  onRangeError?: (message: string | null) => void;
};

function toIso(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

function buildMonthGrid(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const startPad = first.getDay();
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: startPad }, () => null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(first.getFullYear(), first.getMonth(), d));
  }
  return cells;
}

function CalendarSkeleton() {
  return (
    <div className="mt-4 grid grid-cols-7 gap-1.5" aria-hidden>
      {Array.from({ length: 35 }, (_, i) => (
        <div key={i} className="h-11 animate-pulse rounded-xl bg-sand-dark/70" />
      ))}
    </div>
  );
}

export function BookingCalendar({
  slug,
  checkIn,
  checkOut,
  onRangeChange,
  onBlocksLoaded,
  onRangeError,
}: Props) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [blocks, setBlocks] = useState<DateRange[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);

  const today = todayInGuayaquil();
  const awaitingCheckOut = Boolean(checkIn && !checkOut);
  const pickingCheckIn = !checkIn || Boolean(checkIn && checkOut);

  useEffect(() => {
    if (checkIn) {
      setMonth(startOfMonth(parseISO(checkIn)));
    }
  }, [checkIn]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFetchError(null);
    fetch(`/api/availability?slug=${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "No se pudo cargar disponibilidad");
        }
        return res.json() as Promise<AvailabilityResponse>;
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

  const grid = useMemo(() => buildMonthGrid(month), [month]);
  const monthLabel = format(month, "LLLL yyyy", { locale: es });

  function handleDayClick(iso: string) {
    onRangeError?.(null);
    if (iso < today) return;

    if (checkIn && checkOut) {
      if (isNightBlocked(iso, blocks)) return;
      onRangeChange(iso, "");
      return;
    }

    if (!checkIn) {
      if (isNightBlocked(iso, blocks)) return;
      onRangeChange(iso, "");
      return;
    }

    if (iso === checkIn) {
      onRangeChange("", "");
      return;
    }

    const start = iso < checkIn ? iso : checkIn;
    const end = iso < checkIn ? checkIn : iso;
    if (differenceInCalendarDays(parseISO(end), parseISO(start)) < 1) {
      onRangeChange(iso, "");
      return;
    }
    if (rangeOverlapsAny(start, end, blocks)) {
      onRangeError?.("Ese rango incluye noches ocupadas. Prueba con menos días o otras fechas.");
      return;
    }
    onRangeChange(start, end);
  }

  function dayClasses(iso: string): string {
    const blocked = isNightBlocked(iso, blocks);
    const past = iso < today;
    const isCheckIn = checkIn === iso;
    const isCheckOut = checkOut === iso;
    const inRange =
      checkIn && checkOut && iso >= checkIn && iso < checkOut && !isNightBlocked(iso, blocks);

    let cls =
      "relative flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium transition-all ";

    if (past) {
      cls += "cursor-not-allowed text-muted/35 ";
    } else if (blocked) {
      cls += "cursor-not-allowed bg-coral/25 text-coral/90 line-through decoration-coral/60 ";
    } else {
      cls += "cursor-pointer text-ink hover:bg-ocean-light hover:ring-2 hover:ring-ocean/20 ";
    }

    if (isCheckIn || isCheckOut) {
      cls += "bg-ocean text-white shadow-sm ring-2 ring-ocean/30 hover:bg-ocean hover:ring-ocean/30 ";
    } else if (inRange) {
      cls += "bg-ocean-light/80 text-ink ";
    }

    if (iso === today && !isCheckIn && !isCheckOut) {
      cls += " ring-1 ring-ocean/40 ";
    }

    return cls;
  }

  const syncLabel = lastSyncAt
    ? new Intl.DateTimeFormat("es-EC", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Guayaquil",
      }).format(new Date(lastSyncAt))
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sand-dark bg-white text-ink transition-colors hover:border-ocean/30 hover:bg-ocean-light"
            aria-label="Mes anterior"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <p className="min-w-[140px] text-center text-base font-semibold capitalize text-ink">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sand-dark bg-white text-ink transition-colors hover:border-ocean/30 hover:bg-ocean-light"
            aria-label="Mes siguiente"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
            awaitingCheckOut ? "bg-ocean-light text-ocean" : "bg-ocean text-white"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${awaitingCheckOut ? "bg-ocean" : "bg-white"}`}
            aria-hidden
          />
          {awaitingCheckOut ? "2. Elige check-out" : "1. Elige check-in"}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold uppercase tracking-wide text-muted">
        {["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"].map((d) => (
          <span key={d} className="py-1">
            {d}
          </span>
        ))}
      </div>

      {loading ? (
        <CalendarSkeleton />
      ) : fetchError ? (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-800" role="alert">
          {fetchError}
        </p>
      ) : (
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {grid.map((day, i) => {
            if (!day) return <span key={`empty-${i}`} />;
            const iso = toIso(day);
            const blocked = isNightBlocked(iso, blocks);
            const disabled = iso < today || (pickingCheckIn && blocked);
            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => handleDayClick(iso)}
                className={dayClasses(iso)}
                aria-label={
                  blocked
                    ? `${iso}, no disponible`
                    : `${iso}${checkIn === iso ? ", check-in" : ""}${checkOut === iso ? ", check-out" : ""}`
                }
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-sand-dark pt-4 text-xs text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-md bg-coral/25 ring-1 ring-coral/30" aria-hidden />
          Ocupado (Airbnb / reservas)
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-md bg-ocean-light ring-1 ring-ocean/20" aria-hidden />
          Tu estancia
        </span>
        {syncLabel && (
          <span className="text-muted/80">Sincronizado: {syncLabel}</span>
        )}
      </div>
    </div>
  );
}
