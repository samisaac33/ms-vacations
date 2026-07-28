import { readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const LOGO_SVG_PATH = path.join(process.cwd(), "public", "logo-mark.svg");
const BRAND_TEAL = { r: 0, g: 157, b: 173 };

const cache = new Map<string, Buffer>();

export type LogoImageAsset = {
  buffer: Buffer;
  width: number;
  height: number;
};

function readLogoSvg(): string {
  return readFileSync(LOGO_SVG_PATH, "utf8");
}

function whiteLogoSvg(): string {
  return readLogoSvg().replace(/#009dad/gi, "#ffffff");
}

async function renderSquareLogo(
  size: number,
  variant: "header" | "watermark",
): Promise<LogoImageAsset> {
  const cacheKey = `${variant}-${size}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    const meta = await sharp(cached).metadata();
    return {
      buffer: cached,
      width: meta.width ?? size,
      height: meta.height ?? size,
    };
  }

  const iconSize = Math.round(size * (variant === "header" ? 0.62 : 0.72));
  const svg = variant === "header" ? whiteLogoSvg() : readLogoSvg();

  const icon = await sharp(Buffer.from(svg)).resize(iconSize, iconSize, { fit: "contain" }).png().toBuffer();

  let pipeline = sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: variant === "header" ? BRAND_TEAL : { r: 255, g: 255, b: 255 },
    },
  }).composite([{ input: icon, gravity: "centre" }]);

  if (variant === "watermark") {
    pipeline = pipeline.modulate({ brightness: 1.08, saturation: 0.35 });
  }

  const output = await pipeline.jpeg({ quality: variant === "header" ? 92 : 80 }).toBuffer();
  const meta = await sharp(output).metadata();

  const result = {
    buffer: output,
    width: meta.width ?? size,
    height: meta.height ?? size,
  };

  cache.set(cacheKey, output);
  return result;
}

export async function getHeaderLogoJpeg(size = 104): Promise<LogoImageAsset> {
  return renderSquareLogo(size, "header");
}

export async function getWatermarkLogoJpeg(size = 140): Promise<LogoImageAsset> {
  return renderSquareLogo(size, "watermark");
}

export function clearLogoImageCache(): void {
  cache.clear();
}
