import Image from "next/image";
import Link from "next/link";
import { formatUsd } from "@/lib/pricing";

export type DestinationCard = {
  id: "beach" | "city";
  name: string;
  tagline: string;
  href: string;
  image: { src: string; alt: string };
  propertyCount: number;
  priceFromUsd: number;
};

type Props = {
  destinations: DestinationCard[];
};

export function HomeDestinationPicker({ destinations }: Props) {
  if (destinations.length === 0) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {destinations.map((destination) => (
        <Link
          key={destination.id}
          href={destination.href}
          className="card group relative overflow-hidden transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-[16/10]">
            <Image
              src={destination.image.src}
              alt={destination.image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/25 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              {destination.id === "beach" ? "Costa · Manabí" : "Ciudad · Manabí"}
            </p>
            <h3 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {destination.name}
            </h3>
            <p className="mt-1 text-sm text-white/90">{destination.tagline}</p>
            <p className="mt-3 text-sm font-medium">
              {destination.propertyCount}{" "}
              {destination.propertyCount === 1 ? "alojamiento" : "alojamientos"} · desde $
              {formatUsd(destination.priceFromUsd)}/noche
            </p>
            <span className="mt-3 inline-flex text-sm font-semibold underline-offset-4 group-hover:underline">
              Ver alojamientos →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
