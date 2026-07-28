"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { PropertyDetailModal } from "@/components/property-detail-modal";
import {
  getCancellationPreview,
  getHouseRulesDetail,
  getHouseRulesPreview,
  getSafetyDetail,
  getSafetyPreview,
} from "@/lib/property-things-to-know-content";
import type { Property } from "@/lib/properties";

type Props = {
  property: Property;
  propertySlug: string;
  rules: string[];
  checkIn?: string;
  checkOut?: string;
  onAddDates?: () => void;
};

function CalendarIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3v4M16 3v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11 15h10M17 15v-3M20 15v-2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 4v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V7l7-4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThingsColumn({
  icon,
  title,
  lines,
  ctaLabel,
  onCtaClick,
  ctaHref,
}: {
  icon: ReactNode;
  title: string;
  lines: string[];
  ctaLabel: string;
  onCtaClick?: () => void;
  ctaHref?: string;
}) {
  return (
    <div>
      <div className="text-ink">{icon}</div>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      <div className="mt-3 space-y-1 text-sm leading-relaxed text-muted">
        {lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      {ctaHref ? (
        <Link
          href={ctaHref}
          className="mt-4 inline-block text-sm font-semibold text-ink underline underline-offset-2"
        >
          {ctaLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onCtaClick}
          className="mt-4 text-sm font-semibold text-ink underline underline-offset-2"
        >
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

export function PropertyThingsToKnow({
  property,
  propertySlug,
  rules,
  checkIn,
  checkOut,
  onAddDates,
}: Props) {
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [safetyModalOpen, setSafetyModalOpen] = useState(false);

  const cancellation = getCancellationPreview({ checkIn, checkOut });
  const houseRules = getHouseRulesPreview(rules, propertySlug);
  const safety = getSafetyPreview(property);
  const houseRulesDetail = getHouseRulesDetail(rules, propertySlug);
  const safetyDetail = getSafetyDetail(property);

  return (
    <>
      <section className="border-t border-b border-sand-dark py-10">
        <h2 className="text-xl font-semibold text-ink">Lo que debes saber</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3 md:gap-8">
          <ThingsColumn
            icon={<CalendarIcon />}
            title={cancellation.title}
            lines={cancellation.lines}
            ctaLabel={cancellation.ctaLabel}
            ctaHref={cancellation.ctaKind === "link" ? cancellation.ctaHref : undefined}
            onCtaClick={cancellation.ctaKind === "add-dates" ? onAddDates : undefined}
          />
          <ThingsColumn
            icon={<KeyIcon />}
            title={houseRules.title}
            lines={houseRules.lines}
            ctaLabel={houseRules.ctaLabel}
            onCtaClick={() => setRulesModalOpen(true)}
          />
          <ThingsColumn
            icon={<ShieldIcon />}
            title={safety.title}
            lines={safety.lines}
            ctaLabel={safety.ctaLabel}
            onCtaClick={() => setSafetyModalOpen(true)}
          />
        </div>
      </section>

      <PropertyDetailModal
        open={rulesModalOpen}
        title="Reglas de la casa"
        onClose={() => setRulesModalOpen(false)}
      >
        {houseRulesDetail.rules.length > 0 && (
          <div>
            <p className="font-semibold text-ink">Reglas del alojamiento</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
              {houseRulesDetail.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={houseRulesDetail.rules.length > 0 ? "mt-6" : ""}>
          <p className="font-semibold text-ink">Reglas adicionales</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {houseRulesDetail.additionalRules.visitorsAndEvents}
          </p>
          <p className="mt-4 text-sm font-semibold text-ink">
            {houseRulesDetail.additionalRules.lateCheckoutTitle}
          </p>
          <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted">
            {houseRulesDetail.additionalRules.lateCheckoutRules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ol>
        </div>

        {houseRulesDetail.guaranteeText && (
          <div className="mt-6 border-t border-sand-dark pt-6">
            <p className="font-semibold text-ink">Garantía reembolsable</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {houseRulesDetail.guaranteeText}
            </p>
            <Link
              href="/garantia"
              className="mt-2 inline-block text-sm font-medium text-ocean hover:underline"
            >
              Ver política de garantía
            </Link>
          </div>
        )}
      </PropertyDetailModal>

      <PropertyDetailModal
        open={safetyModalOpen}
        title="Seguridad y propiedad"
        onClose={() => setSafetyModalOpen(false)}
      >
        {safetyDetail.fallback ? (
          <p className="text-sm leading-relaxed text-muted">
            Reserva directa con confirmación por MS Vacations. Consulta normas de uso al confirmar
            tu estadía.
          </p>
        ) : (
          <>
            {safetyDetail.included.length > 0 && (
              <div>
                <p className="font-semibold text-ink">En la propiedad</p>
                <ul className="mt-2 space-y-3 text-sm text-muted">
                  {safetyDetail.included.map((item) => (
                    <li key={item.label}>
                      <p className="font-medium text-ink">{item.label}</p>
                      {item.detail ? <p className="mt-0.5">{item.detail}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {safetyDetail.notIncluded.length > 0 && (
              <div className={safetyDetail.included.length > 0 ? "mt-6" : ""}>
                <p className="font-semibold text-ink">No incluido o no disponible</p>
                <ul className="mt-2 space-y-3 text-sm text-muted">
                  {safetyDetail.notIncluded.map((item) => (
                    <li key={item.label}>
                      <p className="font-medium text-ink">{item.label}</p>
                      {item.detail ? <p className="mt-0.5">{item.detail}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </PropertyDetailModal>
    </>
  );
}
