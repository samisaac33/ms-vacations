import siteData from "@/data/site.json";
import catalogData from "@/data/properties.json";

export type DestinationId = "san-clemente" | "portoviejo";

export interface PropertyRecord {
  id: string;
  slug: string;
  name: string;
  destination: DestinationId;
  shortDescription: string;
  description: string;
  guests: number;
  bedrooms: number;
  bathrooms: number;
  pricePerNight: number;
  cleaningFee: number;
  minNights: number;
  images: string[];
  amenities: string[];
  highlights: string[];
  googleMapsUrl: string;
  icalEnvKey: string;
}

export interface DestinationRecord {
  id: DestinationId;
  name: string;
  tagline: string;
  description: string;
  priceFrom: number;
  image: string;
  vibe: "playa" | "ciudad";
}

export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const properties = catalogData.properties as PropertyRecord[];
export const destinations = catalogData.destinations as DestinationRecord[];
export const paymentMethods = siteData.paymentMethods as PaymentMethod[];
export const bookingPolicy = siteData.bookingPolicy;

export const WHATSAPP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? siteData.whatsappUrl;

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

export function getPropertyBySlug(slug: string) {
  return properties.find((property) => property.slug === slug);
}

export function getPropertiesByDestination(destination: DestinationId) {
  return properties.filter((property) => property.destination === destination);
}

export function getDestination(id: DestinationId) {
  return destinations.find((destination) => destination.id === id);
}

export function getIcalUrl(property: PropertyRecord): string | undefined {
  const fromEnv = process.env[property.icalEnvKey];
  return fromEnv && fromEnv.length > 0 ? fromEnv : undefined;
}

export function getCoverImage(property: PropertyRecord): string {
  return property.images[0] ?? "/images/placeholder-property.jpg";
}

export function getPropertyImageAlt(property: PropertyRecord, index = 0): string {
  return `${property.name} — foto ${index + 1}`;
}
