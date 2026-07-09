import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PropertyBookingPanel } from "@/components/property-booking-panel";
import { PropertyLocationMap } from "@/components/property-location-map";
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

  const mainImage = p.images[0];
  const extraImages = p.images.slice(1);

  return (
    <article className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title={p.name}
        subtitle={`${p.location.area}, ${p.location.province}`}
        breadcrumbs={[
          { label: siteConfig.copy.catalogNav, href: siteConfig.copy.catalogPath },
          { label: p.name },
        ]}
      />

      <div className="mt-8 max-w-3xl">
        <div className="grid gap-3">
          {mainImage && (
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sand-dark">
              <Image
                src={mainImage.src}
                alt={mainImage.alt}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 768px"
              />
            </div>
          )}
          {extraImages.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {extraImages.map((img, i) => (
                <div
                  key={`${img.src}-${i}`}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand-dark"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <PropertyBookingPanel
          slug={p.slug}
          pricePerNightUsd={p.basePricePerNightUsd}
          stay={stay}
          stayQuery={stayQuery}
          quote={quote}
        />

        <section className="mt-10 space-y-8 border-t border-sand-dark pt-10">
          <div>
            <h2 className="text-xl font-semibold text-ink">Descripción</h2>
            <p className="mt-3 leading-relaxed text-muted">{p.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-ink">Capacidad</h3>
            <ul className="mt-3 space-y-1 text-muted">
              <li>{p.capacity.guests} huéspedes</li>
              <li>
                {p.capacity.bedrooms} dormitorios · {p.capacity.beds} camas ·{" "}
                {p.capacity.bathrooms} baños
              </li>
            </ul>
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
      </div>
    </article>
  );
}
