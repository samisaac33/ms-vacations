export type PropertyDestination = "beach" | "city";

export type PropertyAboutSection = {
  title: string;
  lead?: string;
  paragraphs: string[];
};

export type PropertyAbout = {
  intro: string;
  sections: PropertyAboutSection[];
};

export type PropertyAmenityItem = {
  label: string;
  detail?: string;
};

export type PropertyAmenityCategory = {
  title: string;
  items: PropertyAmenityItem[];
};

export type PropertyAmenityGroups = {
  categories: PropertyAmenityCategory[];
  notIncluded?: PropertyAmenityItem[];
};

export type PropertyHighlight = {
  title: string;
  description: string;
};

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
  about?: PropertyAbout;
  amenityGroups?: PropertyAmenityGroups;
  highlights?: PropertyHighlight[];
  /** Propiedad con acceso directo a la playa / frente al mar. */
  beachfront?: boolean;
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

function portoNorteImage(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`porto-norte/${file}`, "current"),
    alt: `Porto Norte — ${alt}`,
  };
}

const PORTO_NORTE_IMAGES = [
  portoNorteImage("exterior-01.webp", "exterior y piscina"),
  portoNorteImage("exterior-02.webp", "exterior vista 2"),
  portoNorteImage("exterior-03.webp", "exterior vista 3"),
  portoNorteImage("piscina-01.webp", "piscina"),
  portoNorteImage("piscina-02.webp", "piscina vista 2"),
  portoNorteImage("habitacion-01.webp", "habitación 1"),
  portoNorteImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  portoNorteImage("habitacion-02.webp", "habitación 2"),
  portoNorteImage("habitacion-03.webp", "habitación 3"),
  portoNorteImage("habitacion-04.webp", "habitación 4"),
];

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
  homeOneImage("habitacion-1-01.webp", "habitación 1 — 1 cama king, 2 camas dobles, 1 cama individual"),
  homeOneImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  homeOneImage("habitacion-2-01.webp", "habitación 2 — 1 cama doble, 1 cama individual"),
  homeOneImage("habitacion-2-bano-01.webp", "habitación 2 — baño"),
  homeOneImage("habitacion-3-01.webp", "habitación 3 — 1 cama king"),
  homeOneImage("habitacion-3-bano-01.webp", "habitación 3 — baño"),
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
    alt: `Rustic House — ${alt}`,
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
  rusticHouseImage("habitacion-1-01.webp", "habitación 1 — 1 cama king"),
  rusticHouseImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  rusticHouseImage("habitacion-2-01.webp", "habitación 2 — 1 cama doble"),
  rusticHouseImage("habitacion-2-bano-01.webp", "habitación 2 — baño"),
  rusticHouseImage("habitacion-3-01.webp", "habitación 3 — 2 camas dobles"),
  rusticHouseImage("habitacion-4-01.webp", "habitación 4 — 2 camas dobles, 1 cama individual"),
  rusticHouseImage("habitacion-5-01.webp", "habitación 5 — 1 cama king"),
  rusticHouseImage("habitacion-6-01.webp", "habitación 6 — 3 camas individuales"),
  rusticHouseImage("adicional-01.webp", "vista adicional"),
  rusticHouseImage("adicional-02.webp", "vista adicional"),
  rusticHouseImage("adicional-03.webp", "vista adicional"),
];

function homeLuxuryLaPuntaImage(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`home-luxury-la-punta/${file}`, "current"),
    alt: `La Punta — ${alt}`,
  };
}

export const HOME_HERO_IMAGE = homeLuxuryLaPuntaImage("exterior-08.webp", "exterior vista 8");

export const HOME_BEACH_DESTINATION_IMAGE = homeLuxuryLaPuntaImage(
  "exterior-08.webp",
  "exterior vista 8",
);

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
  homeLuxuryLaPuntaImage("habitacion-1-01.webp", "habitación 1 — 1 cama king"),
  homeLuxuryLaPuntaImage("habitacion-1-bano-01.webp", "habitación 1 — baño"),
  homeLuxuryLaPuntaImage("habitacion-2-01.webp", "habitación 2 — 2 camas dobles"),
  homeLuxuryLaPuntaImage("habitacion-2-02.webp", "habitación 2 — vista 2"),
  homeLuxuryLaPuntaImage("habitacion-2-03.webp", "habitación 2 — vista 3"),
  homeLuxuryLaPuntaImage("habitacion-2-bano-01.webp", "habitación 2 — baño"),
  homeLuxuryLaPuntaImage("habitacion-3-01.webp", "habitación 3 — 1 cama king"),
  homeLuxuryLaPuntaImage("habitacion-3-bano-01.webp", "habitación 3 — baño"),
  homeLuxuryLaPuntaImage("habitacion-4-01.webp", "habitación 4 — 2 camas dobles"),
  homeLuxuryLaPuntaImage("habitacion-4-bano-01.webp", "habitación 4 — baño"),
  homeLuxuryLaPuntaImage("habitacion-5-01.webp", "habitación 5 — 3 camas dobles"),
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

export const HOME_CITY_DESTINATION_IMAGE = losPinosImage("piscina-01.webp", "piscina");

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

function containerStay1Image(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`container-stay-1/${file}`, "current"),
    alt: `Container Stay 2 — ${alt}`,
  };
}

const CONTAINER_STAY_1_IMAGES = [
  containerStay1Image("exterior-01.webp", "exterior"),
  containerStay1Image("cocina-01.webp", "cocina"),
  containerStay1Image("habitacion-01.webp", "habitación 1"),
  containerStay1Image("habitacion-02.webp", "habitación 2"),
  containerStay1Image("bano-completo-01.webp", "baño"),
];

function containerStay2Image(file: string, alt: string) {
  return {
    src: supabaseStorageUrl(`container-stay-2/${file}`, "current"),
    alt: `Container Stay 1 — ${alt}`,
  };
}

const CONTAINER_STAY_2_IMAGES = [
  containerStay2Image("exterior-01.webp", "exterior"),
  containerStay2Image("cocina-01.webp", "cocina"),
  containerStay2Image("habitacion-01.webp", "habitación 1"),
  containerStay2Image("habitacion-02.webp", "habitación 2"),
  containerStay2Image("bano-completo-01.webp", "baño"),
];

