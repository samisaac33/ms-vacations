"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookingCalendar } from "@/components/booking-calendar";
import { BookingMobileDatePicker } from "@/components/booking/booking-mobile-date-picker";
import { Button } from "@/components/ui/button";
import {
  PropertyGuestStepper,
  PropertyStaySearchFields,
} from "@/components/property-stay-search-fields";
import {
  getBookingRangeValidationError,
  isBookingRangeValidWithRules,
  isValidBookingRange,
} from "@/lib/booking-date-selection";
import { formatUsd } from "@/lib/pricing";
import { buildStaySearchQuery, type StayDestination } from "@/lib/stay-search";
import type { HighSeasonPeriod } from "@/lib/stay-rules";

export type PropertyBookingWidgetHandle = {
  openDatePicker: () => void;
};

type StayDates = {
  checkIn: string;
  checkOut: string;
  huespedes?: number;
};

type Props = {
  slug: string;
  pricePerNightUsd: number;
  maxGuests: number;
  destino: StayDestination;
  stay?: StayDates;
  stayQuery: string;
  quote?: {
    nights: number;
    totalUsd: number;
  } | null;
  id?: string;
  highSeasonPeriods?: HighSeasonPeriod[];
};

export const PropertyBookingWidget = forwardRef<PropertyBookingWidgetHandle, Props>(
  function PropertyBookingWidget(
    {
      slug,
      pricePerNightUsd,
      maxGuests,
      destino,
      stay,
      stayQuery,
      quote,
      id = "property-booking-widget",
      highSeasonPeriods = [],
    },
    ref,
  ) {
    const router = useRouter();
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    const [calendarOpen, setCalendarOpen] = useState(false);
    const [guestsOpen, setGuestsOpen] = useState(false);
    const [draftCheckIn, setDraftCheckIn] = useState(stay?.checkIn ?? "");
    const [draftCheckOut, setDraftCheckOut] = useState(stay?.checkOut ?? "");
    const [draftGuests, setDraftGuests] = useState(stay?.huespedes ?? 2);
    const [rangeError, setRangeError] = useState<string | null>(null);

    const hasStay = Boolean(stay?.checkIn && stay?.checkOut);
    const nights = quote?.nights;
    const totalUsd = quote?.totalUsd;
    const guests = stay?.huespedes ?? draftGuests;

    useEffect(() => {
      setDraftCheckIn(stay?.checkIn ?? "");
      setDraftCheckOut(stay?.checkOut ?? "");
      setDraftGuests(stay?.huespedes ?? 2);
    }, [stay?.checkIn, stay?.checkOut, stay?.huespedes]);

    useImperativeHandle(ref, () => ({
      openDatePicker: () => {
        setGuestsOpen(false);
        setCalendarOpen(true);
      },
    }));

    useEffect(() => {
      if (!calendarOpen) return;
      const rulesError = getBookingRangeValidationError(
        draftCheckIn,
        draftCheckOut,
        highSeasonPeriods,
      );
      if (rulesError) {
        setRangeError(rulesError);
      }
    }, [calendarOpen, draftCheckIn, draftCheckOut, highSeasonPeriods]);

    useEffect(() => {
      if (!calendarOpen && !guestsOpen) return;

      function handleClickOutside(event: MouseEvent) {
        if (!containerRef.current?.contains(event.target as Node)) {
          setCalendarOpen(false);
          setGuestsOpen(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [calendarOpen, guestsOpen]);

    function applySearch(next: {
      checkIn?: string;
      checkOut?: string;
      huespedes?: number;
    }) {
      const checkIn = next.checkIn ?? stay?.checkIn ?? draftCheckIn;
      const checkOut = next.checkOut ?? stay?.checkOut ?? draftCheckOut;
      const huespedes = next.huespedes ?? guests;

      if (
        !isValidBookingRange(checkIn, checkOut) ||
        !isBookingRangeValidWithRules(checkIn, checkOut, highSeasonPeriods)
      ) {
        if (next.huespedes != null && hasStay) {
          const query = buildStaySearchQuery({
            destino,
            checkIn: stay!.checkIn,
            checkOut: stay!.checkOut,
            huespedes,
          });
          router.replace(`${pathname}${query}`, { scroll: false });
        }
        return;
      }

      const query = buildStaySearchQuery({ destino, checkIn, checkOut, huespedes });
      router.replace(`${pathname}${query}`, { scroll: false });
      setCalendarOpen(false);
    }

    function handleRangeChange(checkIn: string, checkOut: string) {
      setDraftCheckIn(checkIn);
      setDraftCheckOut(checkOut);
      if (
        isValidBookingRange(checkIn, checkOut) &&
        isBookingRangeValidWithRules(checkIn, checkOut, highSeasonPeriods)
      ) {
        applySearch({ checkIn, checkOut, huespedes: guests });
      }
    }

    function handleGuestsChange(nextGuests: number) {
      setDraftGuests(nextGuests);
      applySearch({ huespedes: nextGuests });
    }

    return (
      <div ref={containerRef} id={id} className="relative">
        <div className="card p-5 shadow-[var(--shadow-card)] sm:p-6">
          <PropertyStaySearchFields
            checkIn={stay?.checkIn}
            checkOut={stay?.checkOut}
            guests={guests}
            datesActive={calendarOpen}
            guestsActive={guestsOpen}
            onDatesClick={() => {
              setGuestsOpen(false);
              setCalendarOpen((open) => !open);
            }}
            onGuestsClick={() => {
              setCalendarOpen(false);
              setGuestsOpen((open) => !open);
            }}
          />

          {guestsOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%-0.5rem)] z-20 mt-2">
              <PropertyGuestStepper
                guests={guests}
                maxGuests={maxGuests}
                onChange={handleGuestsChange}
              />
            </div>
          )}

          <div className="mt-5">
            {hasStay && totalUsd != null && nights ? (
              <div>
                <p className="font-display text-3xl font-semibold text-ink">
                  ${formatUsd(totalUsd)}
                  <span className="ml-2 text-base font-normal text-muted">total · USD</span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  {nights} {nights === 1 ? "noche" : "noches"} · reserva directa
                </p>
              </div>
            ) : (
              <div>
                <p className="font-display text-3xl font-semibold text-ink">
                  ~${formatUsd(pricePerNightUsd)}
                  <span className="text-lg font-normal text-muted"> / noche</span>
                </p>
                <p className="mt-1 text-sm text-muted">Reserva directa · precio en USD</p>
              </div>
            )}
          </div>

          <Button
            href={`/reservar/${slug}${stayQuery}`}
            className="mt-5 h-12 w-full rounded-full text-base font-semibold"
          >
            Reservar
          </Button>
        </div>

        {calendarOpen && (
          <div className="theme-light absolute left-0 right-0 top-[calc(100%-0.5rem)] z-20 mt-2 hidden rounded-2xl border border-sand-dark bg-white p-4 shadow-[var(--shadow-card)] lg:block">
            <BookingCalendar
              slug={slug}
              checkIn={draftCheckIn}
              checkOut={draftCheckOut}
              onRangeChange={handleRangeChange}
              onRangeError={setRangeError}
              highSeasonPeriods={highSeasonPeriods}
              rangeError={rangeError}
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setDraftCheckIn("");
                  setDraftCheckOut("");
                  setRangeError(null);
                  router.replace(pathname, { scroll: false });
                }}
                className="text-sm font-semibold text-ink underline underline-offset-2"
              >
                Borrar fechas
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

type SheetProps = {
  open: boolean;
  onClose: () => void;
  slug: string;
  propertyName: string;
  maxGuests: number;
  destino: StayDestination;
  stay?: StayDates;
  highSeasonPeriods?: HighSeasonPeriod[];
};

export function PropertyStaySearchSheet({
  open,
  onClose,
  slug,
  propertyName,
  maxGuests,
  destino,
  stay,
  highSeasonPeriods = [],
}: SheetProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkIn, setCheckIn] = useState(stay?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(stay?.checkOut ?? "");
  const [guests, setGuests] = useState(stay?.huespedes ?? 2);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [panel, setPanel] = useState<"dates" | "guests">("dates");

  useEffect(() => {
    if (!open) return;
    setCheckIn(stay?.checkIn ?? "");
    setCheckOut(stay?.checkOut ?? "");
    setGuests(stay?.huespedes ?? 2);
    setPanel("dates");
  }, [open, stay?.checkIn, stay?.checkOut, stay?.huespedes]);

  useEffect(() => {
    if (!open || panel !== "dates") return;
    const rulesError = getBookingRangeValidationError(checkIn, checkOut, highSeasonPeriods);
    if (rulesError) {
      setRangeError(rulesError);
    }
  }, [open, panel, checkIn, checkOut, highSeasonPeriods]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const canApply =
    isValidBookingRange(checkIn, checkOut) &&
    isBookingRangeValidWithRules(checkIn, checkOut, highSeasonPeriods);

  function applyAndClose() {
    if (!canApply) return;
    const query = buildStaySearchQuery({ destino, checkIn, checkOut, huespedes: guests });
    router.replace(`${pathname}${query}`, { scroll: false });
    onClose();
  }

  function handleRangeChange(inDate: string, outDate: string) {
    setCheckIn(inDate);
    setCheckOut(outDate);
  }

  const title = panel === "dates" ? `Fechas — ${propertyName}` : "Huéspedes";

  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end bg-ink/40 lg:hidden">
      <button type="button" className="flex-1" aria-label="Cerrar" onClick={onClose} />
      <div className="theme-light flex max-h-[92vh] flex-col rounded-t-3xl bg-white">
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

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <PropertyStaySearchFields
            checkIn={checkIn || undefined}
            checkOut={checkOut || undefined}
            guests={guests}
            datesActive={panel === "dates"}
            guestsActive={panel === "guests"}
            onDatesClick={() => setPanel("dates")}
            onGuestsClick={() => setPanel("guests")}
          />

          <div className="mt-4">
            {panel === "dates" ? (
              <BookingMobileDatePicker
                slug={slug}
                draftCheckIn={checkIn}
                draftCheckOut={checkOut}
                onDraftChange={handleRangeChange}
                onRangeError={setRangeError}
                highSeasonPeriods={highSeasonPeriods}
                rangeError={rangeError}
              />
            ) : (
              <PropertyGuestStepper guests={guests} maxGuests={maxGuests} onChange={setGuests} />
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between border-t border-sand-dark px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => {
              setCheckIn("");
              setCheckOut("");
              setRangeError(null);
            }}
            className="text-sm font-semibold text-ink underline underline-offset-2"
          >
            Borrar fechas
          </button>
          <Button
            type="button"
            onClick={applyAndClose}
            disabled={!canApply}
            className="h-11 rounded-full px-6"
          >
            Aplicar
          </Button>
        </div>
      </div>
    </div>
  );
}
