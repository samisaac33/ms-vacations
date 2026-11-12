import { describe, expect, it } from "vitest";
import { getBedroomCards } from "@/lib/property-photo-groups";

describe("getBedroomCards subtitle", () => {
  it("omite subtítulo cuando solo repite el nombre de la habitación", () => {
    const images = [
      {
        src: "https://example.com/a.webp",
        alt: "Porto Norte — habitación 3",
      },
    ];
    const bedrooms = getBedroomCards(images);
    expect(bedrooms).toHaveLength(1);
    expect(bedrooms[0]?.title).toBe("Habitación 3");
    expect(bedrooms[0]?.subtitle).toBe("");
  });

  it("mantiene detalle de camas en el subtítulo", () => {
    const images = [
      {
        src: "https://example.com/b.webp",
        alt: "Porto Norte — habitación 4 — 2 camas individuales",
      },
    ];
    const bedrooms = getBedroomCards(images);
    expect(bedrooms[0]?.subtitle).toBe("2 camas individuales");
  });
});
