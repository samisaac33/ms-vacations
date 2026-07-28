"use client";

import { useState } from "react";
import { PropertyAboutPanel } from "@/components/property-about-panel";
import { PropertyAmenitiesPanel } from "@/components/property-amenities-panel";
import { PropertyBedroomsCarousel } from "@/components/property-bedrooms-carousel";
import { PropertyStaySearchSheet } from "@/components/property-booking-widget";
import { PropertyHighlights } from "@/components/property-highlights";
import { PropertyLocationMap } from "@/components/property-location-map";
import { PropertyMobileBookingBar } from "@/components/property-mobile-booking-bar";
import { PropertyPhotoGallery } from "@/components/property-photo-gallery";
import { PropertyPhotoTour } from "@/components/property-photo-tour";
import { PropertySummaryStats } from "@/components/property-summary-stats";
import { PropertyThingsToKnow } from "@/components/property-things-to-know";
import type { GalleryImage } from "@/lib/property-photo-groups";
import { getBedroomCards } from "@/lib/property-photo-groups";
import type { Property } from "@/lib/properties";
import { directPricePerNightUsd } from "@/lib/pricing";
import type { StayDestination } from "@/lib/stay-search";
import type { HighSeasonPeriod } from "@/lib/stay-rules";

type Quote = {
  nights: number;
  totalUsd: number;
} | null;

type StayDates = {
  checkIn: string;
  checkOut: string;
  huespedes?: number;
};

type Props = {
  property: Property;
  destino: StayDestination;
  shareLink: string;
  catalogHref: string;
  stay?: StayDates;
  stayQuery: string;
  hasStay: boolean;
  quote: Quote;
  highSeasonPeriods?: HighSeasonPeriod[];
};

export function PropertyDetailMobile({
  property,
  destino,
  shareLink,
  catalogHref,
  stay,
  stayQuery,
  hasStay,
  quote,
  highSeasonPeriods = [],
}: Props) {
  const [tour, setTour] = useState<{ index: number } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const images: GalleryImage[] =
    property.images.length > 0
      ? property.images
      : [{ src: "/properties/placeholder-1.svg", alt: `${property.name} — imagen no disponible` }];

  const bedrooms = getBedroomCards(images);

  function openDatesSheet() {
    setSheetOpen(true);
  }

  return (
    <>
      <div className="lg:hidden">
        <PropertyPhotoGallery
          images={property.images}
          propertyName={property.name}
          shareLink={shareLink}
          catalogHref={catalogHref}
          onOpenTour={(index) => setTour({ index })}
        />

        <div className="relative -mt-6 rounded-t-3xl bg-white px-4 pb-24 pt-6">
          <div className="text-center">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {property.name}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Casa completa · {property.location.area}, {property.location.province}
            </p>
            <div className="mt-2 flex justify-center">
              <PropertySummaryStats capacity={property.capacity} />
            </div>
          </div>

          <div className="mt-8 space-y-8">
            <PropertyBedroomsCarousel
              bedrooms={bedrooms}
              onOpenPhoto={(index) => setTour({ index })}
            />

            <PropertyHighlights highlights={property.highlights} />

            <PropertyAboutPanel property={property} />

            <PropertyAmenitiesPanel property={property} />

            <PropertyThingsToKnow
              property={property}
              propertySlug={property.slug}
              rules={property.rules}
              checkIn={stay?.checkIn}
              checkOut={stay?.checkOut}
              onAddDates={openDatesSheet}
            />

            <PropertyLocationMap property={property} />
          </div>
        </div>

        <PropertyMobileBookingBar
          slug={property.slug}
          pricePerNightUsd={directPricePerNightUsd(property.slug)}
          stayQuery={stayQuery}
          quote={quote}
          hasStay={hasStay}
          onOpenDates={openDatesSheet}
        />

        <PropertyStaySearchSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          slug={property.slug}
          propertyName={property.name}
          maxGuests={property.capacity.guests}
          destino={destino}
          stay={stay}
          highSeasonPeriods={highSeasonPeriods}
        />
      </div>

      {tour !== null && (
        <PropertyPhotoTour
          images={images}
          propertyName={property.name}
          shareUrl={shareLink}
          onClose={() => setTour(null)}
        />
      )}
    </>
  );
}
