import Image from "next/image";
import Link from "next/link";
import { HomeHeroPanel } from "@/components/home-hero-panel";
import { HomeWhyBookDirect } from "@/components/home-why-book-direct";
import {
  HomeDestinationPicker,
  type DestinationCard,
} from "@/components/home-destination-picker";
import { HomeDestinationNav } from "@/components/home-destination-nav";
import {
  CatalogSectionHeader,
  DestinationPropertySection,
} from "@/components/destination-property-section";
import { Button } from "@/components/ui/button";
import { toGoogleMapsEmbedUrl } from "@/lib/google-maps";
import {
  getHomeCityMapLocation,
  getHomeFeaturedMapLocation,
  HOME_HERO_IMAGE,
  type Property,
} from "@/lib/properties";
import { getCatalogGroupedWithDbPrices } from "@/lib/property-db";
import { siteConfig } from "@/lib/site";

function minPriceUsd(properties: Property[]): number {
  if (properties.length === 0) return 0;
  return Math.min(...properties.map((p) => p.basePricePerNightUsd));
}

function buildDestinationCard(
  id: "beach" | "city",
  properties: Property[],
  name: string,
  tagline: string,
  href: string,
): DestinationCard | null {
  if (properties.length === 0) return null;
  const lead = properties[0]!;
  const image = lead.images[0] ?? {
    src: "/properties/placeholder-1.svg",
    alt: `Alojamientos en ${name}`,
  };

  return {
    id,
    name,
    tagline,
    href,
    image,
    propertyCount: properties.length,
    priceFromUsd: minPriceUsd(properties),
  };
}

export default async function Home() {
  const { beach, city } = await getCatalogGroupedWithDbPrices();
  const beachMap = getHomeFeaturedMapLocation();
  const cityMap = getHomeCityMapLocation();
  const beachMapEmbedUrl = toGoogleMapsEmbedUrl(beachMap.coordinates.lat, beachMap.coordinates.lng);
  const cityMapEmbedUrl = toGoogleMapsEmbedUrl(cityMap.coordinates.lat, cityMap.coordinates.lng);
  const destinationCards = [
    buildDestinationCard(
      "beach",
      beach,
      siteConfig.destinations.beach.area,
      siteConfig.destinations.beach.subtitle,
      "#playa",
    ),
    buildDestinationCard(
      "city",
      city,
      siteConfig.destinations.city.area,
      siteConfig.destinations.city.subtitle,
      "#ciudad",
    ),
  ].filter((card): card is DestinationCard => card !== null);

  return (
    <>
      <section className="relative min-h-[58vh] overflow-hidden lg:min-h-[62vh]">
        <Image
          src={HOME_HERO_IMAGE.src}
          alt={HOME_HERO_IMAGE.alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-ocean-dark/70 via-ink/45 to-ink/25" />
        <div className="relative mx-auto flex min-h-[58vh] max-w-6xl flex-col justify-end px-4 pb-6 pt-28 sm:px-6 sm:pb-12 lg:min-h-[62vh]">
          <p className="hidden text-xs font-semibold uppercase tracking-[0.2em] text-accent sm:block">
            {siteConfig.copy.heroEyebrow}
          </p>
          <h1 className="font-display mt-0 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:mt-3 sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
            <span className="sm:hidden">{siteConfig.copy.heroTitleMobile}</span>
            <span className="hidden sm:inline">{siteConfig.copy.heroTitle}</span>
          </h1>
          <p className="mt-4 hidden max-w-xl text-base leading-relaxed text-white/90 sm:block sm:text-lg">
            {siteConfig.copy.heroSubtitle}
          </p>
          <HomeHeroPanel />
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-10 px-4 py-16 sm:px-6">
        <CatalogSectionHeader
          title={siteConfig.copy.catalogTitle}
          subtitle={siteConfig.copy.catalogSubtitle}
          catalogPath={siteConfig.copy.catalogPath}
          seeAllLabel={siteConfig.copy.seeAll}
        />

        <HomeDestinationPicker destinations={destinationCards} />

        <HomeDestinationNav />

        <div className="space-y-16">
          <DestinationPropertySection
            id="playa"
            heading={siteConfig.copy.featuredBeachHeading}
            subtitle={siteConfig.destinations.beach.subtitle}
            properties={beach}
            showDiscountNote={false}
          />

          <DestinationPropertySection
            id="ciudad"
            heading={siteConfig.copy.featuredCityHeading}
            subtitle={siteConfig.destinations.city.subtitle}
            properties={city}
            showDiscountNote={false}
          />
        </div>
      </section>

      <HomeWhyBookDirect />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-xl font-semibold text-ink">{siteConfig.copy.locationsHeading}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{siteConfig.copy.locationsIntro}</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="card overflow-hidden">
            <div className="border-b border-sand-dark px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean">
                {siteConfig.destinations.beach.label}
              </p>
              <h3 className="mt-1 font-semibold text-ink">{siteConfig.destinations.beach.area}</h3>
            </div>
            <div className="min-h-[240px]">
              <iframe
                title="Ubicación playa MS Vacations en Google Maps"
                src={beachMapEmbedUrl}
                className="h-full min-h-[240px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="border-t border-sand-dark bg-sand/50 px-4 py-2 text-right text-xs text-muted">
              <a
                href={beachMap.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ocean hover:underline"
              >
                Ver en Google Maps →
              </a>
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-sand-dark px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ocean">
                {siteConfig.destinations.city.label}
              </p>
              <h3 className="mt-1 font-semibold text-ink">{siteConfig.destinations.city.area}</h3>
            </div>
            <div className="min-h-[240px]">
              <iframe
                title="Ubicación Portoviejo MS Vacations en Google Maps"
                src={cityMapEmbedUrl}
                className="h-full min-h-[240px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <p className="border-t border-sand-dark bg-sand/50 px-4 py-2 text-right text-xs text-muted">
              <a
                href={cityMap.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ocean hover:underline"
              >
                Ver en Google Maps →
              </a>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button href="#playa" variant="secondary">
            {siteConfig.copy.heroCtaBeach}
          </Button>
          <Button href="#ciudad" variant="secondary">
            {siteConfig.copy.heroCtaCity}
          </Button>
          <Link
            href={siteConfig.copy.guidePath}
            className="inline-flex items-center text-sm font-medium text-ocean hover:underline"
          >
            {siteConfig.copy.guideNav} →
          </Link>
        </div>
      </section>
    </>
  );
}
