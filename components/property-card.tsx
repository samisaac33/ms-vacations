import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/lib/properties";
import { directPricePerNightUsd, formatUsd } from "@/lib/pricing";

type Props = {
  property: Property;
};

export function PropertyCard({ property: p }: Props) {
  const image = p.images[0];
  const directUsd = directPricePerNightUsd(p.basePricePerNightUsd);

  return (
    <article className="card group transition-shadow hover:shadow-md">
      <Link href={`/propiedades/${p.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-sand-dark">
          <Image
            src={image?.src ?? "/properties/placeholder-1.svg"}
            alt={image?.alt ?? p.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-ocean">
            {p.location.area}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-ink">{p.name}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {p.shortDescription}
          </p>
          <p className="mt-3 text-xs text-muted">
            {p.capacity.guests} huéspedes · {p.capacity.bedrooms} dorm. · {p.capacity.bathrooms}{" "}
            baños
          </p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">
              Desde ~${formatUsd(directUsd)}{" "}
              <span className="font-normal text-muted">/ noche · reserva directa</span>
            </p>
            <span className="text-sm font-medium text-ocean group-hover:underline">
              Ver →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
