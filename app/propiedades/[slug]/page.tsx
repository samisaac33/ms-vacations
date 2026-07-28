import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PropertyAboutPanel } from "@/components/property-about-panel";
import { PropertyAmenitiesPanel } from "@/components/property-amenities-panel";
import { PropertyDetailMobile } from "@/components/property-detail-mobile";
import { PropertyDetailStayShell } from "@/components/property-detail-stay-shell";
import { PropertyHighlights } from "@/components/property-highlights";
import { PropertyLocationMap } from "@/components/property-location-map";
import { PropertyPhotoGallery } from "@/components/property-photo-gallery";
import { PropertySummaryStats } from "@/components/property-summary-stats";
import { getPropertyBySlugWithDbPrice, getAllPropertySlugs } from "@/lib/property-db";
import { loadHighSeasonPeriodsForPropertySlug } from "@/lib/high-season-query";
import { getStayQuoteBySlug } from "@/lib/pricing-query";
import { directPricePerNightUsd } from "@/lib/pricing";
import { buildCatalogHref, buildStaySearchQuery, parseStaySearchFromParams, validateStaySearch } from "@/lib/stay-search";
import { siteConfig } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function generateStaticParams() {
  return getAllPropertySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getPropertyBySlugWithDbPrice(slug);
  if (!p) return { title: "No encontrado" };
  return {
    title: p.name,
    description: p.shortDescription,
    openGraph: {
      title: p.name,
      description: p.shortDescription,
      images: p.images[0] ? [{ url: p.images[0].src, alt: p.images[0].alt }] : [],
    },
  };
}

export default async function PropertyDetailPage(props: Props) {
  const { slug } = await props.params;
  const queryParams = await props.searchParams;
  const p = await getPropertyBySlugWithDbPrice(slug);
  if (!p) notFound();

  const highSeasonPeriods = await loadHighSeasonPeriodsForPropertySlug(slug);

  const parsed = parseStaySearchFromParams(queryParams);
  const datesValid = Boolean(
    parsed?.checkIn &&
      parsed.checkOut &&
      !validateStaySearch(parsed.checkIn, parsed.checkOut, undefined, highSeasonPeriods),
  );

  const destino = parsed?.destino ?? p.destination;

  const stay = datesValid
    ? {
        checkIn: parsed!.checkIn!,
        checkOut: parsed!.checkOut!,
        huespedes: parsed!.huespedes,
      }
    : undefined;

  const stayQuery = datesValid
    ? buildStaySearchQuery({
        destino,
        checkIn: parsed!.checkIn,
        checkOut: parsed!.checkOut,
        huespedes: parsed!.huespedes,
      })
    : "";

  const catalogHref = datesValid
    ? buildCatalogHref(
        {
          destino,
          checkIn: parsed!.checkIn!,
          checkOut: parsed!.checkOut!,
          huespedes: parsed!.huespedes ?? 2,
        },
        siteConfig.copy.catalogPath,
      )
    : siteConfig.copy.catalogPath;

  const quoteRow =
    datesValid && parsed?.checkIn && parsed?.checkOut
      ? await getStayQuoteBySlug(slug, parsed.checkIn, parsed.checkOut)
      : null;

  const quote = quoteRow
    ? {
        nights: quoteRow.nights,
        totalUsd: quoteRow.totalDirectCents / 100,
      }
    : null;

  const shareLink = `${siteConfig.url}/propiedades/${slug}${stayQuery}`;
  const pricePerNightUsd = directPricePerNightUsd(p.slug);

  return (
    <article className="mx-auto w-full max-w-7xl lg:px-6 lg:py-8">
      <PropertyDetailMobile
        property={p}
        destino={destino}
        shareLink={shareLink}
        catalogHref={catalogHref}
        stay={stay}
        stayQuery={stayQuery}
        hasStay={datesValid}
        quote={quote}
        highSeasonPeriods={highSeasonPeriods}
      />

      <div className="hidden lg:block lg:px-0">
        <PageHeader
          title={p.name}
          subtitle={`${p.location.area}, ${p.location.province}`}
          breadcrumbs={[
            { label: siteConfig.copy.catalogNav, href: catalogHref },
            { label: p.name },
          ]}
        />
        <PropertySummaryStats capacity={p.capacity} />

        <PropertyPhotoGallery images={p.images} propertyName={p.name} shareLink={shareLink} />

        <PropertyDetailStayShell
          property={p}
          destino={destino}
          stay={stay}
          stayQuery={stayQuery}
          quote={quote}
          pricePerNightUsd={pricePerNightUsd}
          highSeasonPeriods={highSeasonPeriods}
          afterThingsToKnow={<PropertyLocationMap property={p} />}
        >
          <PropertyHighlights highlights={p.highlights} />
          <PropertyAboutPanel property={p} />
          <PropertyAmenitiesPanel property={p} />
        </PropertyDetailStayShell>
      </div>
    </article>
  );
}
