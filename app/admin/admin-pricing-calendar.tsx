"use client";

import {
  addMonths,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import {
  clearNightlyRates,
  fetchAdminPricingMonth,
  saveNightlyRates,
  updatePropertyBasePrice,
  type AdminActionState,
} from "@/app/admin/actions";
import { CalendarStayBar } from "@/app/admin/calendar-stay-bar";
import { buildMonthGrid, toIsoDate } from "@/lib/calendar-utils";
import {
  barStyleInWeekRow,
  barsForDayRange,
} from "@/lib/calendar-bar-utils";
import { eachDayIsoInclusive } from "@/lib/dates";
import { formatUsd } from "@/lib/pricing";
import type { CalendarStayBar as StayBar } from "@/lib/admin-calendar-query";
import type { PricingDay } from "@/lib/pricing-query";

type Props = {
  propertyId: string;
  propertyName: string;
  propertySlug: string;
  initialBaseReferenceUsd: number;
  minNights?: number;
  maxNights?: number;
};

function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat("es-EC", {
    day: "numeric",
    month: "short",
  }).format(parseISO(iso + "T12:00:00"));
}

function parseMonthParam(raw: string | null): Date {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    return startOfMonth(parseISO(`${raw}-01T12:00:00`));
  }
  return startOfMonth(new Date());
}

