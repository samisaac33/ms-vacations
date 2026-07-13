"use client";

import { useState } from "react";
import { PropertyAmenitiesList } from "@/components/property-amenities-list";
import { PropertyBedroomsCarousel } from "@/components/property-bedrooms-carousel";
import { PropertyLocationMap } from "@/components/property-location-map";
import { PropertyMobileBookingBar } from "@/components/property-mobile-booking-bar";
import { PropertyPhotoGallery } from "@/components/property-photo-gallery";
import { PropertyPhotoTour } from "@/components/property-photo-tour";
import { PropertySummaryStats } from "@/components/property-summary-stats";
import { PropertyThingsToKnow } from "@/components/property-things-to-know";
import type { GalleryImage } from "@/lib/property-photo-groups";
import { getBedroomCards } from "@/lib/property-photo-groups";
import type { Property } from "@/lib/properties";

type Quote = {
  nights: number;
  totalUsd: number;
} | null;

type Props = {
  property: Property;
  shareLink: string;
  catalogHref: string;
  stayQuery: string;
  hasStay: boolean;
  quote: Quote;
};

export function PropertyDetailMobile({
  property,
  shareLink,
  catalogHref,
  stayQuery,
  hasStay,
  quote,
}: Props) {
  const [tour, setTour] = useState<{ index: number } | null>(null);

  const images: GalleryImage[] =
    property.images.length > 0
      ? property.images
      : [{ src: "/properties/placeholder-1.svg", alt: `${property.name} — imagen no disponible` }];

  const bedrooms = getBedroomCards(images);

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
              Alojamiento entero · {property.location.area}, {property.location.province}
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

            <PropertyAmenitiesList amenities={property.amenities} />

            <section>
              <h2 className="text-xl font-semibold text-ink">Descripción</h2>
              <p className="mt-3 leading-relaxed text-muted">{property.description}</p>
            </section>

            <PropertyThingsToKnow rules={property.rules} />

            <PropertyLocationMap property={property} />
          </div>
        </div>

        <PropertyMobileBookingBar
          slug={property.slug}
          pricePerNightUsd={property.basePricePerNightUsd}
          stayQuery={stayQuery}
          quote={quote}
          hasStay={hasStay}
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
