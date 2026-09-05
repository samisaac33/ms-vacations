import { describe, expect, it } from "vitest";
import {
  isAllowedPropertyImageUpload,
  propertyImageExtension,
  propertyImageUploadValidationError,
} from "@/lib/property-image-upload";

describe("property-image-upload", () => {
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
