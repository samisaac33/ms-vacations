"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  PropertyBookingWidget,
  type PropertyBookingWidgetHandle,
} from "@/components/property-booking-widget";
import { PropertyBedroomsCarousel } from "@/components/property-bedrooms-carousel";
import { PropertyPhotoTour } from "@/components/property-photo-tour";
import { PropertyThingsToKnow } from "@/components/property-things-to-know";
import type { GalleryImage } from "@/lib/property-photo-groups";
import { getBedroomCards } from "@/lib/property-photo-groups";
import type { Property } from "@/lib/properties";
import type { StayDestination } from "@/lib/stay-search";
import type { HighSeasonPeriod } from "@/lib/stay-rules";

type StayDates = {
  checkIn: string;
  checkOut: string;
  huespedes?: number;
};

type Quote = {
  nights: number;
  totalUsd: number;
} | null;

type Props = {
  property: Property;
  destino: StayDestination;
  stay?: StayDates;
  stayQuery: string;
  quote: Quote;
  pricePerNightUsd: number;
  highSeasonPeriods?: HighSeasonPeriod[];
  children: ReactNode;
  afterThingsToKnow?: ReactNode;
};

export function PropertyDetailStayShell({
  property,
  destino,
  stay,
  stayQuery,
  quote,
  pricePerNightUsd,
  highSeasonPeriods = [],
  children,
  afterThingsToKnow,
}: Props) {
  const widgetRef = useRef<PropertyBookingWidgetHandle>(null);
  const [tour, setTour] = useState<{ index: number } | null>(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setShareUrl(window.location.href);
    }
  }, []);

  const images: GalleryImage[] =
    property.images.length > 0
      ? property.images
      : [{ src: "/properties/placeholder-1.svg", alt: `${property.name} — imagen no disponible` }];

  const bedrooms = getBedroomCards(images);

  function handleAddDates() {
    document.getElementById("property-booking-widget")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    widgetRef.current?.openDatePicker();
  }

  return (
    <>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
        <section className="space-y-8">
          {bedrooms.length > 0 && (
            <PropertyBedroomsCarousel
              bedrooms={bedrooms}
              onOpenPhoto={(index) => setTour({ index })}
            />
          )}

          {children}

          <PropertyThingsToKnow
            property={property}
            propertySlug={property.slug}
            rules={property.rules}
            checkIn={stay?.checkIn}
            checkOut={stay?.checkOut}
            onAddDates={handleAddDates}
          />

          {afterThingsToKnow}
        </section>

        <aside className="lg:sticky lg:top-24">
          <PropertyBookingWidget
            ref={widgetRef}
            slug={property.slug}
            pricePerNightUsd={pricePerNightUsd}
            maxGuests={property.capacity.guests}
            destino={destino}
            stay={stay}
            stayQuery={stayQuery}
            quote={quote}
            highSeasonPeriods={highSeasonPeriods}
          />
        </aside>
      </div>

      {tour !== null && (
        <PropertyPhotoTour
          images={images}
          propertyName={property.name}
          shareUrl={shareUrl}
          onClose={() => setTour(null)}
        />
      )}
    </>
  );
}
