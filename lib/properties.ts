export type DestinationId = "san-clemente" | "portoviejo";

export interface Property {
  id: string;
  slug: string;
  name: string;
  destination: DestinationId;
  description: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  priceFrom: number;
  highlights: string[];
  imageUrl: string;
  imageAlt: string;
}

export interface Destination {
  id: DestinationId;
  name: string;
  tagline: string;
  description: string;
  propertyCount: number;
  priceFrom: number;
  imageUrl: string;
  href: string;
  vibe: "playa" | "ciudad";
}

export const destinations: Destination[] = [
  {
    id: "san-clemente",
    name: "San Clemente",
    tagline: "Playa y casas con piscina",
    description:
      "Viviendas vacacionales en la costa de Manabí, ideales para familias y grupos grandes.",
    propertyCount: 5,
    priceFrom: 250,
    imageUrl:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80",
    href: "#san-clemente",
    vibe: "playa",
  },
  {
    id: "portoviejo",
    name: "Portoviejo",
    tagline: "Apartamentos en la ciudad",
    description:
      "Alojamientos urbanos para viajes de trabajo, familia o estadías cortas en Manabí.",
    propertyCount: 2,
    priceFrom: 45,
    imageUrl:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80",
    href: "#portoviejo",
    vibe: "ciudad",
  },
];

export const properties: Property[] = [
  {
    id: "1",
    slug: "alojamiento-arrecife",
    name: "Alojamiento en Arrecife",
    destination: "san-clemente",
    description:
      "Villa moderna de dos plantas con piscina iluminada, amplia zona exterior y luz cálida ideal para familias o grupos.",
    guests: 14,
    bedrooms: 5,
    bathrooms: 4,
    priceFrom: 250,
    highlights: ["Piscina", "Zona exterior", "Ideal para familias"],
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    imageAlt: "Villa con piscina en San Clemente",
  },
  {
    id: "2",
    slug: "casa-home-one",
    name: "Casa vacacional Home One",
    destination: "san-clemente",
    description:
      "Casa vacacional de gran capacidad con piscina y zona de esparcimiento para hasta 18 huéspedes.",
    guests: 18,
    bedrooms: 6,
    bathrooms: 5,
    priceFrom: 260,
    highlights: ["Piscina", "Gran capacidad", "Grupos"],
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    imageAlt: "Casa vacacional amplia en San Clemente",
  },
  {
    id: "3",
    slug: "casa-home-two",
    name: "Casa vacacional Home Two",
    destination: "san-clemente",
    description:
      "La opción de mayor capacidad: hasta 21 huéspedes, perfecta para retiros o familias numerosas.",
    guests: 21,
    bedrooms: 7,
    bathrooms: 6,
    priceFrom: 280,
    highlights: ["Hasta 21 huéspedes", "Piscina", "Retiros"],
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    imageAlt: "Casa grande para grupos en San Clemente",
  },
  {
    id: "4",
    slug: "casa-rustica",
    name: "Casa rústica",
    destination: "san-clemente",
    description:
      "Estética rústica con madera y piedra; hasta 18 huéspedes, con piscina y zona exterior.",
    guests: 18,
    bedrooms: 6,
    bathrooms: 5,
    priceFrom: 300,
    highlights: ["Estilo rústico", "Piscina", "Ambiente acogedor"],
    imageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    imageAlt: "Casa rústica con piscina en San Clemente",
  },
  {
    id: "5",
    slug: "home-luxury-la-punta",
    name: "Home Luxury La Punta",
    destination: "san-clemente",
    description:
      "Casa de lujo frente a la playa con piscina, jacuzzi, terraza y vistas al mar.",
    guests: 18,
    bedrooms: 6,
    bathrooms: 5,
    priceFrom: 500,
    highlights: ["Frente al mar", "Jacuzzi", "Lujo"],
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    imageAlt: "Casa de lujo frente al mar en La Punta, San Clemente",
  },
  {
    id: "6",
    slug: "apartamento-portoviejo",
    name: "Apartamento MS Vacations",
    destination: "portoviejo",
    description:
      "Apartamento equipado en Portoviejo, ideal para viajes de trabajo, familia o escapadas urbanas.",
    guests: 4,
    bedrooms: 2,
    bathrooms: 1,
    priceFrom: 65,
    highlights: ["Céntrico", "Equipado", "Familias"],
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80",
    imageAlt: "Apartamento amoblado en Portoviejo",
  },
  {
    id: "7",
    slug: "suite-portoviejo",
    name: "Suite MS Vacations",
    destination: "portoviejo",
    description:
      "Suite amoblada para parejas o viajeros en solitario, con lo esencial para una estancia cómoda.",
    guests: 2,
    bedrooms: 1,
    bathrooms: 1,
    priceFrom: 45,
    highlights: ["Parejas", "Económico", "Cómodo"],
    imageUrl:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
    imageAlt: "Suite en Portoviejo",
  },
];

export const trustFeatures = [
  {
    title: "Reserva directa",
    description:
      "Sin intermediarios ni comisiones de plataformas externas. Mejor trato y precio.",
  },
  {
    title: "Atención personalizada",
    description:
      "Te acompañamos por WhatsApp antes, durante y después de tu estadía.",
  },
  {
    title: "Casas para grupos",
    description:
      "Propiedades amplias con piscina, pensadas para familias y reuniones de hasta 21 personas.",
  },
  {
    title: "Dos destinos en Manabí",
    description:
      "Playa en San Clemente y comodidad urbana en Portoviejo, según tu tipo de viaje.",
  },
];

export function getPropertiesByDestination(destination: DestinationId) {
  return properties.filter((property) => property.destination === destination);
}

export const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ??
  "https://wa.me/593999999999?text=Hola%2C%20quiero%20información%20sobre%20un%20alojamiento%20en%20MS%20Vacations";
