import type { LegalContactInfo, LegalSection } from "@/lib/legal/types";
import { formatLegalEntityBlock } from "@/lib/legal/contact-info";

const LAST_UPDATED = "21 de julio de 2026";

export function getRefundableGuaranteePolicyMeta() {
  return {
    lastUpdated: LAST_UPDATED,
    description:
      "Política de garantía reembolsable de USD 300 para reservas directas en MS Vacations — inspección post check-out y condiciones de devolución.",
  };
}

export function getRefundableGuaranteePolicySections(info: LegalContactInfo): LegalSection[] {
  const siteHost = info.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return [
    {
      title: "Identificación del prestador",
      paragraphs: [formatLegalEntityBlock(info)],
    },
    {
      title: "Alcance",
      paragraphs: [
        `Esta política aplica a reservas directas confirmadas y pagadas a través del sitio web de ${info.siteName} (${siteHost}).`,
        "No aplica a reservas realizadas a través de plataformas de terceros como Airbnb, cuyas condiciones rigen por separado.",
      ],
    },
    {
      title: "Política de garantía reembolsable",
      paragraphs: [
        "Con el propósito de preservar el excelente estado de nuestras propiedades y garantizar una experiencia de calidad para todos nuestros huéspedes, todas las reservas directas realizadas con MS Vacations están sujetas a una garantía reembolsable de USD 300.",
      ],
    },
    {
      title: "Finalidad de la garantía",
      paragraphs: [
        "Esta garantía tiene como finalidad cubrir cualquier daño, pérdida de artículos, incumplimiento del reglamento interno o costos extraordinarios de limpieza que pudieran generarse durante la estancia.",
      ],
    },
    {
      title: "Inspección post check-out",
      paragraphs: [
        "Una vez realizado el check-out, nuestro equipo efectuará una inspección completa de la propiedad, que incluye la verificación del inventario, el estado general de las instalaciones y el proceso de limpieza.",
      ],
    },
    {
      title: "Devolución íntegra",
      paragraphs: [
        "Si la propiedad es entregada en las mismas condiciones en que fue recibida y no se presentan novedades, la garantía será reembolsada en su totalidad.",
      ],
    },
    {
      title: "Plazo de revisión y devolución",
      paragraphs: [
        "El proceso de revisión y devolución de la garantía se realiza normalmente dentro de las primeras 24 horas posteriores al check-out; sin embargo, este plazo podrá extenderse hasta un máximo de 48 horas, dependiendo de la disponibilidad de nuestro personal de limpieza, del tiempo requerido para completar la inspección o del volumen de reservas programadas.",
      ],
    },
    {
      title: "Descuentos y responsabilidad por excedente",
      paragraphs: [
        "En caso de evidenciarse daños, faltantes, incumplimiento de las políticas de la propiedad o gastos adicionales debidamente justificados, dichos valores serán descontados de la garantía. Si los costos exceden el monto de la garantía, el huésped será responsable de cubrir la diferencia correspondiente.",
      ],
    },
    {
      title: "Aceptación de la política",
      paragraphs: [
        "Al confirmar una reserva directa con MS Vacations, el huésped reconoce haber leído, comprendido y aceptado esta política como parte de los términos y condiciones de su reserva.",
      ],
    },
    {
      title: "Cambios a esta política",
      paragraphs: [
        `${info.siteName} puede actualizar esta política. La versión vigente es la publicada en esta página con fecha de última actualización: ${LAST_UPDATED}.`,
        "Las reservas ya confirmadas antes de un cambio mantienen las condiciones vigentes en el momento del pago, salvo que la ley exija lo contrario.",
      ],
    },
    {
      title: "Nota",
      paragraphs: [
        "Este documento tiene carácter informativo sobre las condiciones comerciales de MS Vacations. Se recomienda consultar con asesoría jurídica local si necesitas un dictamen formal sobre tu situación particular.",
      ],
    },
  ];
}