export function AdminPricingCalendar({
  propertyId,
  propertyName,
  propertySlug,
  initialBaseReferenceUsd,
  minNights = 1,
  maxNights = 30,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSelect = searchParams.get("select");

  const [month, setMonth] = useState(() => parseMonthParam(searchParams.get("month")));
  const [days, setDays] = useState<PricingDay[]>([]);
  const [bars, setBars] = useState<StayBar[]>([]);
  const [baseReferenceCents, setBaseReferenceCents] = useState(Math.round(initialBaseReferenceUsd * 100));
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState(initialSelect ?? "");
  const [rangeEnd, setRangeEnd] = useState("");
  const [referenceInput, setReferenceInput] = useState(String(initialBaseReferenceUsd));

  const monthLabel = format(month, "LLLL yyyy", { locale: es });
  const from = toIsoDate(startOfMonth(month));
  const to = toIsoDate(endOfMonth(month));
  const monthParam = format(month, "yyyy-MM");

  const daysByDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days]);
  const barSegments = useMemo(() => barsForDayRange(bars, from, to), [bars, from, to]);

  const loadMonth = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await fetchAdminPricingMonth(propertyId, from, to);
      if (!result.ok) {
        setFetchError(result.error);
        return;
      }
      setDays(result.days);
      setBars(result.bars);
      setBaseReferenceCents(result.baseReferenceCents);
    } catch {
      setFetchError("Error de red al cargar precios.");
    } finally {
      setLoading(false);
    }
  }, [propertyId, from, to]);

  useEffect(() => {
    void loadMonth();
  }, [loadMonth]);

  useEffect(() => {
    if (rangeStart && rangeEnd) {
      const start = rangeStart <= rangeEnd ? rangeStart : rangeEnd;
      const day = daysByDate.get(start);
      if (day) setReferenceInput(String(day.referenceCents / 100));
    }
  }, [rangeStart, rangeEnd, daysByDate]);

  function syncMonthToUrl(next: Date) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", format(next, "yyyy-MM"));
    router.replace(`/admin/propiedades/${propertySlug}/precios?${params.toString()}`, {
      scroll: false,
    });
  }

  function handleMonthChange(next: Date) {
    setMonth(next);
    syncMonthToUrl(next);
  }

  const grid = buildMonthGrid(month);
  const selectionDays =
    rangeStart && rangeEnd ? eachDayIsoInclusive(rangeStart, rangeEnd) : rangeStart ? [rangeStart] : [];

  const selectionBlocked = selectionDays.some((d) => daysByDate.get(d)?.blocked);

  function handleDayClick(iso: string, blocked: boolean) {
    if (blocked) return;
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(iso);
      setRangeEnd("");
      return;
    }
    setRangeEnd(iso);
  }

  function clearSelection() {
    setRangeStart("");
    setRangeEnd("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("select");
    router.replace(`/admin/propiedades/${propertySlug}/precios?${params.toString()}`, { scroll: false });
  }

  function cellClass(iso: string, blocked: boolean, inMonth: boolean, isOverride: boolean): string {
    const inSelection = selectionDays.includes(iso);
    let cls = "admin-cal-cell ";

    if (!inMonth) cls += "admin-cal-cell--muted ";
    else if (blocked) cls += "admin-cal-cell--blocked ";
    else cls += "cursor-pointer hover:border-zinc-400 ";

    if (inSelection && !blocked && inMonth) cls += "admin-cal-cell--selected ";
    else if (isOverride && inMonth && !blocked) cls += "admin-cal-cell--override ";

    return cls;
  }

  const weekRows = useMemo(() => {
    const rows: (Date | null)[][] = [];
    for (let i = 0; i < grid.length; i += 7) {
      rows.push(grid.slice(i, i + 7));
    }
    return rows;
  }, [grid]);

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_320px] xl:items-start">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMonthChange(startOfMonth(new Date()))}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-white"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => handleMonthChange(subMonths(month, 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300"
              aria-label="Mes anterior"
            >
              ‹
            </button>
            <p className="min-w-[140px] text-center text-base font-semibold capitalize">{monthLabel}</p>
            <button
              type="button"
              onClick={() => handleMonthChange(addMonths(month, 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300"
              aria-label="Mes siguiente"
            >
              ›
            </button>
          </div>
          <LinkToMulti monthParam={monthParam} />
        </div>

        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-medium text-zinc-500">
          {["lun.", "mar.", "mié.", "jue.", "vie.", "sáb.", "dom."].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {loading ? (
          <div className="mt-3 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="admin-cal-cell min-h-[5rem] animate-pulse bg-zinc-100" />
            ))}
          </div>
        ) : fetchError ? (
          <p className="mt-4 text-sm text-red-700" role="alert">
            {fetchError}
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {weekRows.map((week, wi) => {
              const weekDayIsos = week.map((d) => (d ? toIsoDate(d) : null));
              return (
                <div key={wi} className="relative">
                  <div className="grid grid-cols-7 gap-2">
                    {week.map((day, di) => {
                      if (!day) return <span key={`e-${wi}-${di}`} />;
                      const iso = toIsoDate(day);
                      const inMonth = day.getMonth() === month.getMonth();
                      const info = daysByDate.get(iso);
                      const blocked = info?.blocked ?? false;
                      const refUsd = (info?.referenceCents ?? baseReferenceCents) / 100;

                      return (
                        <button
                          key={iso}
                          type="button"
                          disabled={!inMonth || blocked}
                          onClick={() => handleDayClick(iso, blocked)}
                          className={cellClass(iso, blocked, inMonth, info?.isOverride ?? false)}
                        >
                          <span className="self-start text-sm font-semibold">{day.getDate()}</span>
                          {inMonth && (
                            <span className="mt-auto text-sm font-medium">
                              ${formatUsd(Math.round(refUsd))}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="pointer-events-none absolute inset-x-0 top-10 h-7 px-1">
                    {barSegments.map((seg) => {
                      const style = barStyleInWeekRow(seg, weekDayIsos);
                      if (!style) return null;
                      return (
                        <CalendarStayBar
                          key={`${seg.bar.id}-${wi}-${seg.clippedStart}`}
                          bar={seg.bar}
                          style={style}
                          compact
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="xl:sticky xl:top-6">
        {rangeStart ? (
          <EditPanel
            propertyId={propertyId}
            propertyName={propertyName}
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            selectionDays={selectionDays}
            referenceInput={referenceInput}
            selectionBlocked={selectionBlocked}
            onReferenceChange={setReferenceInput}
            onClose={clearSelection}
            onSuccess={loadMonth}
          />
        ) : (
          <SettingsPanel
            propertyId={propertyId}
            propertyName={propertyName}
            baseReferenceUsd={baseReferenceCents / 100}
            minNights={minNights}
            maxNights={maxNights}
            onSaved={loadMonth}
          />
        )}
      </aside>
    </div>
  );
}

function LinkToMulti({ monthParam }: { monthParam: string }) {
  return (
    <Link
      href={`/admin?month=${monthParam}`}
      className="text-xs font-medium text-zinc-600 underline hover:text-zinc-900"
    >
      Ver multi-calendario →
    </Link>
  );
}

function SettingsPanel({
  propertyId,
  propertyName,
  baseReferenceUsd,
  minNights,
  maxNights,
  onSaved,
}: {
  propertyId: string;
  propertyName: string;
  baseReferenceUsd: number;
  minNights: number;
  maxNights: number;
  onSaved: () => void;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-1 shadow-sm">
      <div className="border-b border-zinc-100 px-4 py-3">
        <p className="text-sm font-semibold">{propertyName}</p>
        <p className="text-xs text-zinc-500">Configuración del calendario</p>
      </div>

      <BasePriceForm propertyId={propertyId} baseReferenceUsd={baseReferenceUsd} onSaved={onSaved} />

      <div className="border-t border-zinc-100 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Disponibilidad</p>
        <p className="mt-2 text-sm text-zinc-700">
          Estadías de {minNights} a {maxNights} noches
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Bloqueos importados desde Airbnb (iCal) y reservas web. No editables desde aquí.
        </p>
      </div>

      <div className="border-t border-zinc-100 px-4 py-4 text-sm">
        <p className="text-xs text-zinc-500">Precio base actual</p>
        <p className="mt-1 font-semibold">${formatUsd(baseReferenceUsd)} USD/noche</p>
      </div>
    </div>
  );
}

function EditPanel({
  propertyId,
  propertyName,
  rangeStart,
  rangeEnd,
  selectionDays,
  referenceInput,
  selectionBlocked,
  onReferenceChange,
  onClose,
  onSuccess,
}: {
  propertyId: string;
  propertyName: string;
  rangeStart: string;
  rangeEnd: string;
  selectionDays: string[];
  referenceInput: string;
  selectionBlocked: boolean;
  onReferenceChange: (v: string) => void;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const start = rangeStart && rangeEnd ? (rangeStart <= rangeEnd ? rangeStart : rangeEnd) : rangeStart;
  const end =
    rangeStart && rangeEnd
      ? rangeStart <= rangeEnd
        ? rangeEnd
        : rangeStart
      : rangeStart;

  return (
    <div className="overflow-hidden rounded-2xl bg-zinc-900 text-white shadow-lg">
      <div className="flex items-start justify-between gap-2 px-4 py-4">
        <div>
          <p className="text-sm font-semibold">
            {rangeEnd && rangeEnd !== rangeStart
              ? `${formatShortDate(start)} – ${formatShortDate(end)}`
              : formatShortDate(rangeStart)}
          </p>
          <p className="text-xs text-zinc-400">
            {selectionDays.length} {selectionDays.length === 1 ? "noche" : "noches"} · {propertyName}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>

      <div className="mx-4 rounded-xl bg-zinc-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm">Disponible</span>
          <span className="flex items-center gap-2 text-sm">
            <span
              className={`h-2 w-2 rounded-full ${selectionBlocked ? "bg-red-400" : "bg-emerald-400"}`}
            />
            {selectionBlocked ? "No disponible" : "Sí"}
          </span>
        </div>
      </div>

      <div className="mx-4 mt-3 rounded-xl bg-zinc-800 px-4 py-4">
        <label className="block text-xs text-zinc-400">Precio por noche</label>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-lg text-zinc-400">$</span>
          <input
            type="number"
            min={1}
            max={10000}
            step={0.01}
            value={referenceInput}
            onChange={(e) => onReferenceChange(e.target.value)}
            disabled={selectionBlocked}
            className="w-full bg-transparent text-3xl font-semibold outline-none disabled:opacity-50"
          />
          <span className="text-sm text-zinc-400">USD</span>
        </div>
      </div>

      <div className="mt-4 space-y-2 px-4 pb-4">
        {selectionBlocked ? (
          <p className="text-xs text-amber-300">
            Hay noches bloqueadas en la selección. Elige solo días disponibles.
          </p>
        ) : (
          <RangeActions
            propertyId={propertyId}
            startDate={start}
            endDate={end}
            referencePriceUsd={referenceInput}
            onSuccess={onSuccess}
          />
        )}
      </div>
    </div>
  );
}

function BasePriceForm({
  propertyId,
  baseReferenceUsd,
  onSaved,
}: {
  propertyId: string;
  baseReferenceUsd: number;
  onSaved: () => void;
}) {
  const [state, formAction, pending] = useActionState(updatePropertyBasePrice, {} as AdminActionState);

  useEffect(() => {
    if (state?.success) onSaved();
  }, [state?.success, onSaved]);

  return (
    <form action={formAction} className="px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Precios</p>
      <p className="mt-1 text-sm text-zinc-700">Tarifa base (USD/noche)</p>
      <div className="mt-3 flex items-end gap-2">
        <input
          name="referencePriceUsd"
          type="number"
          min={1}
          max={10000}
          step={0.01}
          required
          defaultValue={baseReferenceUsd}
          disabled={pending}
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <input type="hidden" name="propertyId" value={propertyId} />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white"
        >
          {pending ? "…" : "Guardar"}
        </button>
      </div>
      {state?.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      {state?.success && <p className="mt-2 text-xs text-emerald-700">{state.success}</p>}
    </form>
  );
}

function RangeActions({
  propertyId,
  startDate,
  endDate,
  referencePriceUsd,
  onSuccess,
}: {
  propertyId: string;
  startDate: string;
  endDate: string;
  referencePriceUsd: string;
  onSuccess: () => void;
}) {
  const [saveState, saveAction, savePending] = useActionState(saveNightlyRates, {} as AdminActionState);
  const [clearState, clearAction, clearPending] = useActionState(clearNightlyRates, {} as AdminActionState);

  useEffect(() => {
    if (saveState?.success || clearState?.success) onSuccess();
  }, [saveState?.success, clearState?.success, onSuccess]);

  const pending = savePending || clearPending;
  const feedback = saveState?.error ?? saveState?.success ?? clearState?.error ?? clearState?.success;

  return (
    <>
      <form action={saveAction}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="startDate" value={startDate} />
        <input type="hidden" name="endDate" value={endDate} />
        <input type="hidden" name="referencePriceUsd" value={referencePriceUsd} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-white px-3 py-2.5 text-sm font-semibold text-zinc-900 disabled:opacity-50"
        >
          {savePending ? "Guardando…" : "Guardar"}
        </button>
      </form>
      <form action={clearAction}>
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="startDate" value={startDate} />
        <input type="hidden" name="endDate" value={endDate} />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl border border-zinc-600 px-3 py-2.5 text-sm font-medium text-zinc-200 disabled:opacity-50"
        >
          {clearPending ? "Restableciendo…" : "Restablecer a base"}
        </button>
      </form>
      {feedback && (
        <p className={`text-xs ${saveState?.error || clearState?.error ? "text-red-300" : "text-emerald-300"}`}>
          {feedback}
        </p>
      )}
    </>
  );
}
