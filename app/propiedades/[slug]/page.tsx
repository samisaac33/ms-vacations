import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { PropertyLocationMap } from "@/components/property-location-map";
import { Button } from "@/components/ui/button";
import { getPropertyBySlugWithDbPrice, getAllPropertySlugs } from "@/lib/property-db";
import { formatUsd } from "@/lib/pricing";
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
  const stayQuery =
    parsed?.checkIn &&
    parsed.checkOut &&
    !validateStaySearch(parsed.checkIn, parsed.checkOut)
      ? buildStaySearchQuery({
          checkIn: parsed.checkIn,
          checkOut: parsed.checkOut,
          huespedes: parsed.huespedes,
        })
      : "";

  const mainImage = p.images[0];
  const extraImages = p.images.slice(1);
  const directUsd = p.basePricePerNightUsd;

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

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div>
          <div className="grid gap-3">
            {mainImage && (
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-sand-dark">
                <Image
                  src={mainImage.src}
                  alt={mainImage.alt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
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
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

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

        <aside className="lg:sticky lg:top-24">
          <div className="card p-6">
            <p className="text-2xl font-semibold text-ink">
              ~${formatUsd(directUsd)}
              <span className="text-base font-normal text-muted"> / noche</span>
            </p>
            <p className="mt-1 text-sm text-muted">Reserva directa · precio por noche en USD</p>
            <ul className="mt-4 space-y-2 border-t border-sand-dark pt-4 text-sm text-muted">
              <li>{p.capacity.guests} huéspedes máx.</li>
              <li>
                {p.capacity.bedrooms} dorm. · {p.capacity.beds} camas · {p.capacity.bathrooms}{" "}
                baños
              </li>
            </ul>
            <Button href={`/reservar/${p.slug}${stayQuery}`} className="mt-6 w-full">
              Reservar
            </Button>
            <Button href={siteConfig.copy.catalogPath} variant="secondary" className="mt-3 w-full">
              {siteConfig.copy.otherHomes}
            </Button>
          </div>
        </aside>
      </div>
    </article>
  );
}
