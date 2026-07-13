import { describe, expect, it } from "vitest";
import {
  buildStaySearchQuery,
  defaultCheckOut,
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
});

describe("defaultCheckOut", () => {
  it("sugiere dos noches por defecto", () => {
    expect(defaultCheckOut("2026-08-10")).toBe("2026-08-12");
  });
});
