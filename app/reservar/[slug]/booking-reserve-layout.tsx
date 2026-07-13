"use client";

import { useState } from "react";
import { BookingDesktopFlow } from "@/components/booking/booking-desktop-flow";
import { BookingMobileWizard } from "@/components/booking/booking-mobile-wizard";
import type { BookingPricingState } from "@/hooks/use-booking-checkout";
import type { BankAccountDetails } from "@/lib/payments/bank-transfer";

type PropertySummary = {
  slug: string;
  name: string;
  area: string;
  guests: number;
  bedrooms: number;
  baseDirectUsd: number;
  image?: { src: string; alt: string };
};

type Props = {
  slug: string;
  maxGuests: number;
  property: PropertySummary;
  bank: BankAccountDetails;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
};

export function BookingReserveLayout({
  slug,
  maxGuests,
  property,
  bank,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: Props) {
  const [, setPricing] = useState<BookingPricingState>({
    quote: null,
    quoteLoading: false,
    paymentMethod: "bank_transfer",
    paymentTiming: "full_now",
    dueNowUsd: 0,
    splitSchedule: null,
  });

  return (
    <>
      <BookingMobileWizard
        slug={slug}
        maxGuests={maxGuests}
        bank={bank}
        property={{
          slug: property.slug,
          name: property.name,
          image: property.image,
        }}
        initialCheckIn={initialCheckIn}
        initialCheckOut={initialCheckOut}
        initialGuests={initialGuests}
        onPricingChange={setPricing}
      />

      <div className="mt-8 hidden lg:block">
        <BookingDesktopFlow
          slug={slug}
          maxGuests={maxGuests}
          property={{
            slug: property.slug,
            name: property.name,
            image: property.image,
          }}
          initialCheckIn={initialCheckIn}
          initialCheckOut={initialCheckOut}
          initialGuests={initialGuests}
          onPricingChange={setPricing}
        />
      </div>
    </>
  );
}
