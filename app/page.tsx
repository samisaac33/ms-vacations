import Image from "next/image";
import Link from "next/link";
import { HomeWhyBookDirect } from "@/components/home-why-book-direct";
import {
  CatalogSectionHeader,
  DestinationPropertySection,
} from "@/components/destination-property-section";
import { Button } from "@/components/ui/button";
import { toGoogleMapsEmbedUrl } from "@/lib/google-maps";
import { getHomeCityMapLocation, getHomeFeaturedMapLocation } from "@/lib/properties";
import { getCatalogGroupedWithDbPrices } from "@/lib/property-db";
import { siteConfig } from "@/lib/site";

export default async function Home() {
  const { beach, city } = await getCatalogGroupedWithDbPrices();
  const heroProperty = beach[0] ?? city[0];
  if (!heroProperty) throw new Error("No hay propiedades en el catálogo");
  const heroImage = heroProperty.images[0]!;
  const beachMap = getHomeFeaturedMapLocation();
  const cityMap = getHomeCityMapLocation();
  const beachMapEmbedUrl = toGoogleMapsEmbedUrl(beachMap.coordinates.lat, beachMap.coordinates.lng);
  const cityMapEmbedUrl = toGoogleMapsEmbedUrl(cityMap.coordinates.lat, cityMap.coordinates.lng);

  return (
    <>
      <section className="relative min-h-[70vh] overflow-hidden">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/40 to-ink/20" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6 sm:pb-16">
          <p className="text-sm font-medium uppercase tracking-widest text-ocean-light">
            {siteConfig.copy.heroEyebrow}
          </p>
          <span className="mt-4 inline-flex w-fit rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
            {siteConfig.copy.heroDestinationsBadge}
          </span>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            {siteConfig.copy.heroTitle}
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/90">
            {siteConfig.copy.heroSubtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={siteConfig.copy.catalogPath}>{siteConfig.copy.heroCta}</Button>
            <Button href="#playa" variant="secondary">
              {siteConfig.copy.heroCtaBeach}
            </Button>
            <Button href="#ciudad" variant="secondary">
              {siteConfig.copy.heroCtaCity}
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-16 px-4 py-16 sm:px-6">
        <CatalogSectionHeader
          title={siteConfig.copy.catalogTitle}
          subtitle={siteConfig.copy.catalogSubtitle}
          catalogPath={siteConfig.copy.catalogPath}
          seeAllLabel={siteConfig.copy.seeAll}
        />

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
