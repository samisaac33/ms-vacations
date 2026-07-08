const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://srtoqhmjydbpmwhyuurw.supabase.co";
const BUCKET = "MS_VACATIONS";
const PROOF_PREFIX = "payment-proofs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_BYTES = 5 * 1024 * 1024;

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
