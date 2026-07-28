import { describe, expect, it } from "vitest";
import { PROPERTIES } from "@/lib/properties";
import { getBedroomCards } from "@/lib/property-photo-groups";
import {
  flattenAmenities,
  resolveAmenityGroups,
  resolvePropertyAbout,
  shouldShowAboutMore,
  shouldShowAmenitiesMore,
  totalAmenityCount,
} from "@/lib/property-detail-content";

const HOME_ONE = "casa-vacacional-home-one-18-personas-max";
const ARRECIFE = "alojamiento-en-arrecife";
const HOME_TWO = "casa-vacacional-home-two-21-personas";
const PORTO_NORTE = "porto-norte";
const RUSTIC_HOUSE = "casa-rustica-18-personas-max";
const LA_PUNTA = "home-luxury-la-punta-18-personas-max";
const VILLA_PALMERA = "villa-palmera";
const LAS_HAMACAS = "las-hamacas-portoviejo";
const LOS_PINOS = "los-pinos-portoviejo";
const CONTAINER_STAY_1 = "container-stay-1-san-clemente";
const CONTAINER_STAY_2 = "container-stay-2-san-clemente";

describe("resolvePropertyAbout", () => {
  it("Home One usa contenido estructurado", () => {
    const property = PROPERTIES.find((p) => p.slug === HOME_ONE)!;
    const about = resolvePropertyAbout(property);
    expect(about.sections).toHaveLength(3);
    expect(about.intro).toContain("300 metros del mar");
    expect(shouldShowAboutMore(about)).toBe(true);
  });

  it("Arrecife usa about con 2 secciones e intro sobre hidromasaje", () => {
    const property = PROPERTIES.find((p) => p.slug === ARRECIFE)!;
    const about = resolvePropertyAbout(property);
    expect(about.sections).toHaveLength(2);
    expect(about.intro).toContain("hidromasaje");
    expect(about.sections[0]?.title).toBe("El espacio");
    expect(about.sections[1]?.title).toBe("Acceso de los huéspedes");
    expect(shouldShowAboutMore(about)).toBe(true);
  });

  it("Porto Norte hace fallback a description", () => {
    const property = PROPERTIES.find((p) => p.slug === PORTO_NORTE)!;
    const about = resolvePropertyAbout(property);
    expect(about.intro).toBe(property.description);
    expect(about.sections).toHaveLength(0);
  });

  it("Home Two usa intro y secciones estructuradas", () => {
    const property = PROPERTIES.find((p) => p.slug === HOME_TWO)!;
    const about = resolvePropertyAbout(property);
    expect(about.intro).toContain("450 m del mar");
    expect(about.sections).toHaveLength(2);
    expect(about.sections[0]?.title).toBe("La propiedad");
    expect(about.sections[1]?.lead).toContain("garaje interno");
    expect(shouldShowAboutMore(about)).toBe(true);
  });

  it("Las Hamacas usa about con 3 secciones", () => {
    const property = PROPERTIES.find((p) => p.slug === LAS_HAMACAS)!;
    const about = resolvePropertyAbout(property);
    expect(about.intro).toContain("lugar estratégico");
    expect(about.sections).toHaveLength(3);
    expect(about.sections[0]?.lead).toContain("piscina privada");
    expect(about.sections[2]?.title).toBe("Otros aspectos a destacar");
    expect(shouldShowAboutMore(about)).toBe(true);
  });

  it("Container Stay 1 usa about con 2 secciones", () => {
    const property = PROPERTIES.find((p) => p.slug === CONTAINER_STAY_1)!;
    const about = resolvePropertyAbout(property);
    expect(about.intro).toContain("Container Stay");
    expect(about.sections).toHaveLength(2);
    expect(about.sections[0]?.title).toBe("La propiedad");
    expect(about.sections[1]?.title).toBe("Otros aspectos a destacar");
    expect(about.sections[1]?.paragraphs[0]).toContain("Container Stay 1");
    expect(shouldShowAboutMore(about)).toBe(true);
  });

  it("Container Stay 2 usa about con 2 secciones", () => {
    const property = PROPERTIES.find((p) => p.slug === CONTAINER_STAY_2)!;
    const about = resolvePropertyAbout(property);
    expect(about.intro).toContain("Container Stay");
    expect(about.sections).toHaveLength(2);
    expect(about.sections[0]?.title).toBe("La propiedad");
    expect(about.sections[1]?.title).toBe("Otros aspectos a destacar");
    expect(about.sections[1]?.paragraphs[0]).toContain("Container Stay 2");
    expect(shouldShowAboutMore(about)).toBe(true);
  });
});

