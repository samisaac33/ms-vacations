import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  isAllowedPropertyImageUpload,
  PROPERTY_IMAGE_MAX_UPLOAD_BYTES,
} from "@/lib/property-image-upload";
import { processPropertyImageToWebp } from "@/lib/process-property-image";
import { getR2Client, getR2BucketName } from "@/lib/r2-client";
import { isR2Configured, propertyImagePublicUrl } from "@/lib/r2-config";

export async function uploadPropertyImage(
  storagePath: string,
  file: File,
  options?: { preprocessed?: boolean },
): Promise<{ ok: true; publicUrl: string; storagePath: string } | { ok: false; message: string }> {
  if (!isR2Configured()) {
    return {
      ok: false,
      message:
        "Almacenamiento de fotos no configurado (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL).",
    };
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

  try {
    const client = getR2Client();
    await client.send(
      new PutObjectCommand({
        Bucket: getR2BucketName(),
        Key: storagePath,
        Body: uploadBody,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `No se pudo subir la foto a R2. ${message}` };
  }

  return { ok: true, publicUrl: propertyImagePublicUrl(storagePath), storagePath };
}

export async function deletePropertyImageFile(
  storagePath: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isR2Configured()) {
    return { ok: false, message: "Almacenamiento R2 no configurado." };
  }

  try {
    const client = getR2Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: getR2BucketName(),
        Key: storagePath,
      }),
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { ok: false, message: `No se pudo eliminar el archivo (${message}).` };
  }

  return { ok: true };
}
