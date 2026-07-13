"use client";

import { addMonths, format, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo } from "react";
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

const MONTHS_TO_SHOW = 18;

type Props = {
  slug: string;
  draftCheckIn: string;
  draftCheckOut: string;
  onDraftChange: (checkIn: string, checkOut: string) => void;
  onRangeError?: (message: string | null) => void;
  onBlocksLoaded?: (blocks: { start: string; end: string }[]) => void;
};

export function BookingMobileDatePicker({
  slug,
  draftCheckIn,
  draftCheckOut,
  onDraftChange,
  onRangeError,
  onBlocksLoaded,
}: Props) {
  const { blocks, loading, fetchError } = useBookingAvailability(slug, onBlocksLoaded);
  const today = todayInGuayaquil();

  const months = useMemo(() => {
    const start = startOfMonth(new Date(`${today}T12:00:00`));
    return Array.from({ length: MONTHS_TO_SHOW }, (_, i) => addMonths(start, i));
  }, [today]);

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
      <div>
        {Array.from({ length: 3 }, (_, i) => (
          <MonthSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <WeekdayHeader className="sticky top-0 z-10 bg-white pb-2" />

      {months.map((month) => {
        const grid = buildMonthGridMondayFirst(month);
        const monthLabel = format(month, "MMMM 'de' yyyy", { locale: es });

        return (
          <section key={monthLabel} className="mb-6">
            <h4 className="mb-3 text-base font-semibold capitalize text-ink">{monthLabel}</h4>
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
                    onSelect={handleDayClick}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