export const PROPERTIES: Property[] = [
  {
    id: "1",
    slug: "alojamiento-en-arrecife",
    name: "Home Arrecife",
    destination: "beach",
    shortDescription:
      "A 300 m del mar: villa moderna de dos plantas con piscina iluminada, amplia zona exterior y luz cálida ideal para familias o grupos.",
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
      "Máximo de huéspedes según reserva",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: "https://maps.app.goo.gl/pb7RNYVtzTSdk1Wm9",
      coordinates: { lat: -0.7684796, lng: -80.5118034 },
    },
    basePricePerNightUsd: 291,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/847175742779477105.ics?t=405b7afe008240abbc34a797a4a4a5f0",
    images: [
      { src: supabase("Alojamiento en Arrecife.webp"), alt: "Home Arrecife — fachada y piscina" },
    ],
  },
  {
    id: "2",
    slug: "casa-vacacional-home-one-18-personas-max",
    name: "Home One",
    destination: "beach",
    shortDescription:
      "A 450 m del mar: casa privada con piscina e hidromasaje en San Clemente; hasta 12 personas, ideal para familias y grupos que buscan comodidad y exclusividad.",
    description:
      "Casa vacacional en San Clemente con 3 habitaciones, piscina privada e hidromasaje de uso exclusivo. Hasta 12 huéspedes.",
    capacity: { guests: 12, bedrooms: 3, beds: 7, bathrooms: 3.5 },
    amenities: [
      "Wi‑Fi",
      "Piscina privada",
      "Hidromasaje",
      "Aire acondicionado",
      "Cocina equipada",
      "Estacionamiento gratuito",
      "Lavadora",
      "Zona de trabajo privada",
    ],
    about: {
      intro:
        "Disfruta de una estadía privada y confortable en esta hermosa casa con piscina y área de hidromasaje. Con capacidad para hasta 12 personas, es ideal para familias y grupos que buscan comodidad y exclusividad. Relájate en sus amplios espacios, disfruta del sol junto a la piscina y vive momentos inolvidables en un ambiente seguro y acogedor. En MS Vacations cuidamos cada detalle para que tu experiencia sea memorable.",
      sections: [
        {
          title: "La propiedad",
          lead: "🌴 Exclusiva Casa con Piscina & Hidromasaje | Capacidad 12 Personas",
          paragraphs: [
            "Disfruta de una experiencia única en esta moderna y elegante propiedad diseñada para el descanso y la comodidad. Ideal para familias o grupos de amigos, la casa cuenta con 3 amplias habitaciones y capacidad para hasta 12 huéspedes, ofreciendo espacios cómodos, funcionales y perfectamente equipados.",
            "La propiedad destaca por su piscina privada iluminada y un exclusivo hidromasaje, perfectos para relajarse tanto de día como de noche en un ambiente privado y seguro. Su diseño contemporáneo, combinado con iluminación cálida y detalles modernos, crea una atmósfera acogedora y sofisticada.",
            "3 habitaciones cómodas y climatizadas, una de ellas tipo suite familiar.",
            "Capacidad máxima para 12 personas.",
            "Piscina privada.",
            "Área de hidromasaje.",
            "Espacios exteriores ideales para compartir.",
            "Cocina totalmente equipada.",
            "Zona social amplia y confortable.",
            "Perfecta para vacaciones, escapadas de fin de semana o celebraciones familiares en un entorno tranquilo.",
            "En MS Vacations cuidamos cada detalle para que tu estadía sea cómoda, segura y memorable.",
          ],
        },
        {
          title: "Acceso e ingreso",
          lead: "🏡 Uso exclusivo de la propiedad",
          paragraphs: [
            "Estimados huéspedes, queremos informarles que durante su estadía podrán hacer uso completo y exclusivo de toda la propiedad. La casa no es compartida con otros huéspedes ni con terceros, por lo que disfrutarán de total privacidad en todas las áreas, incluyendo habitaciones, piscina, hidromasaje y zonas sociales.",
            "Nuestro objetivo en MS Vacations es que se sientan cómodos, seguros y como en casa, disfrutando cada espacio con tranquilidad.",
          ],
        },
      ],
    },
    highlights: [
      {
        title: "Piscina e hidromasaje privados",
        description:
          "Una de las pocas casas en la zona con piscina e hidromasaje de uso exclusivo para tu grupo.",
      },
      {
        title: "Llegada autónoma",
        description: "Personal del edificio disponible las 24 horas para recibir a los huéspedes.",
      },
      {
        title: "A 450 m del mar",
        description: "Ubicación cercana a la playa en San Clemente.",
      },
    ],
    amenityGroups: {
      categories: [
        {
          title: "Baño",
          items: [
            { label: "Champú" },
            { label: "Ducha exterior" },
            { label: "Agua caliente" },
          ],
        },
        {
          title: "Dormitorio y lavandería",
          items: [
            { label: "Lavadora Pagado" },
            { label: "Ganchos para la ropa" },
            { label: "Sábanas" },
            { label: "Persianas o cortinas opacas" },
            { label: "Espacio para guardar la ropa" },
          ],
        },
        {
          title: "Entretenimiento",
          items: [{ label: "Televisión" }, { label: "Sistema de sonido" }],
        },
        {
          title: "Calefacción y refrigeración",
          items: [{ label: "Aire acondicionado" }],
        },
        {
          title: "Seguridad en el hogar",
          items: [
            {
              label: "Cámaras de seguridad en la parte exterior de la propiedad",
              detail:
                "Tenemos 4 cámaras de seguridad: 2 apuntando a las calles laterales de la propiedad, 1 apuntando al parqueadero y piscina, 1 apuntando a las dos puertas de acceso principales. Nuestras cámaras se encuentran activas 24/7.",
            },
          ],
        },
        {
          title: "Internet y oficina",
          items: [
            { label: "Wifi" },
            {
              label: "Zona de trabajo privada en el alojamiento",
            },
          ],
        },
        {
          title: "Utensilios y vajilla",
          items: [
            { label: "Cocina", detail: "Los huéspedes pueden cocinar en este espacio" },
            { label: "Refrigerador" },
            { label: "Microondas" },
            { label: "Utensilios básicos para cocinar" },
            {
              label: "Ollas y sartenes, aceite, sal y pimienta",
            },
            { label: "Horno" },
            { label: "Copas de vino" },
            { label: "Licuadora" },
            { label: "Arrocera" },
          ],
        },
        {
          title: "Exterior",
          items: [
            { label: "Patio o balcón" },
            { label: "Hamaca" },
            { label: "Zona de comida al aire libre" },
            { label: "Cocina al aire libre" },
            { label: "Parrilla" },
          ],
        },
        {
          title: "Estacionamiento e instalaciones",
          items: [
            { label: "Estacionamiento gratuito en las instalaciones" },
            { label: "Piscina" },
          ],
        },
        {
          title: "Servicios",
          items: [
            { label: "Llegada autónoma" },
            {
              label: "Personal del edificio",
              detail: "Hay alguien disponible las 24 horas para recibir a los huéspedes.",
            },
          ],
        },
      ],
      notIncluded: [
        { label: "Secadora" },
        { label: "Servicios básicos" },
        {
          label: "Detector de humo",
          detail: "No hay detector de humo en la propiedad.",
        },
        {
          label: "Detector de monóxido de carbono",
          detail:
            "El anfitrión indicó que no es necesario un detector de monóxido de carbono. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        { label: "Calefacción" },
      ],
    },
    rules: [
      "Capacidad máxima 12 huéspedes",
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
    basePricePerNightUsd: 302,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/43089929.ics?t=310e4fb4cc2b45d8a3dae8e961cc4c21",
    images: HOME_ONE_IMAGES,
  },
  {
    id: "3",
    slug: "casa-vacacional-home-two-21-personas",
    name: "Home Two",
    destination: "beach",
    shortDescription:
      "Amplia casa vacacional a 450 m del mar, ideal para grupos de hasta 21 personas con piscina, billar y futbolín.",
    description:
      "Casa vacacional a 450 m del mar en San Clemente: hasta 21 huéspedes, piscina privada, billar, futbolín y garaje para 2 vehículos.",
    capacity: { guests: 21, bedrooms: 5, beds: 11, bathrooms: 4.5 },
    amenities: [
      "Wi‑Fi",
      "Piscina privada",
      "Mesa de billar",
      "Futbolín",
      "Cocina equipada",
      "BBQ / Zona de parrilla",
      "Estacionamiento",
      "Cámaras de seguridad",
      "Ingreso con cerradura inteligente",
    ],
    about: {
      intro:
        "Amplia casa vacacional a 450 m del mar, ideal para grupos de hasta 21 personas. Disfruta de su piscina privada con opción a temperar (costo adicional), mesa de billar y futbolín. La propiedad cuenta con internet WiFi, espacios cómodos y seguros gracias a su cerramiento de hormigón con cerco eléctrico y cámaras de videovigilancia. Perfecta para familias o amigos que buscan comodidad y diversión cerca del mar.",
      sections: [
        {
          title: "La propiedad",
          lead: "Totalmente privado y tranquilo",
          paragraphs: [],
        },
        {
          title: "Acceso e ingreso",
          lead: "Ingreso independiente, garaje interno para dos vehículos.",
          paragraphs: [],
        },
      ],
    },
    highlights: [
      {
        title: "Piscina privada",
        description: "Piscina de uso exclusivo para tu grupo durante la estadía.",
      },
      {
        title: "Ingreso con cerradura inteligente",
        description: "Recibes instrucciones de acceso al confirmar tu reserva.",
      },
      {
        title: "A 450 m del mar",
        description: "Ubicación cercana al mar en San Clemente.",
      },
    ],
    amenityGroups: {
      categories: [
        {
          title: "Baño",
          items: [{ label: "Ducha exterior" }, { label: "Agua caliente" }],
        },
        {
          title: "Dormitorio y lavandería",
          items: [
            { label: "Lavadora Pagado" },
            { label: "Secadora Pagado" },
            { label: "Ganchos para la ropa" },
            { label: "Sábanas" },
            { label: "Persianas o cortinas opacas" },
            { label: "Plancha" },
            { label: "Tendedero de ropa" },
            { label: "Espacio para guardar ropa: armario" },
          ],
        },
        {
          title: "Entretenimiento",
          items: [
            { label: "Televisor con cable estándar" },
            { label: "Sistema de sonido" },
          ],
        },
        {
          title: "Climatización",
          items: [{ label: "Aire acondicionado" }],
        },
        {
          title: "Seguridad",
          items: [
            {
              label: "Cámaras de seguridad en la parte exterior de la propiedad",
              detail:
                "Tenemos 4 cámaras: 1 en la entrada, 1 en la terraza con billar, 1 en la piscina y 1 en la sala de estar. Todas las grabaciones son las 24 horas del día, los 7 días de la semana.",
            },
          ],
        },
        {
          title: "Conectividad",
          items: [{ label: "Wifi" }, { label: "Zona de trabajo privada" }],
        },
        {
          title: "Cocina y vajilla",
          items: [
            { label: "Cocina", detail: "Cocina equipada para tu estadía" },
            { label: "Refrigerador" },
            { label: "Microondas" },
            {
              label: "Platos y cubiertos",
              detail: "Bowls, palitos chinos, platos, tazas, etc.",
            },
            { label: "Horno" },
            { label: "Cafetera" },
            { label: "Copas de vino" },
            { label: "Tostadora" },
            { label: "Bandeja para hornear" },
            { label: "Licuadora" },
            { label: "Arrocera" },
            {
              label: "Utensilios para hacer parrillada",
              detail: "Parrilla, carbón, palillos de bambú/hierro, etc.",
            },
            { label: "Mesa del comedor" },
          ],
        },
        {
          title: "Ubicación",
          items: [
            {
              label: "Entrada independiente",
              detail: "Entrada por otra calle o edificio",
            },
          ],
        },
        {
          title: "Exterior",
          items: [
            { label: "Patio o balcón" },
            {
              label: "Patio trasero",
              detail: "Espacio abierto en la propiedad, generalmente cubierto de pasto",
            },
            { label: "Hamaca" },
            { label: "Parrilla" },
          ],
        },
        {
          title: "Estacionamiento e instalaciones",
          items: [
            { label: "Estacionamiento gratuito en las instalaciones" },
            { label: "Estacionamiento gratuito en la calle" },
            { label: "Piscina" },
            { label: "Estacionamiento de pago fuera de las instalaciones" },
          ],
        },
        {
          title: "Servicios",
          items: [
            {
              label: "Se permiten mascotas",
              detail: "No hay restricciones respecto los animales de asistencia",
            },
            { label: "Apto para fumadores" },
            {
              label: "Disponible para estadías largas",
              detail: "Permite estadías de 28 días o más",
            },
            { label: "Ingreso con cerradura inteligente", detail: "Cerradura inteligente" },
          ],
        },
      ],
      notIncluded: [
        { label: "Artículos de aseo básicos" },
        {
          label: "Detector de humo",
          detail: "No hay detector de humo en la propiedad.",
        },
        {
          label: "Detector de monóxido de carbono",
          detail:
            "No incluye detector de monóxido de carbono. Escríbenos si necesitas más información.",
        },
        { label: "Calefacción" },
      ],
    },
    rules: [
      "Capacidad máxima 21 huéspedes",
      "Garantía reembolsable de USD 300 (ver política)",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: mapsHomeOneTwo,
      coordinates: coordsHomeOneTwo,
    },
    basePricePerNightUsd: 326,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/43093803.ics?t=160b4a632c5a48f2bcb610e8c2c892d9",
    images: HOME_TWO_IMAGES,
  },
  {
    id: "4",
    slug: "casa-rustica-18-personas-max",
    name: "Rustic House",
    destination: "beach",
    shortDescription:
      "A 150 m del mar: cabaña rústica en San Clemente con piscina, vistas al mar y acceso a la playa; hasta 18 huéspedes en 6 habitaciones.",
    description:
      "Cabaña vacacional con estética rústica en San Clemente: 6 habitaciones, 11 camas, piscina, acceso a la playa, mesa de billar y vistas al océano. Manabí, Ecuador.",
    capacity: { guests: 18, bedrooms: 6, beds: 11, bathrooms: 4.5 },
    amenities: [
      "Wi‑Fi",
      "Piscina",
      "Mesa de billar",
      "Aire acondicionado",
      "Cocina equipada",
      "Estacionamiento gratuito",
      "Vistas al océano",
      "Acceso a la playa",
      "Se permiten mascotas",
      "Cámaras de seguridad",
    ],
    highlights: [
      {
        title: "Piscina privada",
        description: "Una de las pocas casas en la zona con piscina.",
      },
      {
        title: "Llegada autónoma",
        description: "Ingreso con caja de seguridad para llaves.",
      },
      {
        title: "Vistas al océano y la playa",
        description: "Disfruta las vistas durante tu estadía.",
      },
    ],
    amenityGroups: {
      categories: [
        {
          title: "Vistas panorámicas",
          items: [
            { label: "Vista a las montañas" },
            { label: "Vista al océano" },
            { label: "Vista al patio" },
            { label: "Vista al canal" },
            { label: "Vista a la playa" },
            { label: "Vista a la piscina" },
          ],
        },
        {
          title: "Baño",
          items: [{ label: "Ducha exterior" }, { label: "Agua caliente" }],
        },
        {
          title: "Dormitorio y lavandería",
          items: [
            { label: "Lavadora Pagado" },
            { label: "Secadora Pagado" },
            { label: "Sábanas" },
            { label: "Persianas o cortinas opacas" },
            { label: "Plancha" },
          ],
        },
        {
          title: "Entretenimiento",
          items: [{ label: "Televisión" }, { label: "Mesa de billar" }],
        },
        {
          title: "Calefacción y refrigeración",
          items: [{ label: "Aire acondicionado" }],
        },
        {
          title: "Seguridad en el hogar",
          items: [
            {
              label: "Cámaras de seguridad en la parte exterior de la propiedad",
              detail:
                "Cámaras en espacios comunes: Sala, patio lateral, patio posterior y patio frontal.",
            },
          ],
        },
        {
          title: "Internet y oficina",
          items: [
            { label: "Wifi" },
            { label: "Zona de trabajo privada en el alojamiento" },
          ],
        },
        {
          title: "Utensilios y vajilla",
          items: [
            { label: "Cocina", detail: "Los huéspedes pueden cocinar en este espacio" },
            { label: "Refrigerador" },
            { label: "Microondas" },
            {
              label: "Platos y cubiertos",
              detail: "Bowls, palitos chinos, platos, tazas, etc.",
            },
            { label: "Mini nevera" },
            { label: "Cocina a gas" },
            { label: "Horno" },
            { label: "Cafetera", detail: "Cafetera de filtro" },
            { label: "Copas de vino" },
            { label: "Tostadora" },
            { label: "Bandeja para hornear" },
            { label: "Licuadora" },
            { label: "Arrocera" },
            { label: "Mesa del comedor" },
          ],
        },
        {
          title: "Características de la ubicación",
          items: [
            { label: "Costa", detail: "Justo al lado del agua" },
            {
              label: "Acceso a la playa",
              detail: "Los huéspedes pueden disfrutar de una playa cercana",
            },
            {
              label: "Entrada independiente",
              detail: "Entrada por otra calle o edificio",
            },
          ],
        },
        {
          title: "Exterior",
          items: [
            { label: "Patio o balcón privado" },
            {
              label: "Patio trasero privado",
              detail:
                "Un espacio abierto en la propiedad, generalmente cubierto de pasto",
            },
            { label: "Hamaca" },
            { label: "Barbacoa", detail: "Carbón" },
          ],
        },
        {
          title: "Estacionamiento e instalaciones",
          items: [
            { label: "Estacionamiento gratuito en las instalaciones" },
            { label: "Piscina" },
          ],
        },
        {
          title: "Servicios",
          items: [
            {
              label: "Se permiten mascotas",
              detail: "No hay restricciones respecto a los animales de asistencia",
            },
            { label: "Apto para fumadores" },
            { label: "Llegada autónoma" },
            { label: "Caja de seguridad con llaves" },
          ],
        },
      ],
      notIncluded: [
        { label: "Servicios básicos" },
        {
          label: "Detector de humo",
          detail: "No hay detector de humo en la propiedad.",
        },
        {
          label: "Detector de monóxido de carbono",
          detail:
            "El anfitrión indicó que no es necesario un detector de monóxido de carbono. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        { label: "Calefacción" },
      ],
    },
    rules: ["Máximo 18 huéspedes", "Se permiten mascotas", "No fumar en dormitorios"],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: "https://maps.app.goo.gl/qg4NrzUQuzQUhGhn9",
      coordinates: { lat: -0.7682655, lng: -80.513127 },
    },
    basePricePerNightUsd: 349,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/50403775.ics?t=88621880882d456c9e21b1072b23ec7d",
    images: RUSTIC_HOUSE_IMAGES,
  },
  {
    id: "5",
    slug: "home-luxury-la-punta-18-personas-max",
    name: "La Punta",
    destination: "beach",
    beachfront: true,
    shortDescription:
      "Casa de lujo frente a la playa en San Clemente: piscina y jacuzzi privados, acceso a la playa y hasta 18 huéspedes.",
    description:
      "Casa frente a la playa en San Clemente: 5 habitaciones, 9 camas, piscina y jacuzzi privados, acceso compartido a la playa y áreas exteriores amplias. Manabí, Ecuador.",
    capacity: { guests: 18, bedrooms: 5, beds: 9, bathrooms: 6 },
    amenities: [
      "Wi‑Fi",
      "Piscina privada",
      "Jacuzzi privado",
      "Cocina equipada",
      "Estacionamiento gratuito",
      "Frente a la playa",
      "Mesa de billar",
      "Aire acondicionado",
      "Cámaras de seguridad",
      "Cerradura con teclado",
    ],
    highlights: [
      {
        title: "Piscina y jacuzzi privados",
        description: "Sumérgete en tu estadía con piscina y jacuzzi de uso exclusivo para tu grupo.",
      },
      {
        title: "Llegada autónoma",
        description:
          "Ingreso con cerradura con teclado; accede al alojamiento por tu cuenta con el código de acceso.",
      },
      {
        title: "Paz y tranquilidad",
        description: "Los huéspedes destacan lo tranquila que es la zona.",
      },
    ],
    amenityGroups: {
      categories: [
        {
          title: "Vistas panorámicas",
          items: [{ label: "Vista a la playa" }],
        },
        {
          title: "Baño",
          items: [
            { label: "Secadora de pelo" },
            { label: "Champú" },
            { label: "Jabón corporal" },
            { label: "Ducha exterior" },
            { label: "Agua caliente" },
          ],
        },
        {
          title: "Dormitorio y lavandería",
          items: [
            { label: "Lavadora Pagado" },
            { label: "Secadora Pagado" },
            { label: "Ganchos para la ropa" },
            { label: "Sábanas" },
            { label: "Persianas o cortinas opacas" },
            { label: "Plancha" },
            { label: "Tendedero de ropa" },
            { label: "Espacio para guardar la ropa", detail: "Armario" },
          ],
        },
        {
          title: "Entretenimiento",
          items: [
            { label: "Televisión" },
            { label: "Sistema de sonido" },
            { label: "Mesa de billar" },
          ],
        },
        {
          title: "Calefacción y refrigeración",
          items: [
            {
              label: "Sistema de aire acondicionado sin conductos de ventilación tipo split",
            },
          ],
        },
        {
          title: "Seguridad en el hogar",
          items: [
            {
              label: "Cámaras de seguridad en la parte exterior de la propiedad",
              detail:
                "12 cámaras distribuidas: 1 cerco exterior, 2 cerramiento exterior frontal, 3 garaje, 4 cerco lateral, 5 área de piscina, 6 acceso a la casa peatonal, 7 comedor exterior, 8 pasillo lateral exterior, 9 BBQ, 10 frontal casa, 11 acceso peatonal playa, 12 balcón planta alta.",
            },
            { label: "Detector de humo" },
            { label: "Extintor de incendios" },
          ],
        },
        {
          title: "Internet y oficina",
          items: [
            { label: "Wifi" },
            {
              label: "Zona de trabajo privada en el alojamiento",
              detail: "En un espacio compartido",
            },
          ],
        },
        {
          title: "Utensilios y vajilla",
          items: [
            { label: "Cocina", detail: "Los huéspedes pueden cocinar en este espacio" },
            { label: "Congelador de doble puerta" },
            { label: "Microondas" },
            { label: "Utensilios básicos para cocinar" },
            {
              label: "Ollas y sartenes, aceite, sal y pimienta",
            },
            {
              label: "Platos y cubiertos",
              detail: "Bowls, palitos chinos, platos, tazas, etc.",
            },
            { label: "Mini nevera" },
            { label: "Congelador" },
            { label: "Horno de acero inoxidable", detail: "Marca Teka" },
            { label: "Cafetera", detail: "Cafetera de filtro" },
            { label: "Copas de vino" },
            { label: "Tostadora" },
            { label: "Bandeja para hornear" },
            { label: "Licuadora" },
            { label: "Arrocera" },
            {
              label: "Utensilios para hacer parrillada",
              detail: "Parrilla, carbón, palillos de bambú/hierro, etc.",
            },
            { label: "Mesa del comedor" },
          ],
        },
        {
          title: "Características de la ubicación",
          items: [
            {
              label: "Acceso compartido a la playa – Frente a la playa",
              detail: "Los huéspedes pueden disfrutar de una playa cercana",
            },
          ],
        },
        {
          title: "Exterior",
          items: [
            { label: "Patio o balcón" },
            {
              label: "Patio trasero",
              detail:
                "Un espacio abierto en la propiedad, generalmente cubierto de pasto",
            },
            { label: "Lugar para hacer fogata" },
            { label: "Mobiliario exterior" },
            { label: "Zona de comida al aire libre" },
            { label: "Parrilla" },
          ],
        },
        {
          title: "Estacionamiento e instalaciones",
          items: [
            { label: "Estacionamiento gratuito en las instalaciones" },
            { label: "Piscina privada" },
            { label: "Jacuzzi privado" },
          ],
        },
        {
          title: "Servicios",
          items: [
            { label: "Apto para fumadores" },
            {
              label: "Disponible para estadías largas",
              detail: "Permite estadías de 28 días o más",
            },
            { label: "Llegada autónoma" },
            {
              label: "Cerradura con teclado",
              detail: "Accede al alojamiento por tu cuenta con el código de acceso",
            },
          ],
        },
      ],
      notIncluded: [
        { label: "Servicios básicos" },
        {
          label: "Detector de monóxido de carbono",
          detail:
            "El anfitrión indicó que no es necesario un detector de monóxido de carbono. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        { label: "Calefacción" },
      ],
    },
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
    basePricePerNightUsd: 581,
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
      "A 100 m del mar: casa vacacional en U con piscina central y palmeras; hasta 13 huéspedes, jacuzzi y zonas al aire libre.",
    description:
      "Villa Palmera es una espectacular casa vacacional en playa con arquitectura en forma de U que abre hacia una impresionante piscina central rodeada de palmeras, creando un entorno tropical único. Ideal para familias o grupos que buscan privacidad y comodidad; su diseño permite disfrutar de la brisa marina y las vistas a la piscina desde casi cada espacio. San Clemente, Manabí.",
    capacity: { guests: 13, bedrooms: 4, beds: 6, bathrooms: 5 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Piscina",
      "Jacuzzi",
      "Parrilla",
      "Comedor al aire libre",
      "Estacionamiento gratuito",
      "Aire acondicionado",
      "Televisión",
      "Ducha exterior",
      "Cámaras de seguridad",
      "Llegada autónoma",
    ],
    highlights: [
      {
        title: "Piscina central",
        description: "Una de las pocas casas en la zona con piscina.",
      },
      {
        title: "Llegada autónoma",
        description: "Ingreso con caja de seguridad para llaves.",
      },
      {
        title: "Paz y tranquilidad",
        description: "Los huéspedes destacan lo tranquila que es la zona.",
      },
    ],
    amenityGroups: {
      categories: [
        {
          title: "Baño",
          items: [{ label: "Ducha exterior" }],
        },
        {
          title: "Entretenimiento",
          items: [{ label: "Televisión" }],
        },
        {
          title: "Calefacción y refrigeración",
          items: [{ label: "Aire acondicionado" }],
        },
        {
          title: "Seguridad en el hogar",
          items: [
            {
              label: "Cámaras de seguridad en la parte exterior de la propiedad",
              detail:
                "Las cámaras están en el área de ingreso a la propiedad, garaje y área de piscina.",
            },
          ],
        },
        {
          title: "Internet y oficina",
          items: [{ label: "Wifi" }],
        },
        {
          title: "Utensilios y vajilla",
          items: [
            { label: "Cocina", detail: "Los huéspedes pueden cocinar en este espacio" },
          ],
        },
        {
          title: "Exterior",
          items: [
            { label: "Zona de comida al aire libre" },
            { label: "Parrilla" },
          ],
        },
        {
          title: "Estacionamiento e instalaciones",
          items: [
            { label: "Estacionamiento gratuito en las instalaciones" },
            { label: "Piscina" },
            { label: "Jacuzzi" },
          ],
        },
        {
          title: "Servicios",
          items: [
            { label: "Llegada autónoma" },
            { label: "Caja de seguridad con llaves" },
          ],
        },
      ],
      notIncluded: [
        { label: "Lavadora" },
        { label: "Secadora" },
        { label: "Servicios básicos" },
        {
          label: "Detector de humo",
          detail:
            "Es posible que este lugar no tenga un detector de humo. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        {
          label: "Detector de monóxido de carbono",
          detail:
            "Es posible que este lugar no tenga un detector de monóxido de carbono. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        { label: "Calefacción" },
        { label: "Agua caliente" },
      ],
    },
    rules: [
      "Capacidad máxima 13 huéspedes",
      "Check-in a partir de las 15:00",
      "Check-out antes de las 12:00",
      "No fumar en interiores",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: "https://maps.app.goo.gl/1zcYg9m4aM8ts1ZZ9",
      coordinates: { lat: -0.7688396, lng: -80.5107063 },
    },
    basePricePerNightUsd: 465,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/1528516663501304063.ics?t=11dbc9a3622f4dd182472713834c1fbd",
    images: VILLA_PALMERA_IMAGES,
  },
  {
    id: "11",
    slug: "porto-norte",
    name: "Porto Norte",
    destination: "beach",
    beachfront: true,
    shortDescription:
      "Villa frente al mar con piscina privada, BBQ y vistas al océano. Hasta 10 huéspedes.",
    description:
      "Porto Norte es una exclusiva villa frente al mar en San Clemente, diseñada para quienes buscan privacidad, comodidad y una experiencia premium. Disfruta de piscina privada, zona de BBQ, cocina totalmente equipada, amplios espacios y espectaculares vistas al mar. El lugar perfecto para descansar en familia o con amigos y crear recuerdos inolvidables junto al mar. San Clemente, Manabí.",
    capacity: { guests: 10, bedrooms: 4, beds: 6, bathrooms: 3.5 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Piscina privada",
      "Frente a playa / vistas al mar",
      "Aire acondicionado",
      "Estacionamiento gratuito",
      "Zona de parrilla / BBQ",
      "Comedor al aire libre",
      "Televisión",
      "Ducha exterior",
      "Lugar para fogata",
      "Cámaras de seguridad exteriores",
    ],
    rules: [
      "Capacidad máxima 10 huéspedes",
      "Check-in a partir de las 15:00",
      "Check-out antes de las 12:00",
      "No fumar en interiores",
    ],
    highlights: [
      {
        title: "Frente al mar",
        description:
          "Villa con vistas al océano y acceso inmediato a la playa en San Clemente.",
      },
      {
        title: "Piscina privada y BBQ",
        description: "Espacios exteriores premium de uso exclusivo para tu grupo.",
      },
      {
        title: "Ingreso con caja de llaves",
        description: "Recibes instrucciones de acceso al confirmar tu reserva.",
      },
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: "https://maps.app.goo.gl/imUygcDVw9U27dx17",
      coordinates: { lat: -0.753132, lng: -80.509735 },
    },
    basePricePerNightUsd: 372,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/1737879881985992721.ics?t=0918dfbcf81f42a7989101a118b15f87",
    images: PORTO_NORTE_IMAGES,
  },
  {
    id: "9",
    slug: "las-hamacas-portoviejo",
    name: "Las Hamacas",
    destination: "city",
    shortDescription:
      "Casa independiente en el norte de Portoviejo con piscina y BBQ de uso exclusivo. Hasta 8 huéspedes, 4 habitaciones con baño privado.",
    description:
      "Hermosa casa amoblada y completamente independiente en el norte de Portoviejo, estratégicamente ubicada cerca del centro de la ciudad, zonas comerciales, restaurantes y supermercados. Ideal para grupos de hasta 8 personas, con 4 habitaciones —cada una con baño privado—: una en planta baja (accesible) y tres en el piso superior. Piscina y área de BBQ son de uso exclusivo para huéspedes, sin horarios ni restricciones de urbanización. Apta para turismo y viajes de negocios. Ingreso con caja de llaves.",
    capacity: { guests: 8, bedrooms: 4, beds: 4, bathrooms: 4.5 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Piscina privada",
      "Parrilla",
      "Estacionamiento gratuito",
      "Aire acondicionado",
      "Televisión",
      "Ducha exterior",
      "Cámaras de seguridad",
      "Llegada autónoma",
      "Baño privado en cada habitación",
    ],
    about: {
      intro:
        "Esta hermosa propiedad está ubicada en un lugar estratégico, cerca del centro de la ciudad, locales comerciales y restaurantes.",
      sections: [
        {
          title: "La propiedad",
          lead: "Acogedora casa con piscina privada y excelente ubicación",
          paragraphs: [
            "Disfruta de una cómoda estadía en esta hermosa casa totalmente amoblada, ideal para grupos de hasta 8 personas. La propiedad cuenta con 4 habitaciones, cada una con su propio baño privado para mayor privacidad y confort. Una de las habitaciones se encuentra en la planta baja, perfecta para personas con movilidad reducida, mientras que las otras tres están en la planta alta.",
            "Ubicada en el norte de la ciudad, estarás cerca de restaurantes, centros comerciales y supermercados, lo que te permitirá disfrutar de una estadía práctica y bien conectada.",
            "Relájate en la piscina privada o comparte momentos inolvidables en el área de BBQ, perfecta para reuniones familiares o con amigos.",
            "Ya sea por turismo o trabajo, esta propiedad te ofrece todo lo que necesitas para una estadía cómoda, segura y placentera.",
          ],
        },
        {
          title: "Acceso e ingreso",
          lead: "Uso exclusivo de piscina y BBQ",
          paragraphs: [
            "La propiedad es completamente independiente, no forma parte de una urbanización ni condominio. Por esta razón, la piscina y el área de BBQ son de uso exclusivo para ustedes, sin horarios ni restricciones. Pueden disfrutar de estos espacios con total privacidad en el momento que deseen durante su estancia.",
          ],
        },
        {
          title: "Otros aspectos a destacar",
          paragraphs: [
            "Para garantizar una experiencia tranquila y segura para todos, les recordamos que no se permiten fiestas ni reuniones con personas externas a la reserva. La casa es exclusivamente para el uso de los huéspedes registrados.",
            "Agradecemos mucho su comprensión y colaboración para mantener un ambiente agradable durante su estancia.",
          ],
        },
      ],
    },
    highlights: [
      {
        title: "Piscina privada",
        description: "Una de las pocas casas en la zona con piscina.",
      },
      {
        title: "Llegada autónoma",
        description: "Ingreso con caja de seguridad para llaves.",
      },
      {
        title: "Excelente ubicación",
        description: "Cerca del centro, comercios y restaurantes en Portoviejo.",
      },
    ],
    amenityGroups: {
      categories: [
        {
          title: "Baño",
          items: [{ label: "Ducha exterior" }],
        },
        {
          title: "Dormitorio y lavandería",
          items: [{ label: "Plancha" }],
        },
        {
          title: "Entretenimiento",
          items: [{ label: "Televisión" }],
        },
        {
          title: "Calefacción y refrigeración",
          items: [{ label: "Aire acondicionado" }],
        },
        {
          title: "Seguridad en el hogar",
          items: [
            {
              label: "Cámaras de seguridad en la parte exterior de la propiedad",
              detail: "2 cámaras enfocando el ingreso.",
            },
          ],
        },
        {
          title: "Internet y oficina",
          items: [{ label: "Wifi" }],
        },
        {
          title: "Utensilios y vajilla",
          items: [
            { label: "Cocina", detail: "Los huéspedes pueden cocinar en este espacio" },
          ],
        },
        {
          title: "Exterior",
          items: [
            { label: "Zona de comida al aire libre" },
            { label: "Parrilla" },
          ],
        },
        {
          title: "Estacionamiento e instalaciones",
          items: [
            { label: "Estacionamiento gratuito en las instalaciones" },
            { label: "Piscina" },
          ],
        },
        {
          title: "Servicios",
          items: [
            { label: "Llegada autónoma" },
            { label: "Caja de seguridad con llaves" },
          ],
        },
      ],
      notIncluded: [
        { label: "Lavadora" },
        { label: "Secadora" },
        { label: "Servicios básicos" },
        {
          label: "Detector de humo",
          detail:
            "Es posible que este lugar no tenga un detector de humo. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        {
          label: "Detector de monóxido de carbono",
          detail:
            "Es posible que este lugar no tenga un detector de monóxido de carbono. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        { label: "Calefacción" },
        { label: "Agua caliente" },
      ],
    },
    rules: [
      "Capacidad máxima 8 huéspedes registrados",
      "La casa es exclusivamente para huéspedes de la reserva",
      "No se permiten fiestas ni reuniones con personas externas a la reserva",
      "No fumar en interiores",
    ],
    location: {
      area: "Portoviejo",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: mapsPortoviejo,
      coordinates: coordsPortoviejoCenter,
    },
    basePricePerNightUsd: 174,
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
      "Parrilla",
      "Comedor al aire libre",
      "Estacionamiento gratuito",
      "Aire acondicionado",
      "Televisión",
      "Ducha exterior",
      "Cámaras de seguridad",
    ],
    highlights: [
      {
        title: "Piscina",
        description: "Una de las pocas casas en la zona con piscina.",
      },
      {
        title: "Jacuzzi",
        description: "Relájate en el jacuzzi durante tu estadía.",
      },
      {
        title: "Ideal para familias",
        description: "Casa amplia y acogedora en Portoviejo.",
      },
    ],
    amenityGroups: {
      categories: [
        {
          title: "Baño",
          items: [{ label: "Ducha exterior" }],
        },
        {
          title: "Entretenimiento",
          items: [{ label: "Televisión" }],
        },
        {
          title: "Calefacción y refrigeración",
          items: [{ label: "Aire acondicionado" }],
        },
        {
          title: "Seguridad en el hogar",
          items: [
            {
              label: "Cámaras de seguridad en la parte exterior de la propiedad",
              detail: "Dos cámaras para las puertas de ingreso.",
            },
          ],
        },
        {
          title: "Internet y oficina",
          items: [{ label: "Wifi" }],
        },
        {
          title: "Utensilios y vajilla",
          items: [
            { label: "Cocina", detail: "Los huéspedes pueden cocinar en este espacio" },
          ],
        },
        {
          title: "Exterior",
          items: [
            { label: "Zona de comida al aire libre" },
            { label: "Parrilla" },
          ],
        },
        {
          title: "Estacionamiento e instalaciones",
          items: [
            { label: "Estacionamiento gratuito en las instalaciones" },
            { label: "Piscina" },
            { label: "Jacuzzi" },
          ],
        },
      ],
      notIncluded: [
        { label: "Lavadora" },
        { label: "Secadora" },
        { label: "Servicios básicos" },
        {
          label: "Detector de humo",
          detail:
            "Es posible que este lugar no tenga un detector de humo. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        {
          label: "Detector de monóxido de carbono",
          detail:
            "Es posible que este lugar no tenga un detector de monóxido de carbono. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        { label: "Calefacción" },
        { label: "Agua caliente" },
      ],
    },
    rules: [
      "Capacidad máxima 11 huéspedes registrados",
      "No fumar en interiores",
    ],
    location: {
      area: "Portoviejo",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: mapsPortoviejo,
      coordinates: coordsPortoviejoCenter,
    },
    basePricePerNightUsd: 233,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/1542938339737311039.ics?t=ef3446ccb9204f26b3b4db18bca0306c",
    images: LOS_PINOS_IMAGES,
  },
  {
    id: "12",
    slug: "container-stay-1-san-clemente",
    name: "Container Stay 2",
    destination: "beach",
    shortDescription:
      "A 500 m del mar: Container Stay moderno en San Clemente con 2 habitaciones, cocina equipada, A/C y Wi‑Fi. Hasta 4 personas.",
    description:
      "Container Stay moderno y totalmente equipado en San Clemente: 2 habitaciones para hasta 4 personas, cocina, aire acondicionado y Wi‑Fi. Ideal para parejas, familias pequeñas o escapadas a la costa.",
    capacity: { guests: 4, bedrooms: 2, beds: 2, bathrooms: 1 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Aire acondicionado",
      "Televisión",
      "Estacionamiento gratuito",
      "Cámaras de seguridad",
      "Llegada autónoma",
    ],
    about: {
      intro:
        "Descubre nuestro Container Stay: un espacio moderno, cómodo y totalmente equipado, perfecto para descansar o escaparte a San Clemente.",
      sections: [
        {
          title: "La propiedad",
          lead: "Container Stay cómodo y totalmente equipado",
          paragraphs: [
            "Cuenta con 2 habitaciones para hasta 4 personas, baño con agua caliente, cocina equipada, aire acondicionado, Wi‑Fi y ambiente aromatizado.",
            "Ideal para descansar o disfrutar una escapada en la costa.",
          ],
        },
        {
          title: "Otros aspectos a destacar",
          paragraphs: [
            "El patio y el parqueo se comparten con Container Stay 1 en el mismo terreno.",
          ],
        },
      ],
    },
    highlights: [
      {
        title: "Estacionamiento gratuito",
        description:
          "Una de las pocas casas en la zona con estacionamiento en las instalaciones.",
      },
      {
        title: "Container Stay moderno",
        description: "Espacio cómodo y totalmente equipado en San Clemente.",
      },
      {
        title: "Hasta 4 personas",
        description: "Ideal para parejas, familias pequeñas o escapadas.",
      },
    ],
    amenityGroups: {
      categories: [
        {
          title: "Entretenimiento",
          items: [{ label: "Televisión" }],
        },
        {
          title: "Calefacción y refrigeración",
          items: [{ label: "Aire acondicionado" }],
        },
        {
          title: "Seguridad en el hogar",
          items: [
            {
              label: "Cámaras de seguridad en la parte exterior de la propiedad",
            },
            { label: "Cámaras de exteriores" },
          ],
        },
        {
          title: "Internet y oficina",
          items: [{ label: "Wifi" }],
        },
        {
          title: "Utensilios y vajilla",
          items: [
            { label: "Cocina", detail: "Los huéspedes pueden cocinar en este espacio" },
          ],
        },
        {
          title: "Exterior",
          items: [{ label: "Zona de comida al aire libre" }],
        },
        {
          title: "Estacionamiento e instalaciones",
          items: [{ label: "Estacionamiento gratuito en las instalaciones" }],
        },
      ],
      notIncluded: [
        { label: "Lavadora" },
        { label: "Secadora" },
        { label: "Servicios básicos" },
        {
          label: "Detector de humo",
          detail:
            "Es posible que este lugar no tenga un detector de humo. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        {
          label: "Detector de monóxido de carbono",
          detail:
            "Es posible que este lugar no tenga un detector de monóxido de carbono. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        { label: "Calefacción" },
        { label: "Agua caliente" },
      ],
    },
    rules: [
      "Capacidad máxima 4 huéspedes",
      "Patio y parqueo compartidos con Container Stay 1 en el mismo terreno",
      "No fumar en interiores",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: mapsHomeOneTwo,
      coordinates: coordsHomeOneTwo,
    },
    basePricePerNightUsd: 75,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/1615941520178264658.ics?t=4de4cb0d72e94d79a16bde6a113df279",
    images: CONTAINER_STAY_1_IMAGES,
  },
  {
    id: "13",
    slug: "container-stay-2-san-clemente",
    name: "Container Stay 1",
    destination: "beach",
    shortDescription:
      "A 500 m del mar: Container Stay moderno en San Clemente con 2 habitaciones, cocina equipada, A/C y Wi‑Fi. Hasta 4 personas.",
    description:
      "Container Stay 1 moderno y totalmente equipado en San Clemente: 2 habitaciones para hasta 4 personas, cocina, aire acondicionado y Wi‑Fi. Ideal para parejas, familias pequeñas o escapadas a la costa.",
    capacity: { guests: 4, bedrooms: 2, beds: 2, bathrooms: 1 },
    amenities: [
      "Wi‑Fi",
      "Cocina equipada",
      "Aire acondicionado",
      "Televisión",
      "Estacionamiento gratuito",
      "Cámaras de seguridad",
      "Llegada autónoma",
    ],
    about: {
      intro:
        "Descubre nuestro Container Stay: un espacio moderno, cómodo y totalmente equipado, perfecto para descansar o escaparte a San Clemente.",
      sections: [
        {
          title: "La propiedad",
          lead: "Container Stay cómodo y totalmente equipado",
          paragraphs: [
            "Cuenta con 2 habitaciones para hasta 4 personas, baño con agua caliente, cocina equipada, aire acondicionado, Wi‑Fi y ambiente aromatizado.",
            "Ideal para descansar o disfrutar una escapada en la costa.",
          ],
        },
        {
          title: "Otros aspectos a destacar",
          paragraphs: [
            "El patio y el parqueo se comparten con Container Stay 2 en el mismo terreno.",
          ],
        },
      ],
    },
    highlights: [
      {
        title: "Estacionamiento gratuito",
        description:
          "Una de las pocas casas en la zona con estacionamiento en las instalaciones.",
      },
      {
        title: "Container Stay moderno",
        description: "Espacio cómodo y totalmente equipado en San Clemente.",
      },
      {
        title: "Hasta 4 personas",
        description: "Ideal para parejas, familias pequeñas o escapadas.",
      },
    ],
    amenityGroups: {
      categories: [
        {
          title: "Entretenimiento",
          items: [{ label: "Televisión" }],
        },
        {
          title: "Calefacción y refrigeración",
          items: [{ label: "Aire acondicionado" }],
        },
        {
          title: "Seguridad en el hogar",
          items: [
            {
              label: "Cámaras de seguridad en la parte exterior de la propiedad",
            },
            { label: "Cámaras de exteriores" },
          ],
        },
        {
          title: "Internet y oficina",
          items: [{ label: "Wifi" }],
        },
        {
          title: "Utensilios y vajilla",
          items: [
            { label: "Cocina", detail: "Los huéspedes pueden cocinar en este espacio" },
          ],
        },
        {
          title: "Exterior",
          items: [{ label: "Zona de comida al aire libre" }],
        },
        {
          title: "Estacionamiento e instalaciones",
          items: [{ label: "Estacionamiento gratuito en las instalaciones" }],
        },
      ],
      notIncluded: [
        { label: "Lavadora" },
        { label: "Secadora" },
        { label: "Servicios básicos" },
        {
          label: "Detector de humo",
          detail:
            "Es posible que este lugar no tenga un detector de humo. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        {
          label: "Detector de monóxido de carbono",
          detail:
            "Es posible que este lugar no tenga un detector de monóxido de carbono. Si tienes alguna pregunta, comunícate con el anfitrión.",
        },
        { label: "Calefacción" },
        { label: "Agua caliente" },
      ],
    },
    rules: [
      "Capacidad máxima 4 huéspedes",
      "Patio y parqueo compartidos con Container Stay 2 en el mismo terreno",
      "No fumar en interiores",
    ],
    location: {
      area: "San Clemente",
      province: "Manabí",
      country: "Ecuador",
      googleMapsUrl: mapsHomeOneTwo,
      coordinates: coordsHomeOneTwo,
    },
    basePricePerNightUsd: 70,
    icalUrl:
      "https://www.airbnb.com.ec/calendar/ical/1644692569351675312.ics?t=6f84bbcb618e46709d1e56d49b6c2f3e",
    images: CONTAINER_STAY_2_IMAGES,
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
