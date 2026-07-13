import type { LegalContactInfo, LegalSection } from "@/lib/legal/types";
import { formatLegalEntityBlock } from "@/lib/legal/contact-info";

const LAST_UPDATED = "10 de julio de 2026";

function contactChannels({ contactEmail, contactWhatsapp }: LegalContactInfo): string {
  const parts: string[] = [];
  if (contactEmail) parts.push(`correo ${contactEmail}`);
  parts.push(`WhatsApp +${contactWhatsapp}`);
  return parts.join(" o ");
}

export function getPrivacyPolicyMeta() {
  return {
    lastUpdated: LAST_UPDATED,
    description:
      "Política de privacidad de MS Vacations — tratamiento de datos personales en reservas directas, conforme a la LOPDP de Ecuador.",
  };
}

export function getPrivacyPolicySections(info: LegalContactInfo): LegalSection[] {
  const contact = contactChannels(info);

  return [
    {
      title: "Responsable del tratamiento",
      paragraphs: [
        formatLegalEntityBlock(info),
        `${info.siteName} es responsable del tratamiento de los datos personales recopilados a través de este sitio web para reservas directas.`,
        `Para ejercer tus derechos o consultas sobre privacidad, contáctanos por ${contact}.`,
      ],
    },
    {
      title: "Alcance",
      paragraphs: [
        "Esta política describe cómo tratamos los datos cuando reservas y pagas en nuestro sitio web.",
        "Si reservaste a través de Airbnb, tus datos personales en ese canal están sujetos a la política de privacidad de Airbnb (https://www.airbnb.com/help/article/2855), no a la presente.",
      ],
    },
    {
      title: "Datos que recopilamos",
      paragraphs: ["En el proceso de reserva directa podemos tratar:"],
      list: [
        "Correo electrónico de contacto.",
        "Fechas de check-in y check-out, número de huéspedes y propiedad seleccionada.",
        "Importe de la reserva, moneda, método de pago e identificadores de la transacción (PayPal, PayPhone o comprobante de transferencia).",
        "Datos técnicos mínimos del servidor (dirección IP, agente de usuario, registros de error) necesarios para seguridad y funcionamiento del sitio.",
      ],
    },
    {
      title: "Datos que no almacenamos",
      paragraphs: [
        "Los pagos en línea se procesan a través de PayPal o PayPhone. Las transferencias bancarias requieren comprobante, que almacenamos para verificar el pago. No guardamos números completos de tarjeta en nuestros servidores.",
        "PayPal y PayPhone tratan los datos de pago conforme a sus propias políticas de privacidad y estándares de seguridad.",
      ],
    },
    {
      title: "Finalidades del tratamiento",
      list: [
        "Gestionar y confirmar reservas y pagos.",
        "Comunicarnos contigo sobre tu estancia (confirmaciones, cambios o incidencias operativas).",
        "Prevenir fraude, abusos y doble reserva.",
        "Cumplir obligaciones legales, contables o fiscales aplicables en Ecuador.",
        "Mejorar la seguridad y el funcionamiento técnico del sitio.",
      ],
    },
    {
      title: "Base legal (LOPDP Ecuador)",
      paragraphs: [
        "El tratamiento se fundamenta, según el caso, en la ejecución del contrato de hospedaje, tu consentimiento cuando sea requerido, el interés legítimo de MS Vacations en operar el servicio de forma segura, y el cumplimiento de obligaciones legales bajo la Ley Orgánica de Protección de Datos Personales (LOPDP) y normativa complementaria de Ecuador.",
      ],
    },
    {
      title: "Compartición con terceros",
      paragraphs: [
        "No vendemos ni alquilamos tus datos personales. Podemos compartirlos únicamente con proveedores necesarios para prestar el servicio:",
      ],
      list: [
        "PayPal — procesamiento de pagos internacionales.",
        "PayPhone — procesamiento de pagos con tarjeta en Ecuador.",
        "Supabase — almacenamiento de comprobantes de transferencia (cuando aplica).",
        "Vercel — alojamiento y entrega del sitio web.",
        "Proveedor de base de datos PostgreSQL — almacenamiento de reservas y disponibilidad.",
      ],
    },
    {
      title: "Transferencias internacionales",
      paragraphs: [
        "Algunos proveedores (como PayPal, PayPhone o Vercel) pueden tratar datos en servidores fuera de Ecuador. En esos casos, procuramos que existan garantías contractuales y medidas de seguridad acordes a la LOPDP.",
      ],
    },
    {
      title: "Conservación",
      paragraphs: [
        "Conservamos los datos de reserva mientras sea necesario para gestionar la estancia, atender reclamaciones y cumplir obligaciones legales o contables.",
        "Transcurrido ese plazo, los datos se eliminan o anonimizan de forma razonable, salvo que la ley exija un período de retención mayor.",
      ],
    },
    {
      title: "Tus derechos",
      paragraphs: [
        "Conforme a la LOPDP, puedes solicitar acceso, rectificación, eliminación, oposición, portabilidad y limitación del tratamiento de tus datos, cuando proceda legalmente.",
        `Envía tu solicitud a ${contact}, indicando tu identidad y el derecho que deseas ejercer. Responderemos en un plazo razonable.`,
      ],
    },
    {
      title: "Cookies y tecnologías similares",
      paragraphs: [
        "El sitio público no utiliza cookies de publicidad ni de seguimiento de terceros.",
        "El panel de administración interno utiliza una cookie de sesión httpOnly para autenticación; no aplica a huéspedes que solo navegan o reservan en el sitio.",
      ],
    },
    {
      title: "Seguridad",
      paragraphs: [
        "Aplicamos medidas técnicas y organizativas razonables: conexión cifrada (HTTPS), acceso restringido al panel de administración y uso de pasarela de pago certificada.",
        "Ningún sistema es completamente infalible; te recomendamos proteger tus credenciales y reportar cualquier uso no autorizado.",
      ],
    },
    {
      title: "Menores de edad",
      paragraphs: [
        "Este sitio no está dirigido a menores de edad. Las reservas deben ser realizadas por un adulto responsable.",
      ],
    },
    {
      title: "Cambios a esta política",
      paragraphs: [
        `Podemos actualizar esta política. La versión vigente se publica en esta página con fecha de última actualización: ${LAST_UPDATED}.`,
        "Los cambios sustanciales se comunicarán de forma razonable cuando sea procedente.",
      ],
    },
    {
      title: "Ley aplicable",
      paragraphs: [
        "Esta política se rige por las leyes de la República del Ecuador, en particular la LOPDP y normativa relacionada con protección de datos personales.",
      ],
    },
    {
      title: "Nota",
      paragraphs: [
        "Este documento describe nuestras prácticas de privacidad en el canal directo. Para un dictamen legal formal sobre tu situación, consulta con un profesional del derecho en Ecuador.",
      ],
    },
  ];
}
