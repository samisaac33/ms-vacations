/**
 * Sube fotos locales a Cloudflare R2 (sin Supabase).
 *
 * Estructura esperada:
 *   property-photos/arrecife/exterior-01.jpg
 *   property-photos/home-one/piscina-02.png
 *   ...
 *
 * Los nombres de carpeta deben coincidir con lib/property-storage-prefix.ts
 * (arrecife, home-one, porto-norte, etc.). Se convierten a WebP como en producción.
 *
 * Requisitos en .env.local:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL
 *
 * Uso:
 *   npm run storage:upload-local-to-r2 -- --webp-only --dry-run
 *   npm run storage:upload-local-to-r2 -- --webp-only
 *   npm run storage:upload-local-to-r2 -- --source=C:\fotos-ms-vacations
 */
import { existsSync, readFileSync } from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { readFile } from "node:fs/promises";
import { resolve, relative, extname, basename } from "node:path";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { getR2Client, getR2BucketName } from "@/lib/r2-client";
import { getR2PublicUrlBase, isR2Configured, propertyImagePublicUrl } from "@/lib/r2-config";
import { PROPERTY_STORAGE_PREFIX } from "@/lib/property-storage-prefix";

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

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);
const VALID_PREFIXES = new Set(Object.values(PROPERTY_STORAGE_PREFIX));

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const webpOnly = args.includes("--webp-only");
const sourceArg = args.find((a) => a.startsWith("--source="));
const SOURCE_DIR = resolve(process.cwd(), sourceArg?.slice("--source=".length) ?? "property-photos");

function allowedExtensions(): Set<string> {
  return webpOnly ? new Set([".webp"]) : IMAGE_EXT;
}

async function walkImages(dir: string): Promise<string[]> {
  const exts = allowedExtensions();
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkImages(full)));
    } else if (entry.isFile() && exts.has(extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function normalizeRelativePath(rel: string): string[] {
  let parts = rel.replace(/\\/g, "/").split("/");
  if (parts.length > 2 && parts[1] === "webp") {
    parts = [parts[0]!, ...parts.slice(2)];
  }
  return parts;
}

/** Prefer webp/ subcarpeta, luego .webp, luego .avif. */
function filePriority(absPath: string): number {
  const rel = relative(SOURCE_DIR, absPath).replace(/\\/g, "/");
  const ext = extname(absPath).toLowerCase();
  if (rel.includes("/webp/") && ext === ".webp") return 4;
  if (ext === ".webp") return 3;
  if (ext === ".avif") return 2;
  return 1;
}

function dedupeByStoragePath(files: string[]): string[] {
  const best = new Map<string, { absPath: string; priority: number }>();
  for (const absPath of files) {
    const mapped = storagePathForLocalFile(absPath);
    if (typeof mapped === "object") continue;
    const priority = filePriority(absPath);
    const current = best.get(mapped);
    if (!current || priority > current.priority) {
      best.set(mapped, { absPath, priority });
    }
  }
  return [...best.values()].map((v) => v.absPath).sort();
}

function storagePathForLocalFile(absPath: string): string | { error: string } {
  const rel = relative(SOURCE_DIR, absPath);
  const parts = normalizeRelativePath(rel);
  if (parts.length < 2) {
    return { error: `Ruta inválida (use carpeta/propiedad/archivo): ${rel}` };
  }
  const prefix = parts[0]!;
  if (!VALID_PREFIXES.has(prefix)) {
    return {
      error: `Carpeta desconocida "${prefix}" en ${rel}. Use: ${[...VALID_PREFIXES].join(", ")}`,
    };
  }
  const baseName = basename(parts[parts.length - 1]!, extname(parts[parts.length - 1]!));
  const subPath = parts.slice(1, -1);
  const fileName = `${baseName}.webp`;
  return [...subPath.length ? [prefix, ...subPath] : [prefix], fileName].join("/");
}

async function toWebpBuffer(absPath: string): Promise<Buffer> {
  const ext = extname(absPath).toLowerCase();
  const input = await readFile(absPath);
  if (ext === ".webp") return input;
  return sharp(input).webp({ quality: 82 }).toBuffer();
}

async function uploadOne(storagePath: string, body: Buffer) {
  const client = getR2Client();
  await client.send(
    new PutObjectCommand({
      Bucket: getR2BucketName(),
      Key: storagePath,
      Body: body,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
}

async function main() {
  if (!isR2Configured()) {
    throw new Error("Configure R2_* en .env.local");
  }

  const st = await stat(SOURCE_DIR).catch(() => null);
  if (!st?.isDirectory()) {
    throw new Error(
      `Carpeta no encontrada: ${SOURCE_DIR}\nCree property-photos/ con subcarpetas arrecife/, home-one/, etc.`,
    );
  }

  const images = dedupeByStoragePath(await walkImages(SOURCE_DIR));
  if (images.length === 0) {
    throw new Error(`No hay imágenes JPG/PNG/WebP/AVIF en ${SOURCE_DIR}`);
  }

  console.log(`Origen: ${SOURCE_DIR}`);
  console.log(`Destino R2: ${getR2PublicUrlBase()}`);
  console.log(`Modo: ${dryRun ? "dry-run" : "subida real"}${webpOnly ? " (solo .webp)" : ""}`);
  console.log(`Encontradas ${images.length} imágenes locales.`);

  let ok = 0;
  let failed = 0;

  for (const absPath of images) {
    const mapped = storagePathForLocalFile(absPath);
    if (typeof mapped === "object") {
      console.error(`SKIP ${relative(SOURCE_DIR, absPath)}: ${mapped.error}`);
      failed++;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${relative(SOURCE_DIR, absPath)} → ${mapped}`);
      console.log(`          ${propertyImagePublicUrl(mapped)}`);
      ok++;
      continue;
    }

    try {
      const body = await toWebpBuffer(absPath);
      await uploadOne(mapped, body);
      console.log(`OK ${mapped}`);
      ok++;
    } catch (e) {
      console.error(`FAIL ${mapped}:`, e instanceof Error ? e.message : e);
      failed++;
    }
  }

  console.log(`\nResultado: ${ok} OK, ${failed} fallidos.`);
  if (!dryRun && ok > 0) {
    console.log("\nSiguiente paso — actualizar URLs en la base de datos:");
    console.log("  npm run storage:migrate-to-r2 -- --db-only");
    console.log("\nVerifique una URL, por ejemplo:");
    console.log(`  ${propertyImagePublicUrl("arrecife/exterior-01.webp")}`);
  }
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
