import Link from "next/link";
import type { Property } from "@/lib/properties";
import { PropertyCard } from "@/components/property-card";

type Props = {
  id: string;
  heading: string;
  subtitle: string;
  properties: Property[];
  showDiscountNote?: boolean;
  stayQuery?: string;
  emptyMessage?: string;
};

export function DestinationPropertySection({
  id,
  heading,
  subtitle,
  properties,
  showDiscountNote = true,
  stayQuery = "",
  emptyMessage,
}: Props) {
  if (properties.length === 0) {
    if (!emptyMessage) return null;
    return (
      <section id={id} className="scroll-mt-36">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {heading}
          </h2>
          <p className="mt-2 text-muted">{subtitle}</p>
        </div>
        <p className="mt-8 rounded-2xl border border-sand-dark bg-sand-dark/50 px-5 py-4 text-sm text-muted">
          {emptyMessage}
        </p>
      </section>
    );
  }

  return (
    <section id={id} className="scroll-mt-36">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{heading}</h2>
        <p className="mt-2 text-muted">
          {subtitle}
          {showDiscountNote && <> Precios en USD por noche (reserva directa).</>}
        </p>
      </div>
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => (
          <li key={p.id}>
            <PropertyCard property={p} stayQuery={stayQuery} />
          </li>
        ))}
      </ul>
    </section>
  );
}

type CatalogHeaderProps = {
  title: string;
  subtitle: string;
  catalogPath: string;
  seeAllLabel: string;
};

export function CatalogSectionHeader({ title, subtitle, catalogPath, seeAllLabel }: CatalogHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h2>
        <p className="mt-2 text-muted">{subtitle}</p>
      </div>
      <Link href={catalogPath} className="text-sm font-medium text-ocean hover:underline">
        {seeAllLabel}
      </Link>
    </div>
  );
}
