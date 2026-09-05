"use client";

import {
  PROPERTY_IMAGE_MAX_DIMENSION,
  PROPERTY_IMAGE_MAX_UPLOAD_BYTES,
  PROPERTY_IMAGE_WEBP_QUALITY,
} from "@/lib/property-image-upload";

const QUALITY_STEPS = [
  PROPERTY_IMAGE_WEBP_QUALITY / 100,
  0.72,
  0.62,
  0.52,
  0.42,
];
const DIMENSION_STEPS = [PROPERTY_IMAGE_MAX_DIMENSION, 2000, 1600, 1200, 800];

export type CompressImageResult =
  | { ok: true; file: File }
  | { ok: false; message: string };

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode failed"));
    img.src = url;
  });
}

async function decodeToBitmap(file: File, maxDimension: number): Promise<ImageBitmap> {
  const resizeOptions = {
    resizeWidth: maxDimension,
    resizeHeight: maxDimension,
    resizeQuality: "high" as const,
    imageOrientation: "from-image" as const,
  };

  try {
    return await createImageBitmap(file, resizeOptions);
  } catch {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImageElement(url);
      const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      return await createImageBitmap(img, {
        resizeWidth: width,
        resizeHeight: height,
        resizeQuality: "high",
        imageOrientation: "from-image",
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function canvasToWebp(bitmap: ImageBitmap, quality: number): Promise<Blob | null> {
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);

  ctx.drawImage(bitmap, 0, 0);
  return new Promise((resolve) => {
    canvas.toBlob((result) => resolve(result), "image/webp", quality);
  });
}

export async function compressPropertyImageClient(file: File): Promise<CompressImageResult> {
  let lastSize = 0;

  try {
    for (const maxDimension of DIMENSION_STEPS) {
      let bitmap: ImageBitmap | null = null;
      try {
        bitmap = await decodeToBitmap(file, maxDimension);
        const qualities =
          maxDimension === PROPERTY_IMAGE_MAX_DIMENSION ? QUALITY_STEPS : QUALITY_STEPS.slice(0, 3);

        for (const quality of qualities) {
          const blob = await canvasToWebp(bitmap, quality);
          if (!blob) continue;

          lastSize = blob.size;
          if (blob.size <= PROPERTY_IMAGE_MAX_UPLOAD_BYTES) {
            const baseName = file.name.replace(/\.[^.]+$/i, "") || "foto";
            return {
              ok: true,
              file: new File([blob], `${baseName}.webp`, { type: "image/webp" }),
            };
          }
        }
      } finally {
        bitmap?.close();
      }
    }

    if (lastSize > PROPERTY_IMAGE_MAX_UPLOAD_BYTES) {
      return {
        ok: false,
        message:
          "La foto sigue siendo muy pesada tras comprimirla. Pruebe con otra imagen o baje la resolución en la cámara.",
      };
    }

    return { ok: false, message: "No se pudo comprimir la imagen. Pruebe con JPG o PNG." };
  } catch {
    return {
      ok: false,
      message: "No se pudo leer la imagen. Pruebe seleccionarla de nuevo o use formato JPG.",
    };
  }
}
