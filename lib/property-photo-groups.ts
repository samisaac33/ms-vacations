export type GalleryImage = { src: string; alt: string };

export type PhotoSection = {
  id: string;
  title: string;
  images: { image: GalleryImage; globalIndex: number }[];
};

export type BedroomCard = {
  id: string;
  title: string;
  subtitle: string;
  image: GalleryImage;
  globalIndex: number;
};

const SECTION_ORDER = [
  "exterior",
  "piscina",
  "sala",
  "comedor",
  "cocina",
  "bar",
  "interior",
  "balcon",
  "rooftop",
  "garaje",
  "bano-social",
  "bbq",
  "adicional",
] as const;

const SECTION_TITLES: Record<string, string> = {
  exterior: "Exterior",
  piscina: "Piscina",
  sala: "Sala",
  comedor: "Comedor",
  cocina: "Cocina completa",
  bar: "Bar",
  interior: "Interior",
  balcon: "Balcón",
  rooftop: "Rooftop",
  garaje: "Garaje",
  "bano-social": "Baño social",
  bbq: "Zona BBQ",
  adicional: "Vistas adicionales",
};

function parseAltCategory(alt: string): { key: string; label: string } {
  const parts = alt.split(" — ");
  const raw = (parts.length > 1 ? parts.slice(1).join(" — ") : alt).trim().toLowerCase();

  const bedroomMatch = raw.match(/^habitación\s+(\d+)/);
  if (bedroomMatch) {
    const num = bedroomMatch[1];
    if (raw.includes("baño")) {
      return { key: `habitacion-${num}`, label: `Habitación ${num}` };
    }
    return { key: `habitacion-${num}`, label: `Habitación ${num}` };
  }

  if (raw.startsWith("exterior")) return { key: "exterior", label: SECTION_TITLES.exterior };
  if (raw.startsWith("piscina")) return { key: "piscina", label: SECTION_TITLES.piscina };
  if (raw.startsWith("sala")) return { key: "sala", label: SECTION_TITLES.sala };
  if (raw.startsWith("comedor")) return { key: "comedor", label: SECTION_TITLES.comedor };
  if (raw.startsWith("cocina")) return { key: "cocina", label: SECTION_TITLES.cocina };
  if (raw.startsWith("bar")) return { key: "bar", label: SECTION_TITLES.bar };
  if (raw.startsWith("interior")) return { key: "interior", label: SECTION_TITLES.interior };
  if (raw.startsWith("balcón") || raw.startsWith("balcon"))
    return { key: "balcon", label: SECTION_TITLES.balcon };
  if (raw.startsWith("rooftop")) return { key: "rooftop", label: SECTION_TITLES.rooftop };
  if (raw.startsWith("garaje")) return { key: "garaje", label: SECTION_TITLES.garaje };
  if (raw.startsWith("baño social") || raw.startsWith("bano social"))
    return { key: "bano-social", label: SECTION_TITLES["bano-social"] };
  if (raw.startsWith("zona bbq") || raw.startsWith("bbq"))
    return { key: "bbq", label: SECTION_TITLES.bbq };
  if (raw.startsWith("vista adicional")) return { key: "adicional", label: SECTION_TITLES.adicional };

  const slug = raw.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "otros";
  return { key: slug, label: raw.charAt(0).toUpperCase() + raw.slice(1) };
}

function sectionSortKey(key: string): number {
  const bedroomMatch = key.match(/^habitacion-(\d+)$/);
  if (bedroomMatch) {
    return 1000 + Number(bedroomMatch[1]);
  }
  const idx = SECTION_ORDER.indexOf(key as (typeof SECTION_ORDER)[number]);
  return idx >= 0 ? idx : 500;
}

export function groupPropertyPhotos(images: GalleryImage[]): PhotoSection[] {
  const buckets = new Map<string, PhotoSection>();

  images.forEach((image, globalIndex) => {
    const { key, label } = parseAltCategory(image.alt);
    const existing = buckets.get(key);
    if (existing) {
      existing.images.push({ image, globalIndex });
    } else {
      buckets.set(key, {
        id: key,
        title: label,
        images: [{ image, globalIndex }],
      });
    }
  });

  return [...buckets.values()].sort((a, b) => sectionSortKey(a.id) - sectionSortKey(b.id));
}

export function getBedroomCards(images: GalleryImage[]): BedroomCard[] {
  const bedrooms = new Map<string, BedroomCard>();

  images.forEach((image, globalIndex) => {
    const { key, label } = parseAltCategory(image.alt);
    const bedroomMatch = key.match(/^habitacion-(\d+)$/);
    if (!bedroomMatch) return;

    const isBathroom = image.alt.toLowerCase().includes("baño");
    const existing = bedrooms.get(key);

    if (!existing) {
      bedrooms.set(key, {
        id: key,
        title: label,
        subtitle: isBathroom ? "Baño privado" : image.alt.split(" — ").pop() ?? label,
        image,
        globalIndex,
      });
      return;
    }

    if (!isBathroom && existing.subtitle === "Baño privado") {
      existing.image = image;
      existing.globalIndex = globalIndex;
      existing.subtitle = image.alt.split(" — ").pop() ?? label;
    }
  });

  return [...bedrooms.values()].sort(
    (a, b) => sectionSortKey(a.id) - sectionSortKey(b.id),
  );
}
