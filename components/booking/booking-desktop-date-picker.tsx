"use client";

import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";
import {
  buildMonthGridMondayFirst,
  DayCell,
  MonthSkeleton,
  toIsoDate,
  WeekdayHeader,
} from "@/components/booking/booking-date-picker-shared";
import { useBookingAvailability } from "@/hooks/use-booking-availability";
import { selectBookingDateRange } from "@/lib/booking-date-selection";
import { isNightBlocked, todayInGuayaquil } from "@/lib/availability-utils";

type Props = {
  slug: string;
  draftCheckIn: string;
  draftCheckOut: string;
  onDraftChange: (checkIn: string, checkOut: string) => void;
  onRangeError?: (message: string | null) => void;
  onBlocksLoaded?: (blocks: { start: string; end: string }[]) => void;
};

function MonthGrid({
  month,
  draftCheckIn,
  draftCheckOut,
  today,
  blocks,
  onDayClick,
}: {
  month: Date;
  draftCheckIn: string;
  draftCheckOut: string;
  today: string;
  blocks: { start: string; end: string }[];
  onDayClick: (iso: string) => void;
}) {
  const grid = buildMonthGridMondayFirst(month);
  const monthLabel = format(month, "MMMM yyyy", { locale: es });

  return (
    <section className="min-w-0 flex-1">
      <h4 className="mb-4 text-center text-base font-semibold capitalize text-ink">{monthLabel}</h4>
      <WeekdayHeader className="mb-2" />
      <div className="grid grid-cols-7 gap-y-0.5">
        {grid.map((day, i) => {
          if (!day) {
            return <span key={`empty-${monthLabel}-${i}`} className="h-11" />;
          }
          const iso = toIsoDate(day);
          const blocked = isNightBlocked(iso, blocks);
          return (
            <DayCell
              key={iso}
              iso={iso}
              dayNum={day.getDate()}
              checkIn={draftCheckIn}
              checkOut={draftCheckOut}
              today={today}
              blocked={blocked}
              onSelect={onDayClick}
            />
          );
        })}
      </div>
    </section>
  );
}

export function BookingDesktopDatePicker({
  slug,
  draftCheckIn,
  draftCheckOut,
  onDraftChange,
  onRangeError,
  onBlocksLoaded,
}: Props) {
  const { blocks, loading, fetchError } = useBookingAvailability(slug, onBlocksLoaded);
  const today = todayInGuayaquil();
  const minMonth = startOfMonth(new Date(`${today}T12:00:00`));

  const [viewStart, setViewStart] = useState(() => {
    if (draftCheckIn) {
      return startOfMonth(new Date(`${draftCheckIn}T12:00:00`));
    }
    return minMonth;
  });

  const monthA = viewStart;
  const monthB = addMonths(viewStart, 1);

  const canGoPrev = viewStart > minMonth;

  function handleDayClick(iso: string) {
    onRangeError?.(null);
    const result = selectBookingDateRange(
      iso,
      { checkIn: draftCheckIn, checkOut: draftCheckOut },
      blocks,
      today,
    );
    if (!result.ok) {
      onRangeError?.(result.error);
      return;
    }
    onDraftChange(result.range.checkIn, result.range.checkOut);
  }

  if (fetchError) {
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-800" role="alert">
        {fetchError}
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex gap-8">
        <MonthSkeleton className="flex-1" />
        <MonthSkeleton className="flex-1" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={() => setViewStart((m) => subMonths(m, 1))}
          disabled={!canGoPrev}
          className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-sand-dark disabled:opacity-30"
          aria-label="Mes anterior"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M15 6l-6 6 6 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex min-w-0 flex-1 gap-8">
          <MonthGrid
            month={monthA}
            draftCheckIn={draftCheckIn}
            draftCheckOut={draftCheckOut}
            today={today}
            blocks={blocks}
            onDayClick={handleDayClick}
          />
          <MonthGrid
            month={monthB}
            draftCheckIn={draftCheckIn}
            draftCheckOut={draftCheckOut}
            today={today}
            blocks={blocks}
            onDayClick={handleDayClick}
          />
        </div>

        <button
          type="button"
          onClick={() => setViewStart((m) => addMonths(m, 1))}
          className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-sand-dark"
          aria-label="Mes siguiente"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
