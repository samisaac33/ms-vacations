import Image from "next/image";
import Link from "next/link";
import type { DestinationRecord } from "@/lib/catalog";

interface DestinationPickerProps {
  destinations: DestinationRecord[];
}

export function DestinationPicker({ destinations }: DestinationPickerProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {destinations.map((destination, index) => (
        <Link
          key={destination.id}
          href={`#${destination.id}`}
          className="card-hover group relative overflow-hidden rounded-2xl"
          style={{ animationDelay: `${index * 80}ms` }}
        >
          <div className="relative aspect-[16/10]">
            <Image
              src={destination.image}
              alt={`Alojamientos en ${destination.name}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
              {destination.vibe === "playa" ? "Costa · Manabí" : "Ciudad · Manabí"}
            </p>
            <h3 className="font-display mt-1 text-2xl font-semibold md:text-3xl">
              {destination.name}
            </h3>
            <p className="mt-1 text-sm text-white/90">{destination.tagline}</p>
            <p className="mt-3 text-sm font-medium">
              Desde ${destination.priceFrom}/noche
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold underline-offset-4 group-hover:underline">
              Ver alojamientos →
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
