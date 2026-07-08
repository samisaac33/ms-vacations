export const siteConfig = {
  name: "MS Vacations",
  tagline: "Alojamientos vacacionales en playa y ciudad",
  description:
    "Casas y apartamentos en San Clemente y Portoviejo, Manabí. Reserva en línea con calendario de disponibilidad y pago directo.",
  locale: "es_EC",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? undefined,
    whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "593998297151",
  },
  location: {
    area: "Manabí — playa y ciudad",
    province: "Manabí",
    country: "Ecuador",
  },
  destinations: {
    beach: {
      label: "Playa",
      area: "San Clemente",
      subtitle:
        "Viviendas vacacionales con piscina en la costa de Manabí, preparadas para familias y grupos.",
    },
    city: {
      label: "Ciudad",
      area: "Portoviejo",
      subtitle:
        "Apartamentos en Portoviejo para viajes de trabajo, familia o estadías urbanas en Manabí.",
    },
  },
  /** Textos orientados al huésped (evitar jerga de administrador). */
  copy: {
    catalogPath: "/propiedades",
    heroEyebrow: "MS Vacations · Manabí",
    heroTitle: "Alojamientos vacacionales en playa y ciudad",
    heroSubtitle:
      "Propiedades seleccionadas en San Clemente y Portoviejo. Consulta disponibilidad y reserva en línea.",
    heroDestinationsBadge: "Playa · Ciudad",
    heroCta: "Ver alojamientos",
    heroCtaBeach: "San Clemente",
    heroCtaCity: "Portoviejo",
    catalogNav: "Alojamientos",
    catalogTitle: "Alojamientos vacacionales",
    catalogSubtitle:
      "Casas en San Clemente y apartamentos en Portoviejo. Tarifas en USD con reserva directa.",
    featuredBeachHeading: "San Clemente",
    featuredCityHeading: "Portoviejo",
    seeAll: "Ver todos los alojamientos →",
    otherHomes: "Otros alojamientos",
    guidePath: "/guia",
    guideNav: "Guía de la zona",
    guideCityNote: "¿Prefieres hospedarte en la ciudad?",
    guideCityLink: "Ver alojamientos en Portoviejo →",
    locationsHeading: "Nuestros destinos",
    locationsIntro:
      "Operamos en San Clemente, en la costa de Manabí, y en Portoviejo. Cada ficha incluye referencia en Google Maps; la ubicación exacta se confirma al reservar.",
  },
} as const;
