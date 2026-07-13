"use client";

import { useEffect, useState } from "react";
import { BookingMobileDatePicker } from "@/components/booking/booking-mobile-date-picker";
import { GuestStepper } from "@/components/booking/guest-stepper";
import { isValidBookingRange } from "@/lib/booking-date-selection";

type SheetMode = "dates" | "guests" | "details" | null;

type Props = {
  mode: SheetMode;
  onClose: () => void;
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  maxGuests: number;
  onRangeChange: (checkIn: string, checkOut: string) => void;
  onBlocksLoaded: (blocks: { start: string; end: string }[]) => void;
  onRangeError: (message: string | null) => void;
  onGuestsChange: (guests: number) => void;
  rangeError?: string | null;
  children?: React.ReactNode;
};

export function BookingEditSheet({
  mode,
  onClose,
  slug,
  checkIn,
  checkOut,
  guests,
  maxGuests,
  onRangeChange,
  onBlocksLoaded,
  onRangeError,
  onGuestsChange,
  rangeError,
  children,
}: Props) {
  const [draftCheckIn, setDraftCheckIn] = useState(checkIn);
  const [draftCheckOut, setDraftCheckOut] = useState(checkOut);

  useEffect(() => {
    if (mode === "dates") {
      setDraftCheckIn(checkIn);
      setDraftCheckOut(checkOut);
      onRangeError(null);
    }
  }, [mode, checkIn, checkOut, onRangeError]);

  useEffect(() => {
    if (!mode) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mode]);

  if (!mode) return null;

  const title =
    mode === "dates" ? "Cambia las fechas" : mode === "guests" ? "Cambiar huéspedes" : "Detalles del precio";

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
    if (!isValidBookingRange(draftCheckIn, draftCheckOut)) return;
    onRangeChange(draftCheckIn, draftCheckOut);
    onRangeError(null);
    onClose();
  }

  const canSaveDates = isValidBookingRange(draftCheckIn, draftCheckOut);

  if (mode === "dates") {
    return (
      <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-ink/40 lg:hidden">
        <button type="button" className="flex-1" aria-label="Cerrar" onClick={onClose} />
        <div className="flex max-h-[92vh] flex-col rounded-t-3xl bg-white">
          <div className="flex shrink-0 items-center justify-between border-b border-sand-dark px-4 py-4">
            <h3 className="text-lg font-semibold text-ink">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-dark"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-2">
            <BookingMobileDatePicker
              slug={slug}
              draftCheckIn={draftCheckIn}
              draftCheckOut={draftCheckOut}
              onDraftChange={handleDraftChange}
              onRangeError={onRangeError}
              onBlocksLoaded={onBlocksLoaded}
            />
            {rangeError && (
              <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
                {rangeError}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center justify-between border-t border-sand-dark px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={handleClearDates}
              className="text-sm font-semibold text-ink underline underline-offset-2"
            >
              Borra las fechas
            </button>
            <button
              type="button"
              onClick={handleSaveDates}
              disabled={!canSaveDates}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-ocean px-6 text-sm font-semibold text-white transition-colors hover:bg-ocean-dark disabled:opacity-40"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-ink/40 lg:hidden">
      <button type="button" className="flex-1" aria-label="Cerrar" onClick={onClose} />
      <div className="max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-4 pb-8 pt-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-ink">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-sand-dark"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {mode === "guests" && (
          <div className="flex items-center justify-between rounded-xl border border-sand-dark bg-sand/50 px-4 py-4">
            <div>
              <p className="font-semibold text-ink">Huéspedes</p>
              <p className="text-sm text-muted">Máximo {maxGuests}</p>
            </div>
            <GuestStepper value={guests} min={1} max={maxGuests} onChange={onGuestsChange} />
          </div>
        )}

        {mode === "details" && children}
      </div>
    </div>
  );
}
