"use client";

import Image from "next/image";
import type { BedroomCard } from "@/lib/property-photo-groups";

type Props = {
  bedrooms: BedroomCard[];
  onOpenPhoto?: (index: number) => void;
};

export function PropertyBedroomsCarousel({ bedrooms, onOpenPhoto }: Props) {
  if (bedrooms.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">¿Dónde vas a dormir?</h2>
      <div className="scrollbar-none -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1">
        {bedrooms.map((bedroom) => (
          <button
            key={bedroom.id}
            type="button"
            onClick={() => onOpenPhoto?.(bedroom.globalIndex)}
            className="w-44 shrink-0 text-left"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand-dark">
              <Image
                src={bedroom.image.src}
                alt={bedroom.image.alt}
                fill
                className="object-cover"
                sizes="176px"
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{bedroom.title}</p>
            <p className="mt-0.5 text-sm text-muted">{bedroom.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
