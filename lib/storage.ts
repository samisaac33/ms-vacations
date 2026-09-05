import sharp from "sharp";

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

const PROPERTY_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const MAX_BYTES = 5 * 1024 * 1024;
const PROPERTY_IMAGE_MAX_BYTES = 12 * 1024 * 1024;
const PROPERTY_IMAGE_MAX_DIMENSION = 2400;

export function isStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

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
  if (!PROPERTY_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: "Formato no permitido. Use JPG, PNG o WEBP." };
  }
  if (file.size > PROPERTY_IMAGE_MAX_BYTES) {
    return { ok: false, message: "La imagen supera el límite de 12 MB." };
  }

  const input = Buffer.from(await file.arrayBuffer());
  let webp: Buffer;
  try {
    webp = await sharp(input)
      .rotate()
      .resize({
        width: PROPERTY_IMAGE_MAX_DIMENSION,
        height: PROPERTY_IMAGE_MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
  } catch {
    return { ok: false, message: "No se pudo procesar la imagen." };
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
