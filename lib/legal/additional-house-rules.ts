import { catalogReferencePriceUsd } from "@/lib/property-pricing";

export type LateCheckoutFees = {
  until14hUsd: number;
  until16hUsd: number;
  after16hUsd: number;
};

export const ADDITIONAL_HOUSE_RULES = {
  visitorsAndEvents:
    "No se permite visitas. Se permiten eventos únicamente bajo aprobación previa y tarifa adicional. " +
    "Tarifas: evento hasta 30 personas: USD 300; evento hasta 60 personas: USD 600. " +
    "Incluye uso de áreas sociales. No incluye hospedaje adicional. " +
    "El ingreso de personas no autorizadas sin pago o eventos como fiestas sin comunicado previo " +
    "generará el cobro automático de la tarifa máxima aplicable.",
  lateCheckoutTitle: "Reglamento de recargos por late check-out",
} as const;

export function calculateLateCheckoutFees(nightlyRateUsd: number): LateCheckoutFees {
  return {
    until14hUsd: Math.round(nightlyRateUsd * 0.2),
    until16hUsd: Math.round(nightlyRateUsd * 0.4),
    after16hUsd: Math.round(nightlyRateUsd),
  };
}

export function getLateCheckoutRules(nightlyRateUsd: number): string[] {
  const fees = calculateLateCheckoutFees(nightlyRateUsd);

  return [
    "Horario oficial de salida: 12:00 del mediodía.",
    "Late check-out sujeto a disponibilidad: el huésped debe solicitarlo con anticipación y solo se aprobará si no hay otra reserva inmediata.",
    `Tarifas de recargo por late check-out: hasta las 14:00 → 20 % de la tarifa por noche (USD ${fees.until14hUsd}); hasta las 16:00 → 40 % (USD ${fees.until16hUsd}); después de las 16:00 → 100 % (USD ${fees.after16hUsd}).`,
    `Sin solicitud previa: si el huésped se retrasa sin autorización, se aplicará automáticamente el recargo de 40 % de la tarifa por noche (USD ${fees.until16hUsd}).`,
    "Motivo: estos recargos cubren costos de limpieza, personal y la posible pérdida de nuevas reservas.",
  ];
}

export function getAdditionalHouseRulesForProperty(slug: string) {
  const nightlyRateUsd = catalogReferencePriceUsd(slug);
  return {
    visitorsAndEvents: ADDITIONAL_HOUSE_RULES.visitorsAndEvents,
    lateCheckoutTitle: ADDITIONAL_HOUSE_RULES.lateCheckoutTitle,
    lateCheckoutRules: getLateCheckoutRules(nightlyRateUsd),
    nightlyRateUsd,
  };
}
