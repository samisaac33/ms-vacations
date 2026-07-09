import type { Property } from "@/lib/properties";

export type PropertyBadgeTone = "ocean" | "accent" | "neutral";

export type PropertyBadge = {
  label: string;
  tone: PropertyBadgeTone;
};

export function getPropertyBadges(property: Property, max = 3): PropertyBadge[] {
  const badges: PropertyBadge[] = [
    { label: `Hasta ${property.capacity.guests} huéspedes`, tone: "ocean" },
  ];

  const hasPool = property.amenities.some((item) => /piscina/i.test(item));
  if (hasPool) {
    badges.push({ label: "Piscina", tone: "accent" });
  }

  if (property.destination === "beach") {
    if (!hasPool) badges.push({ label: "Costa", tone: "accent" });
  } else {
    badges.push({ label: "Ciudad", tone: "neutral" });
  }

  const hasWifi = property.amenities.some((item) => /wi.?fi/i.test(item));
  if (hasWifi) {
    badges.push({ label: "Wi‑Fi", tone: "neutral" });
  }

  const unique = new Map<string, PropertyBadge>();
  for (const badge of badges) {
    unique.set(badge.label, badge);
  }

  return [...unique.values()].slice(0, max);
}
