import { describe, expect, it } from "vitest";
import {
  buildCatalogHref,
  buildStaySearchQuery,
  clampCheckIn,
  clampCheckOut,
  defaultCheckOut,
  normalizeStayDates,
  validateStaySearch,
} from "@/lib/stay-search";

describe("buildStaySearchQuery", () => {
  it("arma query con destino y fechas", () => {
    const qs = buildStaySearchQuery({
      destino: "beach",
      checkIn: "2026-08-10",
      checkOut: "2026-08-12",
      huespedes: 4,
    });
    expect(qs).toContain("destino=beach");
    expect(qs).toContain("checkIn=2026-08-10");
    expect(qs).toContain("checkOut=2026-08-12");
    expect(qs).toContain("huespedes=4");
  });
});

describe("buildCatalogHref", () => {
  it("restaura catálogo filtrado con hash de destino", () => {
    expect(
      buildCatalogHref({
        destino: "beach",
        checkIn: "2026-08-10",
        checkOut: "2026-08-12",
        huespedes: 4,
      }),
    ).toBe(
      "/propiedades?destino=beach&checkIn=2026-08-10&checkOut=2026-08-12&huespedes=4#playa",
    );
  });

  it("devuelve solo la ruta del catálogo sin fechas", () => {
    expect(buildCatalogHref({ destino: "city" })).toBe("/propiedades");
  });
});

describe("validateStaySearch", () => {
  it("rechaza salida anterior a entrada", () => {
    expect(validateStaySearch("2026-08-12", "2026-08-10", "2026-08-01")).toMatch(/salida/i);
  });

  it("acepta rango válido", () => {
    expect(validateStaySearch("2026-08-10", "2026-08-12", "2026-08-01")).toBeNull();
  });

  it("rechaza 1 noche con entrada en fin de semana", () => {
    expect(validateStaySearch("2026-08-14", "2026-08-15", "2026-08-01")).toMatch(/viernes o sábado/i);
  });

  it("acepta 1 noche con entrada domingo", () => {
    expect(validateStaySearch("2026-08-16", "2026-08-17", "2026-08-01")).toBeNull();
  });

  it("rechaza entrada en el pasado", () => {
    expect(validateStaySearch("2026-07-01", "2026-07-05", "2026-08-01")).toMatch(/pasado/i);
  });
});

describe("clampCheckIn", () => {
  it("corrige fechas anteriores al mínimo", () => {
    expect(clampCheckIn("2026-07-01", "2026-08-01")).toBe("2026-08-01");
  });

  it("conserva fechas válidas", () => {
    expect(clampCheckIn("2026-08-10", "2026-08-01")).toBe("2026-08-10");
  });
});

describe("clampCheckOut", () => {
  it("sugiere salida por defecto si es anterior a la entrada", () => {
    expect(clampCheckOut("2026-08-10", "2026-08-12", "2026-08-01")).toBe("2026-08-14");
  });

  it("conserva salida válida posterior a la entrada", () => {
    expect(clampCheckOut("2026-08-15", "2026-08-12", "2026-08-01")).toBe("2026-08-15");
  });
});

describe("normalizeStayDates", () => {
  it("normaliza entrada y salida pasadas", () => {
    expect(normalizeStayDates("2026-07-01", "2026-07-03", "2026-08-01")).toEqual({
      checkIn: "2026-08-01",
      checkOut: "2026-08-03",
    });
  });
});

describe("defaultCheckOut", () => {
  it("sugiere dos noches por defecto", () => {
    expect(defaultCheckOut("2026-08-10")).toBe("2026-08-12");
  });
});
