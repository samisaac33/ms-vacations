import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { hasDatabase } from "@/db/index";
import { getAllPropertySlugs, getPropertyBySlugWithDbPrice } from "@/lib/property-db";
import { directPricePerNightUsd } from "@/lib/pricing";
import { siteConfig } from "@/lib/site";
import { BookingReserveLayout } from "./booking-reserve-layout";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPropertySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const p = await getPropertyBySlugWithDbPrice(slug);
  if (!p) return { title: "Reserva" };
  return { title: `Reservar ${p.name}` };
}

export default async function ReservarPage(props: Props) {
  const { slug } = await props.params;
  const p = await getPropertyBySlugWithDbPrice(slug);
  if (!p) notFound();

  const dbReady = hasDatabase();
  const image = p.images[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Completa tu reserva"
        subtitle={p.name}
        breadcrumbs={[
          { label: siteConfig.copy.catalogNav, href: siteConfig.copy.catalogPath },
          { label: p.name, href: `/propiedades/${p.slug}` },
          { label: "Reservar" },
        ]}
      />

      {!dbReady && (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Falta configurar{" "}
          <code className="rounded bg-amber-100/80 px-1">DATABASE_URL</code> y ejecutar{" "}
          <code className="rounded px-1">npm run db:push</code> y{" "}
          <code className="rounded px-1">npm run db:seed</code> para habilitar reservas.
        </p>
      )}

      <BookingReserveLayout
        slug={p.slug}
        maxGuests={p.capacity.guests}
        property={{
          slug: p.slug,
          name: p.name,
          area: p.location.area,
          guests: p.capacity.guests,
          bedrooms: p.capacity.bedrooms,
          baseDirectUsd: directPricePerNightUsd(p.basePricePerNightUsd),
          image: image ? { src: image.src, alt: image.alt } : undefined,
        }}
      />
    </div>
  );
}
