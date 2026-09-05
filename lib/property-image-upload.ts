/** Límite alineado con el payload máximo de Vercel (~4,5 MB). */
export const PROPERTY_IMAGE_MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

export const PROPERTY_IMAGE_MAX_DIMENSION = 2400;
export const PROPERTY_IMAGE_WEBP_QUALITY = 82;

const MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "heic", "heif"]);

export function propertyImageExtension(file: File): string | null {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && EXTENSIONS.has(fromName)) return fromName;

  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
      return "heic";
    case "image/heif":
      return "heif";
    default:
      return null;
  }
}

export function isAllowedPropertyImageUpload(file: File): boolean {
  if (MIME_TYPES.has(file.type)) return true;
  if (!file.type || file.type === "application/octet-stream") {
    return propertyImageExtension(file) != null;
  }
  return false;
}

export function propertyImageUploadValidationError(file: File): string | null {
  if (file.size === 0) return "Selecciona una imagen.";
  if (file.size > PROPERTY_IMAGE_MAX_UPLOAD_BYTES) {
    return "La imagen supera el límite de 4 MB. Use una foto más ligera o redúzcala antes de subir.";
  }
  if (!isAllowedPropertyImageUpload(file)) {
    return "Formato no permitido. Use JPG, PNG, WEBP o HEIC (fotos de iPhone).";
  }
  return null;
}

export const PROPERTY_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";
