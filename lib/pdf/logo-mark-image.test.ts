import { describe, expect, it } from "vitest";
import { getHeaderLogoJpeg, getWatermarkLogoJpeg } from "@/lib/pdf/logo-mark-image";

describe("logo-mark-image", () => {
  it("rasteriza el SVG oficial para encabezado y watermark", async () => {
    const header = await getHeaderLogoJpeg(104);
    const watermark = await getWatermarkLogoJpeg(140);

    expect(header.buffer.subarray(0, 2).toString("hex")).toBe("ffd8");
    expect(watermark.buffer.subarray(0, 2).toString("hex")).toBe("ffd8");
    expect(header.width).toBeGreaterThan(0);
    expect(header.height).toBeGreaterThan(0);
  });
});
