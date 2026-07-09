import Image from "next/image";
import Link from "next/link";
import { PropertyBadgeList } from "@/components/property-badge-list";
import type { Property } from "@/lib/properties";
import { getPropertyBadges } from "@/lib/property-badges";
import { directPricePerNightUsd, formatUsd } from "@/lib/pricing";

type Props = {
  property: Property;
};

export function PropertyCard({ property: p }: Props) {
  const image = p.images[0];
  const directUsd = directPricePerNightUsd(p.basePricePerNightUsd);
  const badges = getPropertyBadges(p);

  return (
    <article className="card card-hover group">
      <Link href={`/propiedades/${p.slug}`} className="block">
        <div className="relative aspect-[16/10] overflow-hidden bg-sand-dark">
          <Image
            src={image?.src ?? "/properties/placeholder-1.svg"}
            alt={image?.alt ?? p.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-x-0 top-0 flex justify-between gap-2 p-3">
            <span className="badge badge-ocean shadow-sm">{p.location.area}</span>
            <span className="badge badge-accent shadow-sm">Reserva directa</span>
          </div>
        </div>
        <div className="p-5">
          <h2 className="font-display text-xl font-semibold leading-tight text-ink">{p.name}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {p.shortDescription}
          </p>
          <div className="mt-3">
            <PropertyBadgeList badges={badges} />
          </div>
          <div className="mt-4 flex items-end justify-between gap-3 border-t border-sand-dark pt-4">
            <p className="text-sm">
              <span className="font-display text-2xl font-semibold text-ocean">
                ${formatUsd(directUsd)}
              </span>
              <span className="block text-xs text-muted">por noche · USD</span>
            </p>
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-ocean group-hover:underline">
              Ver ficha
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
