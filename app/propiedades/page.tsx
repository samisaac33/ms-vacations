import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { HomeDestinationNav } from "@/components/home-destination-nav";
import { DestinationPropertySection } from "@/components/destination-property-section";
import { getCatalogGroupedWithDbPrices } from "@/lib/property-db";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: siteConfig.copy.catalogTitle,
  description: siteConfig.description,
};

export default async function PropiedadesPage() {
  const { beach, city } = await getCatalogGroupedWithDbPrices();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title={siteConfig.copy.catalogTitle}
        subtitle={`${siteConfig.copy.catalogSubtitle} Precios de reserva directa en USD.`}
      />

      <div className="mt-10 space-y-10">
        <HomeDestinationNav />

        <div className="space-y-16">
          <DestinationPropertySection
            id="playa"
            heading={`${siteConfig.copy.featuredBeachHeading} — ${siteConfig.destinations.beach.area}`}
            subtitle={siteConfig.destinations.beach.subtitle}
            properties={beach}
          />

          <DestinationPropertySection
            id="ciudad"
            heading={`${siteConfig.copy.featuredCityHeading} — ${siteConfig.destinations.city.area}`}
            subtitle={siteConfig.destinations.city.subtitle}
            properties={city}
          />
        </div>
      </div>
    </div>
  );
}
