"use client";

import { useEffect, useState } from "react";
import { BookingDesktopDatePicker } from "@/components/booking/booking-desktop-date-picker";
import { BookingDesktopModal } from "@/components/booking/booking-desktop-modal";
import { PriceBreakdownContent } from "@/components/booking/booking-step-price-breakdown";
import { GuestStepper } from "@/components/booking/guest-stepper";
import {
  getBookingRangeValidationError,
  isBookingRangeValidWithRules,
  isValidBookingRange,
} from "@/lib/booking-date-selection";
import type { PaymentMethod } from "@/lib/payments/types";
import type { PaymentTiming, SplitSchedule } from "@/lib/payment-schedule";
import type { StayQuote } from "@/lib/pricing-query";
import type { HighSeasonPeriod } from "@/lib/stay-rules";

export type DesktopEditModal = "dates" | "guests" | "details" | null;

type Props = {
  mode: DesktopEditModal;
  onClose: () => void;
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  maxGuests: number;
  paymentMethod: PaymentMethod;
  quote: StayQuote | null;
  paymentTiming: PaymentTiming;
  splitSchedule: SplitSchedule | null;
  onRangeChange: (checkIn: string, checkOut: string) => void;
  onBlocksLoaded: (blocks: { start: string; end: string }[]) => void;
  onRangeError: (message: string | null) => void;
  onGuestsChange: (guests: number) => void;
  rangeError?: string | null;
  highSeasonPeriods?: HighSeasonPeriod[];
};

export function BookingDesktopEditModals({
  mode,
  onClose,
  slug,
  checkIn,
  checkOut,
  guests,
  maxGuests,
  paymentMethod,
  quote,
  paymentTiming,
  splitSchedule,
  onRangeChange,
  onBlocksLoaded,
  onRangeError,
  onGuestsChange,
  rangeError,
  highSeasonPeriods = [],
}: Props) {
  const [draftCheckIn, setDraftCheckIn] = useState(checkIn);
  const [draftCheckOut, setDraftCheckOut] = useState(checkOut);
  const [draftGuests, setDraftGuests] = useState(guests);

  useEffect(() => {
    if (mode === "dates") {
      setDraftCheckIn(checkIn);
      setDraftCheckOut(checkOut);
    }
    if (mode === "guests") {
      setDraftGuests(guests);
    }
  }, [mode, checkIn, checkOut, guests]);

  useEffect(() => {
    if (mode !== "dates") return;
    const rulesError = getBookingRangeValidationError(
      draftCheckIn,
      draftCheckOut,
      highSeasonPeriods,
    );
    if (rulesError) {
      onRangeError(rulesError);
    }
  }, [mode, draftCheckIn, draftCheckOut, highSeasonPeriods, onRangeError]);

  if (!mode) return null;

  const titles: Record<Exclude<DesktopEditModal, null>, string> = {
    dates: "Cambia las fechas",
    guests: "Cambiar huéspedes",
    details: "Desglose del precio",
  };

  function handleDraftChange(inDate: string, outDate: string) {
    setDraftCheckIn(inDate);
    setDraftCheckOut(outDate);
  }

  function handleClearDates() {
    setDraftCheckIn("");
    setDraftCheckOut("");
    onRangeError(null);
  }

  function handleSaveDates() {
    if (!canSaveDates) return;
    onRangeChange(draftCheckIn, draftCheckOut);
    onRangeError(null);
    onClose();
  }

  function handleSaveGuests() {
    onGuestsChange(draftGuests);
    onClose();
  }

  const canSaveDates =
    isValidBookingRange(draftCheckIn, draftCheckOut) &&
    isBookingRangeValidWithRules(draftCheckIn, draftCheckOut, highSeasonPeriods);

  if (mode === "dates") {
    return (
      <BookingDesktopModal
        open
        title={titles.dates}
        onClose={onClose}
        footer={
          <>
            <button
              type="button"
              onClick={handleClearDates}
              className="text-sm font-semibold text-ink underline underline-offset-2"
            >
              Limpia las fechas
            </button>
            <button
              type="button"
              onClick={handleSaveDates}
              disabled={!canSaveDates}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-ink/90 disabled:opacity-40"
            >
              Guarda
            </button>
          </>
        }
      >
        <BookingDesktopDatePicker
          slug={slug}
          draftCheckIn={draftCheckIn}
          draftCheckOut={draftCheckOut}
          onDraftChange={handleDraftChange}
          onRangeError={onRangeError}
          onBlocksLoaded={onBlocksLoaded}
          highSeasonPeriods={highSeasonPeriods}
          rangeError={rangeError}
        />
      </BookingDesktopModal>
    );
  }

  if (mode === "guests") {
    return (
      <BookingDesktopModal
        open
        title={titles.guests}
        onClose={onClose}
        maxWidthClass="max-w-md"
        footer={
          <>
            <span />
            <button
              type="button"
              onClick={handleSaveGuests}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-ink px-6 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
            >
              Guarda
            </button>
          </>
        }
      >
        <div className="flex items-center justify-between rounded-xl border border-sand-dark bg-sand/50 px-4 py-4">
          <div>
            <p className="font-semibold text-ink">Huéspedes</p>
            <p className="text-sm text-muted">Máximo {maxGuests}</p>
          </div>
          <GuestStepper value={draftGuests} min={1} max={maxGuests} onChange={setDraftGuests} />
        </div>
      </BookingDesktopModal>
    );
  }

  if (mode === "details" && quote) {
    return (
      <BookingDesktopModal
        open
        title={titles.details}
        onClose={onClose}
        maxWidthClass="max-w-lg"
      >
        <PriceBreakdownContent
          quote={quote}
          paymentMethod={paymentMethod}
          paymentTiming={paymentTiming}
          splitSchedule={splitSchedule}
        />
      </BookingDesktopModal>
    );
  }

  return null;
}
