import type {
  Property,
  PropertyAbout,
  PropertyAmenityGroups,
  PropertyAmenityItem,
} from "@/lib/properties";

export const PREVIEW_AMENITY_COUNT = 8;

export function resolvePropertyAbout(property: Property): PropertyAbout {
  if (property.about) return property.about;
  return { intro: property.description, sections: [] };
}

export function resolveAmenityGroups(property: Property): PropertyAmenityGroups {
  if (property.amenityGroups) return property.amenityGroups;
  return {
    categories: [
      {
        title: "General",
        items: property.amenities.map((label) => ({ label })),
      },
    ],
  };
}

export function flattenAmenities(groups: PropertyAmenityGroups): PropertyAmenityItem[] {
  return groups.categories.flatMap((category) => category.items);
}

export function totalAmenityCount(groups: PropertyAmenityGroups): number {
  return flattenAmenities(groups).length;
}

export function aboutPreviewText(about: PropertyAbout): string {
  const parts = [about.intro];
  const first = about.sections[0];
  if (first?.lead) parts.push(first.lead);
  else if (first?.paragraphs[0]) parts.push(first.paragraphs[0]);
  return parts.join("\n\n");
}

export function shouldShowAboutMore(about: PropertyAbout): boolean {
  if (about.sections.length > 0) return true;
  return about.intro.length > 280;
}

export function shouldShowAmenitiesMore(total: number): boolean {
  return total > PREVIEW_AMENITY_COUNT;
}
