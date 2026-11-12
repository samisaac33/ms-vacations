/**
 * Reclasifica la foto de habitación 4 de Porto Norte (subida como «Otra» / adicional-01.webp)
 * y publica habitacion-04.webp en R2.
 *
 * Requisitos: DATABASE_URL y variables R2_* (véase .env.local).
 *
 * Uso:
 *   npx tsx scripts/fix-porto-norte-habitacion-4.ts --dry-run
 *   npx tsx scripts/fix-porto-norte-habitacion-4.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { and, eq, ilike, or } from "drizzle-orm";
import sharp from "sharp";
import { getDb } from "@/db/index";
import { properties, propertyImages } from "@/db/schema";
import { PROPERTY_IMAGE_MAX_DIMENSION, PROPERTY_IMAGE_WEBP_QUALITY } from "@/lib/property-image-upload";
import { getR2Client, getR2BucketName } from "@/lib/r2-client";
import { isR2Configured, propertyImagePublicUrl } from "@/lib/r2-config";

const SLUG = "porto-norte";
const SOURCE_JPG = resolve(process.cwd(), "property-photos/porto-norte/habitacion-04.jpg");
const TARGET_STORAGE_PATH = "porto-norte/habitacion-04.webp";
const LEGACY_OTRA_PATH = "porto-norte/adicional-01.webp";

function loadEnvFile(name: string) {
  const path = resolve(process.cwd(), name);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined || process.env[key] === "") {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const dryRun = process.argv.includes("--dry-run");

async function buildWebpBuffer(): Promise<Buffer> {
  const input = await readFile(SOURCE_JPG);
  return sharp(input)
    .rotate()
    .resize({
      width: PROPERTY_IMAGE_MAX_DIMENSION,
      height: PROPERTY_IMAGE_MAX_DIMENSION,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: PROPERTY_IMAGE_WEBP_QUALITY })
    .toBuffer();
}

async function uploadToR2(body: Buffer): Promise<void> {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: TARGET_STORAGE_PATH,
      Body: body,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

async function deleteFromR2(storagePath: string): Promise<void> {
  const client = getR2Client();
  await client.send(
    new DeleteObjectCommand({
      Bucket: getR2BucketName(),
      Key: storagePath,
    }),
  );
}

async function main() {
  if (!existsSync(SOURCE_JPG)) {
    throw new Error(`Falta la foto fuente: ${SOURCE_JPG}`);
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("Defina DATABASE_URL.");
  }
  if (!isR2Configured()) {
    throw new Error("Configure las variables R2_*.");
  }

  const alt = "Porto Norte — habitación 4 — 2 camas individuales";
  const publicUrl = propertyImagePublicUrl(TARGET_STORAGE_PATH);

  const db = getDb();
  const [property] = await db
    .select({ id: properties.id })
    .from(properties)
    .where(eq(properties.slug, SLUG))
    .limit(1);

  if (!property) {
    throw new Error(`Propiedad ${SLUG} no encontrada en la base de datos.`);
  }

  const candidates = await db
    .select()
    .from(propertyImages)
    .where(
      and(
        eq(propertyImages.propertyId, property.id),
        or(
          eq(propertyImages.storagePath, LEGACY_OTRA_PATH),
          eq(propertyImages.storagePath, TARGET_STORAGE_PATH),
          ilike(propertyImages.alt, "% — otra%"),
        ),
      ),
    );

  if (candidates.length === 0) {
    throw new Error(
      "No se encontró la fila «Otra» (adicional-01). Revise la galería en admin.",
    );
  }

  const otraRow =
    candidates.find((r) => r.storagePath === LEGACY_OTRA_PATH || / — otra$/i.test(r.alt)) ??
    candidates[0]!;

  console.log("Imagen a actualizar:", {
    id: otraRow.id,
    storagePath: otraRow.storagePath,
    alt: otraRow.alt,
  });
  console.log("Nuevo destino:", { storagePath: TARGET_STORAGE_PATH, alt, publicUrl });

  if (dryRun) {
    console.log("Dry-run: no se aplicaron cambios.");
    return;
  }

  const webp = await buildWebpBuffer();
  await uploadToR2(webp);

  await db
    .update(propertyImages)
    .set({
      storagePath: TARGET_STORAGE_PATH,
      src: publicUrl,
      alt,
    })
    .where(eq(propertyImages.id, otraRow.id));

  const legacyPaths = new Set(
    candidates
      .filter((r) => r.id !== otraRow.id)
      .map((r) => r.storagePath)
      .concat(otraRow.storagePath !== TARGET_STORAGE_PATH ? [otraRow.storagePath] : []),
  );

  for (const path of legacyPaths) {
    if (path === TARGET_STORAGE_PATH) continue;
    try {
      await deleteFromR2(path);
      console.log(`Archivo R2 eliminado: ${path}`);
    } catch (e) {
      console.warn(`No se pudo eliminar ${path}:`, e);
    }
    await db.delete(propertyImages).where(eq(propertyImages.storagePath, path));
  }

  console.log("Porto Norte: habitación 4 actualizada en R2 y en property_images.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
