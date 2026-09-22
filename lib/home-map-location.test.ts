import { describe, expect, it } from "vitest";
import {
  getHomeCityMapLocation,
  HOME_CITY_MAP_SLUG,
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
