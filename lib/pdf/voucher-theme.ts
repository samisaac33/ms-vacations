/** Colores de marca MS Vacations (valores PDF 0–1). */

export const VOUCHER_COLORS = {
  ocean: { r: 0, g: 0.616, b: 0.678 },
  oceanDark: { r: 0, g: 0.541, b: 0.6 },
  ink: { r: 0.102, g: 0.169, b: 0.169 },
  muted: { r: 0.361, g: 0.42, b: 0.42 },
  white: { r: 1, g: 1, b: 1 },
  sand: { r: 0.98, g: 0.973, b: 0.957 },
  rowGrey: { r: 0.94, g: 0.94, b: 0.94 },
  border: { r: 0.85, g: 0.88, b: 0.88 },
  watermark: { r: 0.88, g: 0.95, b: 0.96 },
} as const;

export type PdfRgb = { r: number; g: number; b: number };

export function rgbString(c: PdfRgb): string {
  return `${c.r} ${c.g} ${c.b}`;
}
