import { LEGAL_POLICIES_PATH } from "@/lib/legal/constants";

export type PolicyLink = {
  href: string;
  title: string;
  description: string;
};

export const LEGAL_POLICIES: PolicyLink[] = [
  {
    href: "/terminos",
    title: "Términos y condiciones de compra",
    description:
      "Condiciones generales para reservar alojamiento vacacional directo: precios, pagos, obligaciones y responsabilidad.",
  },
  {
    href: "/privacidad",
    title: "Política de privacidad",
    description:
      "Tratamiento de datos personales conforme a la LOPDP de Ecuador en reservas y pagos del sitio.",
  },
  {
    href: "/cancelaciones",
    title: "Política de cancelaciones, cambios y devoluciones",
    description:
      "Plazos de cancelación, reembolsos, modificación de fechas y condiciones de devolución.",
  },
];

export function getLegalPoliciesMeta() {
  return {
    title: "Políticas y condiciones",
    description:
      "Documentos legales de MS Vacations: términos de compra, privacidad, cancelaciones, cambios, devoluciones e impuestos.",
    path: LEGAL_POLICIES_PATH,
  };
}
