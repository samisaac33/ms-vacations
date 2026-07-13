"use client";

import { useState } from "react";
import { BookingDesktopCheckout } from "@/components/booking/booking-desktop-checkout";
import {
  BookingDesktopEditModals,
  type DesktopEditModal,
} from "@/components/booking/booking-desktop-edit-modals";
import { BookingSummarySidebar } from "@/components/booking/booking-summary-sidebar";
import { useBookingCheckout, type BookingPricingState } from "@/hooks/use-booking-checkout";

type PropertySummary = {
  slug: string;
  name: string;
  image?: { src: string; alt: string };
};

type Props = {
  slug: string;
  maxGuests: number;
  property: PropertySummary;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onPricingChange?: (state: BookingPricingState) => void;
};

export function BookingDesktopFlow({
  slug,
  maxGuests,
  property,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  onPricingChange,
}: Props) {
  const [editModal, setEditModal] = useState<DesktopEditModal>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  const checkout = useBookingCheckout({
    slug,
    maxGuests,
    initialCheckIn,
    initialCheckOut,
    initialGuests,
    onPricingChange,
  });

  const {
    checkIn,
    checkOut,
    guests,
    setGuests,
    paymentMethod,
    setPaymentMethod,
    paymentTiming,
    splitSchedule,
    quote,
    quoteLoading,
    totalUsd,
    handleBlocksLoaded,
    handleRangeChange,
    setRangeHint,
  } = checkout;

  const hasInitialDates = Boolean(initialCheckIn && initialCheckOut);

  return (
    <>
      <div className="hidden min-w-0 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)] lg:items-start lg:gap-16">
        <BookingDesktopCheckout
          slug={slug}
          propertySlug={property.slug}
          checkout={checkout}
          onOpenModal={setEditModal}
          autoOpenDates={!hasInitialDates}
        />

        <BookingSummarySidebar
          property={property}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          quote={quote}
          quoteLoading={quoteLoading}
          paymentMethod={paymentMethod}
          paymentTiming={paymentTiming}
          splitSchedule={splitSchedule}
          totalUsd={totalUsd}
          onEdit={setEditModal}
        />
      </div>

      <BookingDesktopEditModals
        mode={editModal}
        onClose={() => setEditModal(null)}
        slug={slug}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        maxGuests={maxGuests}
        paymentMethod={paymentMethod}
        quote={quote}
        paymentTiming={paymentTiming}
        splitSchedule={splitSchedule}
        onRangeChange={handleRangeChange}
        onBlocksLoaded={handleBlocksLoaded}
        onRangeError={(msg) => {
          setRangeError(msg);
          setRangeHint(msg);
        }}
        onGuestsChange={setGuests}
        onPaymentMethodChange={setPaymentMethod}
        rangeError={rangeError}
      />
    </>
  );
}
