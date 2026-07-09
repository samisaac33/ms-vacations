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

function propertyLabel(count: number, id: "beach" | "city") {
  if (count === 1) return id === "beach" ? "casa" : "apartamento";
  return id === "beach" ? "casas" : "apartamentos";
}

export function HomeDestinationPicker({ destinations }: Props) {
  if (destinations.length === 0) return null;

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {destinations.map((destination) => (
        <Link
          key={destination.id}
          href={destination.href}
          className="card card-hover group relative overflow-hidden"
        >
          <div className="relative aspect-[16/10]">
            <Image
              src={destination.image.src}
              alt={destination.image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ocean shadow-sm">
              {destination.id === "beach" ? "Playa" : "Ciudad"}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-white sm:p-5">
            <div className="min-w-0">
              <h3 className="font-display text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
                {destination.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-white/90">
                {destination.propertyCount} {propertyLabel(destination.propertyCount, destination.id)} ·
                desde ${formatUsd(destination.priceFromUsd)}
              </p>
            </div>
            <span
              aria-hidden
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ocean shadow-md transition-transform group-hover:scale-105"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
