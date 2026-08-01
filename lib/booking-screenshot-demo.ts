import { guestBookingToResultSummary } from "@/lib/booking-result-summary";
import { eachNightIso } from "@/lib/dates";
import { directPricePerNightUsd } from "@/lib/pricing";
import type { StayQuote } from "@/lib/pricing-query";
import {
  catalogReferencePriceUsd,
  cleaningFeeCents,
  guestDirectPriceUsd,
} from "@/lib/property-pricing";

export const BOOKING_SCREENSHOT_DEMO_ID = "demo-reserva-movil";

export const BOOKING_SCREENSHOT_SLUG = "villa-palmera";
export const BOOKING_SCREENSHOT_CHECK_IN = "2026-08-15";
export const BOOKING_SCREENSHOT_CHECK_OUT = "2026-08-18";
export const BOOKING_SCREENSHOT_GUESTS = 4;

const DEMO_NIGHTS = 3;

export function isContentCaptureParam(
  value: string | string[] | undefined,
): boolean {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "1" || raw === "true";
}

export function bookingScreenshotDemoQuote(slug = BOOKING_SCREENSHOT_SLUG): StayQuote {
  const nights = eachNightIso(BOOKING_SCREENSHOT_CHECK_IN, BOOKING_SCREENSHOT_CHECK_OUT);
  const directCents = Math.round(guestDirectPriceUsd(slug) * 100);
  const referenceCents = Math.round(catalogReferencePriceUsd(slug) * 100);

  const nightly = nights.map((date) => ({
    date,
    referenceCents,
    guestDirectCents: directCents,
    directCents,
    isPromotionalVat: false,
    isOverride: false,
    isNewYearsEve: false,
  }));

  const nightlyTotalDirectCents = directCents * nights.length;
  const cleaning = cleaningFeeCents(slug);

  return {
    slug,
    nights: nights.length,
    nightly,
    cleaningFeeCents: cleaning,
    nightlyTotalDirectCents,
    totalDirectCents: nightlyTotalDirectCents + cleaning,
  };
}

export function bookingScreenshotDemoSummary() {
  const nightlyUsd = directPricePerNightUsd(BOOKING_SCREENSHOT_SLUG);
  return guestBookingToResultSummary({
    propertyName: "Villa Palmera",
    checkIn: BOOKING_SCREENSHOT_CHECK_IN,
    checkOut: BOOKING_SCREENSHOT_CHECK_OUT,
    guests: BOOKING_SCREENSHOT_GUESTS,
    reference: "MS-VP-20260815",
    totalUsd: nightlyUsd * DEMO_NIGHTS,
    guestEmail: "huesped@ejemplo.com",
    paymentMethod: "paypal",
  });
}