describe("resolveAmenityGroups", () => {
  it("Home One expone categorías y más de 8 servicios", () => {
    const property = PROPERTIES.find((p) => p.slug === HOME_ONE)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories.length).toBeGreaterThan(5);
    expect(groups.notIncluded?.length).toBe(4);
    expect(shouldShowAmenitiesMore(totalAmenityCount(groups))).toBe(true);
  });

  it("Arrecife expone amenityGroups estructurado con más de 8 servicios", () => {
    const property = PROPERTIES.find((p) => p.slug === ARRECIFE)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories.length).toBeGreaterThan(5);
    expect(groups.notIncluded?.length).toBe(5);
    expect(totalAmenityCount(groups)).toBe(32);
    expect(shouldShowAmenitiesMore(totalAmenityCount(groups))).toBe(true);
  });

  it("Porto Norte agrupa amenities planos en General", () => {
    const property = PROPERTIES.find((p) => p.slug === PORTO_NORTE)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories[0]?.title).toBe("General");
    expect(flattenAmenities(groups).length).toBe(property.amenities.length);
  });

  it("Home Two expone categorías y más de 8 servicios", () => {
    const property = PROPERTIES.find((p) => p.slug === HOME_TWO)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories.length).toBeGreaterThan(8);
    expect(groups.notIncluded?.length).toBe(4);
    expect(totalAmenityCount(groups)).toBeGreaterThanOrEqual(40);
    expect(shouldShowAmenitiesMore(totalAmenityCount(groups))).toBe(true);
  });

  it("Rustic House expone categorías y más de 8 servicios", () => {
    const property = PROPERTIES.find((p) => p.slug === RUSTIC_HOUSE)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories.length).toBeGreaterThan(8);
    expect(groups.notIncluded?.length).toBe(4);
    expect(shouldShowAmenitiesMore(totalAmenityCount(groups))).toBe(true);
  });

  it("La Punta expone categorías y más de 8 servicios", () => {
    const property = PROPERTIES.find((p) => p.slug === LA_PUNTA)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories.length).toBeGreaterThan(8);
    expect(groups.notIncluded?.length).toBe(3);
    expect(shouldShowAmenitiesMore(totalAmenityCount(groups))).toBe(true);
  });

  it("Villa Palmera expone amenityGroups estructurado", () => {
    const property = PROPERTIES.find((p) => p.slug === VILLA_PALMERA)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories[0]?.title).not.toBe("General");
    expect(groups.notIncluded?.length).toBe(7);
    expect(groups.notIncluded?.some((item) => item.label === "Lavadora")).toBe(true);
    expect(groups.notIncluded?.some((item) => item.label === "Agua caliente")).toBe(true);
  });

  it("Las Hamacas expone amenityGroups estructurado", () => {
    const property = PROPERTIES.find((p) => p.slug === LAS_HAMACAS)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories[0]?.title).not.toBe("General");
    expect(groups.notIncluded?.length).toBe(7);
  });

  it("Los Pinos expone amenityGroups estructurado", () => {
    const property = PROPERTIES.find((p) => p.slug === LOS_PINOS)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories[0]?.title).not.toBe("General");
    expect(groups.notIncluded?.length).toBe(7);
  });

  it("Container Stay 1 expone amenityGroups estructurado", () => {
    const property = PROPERTIES.find((p) => p.slug === CONTAINER_STAY_1)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories[0]?.title).not.toBe("General");
    expect(groups.notIncluded?.length).toBe(7);
    expect(groups.notIncluded?.some((item) => item.label === "Agua caliente")).toBe(true);
  });

  it("Container Stay 2 expone amenityGroups estructurado", () => {
    const property = PROPERTIES.find((p) => p.slug === CONTAINER_STAY_2)!;
    const groups = resolveAmenityGroups(property);
    expect(groups.categories[0]?.title).not.toBe("General");
    expect(groups.notIncluded?.length).toBe(7);
    expect(groups.notIncluded?.some((item) => item.label === "Agua caliente")).toBe(true);
  });
});

describe("Home One capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === HOME_ONE)!;
    expect(property.capacity).toEqual({
      guests: 18,
      bedrooms: 4,
      beds: 12,
      bathrooms: 3.5,
    });
  });
});

describe("Arrecife capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === ARRECIFE)!;
    expect(property.capacity).toEqual({
      guests: 12,
      bedrooms: 3,
      beds: 7,
      bathrooms: 3.5,
    });
  });
});

describe("Arrecife images", () => {
  it("expone 17 fotos y carrusel de 3 habitaciones", () => {
    const property = PROPERTIES.find((p) => p.slug === ARRECIFE)!;
    expect(property.images).toHaveLength(17);
    expect(property.images[0]?.src).toContain("arrecife/");
    const bedrooms = getBedroomCards(property.images);
    expect(bedrooms).toHaveLength(3);
    expect(bedrooms[0]?.title).toBe("Habitación 1");
    expect(bedrooms[0]?.subtitle).toContain("1 cama king");
    expect(bedrooms[1]?.title).toBe("Habitación 2");
    expect(bedrooms[2]?.title).toBe("Habitación 3");
  });
});

describe("Home Two capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === HOME_TWO)!;
    expect(property.capacity).toEqual({
      guests: 21,
      bedrooms: 5,
      beds: 11,
      bathrooms: 4.5,
    });
  });
});

describe("Rustic House capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === RUSTIC_HOUSE)!;
    expect(property.capacity).toEqual({
      guests: 18,
      bedrooms: 6,
      beds: 11,
      bathrooms: 4.5,
    });
  });
});

describe("La Punta capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === LA_PUNTA)!;
    expect(property.capacity).toEqual({
      guests: 18,
      bedrooms: 5,
      beds: 9,
      bathrooms: 6,
    });
  });
});

describe("Villa Palmera capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === VILLA_PALMERA)!;
    expect(property.capacity).toEqual({
      guests: 13,
      bedrooms: 4,
      beds: 6,
      bathrooms: 5,
    });
  });
});

describe("Las Hamacas capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === LAS_HAMACAS)!;
    expect(property.capacity).toEqual({
      guests: 8,
      bedrooms: 4,
      beds: 4,
      bathrooms: 4.5,
    });
  });
});

describe("Los Pinos capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === LOS_PINOS)!;
    expect(property.capacity).toEqual({
      guests: 11,
      bedrooms: 4,
      beds: 6,
      bathrooms: 4.5,
    });
  });
});

describe("Container Stay 1 capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === CONTAINER_STAY_1)!;
    expect(property.capacity).toEqual({
      guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
    });
  });
});

describe("Container Stay 2 capacity", () => {
  it("expone la capacidad publicada", () => {
    const property = PROPERTIES.find((p) => p.slug === CONTAINER_STAY_2)!;
    expect(property.capacity).toEqual({
      guests: 4,
      bedrooms: 2,
      beds: 2,
      bathrooms: 1,
    });
  });
});
