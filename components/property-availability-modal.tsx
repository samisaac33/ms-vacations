"use client";

import { useEffect, useState } from "react";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingMobileDatePicker } from "@/components/booking/booking-mobile-date-picker";
import { BookingDesktopModal } from "@/components/booking/booking-desktop-modal";
import { Button } from "@/components/ui/button";
import {
  getBookingRangeValidationError,
  isBookingRangeValidWithRules,
  isValidBookingRange,
} from "@/lib/booking-date-selection";
import { buildStaySearchQuery } from "@/lib/stay-search";
import type { HighSeasonPeriod } from "@/lib/stay-rules";

type Props = {
  open: boolean;
  onClose: () => void;
  slug: string;
  propertyName: string;
  highSeasonPeriods?: HighSeasonPeriod[];
};

export function PropertyAvailabilityModal({
  open,
  onClose,
  slug,
  propertyName,
  highSeasonPeriods = [],
}: Props) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rangeError, setRangeError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCheckIn("");
      setCheckOut("");
      setRangeError(null);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const rulesError = getBookingRangeValidationError(checkIn, checkOut, highSeasonPeriods);
    if (rulesError) {
      setRangeError(rulesError);
    }
  }, [open, checkIn, checkOut, highSeasonPeriods]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const canContinue =
    isValidBookingRange(checkIn, checkOut) &&
    isBookingRangeValidWithRules(checkIn, checkOut, highSeasonPeriods);
  const continueHref = `/reservar/${slug}${buildStaySearchQuery({ checkIn, checkOut })}`;
  const title = `Disponibilidad — ${propertyName}`;

  function handleRangeChange(inDate: string, outDate: string) {
    setCheckIn(inDate);
    setCheckOut(outDate);
  }

  function handleClearDates() {
    setCheckIn("");
    setCheckOut("");
    setRangeError(null);
  }

  const continueButton = canContinue ? (
    <Button href={continueHref} className="h-11 rounded-full px-6">
      Continuar
    </Button>
  ) : (
    <Button type="button" className="h-11 rounded-full px-6" disabled>
      Continuar
    </Button>
  );

  return (
    <>
      <BookingDesktopModal
        open={open}
        title={title}
        onClose={onClose}
        maxWidthClass="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={handleClearDates}
              className="text-sm font-semibold text-ink underline underline-offset-2"
            >
              Borrar fechas
            </button>
            {continueButton}
          </>
        }
      >
        <BookingCalendar
          slug={slug}
          checkIn={checkIn}
          checkOut={checkOut}
          onRangeChange={handleRangeChange}
          onRangeError={setRangeError}
          highSeasonPeriods={highSeasonPeriods}
          rangeError={rangeError}
        />
      </BookingDesktopModal>

      <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-ink/40 lg:hidden">
        <button type="button" className="flex-1" aria-label="Cerrar" onClick={onClose} />
        <div className="flex max-h-[92vh] flex-col rounded-t-3xl bg-white">
          <div className="flex shrink-0 items-center justify-between border-b border-sand-dark px-4 py-4">
            <h3 className="pr-4 text-lg font-semibold leading-tight text-ink">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full hover:bg-sand-dark"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-2">
            <BookingMobileDatePicker
              slug={slug}
              draftCheckIn={checkIn}
              draftCheckOut={checkOut}
              onDraftChange={handleRangeChange}
              onRangeError={setRangeError}
              highSeasonPeriods={highSeasonPeriods}
              rangeError={rangeError}
            />
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-sand-dark px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={handleClearDates}
              className="text-sm font-semibold text-ink underline underline-offset-2"
            >
              Borrar fechas
            </button>
            {continueButton}
          </div>
        </div>
      </div>
    </>
  );
}
