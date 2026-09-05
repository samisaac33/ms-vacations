import {
  PROPERTY_IMAGE_MAX_DIMENSION,
  PROPERTY_IMAGE_WEBP_QUALITY,
  propertyImageExtension,
} from "@/lib/property-image-upload";

export type ProcessImageResult =
  | { ok: true; buffer: Buffer }
  | { ok: false; message: string };

function heicHelpMessage(): string {
  return "No se pudo procesar HEIC. En Ajustes → Cámara active «Más compatible» (JPG) o exporte la foto a JPG.";
}

function genericProcessError(ext: string | null): string {
  if (ext === "heic" || ext === "heif") return heicHelpMessage();
  return "No se pudo procesar la imagen. Pruebe con JPG o PNG.";
}

export async function processPropertyImageToWebp(
  input: Buffer,
  file: File,
): Promise<ProcessImageResult> {
  let sharp: (typeof import("sharp"))["default"];
  try {
    sharp = (await import("sharp")).default;
  } catch {
    return {
      ok: false,
      message: "El procesador de imágenes no está disponible en el servidor.",
    };
  }

  const ext = propertyImageExtension(file);

  try {
    const webp = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({
        width: PROPERTY_IMAGE_MAX_DIMENSION,
        height: PROPERTY_IMAGE_MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: PROPERTY_IMAGE_WEBP_QUALITY })
      .toBuffer();

    if (webp.length === 0) {
      return { ok: false, message: genericProcessError(ext) };
    }

    return { ok: true, buffer: webp };
  } catch {
    return { ok: false, message: genericProcessError(ext) };
  }
}
