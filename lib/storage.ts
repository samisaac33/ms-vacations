import sharp from "sharp";
import {
  isAllowedPropertyImageUpload,
  PROPERTY_IMAGE_MAX_DIMENSION,
  PROPERTY_IMAGE_MAX_UPLOAD_BYTES,
  PROPERTY_IMAGE_WEBP_QUALITY,
  propertyImageExtension,
} from "@/lib/property-image-upload";

export { isStorageConfigured } from "@/lib/storage-config";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://srtoqhmjydbpmwhyuurw.supabase.co";
/** Proyecto actual donde viven las fotos de propiedades. */
const SUPABASE_PROPERTY_IMAGES_URL =
  process.env.SUPABASE_PROPERTY_IMAGES_URL ??
  process.env.SUPABASE_URL ??
  "https://tikrziworaajjatulzsg.supabase.co";
const BUCKET = "MS_VACATIONS";
const PROOF_PREFIX = "payment-proofs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadPaymentProof(
  bookingId: string,
  file: File,
): Promise<{ ok: true; publicUrl: string } | { ok: false; message: string }> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return { ok: false, message: "Almacenamiento de comprobantes no configurado." };
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return { ok: false, message: "Formato no permitido. Use JPG, PNG, WEBP o PDF." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "El archivo supera el límite de 5 MB." };
  }

  const ext =
    file.type === "application/pdf"
      ? "pdf"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
  const path = `${PROOF_PREFIX}/${bookingId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": file.type,
        "x-upsert": "true",
      },
      body: buffer,
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: `No se pudo subir el comprobante (${res.status}). ${text}` };
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${encodeURIComponent(path)}`;
  return { ok: true, publicUrl };
}

function propertyImagePublicUrl(storagePath: string): string {
  const encoded = storagePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  return `${SUPABASE_PROPERTY_IMAGES_URL}/storage/v1/object/public/${BUCKET}/${encoded}`;
}

export async function uploadPropertyImage(
  storagePath: string,
  file: File,
): Promise<{ ok: true; publicUrl: string; storagePath: string } | { ok: false; message: string }> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return { ok: false, message: "Almacenamiento de fotos no configurado (SUPABASE_SERVICE_ROLE_KEY)." };
  }
  if (!isAllowedPropertyImageUpload(file)) {
    return { ok: false, message: "Formato no permitido. Use JPG, PNG, WEBP o HEIC (fotos de iPhone)." };
  }
  if (file.size > PROPERTY_IMAGE_MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      message: "La imagen supera el límite de 4 MB. Use una foto más ligera o redúzcala antes de subir.",
    };
  }

  const input = Buffer.from(await file.arrayBuffer());
  let webp: Buffer;
  try {
    webp = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({
        width: PROPERTY_IMAGE_MAX_DIMENSION,
        height: PROPERTY_IMAGE_MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: PROPERTY_IMAGE_WEBP_QUALITY })
      .toBuffer();
  } catch (e) {
    const ext = propertyImageExtension(file);
    if (ext === "heic" || ext === "heif") {
      return {
        ok: false,
        message:
          "No se pudo procesar HEIC. En Ajustes → Cámara active «Más compatible» (JPG) o exporte la foto a JPG.",
      };
    }
    return { ok: false, message: "No se pudo procesar la imagen. Pruebe con JPG o PNG." };
  }

  if (webp.length === 0) {
    return { ok: false, message: "No se pudo procesar la imagen. Pruebe con JPG o PNG." };
  }

  const res = await fetch(
    `${SUPABASE_PROPERTY_IMAGES_URL}/storage/v1/object/${BUCKET}/${storagePath
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "image/webp",
        "x-upsert": "true",
      },
      body: new Uint8Array(webp),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: `No se pudo subir la foto (${res.status}). ${text}` };
  }

  return { ok: true, publicUrl: propertyImagePublicUrl(storagePath), storagePath };
}

export async function deletePropertyImageFile(
  storagePath: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return { ok: false, message: "Almacenamiento no configurado." };
  }

  const res = await fetch(
    `${SUPABASE_PROPERTY_IMAGES_URL}/storage/v1/object/${BUCKET}/${storagePath
      .split("/")
      .map(encodeURIComponent)
      .join("/")}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${key}` },
    },
  );

  if (!res.ok && res.status !== 404) {
    const text = await res.text().catch(() => "");
    return { ok: false, message: `No se pudo eliminar el archivo (${res.status}). ${text}` };
  }

  return { ok: true };
}
