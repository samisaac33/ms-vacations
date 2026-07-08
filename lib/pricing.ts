import { countNights } from "@/lib/ical";
import type { PropertyRecord } from "@/lib/catalog";
import { bookingPolicy } from "@/lib/catalog";

export interface PriceQuote {
  nights: number;
  pricePerNight: number;
  subtotal: number;
  cleaningFee: number;
  total: number;
  deposit: number;
  currency: "USD";
  minNights: number;
}

export function calculateQuote(
  property: PropertyRecord,
  checkIn: string,
  checkOut: string,
): PriceQuote | null {
  const nights = countNights(checkIn, checkOut);

  if (nights < property.minNights) {
    return null;
  }

  const subtotal = nights * property.pricePerNight;
  const total = subtotal + property.cleaningFee;
  const deposit = Math.round((total * bookingPolicy.depositPercent) / 100);

  return {
    nights,
    pricePerNight: property.pricePerNight,
    subtotal,
    cleaningFee: property.cleaningFee,
    total,
    deposit,
    currency: "USD",
    minNights: property.minNights,
  };
}
