export type PropertyDestination = "beach" | "city";

export type Property = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  destination: PropertyDestination;
  capacity: { guests: number; bedrooms: number; beds: number; bathrooms: number };
  amenities: string[];
  rules: string[];
  location: {
    area: string;
    province: string;
    country: string;
    googleMapsUrl: string;
    coordinates: { lat: number; lng: number };
  };
  /** Precio por noche en USD (catálogo; valor final lo define el admin en BD). */
  basePricePerNightUsd: number;
  icalUrl: string;
  images: { src: string; alt: string }[];
};

const regionMapEmbedUrl =
  "https://www.openstreetmap.org/export/embed.html?bbox=-80.30%2C-0.95%2C-80.15%2C-0.72&layer=mapnik";

/** Enlace compartido en Google Maps (Home One y Home Two). */
const mapsHomeOneTwo = "https://maps.app.goo.gl/GYGPf5TnSTMtAUkR9";
const coordsHomeOneTwo = { lat: -0.7688396, lng: -80.5107063 };

/** Centro urbano de Portoviejo (referencia para mapa destacado). */
const coordsPortoviejoCenter = { lat: -1.0544, lng: -80.4545 };
const mapsPortoviejo = "https://maps.app.goo.gl/?q=Portoviejo,Manab%C3%AD,Ecuador";

export const REGION_MAP_EMBED_URL = regionMapEmbedUrl;

/** Pin en home: listing Google «MS Vacations Home One - Home Two» (~73 reseñas). */
export const HOME_FEATURED_MAP_SLUG = "casa-vacacional-home-one-18-personas-max";
export const HOME_CITY_MAP_SLUG = "apartamento-ms-vacations-portoviejo";

export function getHomeFeaturedMapLocation() {
  const p = PROPERTIES.find((x) => x.slug === HOME_FEATURED_MAP_SLUG);
  if (!p) throw new Error("Propiedad de mapa destacado no encontrada");
  return p.location;
}

export function getHomeCityMapLocation() {
  const p = PROPERTIES.find((x) => x.slug === HOME_CITY_MAP_SLUG);
  if (p) return p.location;
  return {
    area: "Portoviejo",
    province: "Manabí",
    country: "Ecuador",
    googleMapsUrl: mapsPortoviejo,
    coordinates: coordsPortoviejoCenter,
  };
}

const supabase = (file: string) =>
  `https://srtoqhmjydbpmwhyuurw.supabase.co/storage/v1/object/public/MS_VACATIONS/${encodeURIComponent(file)}`;

const placeholderImage = {
  src: "/properties/placeholder-1.svg",
  alt: "MS Vacations — alojamiento en Portoviejo",
};

