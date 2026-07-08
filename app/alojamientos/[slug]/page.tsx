import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingPanel } from "@/components/booking/BookingPanel";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { PropertyGallery } from "@/components/properties/PropertyGallery";
import { DirectBookingBadge } from "@/components/trust/DirectBookingBadge";
import {
  getDestination,
  getPropertyBySlug,
  getPropertiesByDestination,
  paymentMethods,
  properties,
} from "@/lib/catalog";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) return { title: "Alojamiento no encontrado" };

  return {
    title: `${property.name} · MS Vacations`,
    description: property.shortDescription,
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = getPropertyBySlug(slug);

  if (!property) notFound();

  const destination = getDestination(property.destination);
  const related = getPropertiesByDestination(property.destination).filter(
    (item) => item.slug !== property.slug,
  );

  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-12">
          <nav className="mb-6 text-sm text-muted">
            <Link href="/" className="hover:text-primary">
              Inicio
            </Link>
            <span className="mx-2">/</span>
            <Link href={`/#${property.destination}`} className="hover:text-primary">
              {destination?.name}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{property.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
            <div>
              <PropertyGallery images={property.images} alt={property.name} />

              <div className="mt-8">
                <div className="flex flex-wrap items-center gap-3">
                  <DirectBookingBadge />
                  <span className="text-sm text-muted">{destination?.name}</span>
                </div>
                <h1 className="font-display mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                  {property.name}
                </h1>
                <p className="mt-3 text-muted">
                  {property.guests} huéspedes · {property.bedrooms} dorm. · {property.bathrooms}{" "}
                  {property.bathrooms === 1 ? "baño" : "baños"}
                </p>
                <p className="mt-6 leading-relaxed text-foreground">{property.description}</p>

                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-foreground">Lo que incluye</h2>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {property.amenities.map((amenity) => (
                      <li key={amenity} className="text-sm text-muted">
                        · {amenity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <a
                    href={property.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Ver referencia en Google Maps →
                  </a>
                  <p className="mt-2 text-xs text-muted">
                    La ubicación exacta se confirma al reservar.
                  </p>
                </div>
              </div>
            </div>

            <BookingPanel property={property} paymentMethods={paymentMethods} />
          </div>

          {related.length > 0 && (
            <section className="mt-16 border-t border-border pt-12">
              <h2 className="font-display text-2xl font-semibold text-foreground">
                Otros alojamientos en {destination?.name}
              </h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.slice(0, 3).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/alojamientos/${item.slug}`}
                    className="rounded-xl border border-border p-4 transition-colors hover:border-primary hover:bg-primary-light/30"
                  >
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="mt-1 text-sm text-muted">
                      Desde ${item.pricePerNight}/noche · {item.guests} huéspedes
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}
