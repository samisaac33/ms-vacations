import type { Property } from "@/lib/properties";

export type PropertyBadgeTone = "ocean" | "accent" | "neutral";

export type PropertyBadge = {
  label: string;
  tone: PropertyBadgeTone;
};

type CatalogBadgeDef = {
  label: string;
  tone?: PropertyBadgeTone;
};

const CATALOG_BADGES_BY_SLUG: Record<string, CatalogBadgeDef[]> = {
  "alojamiento-en-arrecife": [
    { label: "Piscina privada", tone: "accent" },
    { label: "Hidromasaje", tone: "accent" },
    { label: "Wi‑Fi", tone: "neutral" },
    { label: "Cocina equipada", tone: "neutral" },
    { label: "Llegada autónoma", tone: "accent" },
    { label: "Aire acondicionado", tone: "neutral" },
    { label: "Estacionamiento", tone: "neutral" },
  ],
  "casa-vacacional-home-one-18-personas-max": [
    { label: "A 300 m del mar", tone: "accent" },
    { label: "Piscina privada", tone: "accent" },
    { label: "Hidromasaje", tone: "accent" },
    { label: "Mesa de billar", tone: "accent" },
    { label: "BBQ exclusivo", tone: "accent" },
    { label: "Aire acondicionado", tone: "neutral" },
    { label: "Wi‑Fi", tone: "neutral" },
  ],
  "casa-vacacional-home-two-21-personas": [
    { label: "A 450 m del mar", tone: "accent" },
    { label: "Piscina privada", tone: "accent" },
    { label: "Mesa de billar", tone: "accent" },
    { label: "Futbolín", tone: "accent" },
    { label: "BBQ / Parrilla", tone: "accent" },
    { label: "Wi‑Fi", tone: "neutral" },
  ],
  "casa-rustica-18-personas-max": [
    { label: "Piscina", tone: "accent" },
    { label: "Estilo rústico", tone: "accent" },
    { label: "Vista al océano", tone: "accent" },
    { label: "Acceso a la playa", tone: "accent" },
    { label: "Mesa de billar", tone: "accent" },
    { label: "Wi‑Fi", tone: "neutral" },
  ],
  "home-luxury-la-punta-18-personas-max": [
    { label: "Frente al mar", tone: "accent" },
    { label: "Piscina y jacuzzi", tone: "accent" },
    { label: "Acceso a la playa", tone: "accent" },
    { label: "Mesa de billar", tone: "accent" },
    { label: "Wi‑Fi", tone: "neutral" },
  ],
  "villa-palmera": [
    { label: "Piscina central", tone: "accent" },
    { label: "Jacuzzi", tone: "accent" },
    { label: "Comedor al aire libre", tone: "accent" },
    { label: "Parrilla", tone: "accent" },
    { label: "Llegada autónoma", tone: "neutral" },
  ],
  "porto-norte": [
    { label: "Frente al mar", tone: "accent" },
    { label: "Piscina privada", tone: "accent" },
    { label: "Vistas al océano", tone: "accent" },
    { label: "BBQ", tone: "accent" },
    { label: "Wi‑Fi", tone: "neutral" },
  ],
  "las-hamacas-portoviejo": [
    { label: "Piscina privada", tone: "accent" },
    { label: "Parrilla", tone: "accent" },
    { label: "Baño privado c/hab.", tone: "neutral" },
    { label: "Llegada autónoma", tone: "neutral" },
    { label: "Ciudad", tone: "neutral" },
  ],
  "los-pinos-portoviejo": [
    { label: "Piscina en L", tone: "accent" },
    { label: "Jacuzzi", tone: "accent" },
    { label: "Comedor exterior", tone: "accent" },
    { label: "Parrilla", tone: "accent" },
    { label: "Ciudad", tone: "neutral" },
  ],
  "container-stay-1-san-clemente": [
    { label: "Container Stay", tone: "accent" },
    { label: "Estacionamiento gratuito", tone: "accent" },
    { label: "Aire acondicionado", tone: "neutral" },
    { label: "Cocina equipada", tone: "neutral" },
    { label: "Wi‑Fi", tone: "neutral" },
  ],
  "container-stay-2-san-clemente": [
    { label: "Container Stay", tone: "accent" },
    { label: "Estacionamiento gratuito", tone: "accent" },
    { label: "Aire acondicionado", tone: "neutral" },
    { label: "Cocina equipada", tone: "neutral" },
    { label: "Wi‑Fi", tone: "neutral" },
  ],
};

const AMENITY_KEYWORD_PRIORITY: { pattern: RegExp; label: string; tone: PropertyBadgeTone }[] = [
  { pattern: /frente.*(playa|mar)|vistas?\s+al\s+(mar|oc[eé]ano)/i, label: "", tone: "accent" },
  { pattern: /piscina/i, label: "Piscina", tone: "accent" },
  { pattern: /jacuzzi|hidromasaje/i, label: "Jacuzzi", tone: "accent" },
  { pattern: /billar/i, label: "Mesa de billar", tone: "accent" },
  { pattern: /futbol[ií]n/i, label: "Futbolín", tone: "accent" },
  { pattern: /bbq|parrilla/i, label: "BBQ", tone: "accent" },
  { pattern: /aire\s+acondicionado/i, label: "Aire acondicionado", tone: "neutral" },
  { pattern: /wi.?fi/i, label: "Wi‑Fi", tone: "neutral" },
  { pattern: /estacionamiento/i, label: "Estacionamiento", tone: "neutral" },
  { pattern: /cocina/i, label: "Cocina equipada", tone: "neutral" },
];

function capacityBadge(property: Property): PropertyBadge {
  return {
    label: `Hasta ${property.capacity.guests} huéspedes`,
    tone: "ocean",
  };
}

function dedupeBadges(badges: PropertyBadge[]): PropertyBadge[] {
  const unique = new Map<string, PropertyBadge>();
  for (const badge of badges) {
    unique.set(badge.label, badge);
  }
  return [...unique.values()];
}

function curatedBadges(property: Property): PropertyBadge[] {
  const defs = CATALOG_BADGES_BY_SLUG[property.slug];
  if (!defs) return [];

  return defs.map(({ label, tone = "neutral" }) => ({ label, tone }));
}

function fallbackBadges(property: Property): PropertyBadge[] {
  const badges: PropertyBadge[] = [];

  if (property.highlights?.length) {
    for (const highlight of property.highlights) {
      badges.push({ label: highlight.title, tone: "accent" });
    }
  }

  for (const amenity of property.amenities) {
    for (const rule of AMENITY_KEYWORD_PRIORITY) {
      if (!rule.pattern.test(amenity)) continue;

      const label = rule.label || amenity;
      badges.push({ label, tone: rule.tone });
      break;
    }
  }

  if (property.destination === "city" && !badges.some((b) => b.label === "Ciudad")) {
    badges.push({ label: "Ciudad", tone: "neutral" });
  }

  return badges;
}

export function getPropertyBadges(property: Property, max?: number): PropertyBadge[] {
  const curated = curatedBadges(property);
  const extras = curated.length > 0 ? curated : fallbackBadges(property);
  const badges = dedupeBadges([capacityBadge(property), ...extras]);

  return max != null ? badges.slice(0, max) : badges;
}
