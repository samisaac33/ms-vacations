/** Generador PDF minimo con soporte de color, cajas, trazos e imagenes JPEG. */

import type { PdfRgb } from "@/lib/pdf/voucher-theme";
import { rgbString } from "@/lib/pdf/voucher-theme";

type PdfText = {
  x: number;
  y: number;
  size: number;
  text: string;
  bold?: boolean;
  color: PdfRgb;
};

type PdfLine = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  color: PdfRgb;
};

type PdfFilledRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: PdfRgb;
};

type PdfStrokedRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  lineWidth: number;
  color: PdfRgb;
  fill?: PdfRgb;
};

type PdfPath = {
  ops: string;
  stroke?: PdfRgb;
  fill?: PdfRgb;
  lineWidth?: number;
};

type PdfImage = {
  x: number;
  y: number;
  displayWidth: number;
  displayHeight: number;
  buffer: Buffer;
  pixelWidth: number;
  pixelHeight: number;
  layer: "background" | "foreground";
};

type PdfObjectEntry = string | { header: string; body: Buffer; footer: string };

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const DEFAULT_COLOR: PdfRgb = { r: 0.102, g: 0.169, b: 0.169 };

/** Unicode codepoint → byte WinAnsi (PDF). Latin-1 y puntuación común en español. */
const UNICODE_TO_WIN_ANSI: Readonly<Record<number, number>> = {
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f,
};

function unicodeToWinAnsiByte(code: number): number | null {
  if (code >= 0x20 && code <= 0x7e) return code;
  if (code >= 0xa0 && code <= 0xff) return code;
  return UNICODE_TO_WIN_ANSI[code] ?? null;
}

/** Codifica texto para cadenas PDF literal (Helvetica / WinAnsiEncoding). */
export function encodePdfText(text: string): string {
  let result = "";
  for (const char of text) {
    const code = char.codePointAt(0)!;
    const byte = unicodeToWinAnsiByte(code);
    if (byte === null) {
      result += "?";
      continue;
    }
    if (byte === 0x5c) {
      result += "\\\\";
      continue;
    }
    if (byte === 0x28) {
      result += "\\(";
      continue;
    }
    if (byte === 0x29) {
      result += "\\)";
      continue;
    }
    if (byte < 0x20 || byte > 0x7e) {
      result += `\\${byte.toString(8).padStart(3, "0")}`;
    } else {
      result += String.fromCharCode(byte);
    }
  }
  return result;
}

