"use client";

import { useState } from "react";
import { PropertyDetailModal, ShowMoreButton } from "@/components/property-detail-modal";
import {
  flattenAmenities,
  PREVIEW_AMENITY_COUNT,
  resolveAmenityGroups,
  shouldShowAmenitiesMore,
  totalAmenityCount,
} from "@/lib/property-detail-content";
import { getAmenityIcon } from "@/lib/property-amenity-icons";
import type { Property, PropertyAmenityGroups, PropertyAmenityItem } from "@/lib/properties";

type Props = {
  property: Property;
};

function AmenityRow({ item }: { item: PropertyAmenityItem }) {
  const Icon = getAmenityIcon(item.label);
  return (
    <li className="flex items-start gap-4">
      <span className="mt-0.5 shrink-0 text-ink">
        <Icon />
      </span>
      <div>
        <span className="text-base text-ink">{item.label}</span>
        {item.detail ? <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p> : null}
      </div>
    </li>
  );
}

function AmenityList({ items, grid = false }: { items: PropertyAmenityItem[]; grid?: boolean }) {
  return (
    <ul className={grid ? "mt-4 grid gap-4 sm:grid-cols-2" : "mt-4 space-y-4"}>
      {items.map((item) => (
        <AmenityRow key={item.label} item={item} />
      ))}
    </ul>
  );
}

function AmenityGroupsContent({ groups }: { groups: PropertyAmenityGroups }) {
  return (
    <div className="space-y-8">
      {groups.categories.map((category) => (
        <section key={category.title}>
          <h3 className="text-lg font-semibold text-ink">{category.title}</h3>
          <ul className="mt-2 divide-y divide-sand-dark">
            {category.items.map((item) => (
              <AmenityRow key={`${category.title}-${item.label}`} item={item} />
            ))}
          </ul>
        </section>
      ))}

      {groups.notIncluded && groups.notIncluded.length > 0 ? (
        <section>
          <h3 className="text-lg font-semibold text-muted">No incluidos</h3>
          <ul className="mt-2 divide-y divide-sand-dark">
            {groups.notIncluded.map((item) => (
              <li key={item.label} className="flex items-start gap-4 py-4 opacity-60">
                <span className="mt-0.5 shrink-0 text-muted">
                  <UnavailableIcon />
                </span>
                <div>
                  <span className="text-base text-muted line-through">{item.label}</span>
                  {item.detail ? (
                    <p className="mt-1 text-sm leading-relaxed text-muted no-underline">{item.detail}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function UnavailableIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function PropertyAmenitiesPanel({ property }: Props) {
  const [open, setOpen] = useState(false);
  const groups = resolveAmenityGroups(property);
  const allItems = flattenAmenities(groups);
  const total = totalAmenityCount(groups);
  const previewItems = allItems.slice(0, PREVIEW_AMENITY_COUNT);
  const showMore = shouldShowAmenitiesMore(total);

  if (total === 0) return null;

  return (
    <section>
      <h2 className="text-xl font-semibold text-ink">Comodidades</h2>
      <AmenityList items={previewItems} grid />
      {showMore ? (
        <ShowMoreButton
          label={`Mostrar los ${total} servicios`}
          onClick={() => setOpen(true)}
        />
      ) : null}

      <PropertyDetailModal
        open={open}
        title="Comodidades"
        onClose={() => setOpen(false)}
        maxWidthClass="max-w-[780px]"
      >
        <AmenityGroupsContent groups={groups} />
      </PropertyDetailModal>
    </section>
  );
}
