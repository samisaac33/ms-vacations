"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { todayInGuayaquil } from "@/lib/availability-utils";
import { nightsBetween } from "@/lib/dates";
import { siteConfig } from "@/lib/site";
import {
  buildStaySearchQuery,
  clampCheckIn,
  clampCheckOut,
  defaultCheckIn,
  defaultCheckOut,
  destinationHash,
  type StayDestination,
  validateStaySearch,
} from "@/lib/stay-search";

const options: { id: StayDestination; label: string }[] = [
  { id: "beach", label: siteConfig.destinations.beach.area },
  { id: "city", label: siteConfig.destinations.city.area },
];

function HeroField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-black/5 sm:p-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-muted">{label}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function HomeHeroPanel() {
  const router = useRouter();
  const minDate = todayInGuayaquil();
  const [destination, setDestination] = useState<StayDestination>("beach");
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(() => defaultCheckOut(defaultCheckIn()));
  const [guests, setGuests] = useState(4);

  const selected = options.find((option) => option.id === destination) ?? options[0]!;

  useEffect(() => {
    setCheckIn((current) => {
      const nextCheckIn = clampCheckIn(current, minDate);
      setCheckOut((currentCheckOut) => clampCheckOut(currentCheckOut, nextCheckIn, minDate));
      return nextCheckIn;
    });
  }, [minDate]);

  const validationError = useMemo(
    () => validateStaySearch(checkIn, checkOut, minDate),
    [checkIn, checkOut, minDate],
  );

  const nights = useMemo(() => nightsBetween(checkIn, checkOut), [checkIn, checkOut]);

  function onCheckInChange(value: string) {
    const nextCheckIn = clampCheckIn(value, minDate);
    setCheckIn(nextCheckIn);
    setCheckOut((current) => clampCheckOut(current, nextCheckIn, minDate));
  }

  function onCheckOutChange(value: string) {
    setCheckOut(clampCheckOut(value, checkIn, minDate));
  }

  function handleSearch() {
    if (validationError) return;
    const query = buildStaySearchQuery({
      destino: destination,
      checkIn,
      checkOut,
      huespedes: guests,
    });
    router.push(`${siteConfig.copy.catalogPath}${query}${destinationHash(destination)}`);
  }

  return (
    <div className="hero-panel mt-3 w-full sm:mt-8 sm:max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
        ¿Dónde quieres hospedarte?
      </p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:mt-3 sm:flex sm:gap-2">
        {options.map((option) => {
          const active = option.id === destination;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setDestination(option.id)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-all sm:flex-1 sm:px-4 sm:py-2.5 sm:text-sm ${
                active
                  ? "bg-white text-ocean shadow-sm ring-2 ring-accent/70"
                  : "bg-white/15 text-white ring-1 ring-white/25 hover:bg-white/25"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div
        key={destination}
        className="mt-3 animate-[fadeIn_0.25s_ease-out] sm:mt-4"
        aria-live="polite"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/75">
          ¿Cuándo y cuántos huéspedes?
        </p>

        <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:grid-cols-3">
          <HeroField label="Entrada">
            <input
              type="date"
              value={checkIn}
              min={minDate}
              onChange={(e) => onCheckInChange(e.target.value)}
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink focus:outline-none focus:ring-0"
            />
          </HeroField>
          <HeroField label="Salida">
            <input
              type="date"
              value={checkOut}
              min={checkIn || minDate}
              onChange={(e) => onCheckOutChange(e.target.value)}
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink focus:outline-none focus:ring-0"
            />
          </HeroField>
          <div className="col-span-2 sm:col-span-1">
            <HeroField label="Huéspedes">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Menos huéspedes"
                  onClick={() => setGuests((n) => Math.max(1, n - 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand-dark text-base font-semibold text-ink sm:h-8 sm:w-8 sm:text-lg"
                >
                  −
                </button>
                <span className="text-sm font-semibold text-ink">{guests}</span>
                <button
                  type="button"
                  aria-label="Más huéspedes"
                  onClick={() => setGuests((n) => Math.min(21, n + 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-sand-dark text-base font-semibold text-ink sm:h-8 sm:w-8 sm:text-lg"
                >
                  +
                </button>
              </div>
            </HeroField>
          </div>
        </div>

        {nights >= 1 && (
          <p className="mt-1.5 text-xs font-medium text-white/70 sm:mt-2">
            {nights} {nights === 1 ? "noche" : "noches"}
          </p>
        )}

        {validationError && (
          <p className="mt-2 text-sm font-medium text-accent" role="alert">
            {validationError}
          </p>
        )}

        <button
          type="button"
          onClick={handleSearch}
          className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-ocean px-6 text-sm font-semibold text-white shadow-lg shadow-black/25 ring-1 ring-white/20 transition-all hover:bg-ocean-dark hover:shadow-xl sm:mt-4 sm:h-14 sm:text-base"
        >
          <svg
            aria-hidden
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
            />
          </svg>
          <span className="sm:hidden">Buscar</span>
          <span className="hidden sm:inline">Buscar en {selected.label}</span>
        </button>
      </div>
    </div>
  );
}
