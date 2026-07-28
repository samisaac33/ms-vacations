import { guestBookingToResultSummary } from "@/lib/booking-result-summary";
import { directPricePerNightUsd } from "@/lib/pricing";

export const BOOKING_SCREENSHOT_DEMO_ID = "demo-reserva-movil";

export const BOOKING_SCREENSHOT_SLUG = "villa-palmera";
export const BOOKING_SCREENSHOT_CHECK_IN = "2026-08-15";
export const BOOKING_SCREENSHOT_CHECK_OUT = "2026-08-18";
export const BOOKING_SCREENSHOT_GUESTS = 4;

const DEMO_NIGHTS = 3;

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
