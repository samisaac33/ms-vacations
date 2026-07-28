"use client";

import Image from "next/image";
import { useState } from "react";
import type { BedroomCard } from "@/lib/property-photo-groups";

type Props = {
  bedrooms: BedroomCard[];
  onOpenPhoto?: (index: number) => void;
};

const CARDS_PER_PAGE = 2;

function BedroomCardButton({
  bedroom,
  onOpenPhoto,
  className,
  imageSizes,
}: {
  bedroom: BedroomCard;
  onOpenPhoto?: (index: number) => void;
  className?: string;
  imageSizes: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpenPhoto?.(bedroom.globalIndex)}
      className={`text-left ${className ?? ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-sand-dark">
        <Image
          src={bedroom.image.src}
          alt={bedroom.image.alt}
          fill
          className="object-cover"
          sizes={imageSizes}
        />
      </div>
      <p className="mt-2 text-sm font-semibold text-ink">{bedroom.title}</p>
      <p className="mt-0.5 text-sm text-muted">{bedroom.subtitle}</p>
    </button>
  );
}

function CarouselNavButton({
  direction,
  disabled,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink transition hover:bg-sand disabled:cursor-not-allowed disabled:opacity-35"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d={direction === "prev" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function PropertyBedroomsCarousel({ bedrooms, onOpenPhoto }: Props) {
  const [page, setPage] = useState(0);

  if (bedrooms.length === 0) return null;

  const pageCount = Math.ceil(bedrooms.length / CARDS_PER_PAGE);
  const pageStart = page * CARDS_PER_PAGE;
  const visibleBedrooms = bedrooms.slice(pageStart, pageStart + CARDS_PER_PAGE);

  return (
    <section>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-ink">¿Dónde vas a dormir?</h2>

        {pageCount > 1 && (
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-sm text-muted">
              {page + 1} / {pageCount}
            </span>
            <CarouselNavButton
              direction="prev"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              label="Habitaciones anteriores"
            />
            <CarouselNavButton
              direction="next"
              disabled={page >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              label="Habitaciones siguientes"
            />
          </div>
        )}
      </div>

      <div className="scrollbar-none -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:hidden">
        {bedrooms.map((bedroom) => (
          <BedroomCardButton
            key={bedroom.id}
            bedroom={bedroom}
            onOpenPhoto={onOpenPhoto}
            className="w-44 shrink-0"
            imageSizes="176px"
          />
        ))}
      </div>

      <div className="mt-4 hidden grid-cols-2 gap-4 lg:grid">
        {visibleBedrooms.map((bedroom) => (
          <BedroomCardButton
            key={bedroom.id}
            bedroom={bedroom}
            onOpenPhoto={onOpenPhoto}
            imageSizes="(max-width: 1280px) 40vw, 320px"
          />
        ))}
      </div>
    </section>
  );
}
