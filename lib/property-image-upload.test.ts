import { describe, expect, it } from "vitest";
import {
  fitImageDimensions,
  isAllowedPropertyImageUpload,
  propertyImageExtension,
  propertyImageUploadValidationError,
} from "@/lib/property-image-upload";

describe("property-image-upload", () => {
  it("fitImageDimensions mantiene la proporción al escalar", () => {
    expect(fitImageDimensions(4000, 3000, 2400)).toEqual({ width: 2400, height: 1800 });
    expect(fitImageDimensions(3000, 4000, 2400)).toEqual({ width: 1800, height: 2400 });
    expect(fitImageDimensions(1200, 800, 2400)).toEqual({ width: 1200, height: 800 });
    expect(fitImageDimensions(1000, 1000, 2400)).toEqual({ width: 1000, height: 1000 });
  });

  it("acepta HEIC por extensión aunque el MIME venga vacío (iPhone)", () => {
    const file = new File([new Uint8Array([1, 2, 3])], "foto.heic", { type: "" });
    expect(isAllowedPropertyImageUpload(file)).toBe(true);
    expect(propertyImageExtension(file)).toBe("heic");
    expect(propertyImageUploadValidationError(file)).toBeNull();
  });

  it("rechaza archivos demasiado grandes", () => {
    const file = new File([new Uint8Array(4 * 1024 * 1024 + 1)], "foto.jpg", {
      type: "image/jpeg",
    });
    expect(propertyImageUploadValidationError(file)).toMatch(/4 MB/);
  });
});
