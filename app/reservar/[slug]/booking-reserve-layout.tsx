"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BANK_TRANSFER_DISCOUNT_PERCENT,
  formatUsd,
  totalUsdForPaymentMethod,
} from "@/lib/pricing";
import type { PaymentMethod } from "@/lib/payments/types";
import { BookingForm, type BookingPricingState } from "./booking-form";

type PropertySummary = {
  slug: string;
  name: string;
  area: string;
  guests: number;
  bedrooms: number;
  baseDirectUsd: number;
  image?: { src: string; alt: string };
};

type Props = {
  slug: string;
  maxGuests: number;
  property: PropertySummary;
};

function perNightLabel(pricing: BookingPricingState, baseDirectUsd: number): string {
  if (pricing.quoteLoading) return "Calculando…";
  const { quote } = pricing;
  if (!quote) return `~$${formatUsd(baseDirectUsd)}`;

  const directAmounts = [...new Set(quote.nightly.map((n) => n.directCents))];
  if (directAmounts.length === 1) {
    return `$${formatUsd(directAmounts[0]! / 100)}`;
  }
  return "Variable";
}

export function BookingReserveLayout({ slug, maxGuests, property }: Props) {
  const [pricing, setPricing] = useState<BookingPricingState>({
    quote: null,
    quoteLoading: false,
    paymentMethod: "bank_transfer",
  });

  const totalUsd =
    pricing.quote !== null
      ? totalUsdForPaymentMethod(pricing.quote.totalDirectCents, pricing.paymentMethod)
      : null;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-start">
      <BookingForm slug={slug} maxGuests={maxGuests} onPricingChange={setPricing} />

      <aside className="lg:sticky lg:top-24">
        <div className="card overflow-hidden">
          {property.image && (
            <div className="relative aspect-[16/10] bg-sand-dark">
              <Image
                src={property.image.src}
                alt={property.image.alt}
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>
          )}
          <div className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-ocean">{property.area}</p>
            <h2 className="mt-1 font-semibold leading-snug text-ink">{property.name}</h2>

            <dl className="mt-4 space-y-3 border-t border-sand-dark pt-4 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">{pricing.quote ? "Tarifa directa" : "Desde"}</dt>
                <dd className="text-right font-semibold text-ink">
                  {perNightLabel(pricing, property.baseDirectUsd)}
                  <span className="font-normal text-muted"> / noche</span>
                </dd>
              </div>

              {totalUsd !== null && !pricing.quoteLoading && (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">
                    Total
                    {pricing.paymentMethod === "bank_transfer" ? " (transferencia)" : ""}
                  </dt>
                  <dd className="font-semibold text-ink">${formatUsd(totalUsd)} USD</dd>
                </div>
              )}

              {pricing.quote && pricing.quote.nights > 1 && (
                <div className="flex justify-between gap-2 text-xs">
                  <dt className="text-muted">Estancia</dt>
                  <dd className="text-ink">
                    {pricing.quote.nights} {pricing.quote.nights === 1 ? "noche" : "noches"}
                  </dd>
                </div>
              )}

              {pricing.paymentMethod === "bank_transfer" && pricing.quote && (
                <div className="flex justify-between gap-2 text-xs">
                  <dt className="text-muted">Transferencia</dt>
                  <dd className="text-ocean">−{BANK_TRANSFER_DISCOUNT_PERCENT}% off</dd>
                </div>
              )}

              <div className="flex justify-between gap-2">
                <dt className="text-muted">Capacidad</dt>
                <dd className="text-ink">
                  {property.guests} huéspedes · {property.bedrooms} dorm.
                </dd>
              </div>
            </dl>

            <Button href={`/propiedades/${property.slug}`} variant="secondary" className="mt-5 w-full text-sm">
              Ver ficha completa
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