export const PROPERTIES: Property[] = [
  {
    id: "1",
    slug: "alojamiento-en-arrecife",
    name: "Alojamiento en Arrecife",
    destination: "beach",
    shortDescription:
      "Villa moderna de dos plantas con piscina iluminada, amplia zona exterior y luz cálida ideal para familias o grupos.",
    description:
      "Alojamiento con estilo actual, terrazas, comedor al aire libre y piscina. Cocina y espacios comunes para compartir. Zona de costa en San Clemente, Manabí.",
    capacity: { guests: 14, bedrooms: 5, beds: 7, bathrooms: 4 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Piscina privada",
      "Estacionamiento",
      "Terraza y zona exterior",
      "Agua caliente",
    ],
    rules: [
      "No fumar en interiores",
      "Silencio nocturno 22:00–7:00",
      "Máximo de huéspedes según reserva",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: "https://maps.app.goo.gl/pb7RNYVtzTSdk1Wm9",
      coordinates: { lat: -0.7684796, lng: -80.5118034 },
    },
    basePricePerNightUsd: 200,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/847175742779477105.ics?t=405b7afe008240abbc34a797a4a4a5f0",
    images: [
      { src: supabase("Alojamiento en Arrecife.webp"), alt: "Alojamiento en Arrecife — fachada y piscina" },
    ],
  },
  {
    id: "2",
    slug: "casa-vacacional-home-one-18-personas-max",
    name: "Casa vacacional - Home One (18 Personas Max)",
    destination: "beach",
    shortDescription: "Casa vacacional de gran capacidad: hasta 18 huéspedes. Piscina y zona de esparcimiento.",
    description:
      "Propiedad amplia con espacios interiores y exteriores para grupos. Cocina, áreas de descanso y piscina. Corredor costero de San Clemente, Manabí",
    capacity: { guests: 18, bedrooms: 6, beds: 8, bathrooms: 5 },
    amenities: [
      "Wi‑Fi",
      "Cocina completa",
      "Piscina",
      "Estacionamiento",
      "Zona de juegos / recreación",
      "Lavadora",
    ],
    rules: [
      "Capacidad máxima 18 huéspedes",
      "Uso de piscina según normas al confirmar",
      "Respetar horarios de descanso",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: mapsHomeOneTwo,
      coordinates: coordsHomeOneTwo,
    },
    basePricePerNightUsd: 185,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/43089929.ics?t=310e4fb4cc2b45d8a3dae8e961cc4c21",
    images: [
      {
        src: supabase("Casa vacacional - Home One (18 Personas Max).webp"),
        alt: "Casa vacacional - Home One — vista exterior y piscina",
      },
    ],
  },
  {
    id: "3",
    slug: "casa-vacacional-home-two-21-personas",
    name: "Casa vacacional - Home Two (21 Personas)",
    destination: "beach",
    shortDescription: "Casa de mayor capacidad (hasta 21 personas), ideal para retiros o familias numerosas.",
    description:
      "Amplia vivienda con múltiples habitaciones, espacios comunes y zona de piscina. Manabí, San Clemente.",
    capacity: { guests: 21, bedrooms: 7, beds: 10, bathrooms: 6 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Piscina",
      "BBQ / Zona de parrilla",
      "Estacionamiento",
      "Varios salones o zonas de estar",
    ],
    rules: [
      "Capacidad máxima 21 huéspedes",
      "Eventos o grupos: consultar y autorizar con antelación",
      "Depósito según política al confirmar",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: mapsHomeOneTwo,
      coordinates: coordsHomeOneTwo,
    },
    basePricePerNightUsd: 220,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/43093803.ics?t=160b4a632c5a48f2bcb610e8c2c892d9",
    images: [
      {
        src: supabase("Casa vacacional - Home Two (21 Personas).webp"),
        alt: "Casa vacacional - Home Two — exterior y piscina",
      },
    ],
  },
  {
    id: "4",
    slug: "casa-rustica-18-personas-max",
    name: "Casa rustica (18 personas max.)",
    destination: "beach",
    shortDescription: "Casa con estética rústica, madera y piedra; hasta 18 huéspedes, con piscina y zona exterior.",
    description:
      "Dos plantas, acabados naturales, espacio para comer al aire libre y piscina. San Clemente, Manabí.",
    capacity: { guests: 18, bedrooms: 6, beds: 7, bathrooms: 5 },
    amenities: [
      "Wi‑Fi",
      "Cocina",
      "Piscina",
      "Estacionamiento",
      "Terraza cubierta",
    ],
    rules: ["Máximo 18 huéspedes", "No fumar en dormitorios", "Silencio nocturno 22:00–7:00"],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: "https://maps.app.goo.gl/qg4NrzUQuzQUhGhn9",
      coordinates: { lat: -0.7682655, lng: -80.513127 },
    },
    basePricePerNightUsd: 170,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/50403775.ics?t=88621880882d456c9e21b1072b23ec7d",
    images: [
      {
        src: supabase("Casa rustica (18 personas max.).webp"),
        alt: "Casa rustica — fachada y piscina",
      },
    ],
  },
  {
    id: "5",
    slug: "home-luxury-la-punta-18-personas-max",
    name: "Home Luxury La Punta (18 Personas Max)",
    destination: "beach",
    shortDescription:
      "Casa de lujo frente a la playa: piscina, jacuzzi, terraza y vistas al mar. Hasta 18 huéspedes.",
    description:
      "Arquitectura moderna, acceso a playa, piscina con hidromasaje, deck y áreas al aire libre. Corredor costero de San Clemente, Manabí.",
    capacity: { guests: 18, bedrooms: 6, beds: 8, bathrooms: 5 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Piscina y jacuzzi",
      "Frente a playa / vistas al mar",
      "Estacionamiento",
      "Terraza y solárium",
    ],
    rules: [
      "Capacidad máxima 18 huéspedes",
      "Uso de piscina e hidromasaje según normas al confirmar",
      "Respetar horarios de descanso",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: "https://maps.app.goo.gl/AcMXwczwft2fmtrZA",
      coordinates: { lat: -0.7451309, lng: -80.5076173 },
    },
    basePricePerNightUsd: 195,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/664011177607035357.ics?t=5f48c51138dc48c7859e683a4f3f6e37",
    images: [
      {
        src: supabase("Home Luxury La Punta (18 Personas Max).webp"),
        alt: "Home Luxury La Punta — fachada, piscina y playa",
      },
    ],
  },
  {
    id: "6",
    slug: "apartamento-ms-vacations-portoviejo",
    name: "Apartamento MS Vacations — Portoviejo",
    destination: "city",
    shortDescription:
      "Apartamento equipado en Portoviejo: ideal para viajes de trabajo, familia o escapadas urbanas en Manabí.",
    description:
      "Alojamiento cómodo en Portoviejo con cocina, Wi‑Fi y estacionamiento. Ubicación práctica para moverte por la capital manabita y la región.",
    capacity: { guests: 4, bedrooms: 2, beds: 2, bathrooms: 1 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Aire acondicionado",
      "Estacionamiento",
      "Agua caliente",
      "TV",
    ],
    rules: [
      "Capacidad máxima según reserva",
      "No fumar en interiores",
      "Silencio nocturno 22:00–7:00",
    ],
    location: {
      area: "Portoviejo",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: mapsPortoviejo,
      coordinates: coordsPortoviejoCenter,
    },
    basePricePerNightUsd: 65,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/0.ics?t=placeholder",
    images: [placeholderImage],
  },
  {
    id: "7",
    slug: "suite-ms-vacations-portoviejo",
    name: "Suite MS Vacations — Portoviejo",
    destination: "city",
    shortDescription:
      "Suite amoblada en Portoviejo para parejas o viajeros en solitario, con lo esencial para una estancia cómoda.",
    description:
      "Espacio íntimo y funcional en Portoviejo. Perfecto para estancias cortas, trámites en la ciudad o como base para conocer Manabí.",
    capacity: { guests: 2, bedrooms: 1, beds: 1, bathrooms: 1 },
    amenities: ["Wi‑Fi", "Cocina básica", "Aire acondicionado", "Agua caliente", "TV"],
    rules: [
      "Capacidad máxima 2 huéspedes",
      "No fumar en interiores",
      "Silencio nocturno 22:00–7:00",
    ],
    location: {
      area: "Portoviejo",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: mapsPortoviejo,
      coordinates: { lat: -1.0562, lng: -80.4521 },
    },
    basePricePerNightUsd: 45,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/0.ics?t=placeholder",
    images: [placeholderImage],
  },
];

export function getPropertyBySlug(slug: string): Property | undefined {
  return PROPERTIES.find((p) => p.slug === slug);
}

export function getAllPropertySlugs(): string[] {
  return PROPERTIES.map((p) => p.slug);
}

export function getPropertiesByDestination(destination: PropertyDestination): Property[] {
  return PROPERTIES.filter((p) => p.destination === destination);
}

export function groupPropertiesByDestination(catalog: Property[]): {
  beach: Property[];
  city: Property[];
} {
  return {
    beach: catalog.filter((p) => p.destination === "beach"),
    city: catalog.filter((p) => p.destination === "city"),
  };
}
