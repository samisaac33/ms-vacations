import { rangeOverlapsAny, type DateRange } from "@/lib/availability-utils";
import { getBlocksByPropertySlugs } from "@/lib/availability-query";
import { hasDatabase } from "@/db/index";
import type { Property } from "@/lib/properties";

export function propertyAvailableForStay(
  checkIn: string,
  checkOut: string,
  blocks: DateRange[],
  maxGuests?: number,
  propertyGuests?: number,
): boolean {
  if (maxGuests !== undefined && propertyGuests !== undefined && maxGuests > propertyGuests) {
    return false;
  }
  return !rangeOverlapsAny(checkIn, checkOut, blocks);
}

export async function filterPropertiesByStay(
  properties: Property[],
  checkIn: string,
  checkOut: string,
  guests?: number,
): Promise<Property[]> {
  if (!hasDatabase() || properties.length === 0) return properties;

  const blocksBySlug = await getBlocksByPropertySlugs(properties.map((p) => p.slug));

  return properties.filter((property) => {
    const blocks = blocksBySlug.get(property.slug) ?? [];
    return propertyAvailableForStay(
      checkIn,
      checkOut,
      blocks,
      guests,
      property.capacity.guests,
    );
  });
}
