import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/properties";
import {
  getCancellationPreview,
  getHouseRulesPreview,
  getSafetyDetail,
  getSafetyPreview,
} from "@/lib/property-things-to-know-content";

const HOME_TWO = "casa-vacacional-home-two-21-personas";
const PORTO_NORTE = "porto-norte";
const ARRECIFE = "alojamiento-en-arrecife";

describe("getCancellationPreview", () => {
  it("sin fechas pide agregar fechas", () => {
    const preview = getCancellationPreview({});
    expect(preview.ctaKind).toBe("add-dates");
    expect(preview.ctaLabel).toBe("Agrega fechas");
    expect(preview.lines[0]).toContain("Agrega las fechas");
  });

  it("con fechas incluye el rango del viaje y política MS", () => {
    const preview = getCancellationPreview({
      checkIn: "2026-08-18",
      checkOut: "2026-08-21",
    });
    expect(preview.ctaKind).toBe("link");
    expect(preview.ctaHref).toBe("/cancelaciones");
    expect(preview.lines[0]).toContain("18 de agosto");
    expect(preview.lines[0]).toContain("21 de agosto");
    expect(preview.lines[0]).toContain("24 horas");
    expect(preview.lines[0]).toContain("50 %");
  });
});

describe("getHouseRulesPreview", () => {
  it("Porto Norte incluye horarios de check-in/out", () => {
    const property = PROPERTIES.find((p) => p.slug === PORTO_NORTE)!;
    const preview = getHouseRulesPreview(property.rules, property.slug);
    expect(preview.lines.some((l) => l.includes("15:00"))).toBe(true);
    expect(preview.lines.some((l) => l.includes("12:00"))).toBe(true);
    expect(preview.lines.length).toBeLessThanOrEqual(3);
  });

  it("Arrecife usa defaults de horario si no están en rules", () => {
    const property = PROPERTIES.find((p) => p.slug === ARRECIFE)!;
    const preview = getHouseRulesPreview(property.rules, property.slug);
    expect(preview.lines[0]).toContain("15:00");
    expect(preview.lines[1]).toContain("12:00");
  });
});

describe("getSafetyPreview", () => {
  it("Home Two muestra cámaras y ausencia de detectores", () => {
    const property = PROPERTIES.find((p) => p.slug === HOME_TWO)!;
    const preview = getSafetyPreview(property);
    expect(preview.lines.some((l) => l.toLowerCase().includes("cámara"))).toBe(true);
    const detail = getSafetyDetail(property);
    expect(detail.included.length).toBeGreaterThan(0);
    expect(detail.notIncluded.some((i) => i.label.includes("Detector"))).toBe(true);
  });

  it("Arrecife muestra cámaras y ausencia de detectores", () => {
    const property = PROPERTIES.find((p) => p.slug === ARRECIFE)!;
    const preview = getSafetyPreview(property);
    expect(preview.lines.some((l) => l.toLowerCase().includes("cámara"))).toBe(true);
    const detail = getSafetyDetail(property);
    expect(detail.included.length).toBeGreaterThan(0);
    expect(detail.notIncluded.some((i) => i.label.includes("Detector"))).toBe(true);
  });

  it("propiedad sin datos de seguridad usa fallback", () => {
    const property = PROPERTIES.find((p) => p.slug === PORTO_NORTE)!;
    const preview = getSafetyPreview(property);
    expect(preview.lines[0]).toContain("MS Vacations");
  });
});
