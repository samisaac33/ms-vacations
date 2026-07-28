"use client";

import Link from "next/link";
import { useState } from "react";
import { PropertyAvailabilityModal } from "@/components/property-availability-modal";
import { PropertyBadgeList } from "@/components/property-badge-list";
import { PropertyCardImageCarousel } from "@/components/property-card-image-carousel";
import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/properties";
import { getPropertyBadges } from "@/lib/property-badges";
import {
  CATALOG_CARD_SAVINGS_PERCENT,
  catalogDisplayPriceUsd,
  catalogDisplayReferenceUsd,
  formatUsd,
} from "@/lib/pricing";

function BeachfrontIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 14c2-1 4-1 6 0s4 1 6 0 4-1 6 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M2 18c2-1 4-1 6 0s4 1 6 0 4-1 6 0"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

type Props = {
  property: Property;
  stayQuery?: string;
  hasStay?: boolean;
  quote?: {
    nights: number;
    totalUsd: number;
  } | null;
};

export function PropertyCard({
  property: p,
  stayQuery = "",
  hasStay = false,
  quote = null,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const badges = getPropertyBadges(p);
  const referenceUsd = catalogDisplayReferenceUsd(p.slug);
  const displayUsd = catalogDisplayPriceUsd(p.slug);
  const detailHref = `/propiedades/${p.slug}${stayQuery}`;
  const showStayPricing = hasStay && quote != null;
  const nights = quote?.nights;
  const totalUsd = quote?.totalUsd;
  const avgPerNightUsd =
    showStayPricing && nights && totalUsd != null ? Math.round(totalUsd / nights) : null;

  return (
    <article className="card card-hover group flex w-full min-w-0 flex-col">
      <PropertyCardImageCarousel
        images={p.images}
        propertyName={p.name}
        detailHref={detailHref}
      >
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <span className="badge badge-ocean shadow-sm">{p.location.area}</span>
        </div>
        {p.beachfront && (
          <div className="absolute inset-x-0 bottom-0 p-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ocean shadow-sm">
              <BeachfrontIcon />
              Frente al mar
            </span>
          </div>
        )}
      </PropertyCardImageCarousel>

      <Link href={detailHref} className="block min-w-0">
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="font-display min-w-0 text-xl font-semibold leading-tight text-ink">
              {p.name}
            </h2>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="rounded-full bg-ocean-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ocean">
                Reserva directa
              </span>
              <span className="rounded-full bg-coral px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                {CATALOG_CARD_SAVINGS_PERCENT}% off
              </span>
            </div>
          </div>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {p.shortDescription}
          </p>
          <div className="mt-3">
            <PropertyBadgeList badges={badges} />
          </div>
        </div>
      </Link>

      <div className="mt-4 border-t border-sand-dark p-4 pt-3 sm:p-5 sm:pt-4">
        {showStayPricing && nights != null && totalUsd != null ? (
          <div className="flex items-center justify-between gap-3 sm:items-end">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="font-display text-2xl font-semibold leading-none text-ocean">
                  ${formatUsd(totalUsd)}
                </span>
                <span className="text-sm text-muted">total · USD</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {nights} {nights === 1 ? "noche" : "noches"} · reserva directa
              </p>
              {avgPerNightUsd != null && (
                <p className="mt-0.5 text-xs text-muted">~${formatUsd(avgPerNightUsd)}/noche</p>
              )}
            </div>
            <Button
              href={`/reservar/${p.slug}${stayQuery}`}
              className="h-9 shrink-0 rounded-full px-4 text-xs font-semibold"
            >
              Reservar
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                {referenceUsd > displayUsd && (
                  <span className="text-sm font-medium text-coral/75 line-through decoration-coral/50">
                    ${formatUsd(referenceUsd)}
                  </span>
                )}
                <span className="font-display text-2xl font-semibold leading-none text-ocean">
                  ${formatUsd(displayUsd)}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted">por noche · USD</p>
            </div>
            <Button
              type="button"
              className="h-11 w-full rounded-full text-sm font-semibold"
              onClick={() => setModalOpen(true)}
            >
              Ver disponibilidad
            </Button>
          </div>
        )}
      </div>

      {!showStayPricing && (
        <PropertyAvailabilityModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          slug={p.slug}
          propertyName={p.name}
        />
      )}
    </article>
  );
}
