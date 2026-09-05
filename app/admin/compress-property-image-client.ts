"use client";

import { PROPERTY_IMAGE_MAX_UPLOAD_BYTES } from "@/lib/property-image-upload";

const MAX_DIMENSION = 2400;
const WEBP_QUALITY = 0.82;

export type CompressImageResult =
  | { ok: true; file: File }
  | { ok: false; message: string };

export async function compressPropertyImageClient(file: File): Promise<CompressImageResult> {
  try {
    const bitmap = await createImageBitmap(file);
    let width = bitmap.width;
    let height = bitmap.height;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return { ok: false, message: "No se pudo preparar la imagen en el navegador." };
    }

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), "image/webp", WEBP_QUALITY);
    });

    if (!blob) {
      return { ok: false, message: "No se pudo comprimir la imagen. Pruebe con JPG o PNG." };
    }

    if (blob.size > PROPERTY_IMAGE_MAX_UPLOAD_BYTES) {
      return {
        ok: false,
        message: "Tras comprimir sigue superando 4 MB. Use una foto con menos resolución.",
      };
    }

    const baseName = file.name.replace(/\.[^.]+$/i, "") || "foto";
    return {
      ok: true,
      file: new File([blob], `${baseName}.webp`, { type: "image/webp" }),
    };
  } catch {
    return {
      ok: false,
      message:
        "No se pudo leer la imagen. Si es HEIC, exporte a JPG o active «Más compatible» en Ajustes → Cámara.",
    };
  }
}
