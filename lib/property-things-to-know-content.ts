import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { getAdditionalHouseRulesForProperty } from "@/lib/legal/additional-house-rules";
import { appliesRefundableGuarantee } from "@/lib/pricing";
import { resolveAmenityGroups } from "@/lib/property-detail-content";
import type { Property } from "@/lib/properties";

const DEFAULT_CHECK_IN = "Check-in a partir de las 15:00";
const DEFAULT_CHECK_OUT = "Check-out antes de las 12:00";
const MAX_PREVIEW_LINES = 3;

const SAFETY_KEYWORDS = [
  "detector de humo",
  "detector de monóxido",
  "monóxido de carbono",
  "cámara",
  "cámaras",
  "alarma",
];

export type CancellationPreview = {
  title: string;
  lines: string[];
  ctaLabel: string;
  ctaKind: "add-dates" | "link";
  ctaHref?: string;
};

export type PreviewBlock = {
  title: string;
  lines: string[];
  ctaLabel: string;
};

export type SafetyDetail = {
  included: { label: string; detail?: string }[];
  notIncluded: { label: string; detail?: string }[];
  fallback: boolean;
};

function formatStayDate(iso: string): string {
  return format(parseISO(iso), "d 'de' MMMM", { locale: es });
}

function matchesRuleKeyword(rule: string, keywords: string[]): boolean {
  const lower = rule.toLowerCase();
  return keywords.some((keyword) => lower.includes(keyword));
}

function pickHouseRuleLines(rules: string[]): string[] {
  const picked: string[] = [];
  const used = new Set<number>();

  const priorities: string[][] = [
    ["check-in"],
    ["check-out", "check out", "salida"],
    ["mascota", "mascotas", "pet"],
  ];

  for (const keywords of priorities) {
    const index = rules.findIndex(
      (rule, i) => !used.has(i) && matchesRuleKeyword(rule, keywords),
    );
    if (index >= 0) {
      picked.push(rules[index]!);
      used.add(index);
    }
  }

  for (let i = 0; i < rules.length && picked.length < MAX_PREVIEW_LINES; i++) {
    if (used.has(i)) continue;
    picked.push(rules[i]!);
    used.add(i);
  }

  return picked;
}

export function getCancellationPreview(options: {
  checkIn?: string;
  checkOut?: string;
}): CancellationPreview {
  const { checkIn, checkOut } = options;
  const hasDates = Boolean(checkIn && checkOut);

  if (!hasDates) {
    return {
      title: "Política de cancelación",
      lines: [
        "Agrega las fechas de tu viaje para obtener los detalles de cancelación de esta estadía.",
      ],
      ctaLabel: "Agrega fechas",
      ctaKind: "add-dates",
    };
  }

  return {
    title: "Política de cancelación",
    lines: [
      `Para tu viaje del ${formatStayDate(checkIn!)} al ${formatStayDate(checkOut!)}: cancelación gratuita durante 24 horas tras confirmar el pago. Después de ese plazo, penalización del 50 % del valor total.`,
      "Consulta la política completa de MS Vacations para obtener más detalles.",
    ],
    ctaLabel: "Más información",
    ctaKind: "link",
    ctaHref: "/cancelaciones",
  };
}

export function getHouseRulesPreview(rules: string[], _propertySlug: string): PreviewBlock {
  const lines: string[] = [];
  const hasCheckIn = rules.some((rule) => matchesRuleKeyword(rule, ["check-in"]));
  const hasCheckOut = rules.some((rule) =>
    matchesRuleKeyword(rule, ["check-out", "check out", "salida"]),
  );

  if (!hasCheckIn) lines.push(DEFAULT_CHECK_IN);
  if (!hasCheckOut) lines.push(DEFAULT_CHECK_OUT);

  const ruleLines = pickHouseRuleLines(rules);
  for (const rule of ruleLines) {
    if (lines.length >= MAX_PREVIEW_LINES) break;
    if (!lines.includes(rule)) lines.push(rule);
  }

  while (lines.length < MAX_PREVIEW_LINES && lines.length < rules.length + 2) {
    break;
  }

  return {
    title: "Reglas de la casa",
    lines: lines.slice(0, MAX_PREVIEW_LINES),
    ctaLabel: "Más información",
  };
}

export function getHouseRulesDetail(rules: string[], propertySlug: string) {
  const additionalRules = getAdditionalHouseRulesForProperty(propertySlug);
  return {
    rules,
    additionalRules,
    guaranteeText: appliesRefundableGuarantee(propertySlug)
      ? "Reservas directas sujetas a una garantía reembolsable de USD 300. Se devuelve íntegramente si la propiedad se entrega en las mismas condiciones."
      : null,
  };
}

function isSafetyNotIncluded(item: { label: string }): boolean {
  const lower = item.label.toLowerCase();
  return SAFETY_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export function getSafetyDetail(property: Property): SafetyDetail {
  const groups = resolveAmenityGroups(property);
  const securityCategory = groups.categories.find((c) => c.title === "Seguridad");
  const included = securityCategory?.items ?? [];
  const notIncluded = (groups.notIncluded ?? []).filter(isSafetyNotIncluded);

  return {
    included,
    notIncluded,
    fallback: included.length === 0 && notIncluded.length === 0,
  };
}

export function getSafetyPreview(property: Property): PreviewBlock {
  const detail = getSafetyDetail(property);
  const lines: string[] = [];

  for (const item of detail.included) {
    if (lines.length >= MAX_PREVIEW_LINES) break;
    lines.push(item.label);
  }

  for (const item of detail.notIncluded) {
    if (lines.length >= MAX_PREVIEW_LINES) break;
    const text = item.detail ?? item.label;
    if (!lines.includes(text)) lines.push(text);
  }

  if (lines.length === 0) {
    lines.push(
      "Reserva directa con confirmación por MS Vacations. Consulta normas de uso al confirmar tu estadía.",
    );
  }

  return {
    title: "Seguridad y propiedad",
    lines: lines.slice(0, MAX_PREVIEW_LINES),
    ctaLabel: "Más información",
  };
}
