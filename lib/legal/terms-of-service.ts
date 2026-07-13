import type { LegalContactInfo, LegalSection } from "@/lib/legal/types";
import { formatLegalEntityBlock } from "@/lib/legal/contact-info";
import {
  HOSPITALITY_VAT_PROMOTIONAL_RATE,
  HOSPITALITY_VAT_STANDARD_RATE,
  getPromotionalVatPeriodsSummary,
} from "@/lib/legal/hospitality-vat";

const LAST_UPDATED = "10 de julio de 2026";

function contactChannels({ contactEmail, contactWhatsapp }: LegalContactInfo): string {
  const parts: string[] = [];
  if (contactEmail) parts.push(`correo ${contactEmail}`);
  parts.push(`WhatsApp +${contactWhatsapp}`);
  return parts.join(" o ");
}

export function getTermsOfServiceMeta() {
  return {
    lastUpdated: LAST_UPDATED,
    description:
      "Términos y condiciones de MS Vacations para reservas directas de casas vacacionales en Manabí (costa y Portoviejo).",
  };
}

export function getTermsOfServiceSections(info: LegalContactInfo): LegalSection[] {
  const siteHost = info.siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const contact = contactChannels(info);

  return [
    {
      title: "Identificación del prestador",
      paragraphs: [
        formatLegalEntityBlock(info),
        `${info.siteName} opera alojamiento vacacional en Manabí (San Clemente y Portoviejo) a través del sitio web ${siteHost}.`,
      ],
    },
    {
      title: "Aceptación de los términos",
      paragraphs: [
        `Al acceder a este sitio web y, en particular, al completar una reserva directa, aceptas estos Términos y Condiciones de ${info.siteName}.`,
        "Si no estás de acuerdo, no utilices el sitio para reservar. Debes ser mayor de edad y actuar en nombre propio o con autorización para contratar en nombre de los demás huéspedes.",
      ],
    },
    {
      title: "Alcance y relación contractual",
      paragraphs: [
        `Estos términos regulan el uso del sitio ${siteHost} y las reservas confirmadas y pagadas a través del canal directo de ${info.siteName}.`,
        "Si reservaste a través de Airbnb u otra plataforma, rigen los términos y condiciones de esa plataforma; este documento no los sustituye.",
        "La información publicada en cada ficha de propiedad (capacidad, descripción, reglas de la casa y precio orientativo) forma parte del contrato de hospedaje junto con estos términos y la confirmación de pago.",
      ],
    },
    {
      title: "Proceso de reserva",
      list: [
        "Seleccionas fechas disponibles, número de huéspedes y proporcionas un correo de contacto.",
        "El sistema verifica disponibilidad (incluidos bloqueos sincronizados desde calendarios externos como Airbnb).",
        "Tras confirmar el pago (PayPal, PayPhone o transferencia verificada), recibes confirmación de la reserva.",
        "Una reserva pendiente de pago puede expirar automáticamente si no se completa en el plazo indicado (30 minutos en línea; 72 horas para transferencia bancaria antes de subir comprobante).",
      ],
    },
    {
      title: "Precios, IVA e impuestos",
      paragraphs: [
        "Los precios publicados y el total de tu reserva se expresan en dólares estadounidenses (USD). Salvo indicación contraria en la confirmación, los importes incluyen el Impuesto al Valor Agregado (IVA) aplicable al servicio de alojamiento turístico.",
        `La tarifa general del IVA para hospedaje turístico en Ecuador es del ${HOSPITALITY_VAT_STANDARD_RATE * 100} %. Durante feriados nacionales o locales —y los fines de semana colindantes cuando así lo disponga un Decreto Ejecutivo— la tarifa puede reducirse al ${HOSPITALITY_VAT_PROMOTIONAL_RATE * 100} % para servicios turísticos registrados conforme a la Ley de Turismo.`,
        "La reducción al 8 % no es automática: requiere decreto presidencial vigente, registro de turismo y emisión del comprobante de venta con la tarifa correspondiente. Períodos decretados publicados en este sitio (referencia): " +
          getPromotionalVatPeriodsSummary() +
          ". Consulta la versión vigente al reservar; MS Vacations actualizará los períodos cuando se publiquen nuevos decretos.",
        "Si tu estancia abarca noches con tarifas de IVA distintas, el desglose se reflejará en la factura o comprobante emitido al confirmar el pago.",
      ],
    },
    {
      title: "Precios y pagos",
      paragraphs: [
        "Los precios se muestran en dólares estadounidenses (USD) salvo indicación contraria. El importe total de la estancia se calcula según el número de noches entre check-in y check-out y la tarifa vigente de la propiedad al momento de reservar.",
        "Aceptamos transferencia bancaria (con 7% de descuento adicional sobre el total de reserva directa), PayPal y PayPhone. MS Vacations no almacena números completos de tarjeta.",
        "En transferencia bancaria debes subir el comprobante; la reserva se confirma tras verificación manual. El precio confirmado al reservar es el importe contractual, salvo error manifiesto que MS Vacations se reserve corregir antes de aceptar el pago.",
        "Tras confirmar el pago, emitiremos el comprobante de venta (factura electrónica u otro documento autorizado por el SRI) con el desglose de IVA que corresponda según la normativa vigente y la fecha de prestación del servicio.",
      ],
    },
    {
      title: "Obligaciones del huésped",
      paragraphs: ["Durante tu estancia te comprometes a:"],
      list: [
        "Respetar el número máximo de huéspedes indicado en la reserva.",
        "Cumplir las reglas de la casa publicadas en la ficha de la propiedad (por ejemplo: no fumar en interiores, horarios de silencio, uso responsable de piscinas y áreas comunes).",
        "Tratar la propiedad y sus enseres con cuidado razonable.",
        "No realizar actividades ilegales, eventos no autorizados ni usos distintos al alojamiento vacacional acordado.",
        "Comunicar con prontitud cualquier incidencia o daño accidental a MS Vacations.",
      ],
    },
    {
      title: "Check-in, check-out y acceso",
      paragraphs: [
        "Las horas de entrada y salida, así como las instrucciones de acceso, se comunicarán tras confirmar la reserva por los canales de contacto oficiales.",
        "La salida debe realizarse en la fecha de check-out acordada, dejando la propiedad en condiciones razonables de orden y limpieza.",
      ],
    },
    {
      title: "Cancelaciones y reembolsos",
      paragraphs: [
        "Las condiciones de cancelación para reservas directas se rigen por nuestra Política de cancelaciones (política Moderate, alineada con el estándar de Airbnb para estancias de hasta 27 noches).",
        "Consulta el detalle completo en la página de cancelaciones de este sitio. Las solicitudes de cancelación deben enviarse por los canales indicados en dicha política.",
      ],
    },
    {
      title: "Privacidad",
      paragraphs: [
        "El tratamiento de tus datos personales se describe en nuestra Política de privacidad, disponible en este sitio web y conforme a la LOPDP de Ecuador.",
      ],
    },
    {
      title: "Defensa del consumidor",
      paragraphs: [
        "Como consumidor en Ecuador puedes presentar reclamos relacionados con la prestación del servicio de alojamiento. Te atenderemos por los canales de contacto indicados en estos términos.",
        "Si no recibes respuesta satisfactoria, puedes acudir a las autoridades de defensa del consumidor competentes conforme a la Ley Orgánica de Defensa del Consumidor.",
      ],
    },
    {
      title: "Disponibilidad del calendario",
      paragraphs: [
        "MS Vacations sincroniza la disponibilidad desde calendarios externos (por ejemplo, reservas de Airbnb) para reducir el riesgo de doble reserva.",
        "La sincronización no es en tiempo real; en casos excepcionales de conflicto, MS Vacations se compromete a proponer una solución razonable (reubicación, reembolso o alternativa equivalente).",
      ],
    },
    {
      title: "Depósitos, daños y cargos adicionales",
      paragraphs: [
        "Salvo que se indique expresamente en la confirmación o en la ficha de la propiedad, el precio de la reserva incluye el alojamiento según lo descrito.",
        "MS Vacations puede reclamar el pago de daños causados por incumplimiento de estas condiciones o por uso negligente, previa comunicación y, cuando corresponda, documentación del daño.",
      ],
    },
    {
      title: "Limitación de responsabilidad",
      paragraphs: [
        `${info.siteName} no garantiza un servicio ininterrumpido del sitio web. No somos responsables de interrupciones causadas por terceros (pasarela de pago, proveedores de internet, fuerza mayor).`,
        "En la medida permitida por la ley ecuatoriana, nuestra responsabilidad frente al huésped se limita al importe efectivamente pagado por la reserva directa objeto de la reclamación, salvo dolo o culpa grave.",
        "No respondemos por pérdida de objetos personales, interrupciones de servicios públicos ajenos a nuestro control ni por decisiones de viaje del huésped no relacionadas con el alojamiento contratado.",
      ],
    },
    {
      title: "Fuerza mayor",
      paragraphs: [
        "Ninguna de las partes será responsable por incumplimientos debidos a eventos fuera de su control razonable (desastres naturales, restricciones gubernamentales, cortes generalizados de servicios, etc.), sin perjuicio de los reembolsos o alternativas que correspondan según la política de cancelaciones o acuerdo mutuo.",
      ],
    },
    {
      title: "Propiedad intelectual",
      paragraphs: [
        "El contenido del sitio (textos, imágenes, marca y diseño) pertenece a MS Vacations o a sus licenciantes. No está permitida su reproducción comercial sin autorización escrita.",
      ],
    },
    {
      title: "Modificaciones",
      paragraphs: [
        `MS Vacations puede actualizar estos términos. La versión vigente se publica en esta página con fecha de última actualización: ${LAST_UPDATED}.`,
        "Las reservas confirmadas antes de un cambio mantienen las condiciones vigentes en el momento del pago, salvo que la ley exija lo contrario.",
      ],
    },
    {
      title: "Ley aplicable y jurisdicción",
      paragraphs: [
        "Estos términos se rigen por las leyes de la República del Ecuador.",
        "Cualquier controversia derivada de reservas directas se someterá preferentemente a solución amistosa. En su defecto, a los tribunales competentes de Ecuador, salvo norma imperativa en contrario.",
      ],
    },
    {
      title: "Contacto",
      paragraphs: [
        `Para consultas sobre estos términos o tu reserva, escríbenos por ${contact}.`,
      ],
    },
    {
      title: "Nota",
      paragraphs: [
        "Este documento describe las condiciones generales del canal directo de MS Vacations. Para un dictamen legal formal, consulta con un profesional del derecho en Ecuador.",
      ],
    },
  ];
}
