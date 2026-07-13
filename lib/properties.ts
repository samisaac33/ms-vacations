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
export const HOME_CITY_MAP_SLUG = "los-pinos-portoviejo";

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

const SUPABASE_STORAGE_HOST = {
  /** Imágenes históricas de playa (bucket MS_VACATIONS). */
  legacy: "srtoqhmjydbpmwhyuurw",
  /** Proyecto actual (DB + Villa Palmera). */
  current: "tikrziworaajjatulzsg",
} as const;

function supabaseStorageUrl(
  file: string,
  host: keyof typeof SUPABASE_STORAGE_HOST = "legacy",
) {
  return `https://${SUPABASE_STORAGE_HOST[host]}.supabase.co/storage/v1/object/public/MS_VACATIONS/${file
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

const supabase = (file: string) => supabaseStorageUrl(file);

function villaPalmeraImage(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`villa-palmera/${file}`, "current"),
    alt: `Villa Palmera — ${alt}`,
  };
}

const VILLA_PALMERA_IMAGES = [
  villaPalmeraImage("piscina-01.webp", "piscina central"),
  villaPalmeraImage("piscina-02.webp", "piscina y zona exterior"),
  villaPalmeraImage("piscina-03.webp", "piscina rodeada de palmeras"),
  villaPalmeraImage("piscina-04.webp", "área de piscina"),
  villaPalmeraImage("sala-01.webp", "sala"),
  villaPalmeraImage("sala-02.webp", "sala y zona de estar"),
  villaPalmeraImage("comedor-01.webp", "comedor"),
  villaPalmeraImage("comedor-02.webp", "comedor y zona social"),
  villaPalmeraImage("comedor-03.webp", "comedor al aire libre"),
  villaPalmeraImage("cocina-01.webp", "cocina"),
  villaPalmeraImage("cocina-02.webp", "cocina equipada"),
  villaPalmeraImage("bano-social-01.webp", "baño social"),
  villaPalmeraImage("habitacion-1-01.webp", "habitación 1"),
  villaPalmeraImage("habitacion-1-02.webp", "habitación 1 — vista 2"),
  villaPalmeraImage("habitacion-1-03.webp", "habitación 1 — detalle"),
  villaPalmeraImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  villaPalmeraImage("habitacion-2-01.webp", "habitación 2"),
  villaPalmeraImage("habitacion-2-02.webp", "habitación 2 — vista 2"),
  villaPalmeraImage("habitacion-2-bano-01.webp", "habitación 2 — baño"),
  villaPalmeraImage("habitacion-2-bano-02.webp", "habitación 2 — baño vista 2"),
  villaPalmeraImage("habitacion-3-01.webp", "habitación 3"),
  villaPalmeraImage("habitacion-3-bano-01.webp", "habitación 3 — baño"),
  villaPalmeraImage("habitacion-4-01.webp", "habitación 4"),
  villaPalmeraImage("habitacion-4-bano-01.webp", "habitación 4 — baño"),
  villaPalmeraImage("adicional-01.webp", "vista adicional"),
  villaPalmeraImage("adicional-02.webp", "vista adicional"),
  villaPalmeraImage("adicional-03.webp", "vista adicional"),
  villaPalmeraImage("adicional-04.webp", "vista adicional"),
];

function homeOneImage(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`home-one/${file}`, "current"),
    alt: `Home One — ${alt}`,
  };
}

const HOME_ONE_IMAGES = [
  homeOneImage("exterior-01.webp", "exterior"),
  homeOneImage("exterior-02.webp", "exterior vista 2"),
  homeOneImage("exterior-03.webp", "exterior vista 3"),
  homeOneImage("exterior-05.webp", "exterior vista 4"),
  homeOneImage("exterior-06.webp", "exterior vista 5"),
  homeOneImage("piscina-01.webp", "piscina"),
  homeOneImage("piscina-02.webp", "piscina vista 2"),
  homeOneImage("piscina-03.webp", "piscina vista 3"),
  homeOneImage("sala-01.webp", "sala"),
  homeOneImage("sala-02.webp", "sala vista 2"),
  homeOneImage("cocina-01.webp", "cocina"),
  homeOneImage("cocina-02.webp", "cocina vista 2"),
  homeOneImage("garaje-01.webp", "garaje"),
  homeOneImage("habitacion-1-01.webp", "habitación 1"),
  homeOneImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  homeOneImage("habitacion-2-01.webp", "habitación 2"),
  homeOneImage("habitacion-2-bano-01.webp", "habitación 2 — baño"),
  homeOneImage("habitacion-3-01.webp", "habitación 3"),
  homeOneImage("habitacion-3-bano-01.webp", "habitación 3 — baño"),
  homeOneImage("habitacion-4-01.webp", "habitación 4"),
  homeOneImage("habitacion-4-bano-01.webp", "habitación 4 — baño"),
];

function homeTwoImage(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`home-two/${file}`, "current"),
    alt: `Home Two — ${alt}`,
  };
}

const HOME_TWO_IMAGES = [
  homeTwoImage("exterior-01.webp", "exterior"),
  homeTwoImage("exterior-02.webp", "exterior vista 2"),
  homeTwoImage("exterior-03.webp", "exterior vista 3"),
  homeTwoImage("exterior-04.webp", "exterior vista 4"),
  homeTwoImage("sala-01.webp", "sala"),
  homeTwoImage("comedor-01.webp", "comedor"),
  homeTwoImage("cocina-01.webp", "cocina"),
  homeTwoImage("bano-social-01.webp", "baño social"),
  homeTwoImage("garaje-01.webp", "garaje"),
  homeTwoImage("rooftop-01.webp", "rooftop"),
  homeTwoImage("habitacion-1-01.webp", "habitación 1"),
  homeTwoImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  homeTwoImage("habitacion-2-01.webp", "habitación 2"),
  homeTwoImage("habitacion-2-bano-01.webp", "habitación 2 — baño"),
  homeTwoImage("habitacion-3-01.webp", "habitación 3"),
  homeTwoImage("habitacion-3-bano-01.webp", "habitación 3 — baño"),
  homeTwoImage("habitacion-4-01.webp", "habitación 4"),
  homeTwoImage("habitacion-4-bano-01.webp", "habitación 4 — baño"),
  homeTwoImage("habitacion-5-01.webp", "habitación 5"),
  homeTwoImage("adicional-01.webp", "vista adicional"),
];

function rusticHouseImage(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`rustic-house/${file}`, "current"),
    alt: `Casa Rústica — ${alt}`,
  };
}

const RUSTIC_HOUSE_IMAGES = [
  rusticHouseImage("exterior-01.webp", "exterior"),
  rusticHouseImage("exterior-02.webp", "exterior vista 2"),
  rusticHouseImage("exterior-03.webp", "exterior vista 3"),
  rusticHouseImage("exterior-04.webp", "exterior vista 4"),
  rusticHouseImage("piscina-01.webp", "piscina"),
  rusticHouseImage("interior-01.webp", "interior"),
  rusticHouseImage("interior-02.webp", "interior vista 2"),
  rusticHouseImage("balcon-01.webp", "balcón"),
  rusticHouseImage("balcon-02.webp", "balcón vista 2"),
  rusticHouseImage("balcon-03.webp", "balcón vista 3"),
  rusticHouseImage("cocina-01.webp", "cocina"),
  rusticHouseImage("cocina-02.webp", "cocina vista 2"),
  rusticHouseImage("bano-social-01.webp", "baño social"),
  rusticHouseImage("bbq-01.webp", "zona BBQ"),
  rusticHouseImage("habitacion-1-01.webp", "habitación 1"),
  rusticHouseImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  rusticHouseImage("habitacion-2-01.webp", "habitación 2"),
  rusticHouseImage("habitacion-2-bano-01.webp", "habitación 2 — baño"),
  rusticHouseImage("habitacion-3-01.webp", "habitación 3"),
  rusticHouseImage("habitacion-4-01.webp", "habitación 4"),
  rusticHouseImage("habitacion-5-01.webp", "habitación 5"),
  rusticHouseImage("habitacion-6-01.webp", "habitación 6"),
  rusticHouseImage("adicional-01.webp", "vista adicional"),
  rusticHouseImage("adicional-02.webp", "vista adicional"),
  rusticHouseImage("adicional-03.webp", "vista adicional"),
];

function homeLuxuryLaPuntaImage(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`home-luxury-la-punta/${file}`, "current"),
    alt: `Home Luxury La Punta — ${alt}`,
  };
}

export const HOME_HERO_IMAGE = homeLuxuryLaPuntaImage("exterior-08.webp", "exterior vista 8");

const HOME_LUXURY_LA_PUNTA_IMAGES = [
  homeLuxuryLaPuntaImage("exterior-01.webp", "exterior"),
  homeLuxuryLaPuntaImage("exterior-02.webp", "exterior vista 2"),
  homeLuxuryLaPuntaImage("exterior-03.webp", "exterior vista 3"),
  homeLuxuryLaPuntaImage("exterior-04.webp", "exterior vista 4"),
  homeLuxuryLaPuntaImage("exterior-05.webp", "exterior vista 5"),
  homeLuxuryLaPuntaImage("exterior-06.webp", "exterior vista 6"),
  homeLuxuryLaPuntaImage("exterior-07.webp", "exterior vista 7"),
  homeLuxuryLaPuntaImage("exterior-08.webp", "exterior vista 8"),
  homeLuxuryLaPuntaImage("exterior-09.webp", "exterior vista 9"),
  homeLuxuryLaPuntaImage("exterior-10.webp", "exterior vista 10"),
  homeLuxuryLaPuntaImage("piscina-01.webp", "piscina"),
  homeLuxuryLaPuntaImage("piscina-02.webp", "piscina vista 2"),
  homeLuxuryLaPuntaImage("piscina-03.webp", "piscina vista 3"),
  homeLuxuryLaPuntaImage("rooftop-01.webp", "rooftop"),
  homeLuxuryLaPuntaImage("rooftop-02.webp", "rooftop vista 2"),
  homeLuxuryLaPuntaImage("sala-01.webp", "sala"),
  homeLuxuryLaPuntaImage("sala-02.webp", "sala vista 2"),
  homeLuxuryLaPuntaImage("sala-03.webp", "sala vista 3"),
  homeLuxuryLaPuntaImage("comedor-01.webp", "comedor"),
  homeLuxuryLaPuntaImage("cocina-01.webp", "cocina"),
  homeLuxuryLaPuntaImage("cocina-02.webp", "cocina vista 2"),
  homeLuxuryLaPuntaImage("bbq-01.webp", "zona BBQ"),
  homeLuxuryLaPuntaImage("garaje-01.webp", "garaje"),
  homeLuxuryLaPuntaImage("habitacion-1-01.webp", "habitación 1"),
  homeLuxuryLaPuntaImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  homeLuxuryLaPuntaImage("habitacion-2-01.webp", "habitación 2"),
  homeLuxuryLaPuntaImage("habitacion-2-02.webp", "habitación 2 — vista 2"),
  homeLuxuryLaPuntaImage("habitacion-2-03.webp", "habitación 2 — vista 3"),
  homeLuxuryLaPuntaImage("habitacion-2-bano-01.webp", "habitación 2 — baño"),
  homeLuxuryLaPuntaImage("habitacion-3-01.webp", "habitación 3"),
  homeLuxuryLaPuntaImage("habitacion-3-bano-01.webp", "habitación 3 — baño"),
  homeLuxuryLaPuntaImage("habitacion-4-01.webp", "habitación 4"),
  homeLuxuryLaPuntaImage("habitacion-4-bano-01.webp", "habitación 4 — baño"),
  homeLuxuryLaPuntaImage("habitacion-5-01.webp", "habitación 5"),
  homeLuxuryLaPuntaImage("habitacion-5-bano-01.webp", "habitación 5 — baño"),
  homeLuxuryLaPuntaImage("adicional-01.webp", "vista adicional"),
  homeLuxuryLaPuntaImage("adicional-02.webp", "vista adicional"),
  homeLuxuryLaPuntaImage("adicional-03.webp", "vista adicional"),
];

function lasHamacasImage(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`las-hamacas/${file}`, "current"),
    alt: `Las Hamacas — ${alt}`,
  };
}

const LAS_HAMACAS_IMAGES = [
  lasHamacasImage("exterior-01.webp", "exterior"),
  lasHamacasImage("piscina-01.webp", "piscina"),
  lasHamacasImage("piscina-02.webp", "piscina vista 2"),
  lasHamacasImage("sala-01.webp", "sala"),
  lasHamacasImage("sala-02.webp", "sala vista 2"),
  lasHamacasImage("sala-03.webp", "sala vista 3"),
  lasHamacasImage("sala-04.webp", "sala vista 4"),
  lasHamacasImage("cocina-01.webp", "cocina"),
  lasHamacasImage("cocina-02.webp", "cocina vista 2"),
  lasHamacasImage("bbq-01.webp", "zona BBQ"),
  lasHamacasImage("habitacion-1-01.webp", "habitación 1"),
  lasHamacasImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  lasHamacasImage("habitacion-2-01.webp", "habitación 2"),
  lasHamacasImage("habitacion-2-bano-01.webp", "habitación 2 — baño"),
  lasHamacasImage("habitacion-3-01.webp", "habitación 3"),
  lasHamacasImage("habitacion-3-bano-01.webp", "habitación 3 — baño"),
  lasHamacasImage("habitacion-4-01.webp", "habitación 4"),
];

function losPinosImage(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`los-pinos/${file}`, "current"),
    alt: `Los Pinos — ${alt}`,
  };
}

const LOS_PINOS_IMAGES = [
  losPinosImage("exterior-01.webp", "exterior"),
  losPinosImage("exterior-02.webp", "exterior vista 2"),
  losPinosImage("piscina-01.webp", "piscina"),
  losPinosImage("piscina-02.webp", "piscina vista 2"),
  losPinosImage("sala-01.webp", "sala"),
  losPinosImage("sala-02.webp", "sala vista 2"),
  losPinosImage("sala-03.webp", "sala vista 3"),
  losPinosImage("comedor-01.webp", "comedor"),
  losPinosImage("cocina-01.webp", "cocina"),
  losPinosImage("bar-01.webp", "bar"),
  losPinosImage("habitacion-01.webp", "habitación 1"),
  losPinosImage("habitacion-01-bano-01.webp", "habitación 1 — baño"),
  losPinosImage("habitacion-02.webp", "habitación 2"),
  losPinosImage("habitacion-02-bano-01.webp", "habitación 2 — baño"),
  losPinosImage("habitacion-03.webp", "habitación 3"),
  losPinosImage("habitacion-03-bano-01.webp", "habitación 3 — baño"),
  losPinosImage("habitacion-04.webp", "habitación 4"),
  losPinosImage("habitacion-04-bano-01.webp", "habitación 4 — baño"),
  losPinosImage("habitacion-05.webp", "habitación 5"),
  losPinosImage("habitacion-05-bano-01.webp", "habitación 5 — baño"),
  losPinosImage("habitacion-06.webp", "habitación 6"),
  losPinosImage("habitacion-06-bano-01.webp", "habitación 6 — baño"),
  losPinosImage("adicional-01.webp", "vista adicional"),
  losPinosImage("adicional-02.webp", "vista adicional"),
  losPinosImage("adicional-03.webp", "vista adicional"),
];

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
    basePricePerNightUsd: 268,
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
    basePricePerNightUsd: 278,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/43089929.ics?t=310e4fb4cc2b45d8a3dae8e961cc4c21",
    images: HOME_ONE_IMAGES,
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
    basePricePerNightUsd: 300,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/43093803.ics?t=160b4a632c5a48f2bcb610e8c2c892d9",
    images: HOME_TWO_IMAGES,
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
    basePricePerNightUsd: 321,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/50403775.ics?t=88621880882d456c9e21b1072b23ec7d",
    images: RUSTIC_HOUSE_IMAGES,
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
    basePricePerNightUsd: 535,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/664011177607035357.ics?t=5f48c51138dc48c7859e683a4f3f6e37",
    images: HOME_LUXURY_LA_PUNTA_IMAGES,
  },
  {
    id: "8",
    slug: "villa-palmera",
    name: "Villa Palmera",
    destination: "beach",
    shortDescription:
      "Casa vacacional en U con piscina central y palmeras: hasta 13 huéspedes, jacuzzi y zonas al aire libre.",
    description:
      "Villa Palmera es una espectacular casa vacacional en playa con arquitectura en forma de U que abre hacia una impresionante piscina central rodeada de palmeras, creando un entorno tropical único. Ideal para familias o grupos que buscan privacidad y comodidad; su diseño permite disfrutar de la brisa marina y las vistas a la piscina desde casi cada espacio. San Clemente, Manabí.",
    capacity: { guests: 13, bedrooms: 4, beds: 6, bathrooms: 5 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Piscina",
      "Jacuzzi",
      "Zona de parrilla / BBQ",
      "Comedor al aire libre",
      "Estacionamiento gratuito",
      "Aire acondicionado",
      "TV",
      "Check-in autónomo",
    ],
    rules: [
      "Capacidad máxima 13 huéspedes",
      "Check-in a partir de las 15:00",
      "Check-out antes de las 12:00",
      "No fumar en interiores",
      "Silencio nocturno 22:00–7:00",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: "https://maps.app.goo.gl/1zcYg9m4aM8ts1ZZ9",
      coordinates: { lat: -0.7688396, lng: -80.5107063 },
    },
    basePricePerNightUsd: 428,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/1528516663501304063.ics?t=11dbc9a3622f4dd182472713834c1fbd",
    images: VILLA_PALMERA_IMAGES,
  },
  {
    id: "9",
    slug: "las-hamacas-portoviejo",
    name: "Las Hamacas",
    destination: "city",
    shortDescription:
      "Casa independiente en el norte de Portoviejo con piscina y BBQ de uso exclusivo. Hasta 8 huéspedes, 4 habitaciones con baño privado.",
    description:
      "Hermosa casa amoblada y completamente independiente en el norte de Portoviejo, estratégicamente ubicada cerca del centro de la ciudad, zonas comerciales, restaurantes y supermercados. Ideal para grupos de hasta 8 personas, con 4 habitaciones —cada una con baño privado—: una en planta baja (accesible) y tres en el piso superior. Piscina y área de BBQ son de uso exclusivo para huéspedes, sin horarios ni restricciones de urbanización. Apta para turismo y viajes de negocios. Check-in autónomo con caja de seguridad para llaves.",
    capacity: { guests: 8, bedrooms: 4, beds: 4, bathrooms: 4.5 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Piscina privada",
      "Zona de parrilla / BBQ",
      "Estacionamiento gratuito",
      "Aire acondicionado",
      "TV",
      "Check-in autónomo",
      "Cámaras de seguridad (exterior)",
      "Baño privado en cada habitación",
    ],
    rules: [
      "Capacidad máxima 8 huéspedes registrados",
      "No fiestas ni reuniones con personas externas a la reserva",
      "La casa es exclusivamente para huéspedes de la reserva",
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
    basePricePerNightUsd: 150,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/1397408558028225842.ics?t=7518c18034d24789b8a2b705d573897f",
    images: LAS_HAMACAS_IMAGES,
  },
  {
    id: "10",
    slug: "los-pinos-portoviejo",
    name: "Los Pinos",
    destination: "city",
    shortDescription:
      "Casa amplia y acogedora en Portoviejo, ideal para familias. Piscina, jacuzzi y zona exterior con parrilla.",
    description:
      "Casa ideal para familias, amplia y acogedora, perfecta para disfrutar unos días con la comodidad y calidez de tu propio hogar. Cuenta con piscina en L, jacuzzi, comedor al aire libre, hamaca en porche y amplias zonas exteriores. Una de las pocas propiedades de la zona con piscina.",
    capacity: { guests: 11, bedrooms: 4, beds: 6, bathrooms: 4.5 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Piscina",
      "Jacuzzi",
      "Zona de parrilla / BBQ",
      "Comedor al aire libre",
      "Estacionamiento gratuito",
      "Aire acondicionado",
      "TV",
      "Ducha exterior",
      "Cámaras de seguridad (exterior e ingresos)",
    ],
    rules: [
      "Capacidad máxima 11 huéspedes registrados",
      "No fiestas ni reuniones con personas externas a la reserva",
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
    basePricePerNightUsd: 200,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/1542938339737311039.ics?t=ef3446ccb9204f26b3b4db18bca0306c",
    images: LOS_PINOS_IMAGES,
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
