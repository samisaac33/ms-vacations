import type { LegalContactInfo, LegalSection } from "@/lib/legal/types";
import { formatLegalEntityBlock } from "@/lib/legal/contact-info";

const LAST_UPDATED = "10 de julio de 2026";

function contactChannels({ contactEmail, contactWhatsapp }: LegalContactInfo): string {
  const parts: string[] = [];
  if (contactEmail) parts.push(`correo ${contactEmail}`);
  parts.push(`WhatsApp +${contactWhatsapp}`);
  return parts.join(" o ");
}

export function getCancellationPolicyMeta() {
  return {
    lastUpdated: LAST_UPDATED,
    description:
      "Política de cancelaciones, cambios y devoluciones para reservas directas en MS Vacations — reembolsos según plazos Moderate.",
  };
}

export function getCancellationPolicySections(info: LegalContactInfo): LegalSection[] {
  const siteHost = info.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const contact = contactChannels(info);

  return [
    {
      title: "Identificación del prestador",
      paragraphs: [formatLegalEntityBlock(info)],
    },
    {
      title: "Alcance",
      paragraphs: [
        `Esta política aplica a reservas confirmadas y pagadas a través del sitio web de ${info.siteName} (${siteHost}), canal directo de reserva.`,
        "Corresponde a estancias de 27 noches o menos. Para estancias más largas pueden aplicarse condiciones distintas, que se comunicarán por escrito antes de confirmar el pago.",
      ],
    },
    {
      title: "Reservas realizadas en Airbnb",
      paragraphs: [
        "Si reservaste a través de Airbnb, rigen las condiciones de cancelación y reembolso del anuncio correspondiente en esa plataforma.",
        "Esta página no sustituye ni modifica las reglas de Airbnb. MS Vacations sincroniza disponibilidad desde Airbnb para evitar doble reserva, pero cada canal mantiene sus propias condiciones contractuales.",
      ],
    },
    {
      title: "Ventana de cancelación gratuita de 24 horas",
      paragraphs: [
        "Tras confirmar el pago de tu reserva directa, dispones de un plazo de 24 horas para cancelar con reembolso total del importe pagado, siempre que la fecha de check-in sea al menos 7 días después de la confirmación.",
        "El plazo de 24 horas se cuenta desde el momento en que recibes la confirmación de pago, según la hora oficial de Ecuador (America/Guayaquil).",
      ],
    },
    {
      title: "Política Moderate",
      paragraphs: [
        "MS Vacations aplica la política de cancelación Moderate, alineada con el estándar de Airbnb para estancias cortas:",
      ],
      list: [
        "Reembolso total si cancelas al menos 5 días naturales antes de la fecha de check-in (hora Ecuador, America/Guayaquil).",
        "Si cancelas con menos de 5 días de antelación al check-in, recibirás un reembolso parcial equivalente al 50% del importe correspondiente a las noches no disfrutadas (las noches comprendidas entre la fecha de cancelación y el check-out previsto en tu reserva).",
        "Las noches ya transcurridas, si hubieras iniciado la estancia, no son reembolsables.",
        "Cualquier impuesto, tasa o cargo incluido en el precio total se ajustará de forma proporcional al reembolso aplicable.",
      ],
    },
    {
      title: "Cambios de reserva (modificación de fechas)",
      paragraphs: [
        "Si deseas modificar las fechas de check-in o check-out de una reserva confirmada, contáctanos por " +
          contact +
          " con la mayor antelación posible.",
        "Los cambios están sujetos a disponibilidad de la propiedad y a la tarifa vigente para las nuevas fechas. Si el nuevo total es mayor, deberás abonar la diferencia antes de confirmar el cambio; si es menor, aplicaremos la política de reembolso parcial según las secciones siguientes cuando corresponda.",
        "Un cambio de fechas no garantiza la misma tarifa por noche ni la misma condición de IVA (15 % o 8 % en feriados decretados) que la reserva original.",
        "MS Vacations evaluará cada solicitud de cambio de forma individual y confirmará por escrito si el cambio procede y el importe resultante.",
      ],
    },
    {
      title: "Cómo solicitar una cancelación",
      paragraphs: [
        `Envía tu solicitud por ${contact}, indicando tu nombre, el correo usado en la reserva, las fechas de check-in y check-out, y la propiedad reservada.`,
        "MS Vacations confirmará por el mismo canal si la cancelación procede según esta política y el importe de reembolso correspondiente.",
      ],
    },
    {
      title: "Procesamiento de reembolsos",
      paragraphs: [
        "Los reembolsos aprobados se procesan por el mismo método de pago: transferencia a la cuenta indicada, reversión vía PayPal o PayPhone según corresponda.",
        "El abono en tu cuenta puede tardar entre 5 y 10 días hábiles, según tu entidad bancaria o emisor de la tarjeta.",
        "MS Vacations no cobra comisiones adicionales por procesar un reembolso conforme a esta política.",
      ],
    },
    {
      title: "No presentación",
      paragraphs: [
        "Si no te presentas en la propiedad en la fecha de check-in y no has cancelado previamente conforme a esta política, la reserva se considerará utilizada y no procederá reembolso, salvo acuerdo expreso por escrito con MS Vacations.",
      ],
    },
    {
      title: "Circunstancias excepcionales",
      paragraphs: [
        "En situaciones de fuerza mayor o eventos extraordinarios que impidan razonablemente el uso de la propiedad o el acceso al destino, MS Vacations evaluará cada caso de forma individual.",
        "Las solicitudes deberán incluir la documentación o información que permita verificar la situación. No se garantiza un reembolso automático distinto al previsto en las secciones anteriores.",
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
