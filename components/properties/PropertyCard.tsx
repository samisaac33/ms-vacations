import Image from "next/image";
import Link from "next/link";
import { DirectBookingBadge } from "@/components/trust/DirectBookingBadge";
import type { PropertyRecord } from "@/lib/catalog";
import { getCoverImage } from "@/lib/catalog";

interface PropertyCardProps {
  property: PropertyRecord;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <article className="card-hover group">
      <Link href={`/alojamientos/${property.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={getCoverImage(property)}
            alt={property.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute left-3 top-3">
            <DirectBookingBadge />
          </div>
        </div>

        <div className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary">
              {property.name}
            </h3>
            <p className="shrink-0 text-sm font-semibold text-accent">
              ${property.pricePerNight}
              <span className="font-normal text-muted">/noche</span>
            </p>
          </div>

          <p className="mt-1 text-sm capitalize text-muted">
            {property.destination === "san-clemente" ? "San Clemente" : "Portoviejo"}
          </p>

          <p className="mt-2 text-sm text-muted line-clamp-2">
            {property.shortDescription}
          </p>

          <p className="mt-3 text-sm text-foreground">
            {property.guests} huéspedes · {property.bedrooms} dorm. ·{" "}
            {property.bathrooms} {property.bathrooms === 1 ? "baño" : "baños"}
          </p>

          <span className="mt-3 inline-block text-sm font-semibold text-primary group-hover:underline">
            Ver alojamiento →
          </span>
        </div>
      </Link>
    </article>
  );
}
