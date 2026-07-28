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
      "Ficha de propiedad en móvil: explora fotos, capacidad y amenidades; elige fechas y toca Reservar.",
    href: "/images/content/booking-flow/paso-1-elige-alojamiento.png",
    downloadName: "ms-vacations-reserva-paso-1-elige-alojamiento.png",
    category: "booking-flow",
  },
  {
    id: "booking-step-2",
    title: "Paso 2 — Completa tu reserva",
    description:
      "Asistente móvil paso a paso: revisa fechas, huéspedes, método de pago y confirma la reserva.",
    href: "/images/content/booking-flow/paso-2-completa-reserva.png",
    downloadName: "ms-vacations-reserva-paso-2-completa-reserva.png",
    category: "booking-flow",
  },
  {
    id: "booking-step-3",
    title: "Paso 3 — Recibe confirmación",
    description:
      "Pantalla de confirmación con resumen, referencia de reserva y detalles enviados al correo.",
    href: "/images/content/booking-flow/paso-3-confirmacion.png",
    downloadName: "ms-vacations-reserva-paso-3-confirmacion.png",
    category: "booking-flow",
  },
];

export function getAdminContentAssets(): ContentAsset[] {
  return BOOKING_FLOW_CONTENT_ASSETS;
}
