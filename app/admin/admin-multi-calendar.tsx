"use client";

import Image from "next/image";
import Link from "next/link";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { fetchAdminMultiCalendar } from "@/app/admin/actions";
import { CalendarStayBar } from "@/app/admin/calendar-stay-bar";
import type { AdminCalendarProperty } from "@/lib/admin-calendar-query";
import {
  barStyleInGrid,
  barsForDayRange,
  formatAdminDayHeader,
} from "@/lib/calendar-bar-utils";
import { toIsoDate } from "@/lib/calendar-utils";
import { eachDayIsoInclusive } from "@/lib/dates";
import { formatUsd } from "@/lib/pricing";

function MonthControls({
  month,
  onChange,
}: {
  month: Date;
  onChange: (d: Date) => void;
}) {
  const label = format(month, "LLLL yyyy", { locale: es });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(startOfMonth(new Date()))}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-white"
      >
        Hoy
      </button>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(subMonths(month, 1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 hover:bg-white"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <span className="min-w-[150px] text-center text-sm font-semibold capitalize">{label}</span>
        <button
          type="button"
          onClick={() => onChange(addMonths(month, 1))}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-300 hover:bg-white"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export function AdminMultiCalendar({ initialMonth }: { initialMonth?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [month, setMonth] = useState(() => {
    const raw = initialMonth ?? searchParams.get("month");
    if (raw && /^\d{4}-\d{2}$/.test(raw)) {
      return startOfMonth(parseISO(`${raw}-01T12:00:00`));
    }
    return startOfMonth(new Date());
  });
  const [properties, setProperties] = useState<AdminCalendarProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const from = toIsoDate(startOfMonth(month));
  const to = toIsoDate(endOfMonth(month));
  const dayList = useMemo(() => eachDayIsoInclusive(from, to), [from, to]);

  const monthParam = format(month, "yyyy-MM");

  function handleMonthChange(next: Date) {
    setMonth(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", format(next, "yyyy-MM"));
    router.replace(`/admin?${params.toString()}`, { scroll: false });
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminMultiCalendar(from, to);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setProperties(result.properties ?? []);
    } catch {
      setError("Error al cargar el calendario.");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <MonthControls month={month} onChange={handleMonthChange} />
        <p className="text-xs text-zinc-500">Precios por noche (USD)</p>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-xl bg-zinc-200" />
      ) : error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
          <div className="flex">
            <div className="sticky left-0 z-20 w-12 shrink-0 border-r border-zinc-200 bg-white md:w-56">
              <div className="flex h-12 items-center border-b border-zinc-200 px-3 text-xs font-medium text-zinc-500">
                <span className="sr-only md:not-sr-only md:static">
                  {properties.length} anuncios
                </span>
              </div>
              {properties.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/propiedades/${p.slug}/precios?month=${monthParam}`}
                  title={p.name}
                  aria-label={`Precios de ${p.name}`}
                  className="flex h-[4.75rem] items-center justify-center border-b border-zinc-100 px-1 hover:bg-zinc-50 md:justify-start md:gap-2 md:px-2"
                >
                  <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-zinc-200">
                    <Image src={p.imageSrc} alt="" fill className="object-cover" sizes="36px" />
                  </div>
                  <span className="hidden line-clamp-2 text-xs font-medium leading-snug md:block">
                    {p.name}
                  </span>
                </Link>
              ))}
            </div>

            <div className="min-w-0 flex-1 overflow-x-auto">
              <div style={{ minWidth: `${dayList.length * 3.25}rem` }}>
                <div className="flex h-12 border-b border-zinc-200 bg-zinc-50">
                  {dayList.map((iso) => {
                    const { weekday, day } = formatAdminDayHeader(iso);
                    return (
                      <div key={iso} className="admin-timeline-cell min-w-[3.25rem] bg-zinc-50">
                        <span className="text-[10px] uppercase text-zinc-500">{weekday}</span>
                        <span className="text-sm font-semibold">{day}</span>
                      </div>
                    );
                  })}
                </div>

                {properties.map((p) => {
                  const daysByDate = new Map(p.days.map((d) => [d.date, d]));
                  const segments = barsForDayRange(p.bars, from, to);

                  return (
                    <div key={p.id} className="relative border-b border-zinc-100">
                      <div className="flex">
                        {dayList.map((iso) => {
                          const info = daysByDate.get(iso);
                          const blocked = info?.blocked ?? false;
                          const refUsd = (info?.referenceCents ?? p.baseReferenceCents) / 100;

                          return (
                            <Link
                              key={iso}
                              href={`/admin/propiedades/${p.slug}/precios?month=${monthParam}&select=${iso}`}
                              className={`admin-timeline-cell hover:bg-zinc-50 ${blocked ? "admin-timeline-cell--blocked" : ""}`}
                            >
                              <span className="text-[11px] font-medium text-zinc-700">
                                ${formatUsd(Math.round(refUsd))}
                              </span>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 top-8 h-7">
                        {segments.map((seg) => (
                          <CalendarStayBar
                            key={`${p.id}-${seg.bar.id}-${seg.clippedStart}`}
                            bar={seg.bar}
                            style={barStyleInGrid(seg, dayList.length)}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <ul className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-8 rounded bg-teal-700" /> Reserva web
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-3 w-8 rounded bg-zinc-500" /> Airbnb (iCal)
        </li>
        <li className="flex items-center gap-2">
          <span className="inline-block h-4 w-4 border border-zinc-300 bg-[repeating-linear-gradient(-45deg,#fafafa,#fafafa_3px,#ececec_3px,#ececec_6px)]" />{" "}
          Bloqueado
        </li>
      </ul>
    </div>
  );
}
