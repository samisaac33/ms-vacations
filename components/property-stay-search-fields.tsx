"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type DateFieldProps = {
  label: string;
  value?: string;
  placeholder?: string;
  onClick?: () => void;
  active?: boolean;
  className?: string;
};

function formatDisplayDate(iso: string): string {
  return format(parseISO(iso), "d/M/yyyy", { locale: es });
}

function formatGuestLabel(count: number): string {
  return count === 1 ? "1 huésped" : `${count} huéspedes`;
}

export function PropertyStayDateField({
  label,
  value,
  placeholder = "Agregar fecha",
  onClick,
  active,
  className = "",
}: DateFieldProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 flex-col px-4 py-3 text-left transition hover:bg-sand/60 ${active ? "bg-sand/60" : ""} ${className}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-ink">{label}</span>
      <span className={`mt-0.5 text-sm ${value ? "font-medium text-ink" : "text-muted"}`}>
        {value ? formatDisplayDate(value) : placeholder}
      </span>
    </button>
  );
}

type StaySearchFieldsProps = {
  checkIn?: string;
  checkOut?: string;
  guests: number;
  onDatesClick: () => void;
  onGuestsClick: () => void;
  datesActive?: boolean;
  guestsActive?: boolean;
  id?: string;
};

export function PropertyStaySearchFields({
  checkIn,
  checkOut,
  guests,
  onDatesClick,
  onGuestsClick,
  datesActive,
  guestsActive,
  id,
}: StaySearchFieldsProps) {
  return (
    <div id={id} className="theme-light overflow-hidden rounded-xl border border-ink/20 bg-white">
      <div className="flex divide-x divide-ink/20">
        <PropertyStayDateField
          label="Llegada"
          value={checkIn}
          onClick={onDatesClick}
          active={datesActive}
        />
        <PropertyStayDateField
          label="Salida"
          value={checkOut}
          onClick={onDatesClick}
          active={datesActive}
        />
      </div>
      <button
        type="button"
        onClick={onGuestsClick}
        className={`flex w-full items-center justify-between border-t border-ink/20 px-4 py-3 text-left transition hover:bg-sand/60 ${guestsActive ? "bg-sand/60" : ""}`}
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink">Huéspedes</span>
          <p className="mt-0.5 text-sm font-medium text-ink">{formatGuestLabel(guests)}</p>
        </div>
        <svg className="h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

type GuestStepperProps = {
  guests: number;
  maxGuests: number;
  onChange: (guests: number) => void;
};

export function PropertyGuestStepper({ guests, maxGuests, onChange }: GuestStepperProps) {
  return (
    <div className="theme-light rounded-xl border border-sand-dark bg-white p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-ink">Huéspedes</p>
          <p className="text-sm text-muted">Máximo {maxGuests}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Menos huéspedes"
            disabled={guests <= 1}
            onClick={() => onChange(Math.max(1, guests - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-lg font-semibold text-ink disabled:opacity-30"
          >
            −
          </button>
          <span className="min-w-[1.5rem] text-center text-sm font-semibold text-ink">{guests}</span>
          <button
            type="button"
            aria-label="Más huéspedes"
            disabled={guests >= maxGuests}
            onClick={() => onChange(Math.min(maxGuests, guests + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/20 text-lg font-semibold text-ink disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export { formatGuestLabel };