function escapePdfText(value: string): string {
  return encodePdfText(value);
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

export class MinimalPdfDocument {
  private readonly texts: PdfText[] = [];
  private readonly lines: PdfLine[] = [];
  private readonly filledRects: PdfFilledRect[] = [];
  private readonly strokedRects: PdfStrokedRect[] = [];
  private readonly paths: PdfPath[] = [];
  private readonly images: PdfImage[] = [];

  addText(
    text: string,
    x: number,
    y: number,
    size = 10,
    bold = false,
    color: PdfRgb = DEFAULT_COLOR,
  ): void {
    this.texts.push({ x, y, size, text: escapePdfText(text), bold, color });
  }

  addWrappedText(
    text: string,
    x: number,
    y: number,
    maxWidthChars: number,
    size = 10,
    lineHeight = 14,
    color: PdfRgb = DEFAULT_COLOR,
    bold = false,
  ): number {
    const wrapped = wrapText(text, maxWidthChars);
    let cursorY = y;
    for (const line of wrapped) {
      this.addText(line, x, cursorY, size, bold, color);
      cursorY -= lineHeight;
    }
    return cursorY;
  }

  addHorizontalRule(x1: number, y: number, x2: number, color: PdfRgb = DEFAULT_COLOR, width = 0.5): void {
    this.lines.push({ x1, y1: y, x2, y2: y, width, color });
  }

  addFilledRect(x: number, y: number, width: number, height: number, color: PdfRgb): void {
    this.filledRects.push({ x, y, width, height, color });
  }

  addStrokedRect(
    x: number,
    y: number,
    width: number,
    height: number,
    color: PdfRgb,
    lineWidth = 1,
    fill?: PdfRgb,
  ): void {
    this.strokedRects.push({ x, y, width, height, lineWidth, color, fill });
  }

  addPath(ops: string, options?: { stroke?: PdfRgb; fill?: PdfRgb; lineWidth?: number }): void {
    this.paths.push({
      ops,
      stroke: options?.stroke,
      fill: options?.fill,
      lineWidth: options?.lineWidth,
    });
  }

  addImage(
    buffer: Buffer,
    x: number,
    y: number,
    displayWidth: number,
    displayHeight: number,
    pixelWidth: number,
    pixelHeight: number,
    layer: "background" | "foreground" = "foreground",
  ): void {
    this.images.push({
      x,
      y,
      displayWidth,
      displayHeight,
      buffer,
      pixelWidth,
      pixelHeight,
      layer,
    });
  }

  private imageDrawOps(images: PdfImage[], startIndex: number): string[] {
    const parts: string[] = [];
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      const name = `/Im${startIndex + i}`;
      parts.push("q");
      parts.push(`${image.displayWidth} 0 0 ${image.displayHeight} ${image.x} ${image.y} cm`);
      parts.push(`${name} Do`);
      parts.push("Q");
    }
    return parts;
  }

  toBuffer(): Buffer {
    const contentParts: string[] = [];
    const backgroundImages = this.images.filter((image) => image.layer === "background");
    const foregroundImages = this.images.filter((image) => image.layer === "foreground");
    const imageObjectOffset = 7;

    contentParts.push(...this.imageDrawOps(backgroundImages, imageObjectOffset));

    for (const rect of this.filledRects) {
      contentParts.push(`${rgbString(rect.color)} rg`);
      contentParts.push(`${rect.x} ${rect.y} ${rect.width} ${rect.height} re f`);
    }

    for (const rect of this.strokedRects) {
      if (rect.fill) {
        contentParts.push(`${rgbString(rect.fill)} rg`);
        contentParts.push(`${rect.x} ${rect.y} ${rect.width} ${rect.height} re f`);
      }
      contentParts.push(`${rgbString(rect.color)} RG`);
      contentParts.push(`${rect.lineWidth} w`);
      contentParts.push(`${rect.x} ${rect.y} ${rect.width} ${rect.height} re S`);
    }

    for (const path of this.paths) {
      if (path.fill) {
        contentParts.push(`${rgbString(path.fill)} rg`);
      }
      if (path.stroke) {
        contentParts.push(`${rgbString(path.stroke)} RG`);
        contentParts.push(`${path.lineWidth ?? 1} w`);
      }
      contentParts.push(path.ops);
      if (path.fill && path.stroke) {
        contentParts.push("B");
      } else if (path.fill) {
        contentParts.push("f");
      } else {
        contentParts.push("S");
      }
    }

    contentParts.push(
      ...this.imageDrawOps(foregroundImages, imageObjectOffset + backgroundImages.length),
    );

    for (const line of this.lines) {
      contentParts.push(`${rgbString(line.color)} RG`);
      contentParts.push(`${line.width} w`);
      contentParts.push(`${line.x1} ${line.y1} m ${line.x2} ${line.y2} l S`);
    }

    for (const item of this.texts) {
      contentParts.push(`${rgbString(item.color)} rg`);
      const font = item.bold ? "/F2" : "/F1";
      contentParts.push(`BT ${font} ${item.size} Tf ${item.x} ${item.y} Td (${item.text}) Tj ET`);
    }

    const stream = contentParts.join("\n");
    const streamLength = Buffer.byteLength(stream, "utf8");

    const xObjectEntries = this.images
      .map((_, index) => `/Im${imageObjectOffset + index} ${imageObjectOffset + index} 0 R`)
      .join(" ");
    const xObjects = this.images.length > 0 ? `/XObject << ${xObjectEntries} >>` : "";
    const pageResources = [`/Font << /F1 5 0 R /F2 6 0 R >>`, xObjects].filter(Boolean).join(" ");

    const objects: PdfObjectEntry[] = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents 4 0 R /Resources << ${pageResources} >> >>`,
      `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    ];

    for (const image of this.images) {
      objects.push({
        header: `<< /Type /XObject /Subtype /Image /Width ${image.pixelWidth} /Height ${image.pixelHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.buffer.length} >>\nstream\n`,
        body: image.buffer,
        footer: "\nendstream",
      });
    }

    const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n", "utf8")];
    const offsets: number[] = [0];

    for (let i = 0; i < objects.length; i++) {
      offsets.push(Buffer.concat(chunks).length);
      const entry = objects[i];
      if (typeof entry === "string") {
        chunks.push(Buffer.from(`${i + 1} 0 obj\n${entry}\nendobj\n`, "utf8"));
      } else {
        chunks.push(Buffer.from(`${i + 1} 0 obj\n${entry.header}`, "utf8"));
        chunks.push(entry.body);
        chunks.push(Buffer.from(`${entry.footer}\nendobj\n`, "utf8"));
      }
    }

    const xrefOffset = Buffer.concat(chunks).length;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
      xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(Buffer.from(xref, "utf8"));

    return Buffer.concat(chunks);
  }
}

export { PAGE_WIDTH, PAGE_HEIGHT };
