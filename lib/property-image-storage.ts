import {
  isAllowedPropertyImageUpload,
  PROPERTY_IMAGE_MAX_UPLOAD_BYTES,
} from "@/lib/property-image-upload";
import { processPropertyImageToWebp } from "@/lib/process-property-image";

const SUPABASE_PROPERTY_IMAGES_URL =
  process.env.SUPABASE_PROPERTY_IMAGES_URL ??
  process.env.SUPABASE_URL ??
  "https://tikrziworaajjatulzsg.supabase.co";
const BUCKET = "MS_VACATIONS";

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
  options?: { preprocessed?: boolean },
): Promise<{ ok: true; publicUrl: string; storagePath: string } | { ok: false; message: string }> {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    return { ok: false, message: "Almacenamiento de fotos no configurado (SUPABASE_SERVICE_ROLE_KEY)." };
  }
  if (!isAllowedPropertyImageUpload(file) && !options?.preprocessed) {
    return { ok: false, message: "Formato no permitido. Use JPG, PNG o WEBP." };
  }
  if (file.size > PROPERTY_IMAGE_MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      message: "La imagen supera el límite de 4 MB. Use una foto más ligera o redúzcala antes de subir.",
    };
  }

  let uploadBody: Uint8Array;

  if (options?.preprocessed || file.type === "image/webp") {
    uploadBody = new Uint8Array(await file.arrayBuffer());
  } else {
    const input = Buffer.from(await file.arrayBuffer());
    const processed = await processPropertyImageToWebp(input, file);
    if (!processed.ok) {
      return { ok: false, message: processed.message };
    }
    uploadBody = new Uint8Array(processed.buffer);
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
      body: new Uint8Array(uploadBody),
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
