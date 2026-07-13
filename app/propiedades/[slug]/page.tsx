import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PropertyBookingPanel } from "@/components/property-booking-panel";
import { PropertyDetailMobile } from "@/components/property-detail-mobile";
import { PropertyLocationMap } from "@/components/property-location-map";
import { PropertyPhotoGallery } from "@/components/property-photo-gallery";
import { PropertySummaryStats } from "@/components/property-summary-stats";
import { getPropertyBySlugWithDbPrice, getAllPropertySlugs } from "@/lib/property-db";
import { getStayQuoteBySlug } from "@/lib/pricing-query";
import { buildStaySearchQuery, parseStaySearchFromParams, validateStaySearch } from "@/lib/stay-search";
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

  const parsed = parseStaySearchFromParams(queryParams);
  const datesValid = Boolean(
    parsed?.checkIn &&
      parsed.checkOut &&
      !validateStaySearch(parsed.checkIn, parsed.checkOut),
  );

  const stay = datesValid
    ? {
        checkIn: parsed!.checkIn!,
        checkOut: parsed!.checkOut!,
        huespedes: parsed!.huespedes,
      }
    : undefined;

  const stayQuery = datesValid
    ? buildStaySearchQuery({
        checkIn: parsed!.checkIn,
        checkOut: parsed!.checkOut,
        huespedes: parsed!.huespedes,
      })
    : "";

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

  return (
    <article className="mx-auto w-full max-w-7xl lg:px-6 lg:py-8">
      <PropertyDetailMobile
        property={p}
        shareLink={shareLink}
        catalogHref={siteConfig.copy.catalogPath}
        stayQuery={stayQuery}
        hasStay={datesValid}
        quote={quote}
      />

      <div className="hidden lg:block lg:px-0">
        <PageHeader
          title={p.name}
          subtitle={`${p.location.area}, ${p.location.province}`}
          breadcrumbs={[
            { label: siteConfig.copy.catalogNav, href: siteConfig.copy.catalogPath },
            { label: p.name },
          ]}
        />
        <PropertySummaryStats capacity={p.capacity} />

        <PropertyPhotoGallery images={p.images} propertyName={p.name} shareLink={shareLink} />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-start">
          <section className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-ink">Descripción</h2>
              <p className="mt-3 leading-relaxed text-muted">{p.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-ink">Amenidades</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.amenities.map((a) => (
                  <li
                    key={a}
                    className="rounded-full bg-ocean-light px-3 py-1 text-sm text-ink"
                  >
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-ink">Reglas</h3>
              <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
                {p.rules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>

            <PropertyLocationMap property={p} />
          </section>

          <aside className="lg:sticky lg:top-24">
            <PropertyBookingPanel
              slug={p.slug}
              pricePerNightUsd={p.basePricePerNightUsd}
              stay={stay}
              stayQuery={stayQuery}
              quote={quote}
            />
          </aside>
        </div>
      </div>
    </article>
  );
}
