export type ContentAssetCategory = "booking-flow";

export type ContentAsset = {
  id: string;
  title: string;
  description: string;
  href: string;
  downloadName: string;
  category: ContentAssetCategory;
};

export const BOOKING_FLOW_CONTENT_ASSETS: ContentAsset[] = [
  {
    id: "booking-step-1",
    title: "Paso 1 — Elige tu alojamiento",
    description:
      "Captura real de la ficha en móvil con anotaciones: explora fotos y toca Reservar.",
    href: "/images/content/booking-flow/paso-1-elige-alojamiento.png",
    downloadName: "ms-vacations-reserva-paso-1-elige-alojamiento.png",
    category: "booking-flow",
  },
  {
    id: "booking-step-2",
    title: "Paso 2 — Completa tu reserva",
    description:
      "Captura del asistente móvil con flechas señalando fechas, huéspedes y método de pago.",
    href: "/images/content/booking-flow/paso-2-completa-reserva.png",
    downloadName: "ms-vacations-reserva-paso-2-completa-reserva.png",
    category: "booking-flow",
  },
  {
    id: "booking-step-3",
    title: "Paso 3 — Recibe confirmación",
    description:
      "Captura de la pantalla de confirmación con resumen y referencia de reserva.",
    href: "/images/content/booking-flow/paso-3-confirmacion.png",
    downloadName: "ms-vacations-reserva-paso-3-confirmacion.png",
    category: "booking-flow",
  },
];

export function getAdminContentAssets(): ContentAsset[] {
  return BOOKING_FLOW_CONTENT_ASSETS;
}
