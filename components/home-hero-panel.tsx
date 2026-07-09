"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { todayInGuayaquil } from "@/lib/availability-utils";
import { siteConfig } from "@/lib/site";
import {
  buildStaySearchQuery,
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
    <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5">
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
  const [error, setError] = useState<string | null>(null);

  const selected = options.find((option) => option.id === destination) ?? options[0]!;

  const validationError = useMemo(
    () => validateStaySearch(checkIn, checkOut, minDate),
    [checkIn, checkOut, minDate],
  );

  function onCheckInChange(value: string) {
    setCheckIn(value);
    if (value && checkOut && checkOut <= value) {
      setCheckOut(defaultCheckOut(value));
    }
  }

  function handleSearch() {
    const message = validateStaySearch(checkIn, checkOut, minDate);
    if (message) {
      setError(message);
      return;
    }
    setError(null);
    const query = buildStaySearchQuery({
      destino: destination,
      checkIn,
      checkOut,
      huespedes: guests,
    });
    router.push(`${siteConfig.copy.catalogPath}${query}${destinationHash(destination)}`);
  }

  return (
    <div className="hero-panel mt-8 w-full max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
        ¿Dónde quieres hospedarte?
      </p>
      <div className="mt-3 flex gap-2">
        {options.map((option) => {
          const active = option.id === destination;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setDestination(option.id)}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
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
        className="mt-4 animate-[fadeIn_0.25s_ease-out]"
        aria-live="polite"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-white/75">
          ¿Cuándo y cuántos huéspedes?
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
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
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full border-0 bg-transparent p-0 text-sm font-semibold text-ink focus:outline-none focus:ring-0"
            />
          </HeroField>
          <HeroField label="Huéspedes">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                aria-label="Menos huéspedes"
                onClick={() => setGuests((n) => Math.max(1, n - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-dark text-lg font-semibold text-ink"
              >
                −
              </button>
              <span className="text-sm font-semibold text-ink">{guests}</span>
              <button
                type="button"
                aria-label="Más huéspedes"
                onClick={() => setGuests((n) => Math.min(21, n + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-sand-dark text-lg font-semibold text-ink"
              >
                +
              </button>
            </div>
          </HeroField>
        </div>

        {error && (
          <p className="mt-2 text-sm font-medium text-accent" role="alert">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleSearch}
          disabled={Boolean(validationError)}
          className="mt-4 inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-ocean px-6 text-base font-semibold text-white shadow-lg shadow-black/25 ring-1 ring-white/20 transition-all hover:bg-ocean-dark hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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
          Buscar en {selected.label}
        </button>
      </div>
    </div>
  );
}
