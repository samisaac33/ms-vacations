export type BookingFlowStep = {
  step: "1" | "2" | "3";
  imageBase: string;
  alt: string;
  title: string;
  description: string;
  exportFilename: string;
  downloadName: string;
};

export const BOOKING_FLOW_STEPS: BookingFlowStep[] = [
  {
    step: "1",
    imageBase: "01-propiedad-movil",
    alt: "Ficha de propiedad en móvil: Villa Palmera con galería, detalles y botón Reservar",
    title: "Elige tu alojamiento",
    description:
      "Explora fotos, capacidad y amenidades. Toca Reservar para elegir fechas y huéspedes.",
    exportFilename: "paso-1-elige-alojamiento.png",
    downloadName: "ms-vacations-reserva-paso-1-elige-alojamiento.png",
  },
  {
    step: "2",
    imageBase: "02-reservar-movil",
    alt: "Asistente de reserva en móvil: revisión de fechas, huéspedes y método de pago",
    title: "Completa tu reserva",
    description:
      "Revisa fechas y huéspedes, elige método de pago y confirma en un flujo paso a paso.",
    exportFilename: "paso-2-completa-reserva.png",
    downloadName: "ms-vacations-reserva-paso-2-completa-reserva.png",
  },
  {
    step: "3",
    imageBase: "03-confirmacion-movil",
    alt: "Pantalla de confirmación en móvil tras completar la reserva",
    title: "Recibe confirmación",
    description:
      "Al finalizar el pago o la transferencia, recibes confirmación y referencia de reserva.",
    exportFilename: "paso-3-confirmacion.png",
    downloadName: "ms-vacations-reserva-paso-3-confirmacion.png",
  },
];

export function bookingFlowScreenshotPath(imageBase: string): string {
  return `/images/booking-flow-mobile/${imageBase}-light.png`;
}

export function bookingFlowExportPath(filename: string): string {
  return `/images/content/booking-flow/${filename}`;
}

export function getBookingFlowStep(stepId: string): BookingFlowStep | undefined {
  return BOOKING_FLOW_STEPS.find((step) => step.step === stepId);
}
