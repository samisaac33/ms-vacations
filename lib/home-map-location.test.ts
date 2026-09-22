import { describe, expect, it } from "vitest";
import {
  getHomeCityDestinationImage,
  getHomeCityMapLocation,
  HOME_CITY_DESTINATION_IMAGE,
  HOME_CITY_DESTINATION_PROPERTY_SLUG,
  HOME_CITY_MAP_SLUG,
  type Property,
} from "@/lib/properties";

describe("home city map", () => {
  it("usa Las Hamacas como referencia de mapa en ciudad", () => {
    expect(HOME_CITY_MAP_SLUG).toBe("las-hamacas-portoviejo");
    const location = getHomeCityMapLocation();
    expect(location.coordinates.lat).toBeCloseTo(-1.049, 2);
    expect(location.coordinates.lng).toBeCloseTo(-80.46, 2);
    expect(location.googleMapsUrl).toContain("-1.048987");
  });
});

describe("home city destination image", () => {
  it("usa exterior-05 como fallback estático de portada", () => {
    expect(HOME_CITY_DESTINATION_IMAGE.src).toContain("exterior-05.webp");
  });

  it("prefiere la primera imagen de Los Pinos del catálogo", () => {
    const cover = { src: "https://cdn.example/los-pinos/custom.webp", alt: "Los Pinos" };
    const city = [
      {
        slug: HOME_CITY_DESTINATION_PROPERTY_SLUG,
        images: [cover],
      },
    ] as Pick<Property, "slug" | "images">[];

    expect(getHomeCityDestinationImage(city)).toEqual(cover);
  });
});
