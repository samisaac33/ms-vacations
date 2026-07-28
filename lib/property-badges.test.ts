import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/properties";
import { getPropertyBadges } from "@/lib/property-badges";

describe("getPropertyBadges", () => {
  it("incluye capacidad como primer badge", () => {
    const beach = PROPERTIES.find((p) => p.slug === "alojamiento-en-arrecife")!;
    const badges = getPropertyBadges(beach);
    expect(badges[0]?.label).toContain("12 huéspedes");
    expect(badges[0]?.tone).toBe("ocean");
  });

  it("Arrecife incluye hidromasaje y llegada autónoma", () => {
    const arrecife = PROPERTIES.find((p) => p.slug === "alojamiento-en-arrecife")!;
    const badges = getPropertyBadges(arrecife);
    expect(badges.some((b) => b.label === "Hidromasaje")).toBe(true);
    expect(badges.some((b) => b.label === "Llegada autónoma")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("Home One incluye distancia al mar, hidromasaje y mesa de billar", () => {
    const homeOne = PROPERTIES.find((p) => p.slug === "casa-vacacional-home-one-18-personas-max")!;
    const badges = getPropertyBadges(homeOne);
    expect(badges.some((b) => b.label === "A 300 m del mar")).toBe(true);
    expect(badges.some((b) => b.label === "Hidromasaje")).toBe(true);
    expect(badges.some((b) => b.label === "Mesa de billar")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("Rustic House incluye vista al océano y mesa de billar", () => {
    const rustic = PROPERTIES.find((p) => p.slug === "casa-rustica-18-personas-max")!;
    const badges = getPropertyBadges(rustic);
    expect(badges.some((b) => b.label === "Vista al océano")).toBe(true);
    expect(badges.some((b) => b.label === "Mesa de billar")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("La Punta incluye mesa de billar y acceso a la playa", () => {
    const laPunta = PROPERTIES.find((p) => p.slug === "home-luxury-la-punta-18-personas-max")!;
    const badges = getPropertyBadges(laPunta);
    expect(badges.some((b) => b.label === "Mesa de billar")).toBe(true);
    expect(badges.some((b) => b.label === "Acceso a la playa")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("Villa Palmera incluye parrilla y llegada autónoma", () => {
    const villaPalmera = PROPERTIES.find((p) => p.slug === "villa-palmera")!;
    const badges = getPropertyBadges(villaPalmera);
    expect(badges.some((b) => b.label === "Parrilla")).toBe(true);
    expect(badges.some((b) => b.label === "Llegada autónoma")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("Las Hamacas incluye parrilla y llegada autónoma", () => {
    const lasHamacas = PROPERTIES.find((p) => p.slug === "las-hamacas-portoviejo")!;
    const badges = getPropertyBadges(lasHamacas);
    expect(badges.some((b) => b.label === "Parrilla")).toBe(true);
    expect(badges.some((b) => b.label === "Llegada autónoma")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("Los Pinos incluye parrilla y jacuzzi", () => {
    const losPinos = PROPERTIES.find((p) => p.slug === "los-pinos-portoviejo")!;
    const badges = getPropertyBadges(losPinos);
    expect(badges.some((b) => b.label === "Parrilla")).toBe(true);
    expect(badges.some((b) => b.label === "Jacuzzi")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("Container Stay 1 incluye estacionamiento y cocina equipada", () => {
    const container = PROPERTIES.find((p) => p.slug === "container-stay-1-san-clemente")!;
    const badges = getPropertyBadges(container);
    expect(badges.some((b) => b.label === "Container Stay")).toBe(true);
    expect(badges.some((b) => b.label === "Estacionamiento gratuito")).toBe(true);
    expect(badges.some((b) => b.label === "Cocina equipada")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("Container Stay 2 incluye estacionamiento y cocina equipada", () => {
    const container = PROPERTIES.find((p) => p.slug === "container-stay-2-san-clemente")!;
    const badges = getPropertyBadges(container);
    expect(badges.some((b) => b.label === "Container Stay")).toBe(true);
    expect(badges.some((b) => b.label === "Estacionamiento gratuito")).toBe(true);
    expect(badges.some((b) => b.label === "Cocina equipada")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("Home Two incluye billar y futbolín", () => {
    const homeTwo = PROPERTIES.find((p) => p.slug === "casa-vacacional-home-two-21-personas")!;
    const badges = getPropertyBadges(homeTwo);
    expect(badges.some((b) => b.label === "Mesa de billar")).toBe(true);
    expect(badges.some((b) => b.label === "Futbolín")).toBe(true);
    expect(badges.length).toBeGreaterThan(3);
  });

  it("marca ciudad en casas urbanas", () => {
    const lasHamacas = PROPERTIES.find((p) => p.slug === "las-hamacas-portoviejo")!;
    const losPinos = PROPERTIES.find((p) => p.slug === "los-pinos-portoviejo")!;
    expect(getPropertyBadges(lasHamacas).some((b) => b.label === "Ciudad")).toBe(true);
    expect(getPropertyBadges(losPinos).some((b) => b.label === "Ciudad")).toBe(true);
  });

  it("respeta el máximo de badges cuando se indica", () => {
    const property = PROPERTIES[0]!;
    expect(getPropertyBadges(property, 2)).toHaveLength(2);
  });
});
