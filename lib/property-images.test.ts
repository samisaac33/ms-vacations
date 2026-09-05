import { describe, expect, it } from "vitest";
import {
  buildPropertyImageAlt,
  categoryToAltSuffix,
  nextStorageFileName,
} from "@/lib/property-image-categories";
import { parseStoragePathFromPublicUrl } from "@/lib/property-storage-prefix";

describe("property-storage-prefix", () => {
  it("extrae storage path desde URL pública de Supabase", () => {
    const src =
      "https://tikrziworaajjatulzsg.supabase.co/storage/v1/object/public/MS_VACATIONS/arrecife/exterior-01.webp";
    expect(parseStoragePathFromPublicUrl(src)).toBe("arrecife/exterior-01.webp");
  });
});

describe("property-image-categories", () => {
  it("genera alt con nombre de propiedad", () => {
    expect(buildPropertyImageAlt("Home One", "piscina")).toBe("Home One — piscina");
  });

  it("traduce habitación al formato del recorrido fotográfico", () => {
    expect(categoryToAltSuffix("habitacion-2")).toBe("habitación 2");
  });

  it("incrementa el sufijo numérico por categoría", () => {
    const existing = ["arrecife/exterior-01.webp", "arrecife/exterior-02.webp"];
    expect(nextStorageFileName(existing, "arrecife", "exterior")).toBe("exterior-03.webp");
  });
});
