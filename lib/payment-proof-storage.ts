import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, getR2BucketName } from "@/lib/r2-client";
import { getR2PublicUrlBase, isR2Configured } from "@/lib/r2-config";

const PROOF_PREFIX = "payment-proofs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_BYTES = 5 * 1024 * 1024;

function proofPublicUrl(storagePath: string): string {
  const base = getR2PublicUrlBase();
  if (!base) throw new Error("R2_PUBLIC_URL no está configurada.");
  const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
  return `${base}/${encoded}`;
}

export async function uploadPaymentProof(
  bookingId: string,
  file: File,
): Promise<{ ok: true; publicUrl: string } | { ok: false; message: string }> {
  if (!isR2Configured()) {
    return {
      ok: false,
      message:
        "Almacenamiento de comprobantes no configurado (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL).",
    };
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
  const storagePath = `${PROOF_PREFIX}/${bookingId}.${ext}`;
  const body = new Uint8Array(await file.arrayBuffer());

  try {
    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: getR2BucketName(),
        Key: storagePath,
        Body: body,
        ContentType: file.type,
        CacheControl: "private, max-age=31536000",
      }),
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `No se pudo subir el comprobante a R2. ${message}` };
  }

  return { ok: true, publicUrl: proofPublicUrl(storagePath) };
}
