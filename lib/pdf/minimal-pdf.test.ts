import { describe, expect, it } from "vitest";
import { encodePdfText } from "@/lib/pdf/minimal-pdf";

describe("encodePdfText", () => {
  it("escapa paréntesis y barras invertidas", () => {
    expect(encodePdfText("(test\\)")).toBe("\\(test\\\\\\)");
  });

  it("codifica tildes y eñe en octal WinAnsi", () => {
    const encoded = encodePdfText("Fernández");
    expect(encoded).toContain("\\341");
    expect(encoded).not.toMatch(/[\u0080-\uFFFF]/);
  });

  it("codifica emisión con ó", () => {
    expect(encodePdfText("Emisión")).toContain("\\363");
  });

  it("codifica guion en rango de fechas", () => {
    const encoded = encodePdfText("27 – 29 de jul");
    expect(encoded).toContain("\\226");
  });

  it("codifica punto medio", () => {
    expect(encodePdfText("2 · 3")).toContain("\\267");
  });

  it("no deja bytes UTF-8 multibyte en la salida", () => {
    const sample = encodePdfText("Huéspedes · check-out · Niño");
    expect(Buffer.byteLength(sample, "utf8")).toBe(sample.length);
  });
});
