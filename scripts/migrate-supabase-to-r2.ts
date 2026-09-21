/**
 * Copia fotos de propiedades desde Supabase Storage a Cloudflare R2 y actualiza URLs en BD.
 *
 * Requisitos:
 *   SUPABASE_SERVICE_ROLE_KEY — descargar desde Supabase (API privada, no CDN)
 *   DATABASE_URL — actualizar property_images.src
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 *
 * Uso:
 *   npm run storage:migrate-to-r2 -- --dry-run
 *   npm run storage:migrate-to-r2
 *   npm run storage:migrate-to-r2 -- --db-only
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

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

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/index";
import { propertyImages } from "@/db/schema";
import { getR2Client, getR2BucketName } from "@/lib/r2-client";
import { getR2PublicUrlBase, propertyImagePublicUrl } from "@/lib/r2-config";
import {
  isSupabasePropertyImageUrl,
  PROPERTY_STORAGE_PREFIX,
} from "@/lib/property-storage-prefix";

const SUPABASE_HOSTS = [
  process.env.SUPABASE_PROPERTY_IMAGES_URL ??
    process.env.SUPABASE_URL ??
    "https://tikrziworaajjatulzsg.supabase.co",
  "https://srtoqhmjydbpmwhyuurw.supabase.co",
];
const BUCKET = "MS_VACATIONS";

type ListedObject = { name: string; id: string | null };

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const dbOnly = args.has("--db-only");

async function listSupabasePrefix(
  baseUrl: string,
  serviceKey: string,
  prefix: string,
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const res = await fetch(`${baseUrl}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefix, limit, offset }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`List ${prefix} @ ${baseUrl} (${res.status}): ${text}`);
    }

    const items = (await res.json()) as ListedObject[];
    if (items.length === 0) break;

    for (const item of items) {
      const fullPath = prefix ? `${prefix}${item.name}` : item.name;
      if (item.id === null) {
        const nested = await listSupabasePrefix(baseUrl, serviceKey, `${fullPath}/`);
        paths.push(...nested);
      } else {
        paths.push(fullPath);
      }
    }

    if (items.length < limit) break;
    offset += limit;
  }

  return paths;
}

async function collectSupabasePaths(serviceKey: string): Promise<Map<string, string>> {
  const pathToHost = new Map<string, string>();
  const prefixes = [...new Set(Object.values(PROPERTY_STORAGE_PREFIX))];

  for (const baseUrl of SUPABASE_HOSTS) {
    for (const prefix of prefixes) {
      try {
        const paths = await listSupabasePrefix(baseUrl, serviceKey, `${prefix}/`);
        for (const p of paths) {
          if (!pathToHost.has(p)) pathToHost.set(p, baseUrl);
        }
      } catch (e) {
        console.warn(`Omitiendo ${prefix} en ${baseUrl}:`, e instanceof Error ? e.message : e);
      }
    }
  }

  return pathToHost;
}

async function downloadFromSupabase(
  baseUrl: string,
  serviceKey: string,
  storagePath: string,
): Promise<Buffer> {
  const encoded = storagePath.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(`${baseUrl}/storage/v1/object/${BUCKET}/${encoded}`, {
    headers: { Authorization: `Bearer ${serviceKey}` },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Download ${storagePath} (${res.status}): ${text}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

async function uploadToR2(storagePath: string, body: Buffer, contentType: string) {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: storagePath,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

function guessContentType(path: string): string {
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

async function migrateFiles(pathToHost: Map<string, string>, serviceKey: string) {
  let copied = 0;
  let failed = 0;

  for (const [storagePath, baseUrl] of pathToHost) {
    if (dryRun) {
      console.log(`[dry-run] copiaría ${storagePath} desde ${baseUrl}`);
      copied++;
      continue;
    }

    try {
      const body = await downloadFromSupabase(baseUrl, serviceKey, storagePath);
      await uploadToR2(storagePath, body, guessContentType(storagePath));
      console.log(`OK ${storagePath}`);
      copied++;
    } catch (e) {
      console.error(`FAIL ${storagePath}:`, e instanceof Error ? e.message : e);
      failed++;
    }
  }

  console.log(`Archivos: ${copied} copiados, ${failed} fallidos.`);
  if (failed > 0 && !dryRun) {
    process.exitCode = 1;
  }
}

async function updateDatabaseUrls() {
  if (!getR2PublicUrlBase()) {
    throw new Error("Defina R2_PUBLIC_URL antes de actualizar la BD.");
  }

  const db = getDb();
  const rows = await db
    .select({
      id: propertyImages.id,
      storagePath: propertyImages.storagePath,
      src: propertyImages.src,
    })
    .from(propertyImages);

  let updated = 0;
  for (const row of rows) {
    const newSrc = propertyImagePublicUrl(row.storagePath);
    if (row.src === newSrc) continue;
    if (dryRun) {
      console.log(`[dry-run] BD ${row.id}: ${row.src} → ${newSrc}`);
      updated++;
      continue;
    }
    await db
      .update(propertyImages)
      .set({ src: newSrc })
      .where(eq(propertyImages.id, row.id));
    updated++;
  }

  const supabaseRows = rows.filter((r) => isSupabasePropertyImageUrl(r.src));
  console.log(
    `BD: ${updated} filas ${dryRun ? "a actualizar" : "actualizadas"} (${supabaseRows.length} con URL Supabase).`,
  );
}

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    throw new Error(
      "Defina SUPABASE_SERVICE_ROLE_KEY para leer Supabase Storage (en .env.local, sin comillas vacías).",
    );
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("Defina DATABASE_URL para actualizar property_images.");
  }
  if (!getR2PublicUrlBase()) {
    throw new Error("Defina R2_PUBLIC_URL (URL pública del bucket, con Public URL habilitada).");
  }

  console.log(`Modo: ${dryRun ? "dry-run" : dbOnly ? "solo BD" : "copia + BD"}`);
  console.log(`Destino R2: ${getR2PublicUrlBase()}`);

  if (!dbOnly) {
    console.log("Listando archivos en Supabase…");
    const pathToHost = await collectSupabasePaths(serviceKey);
    console.log(`Encontrados ${pathToHost.size} archivos en MS_VACATIONS.`);
    await migrateFiles(pathToHost, serviceKey);
  }

  console.log("Actualizando URLs en property_images…");
  await updateDatabaseUrls();

  console.log("Migración finalizada.");
  console.log("");
  console.log("Próximos pasos:");
  console.log("  1. Configure las variables R2_* en Vercel y redeploy.");
  console.log("  2. Verifique una URL: " + propertyImagePublicUrl("arrecife/exterior-01.webp"));
  console.log("  3. Opcional: dominio custom en R2 → actualice R2_PUBLIC_URL.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
