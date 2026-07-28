/**
 * Convierte fotos locales a WebP y las sube a Supabase Storage (MS_VACATIONS/porto-norte/).
 *
 * Uso:
 *   1. Coloque JPG/PNG/WebP en ./porto-norte-photos/ (nombres finales, p. ej. exterior-01.jpg)
 *   2. Defina SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY
 *   3. npx tsx scripts/upload-porto-norte-photos.ts
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? "https://tikrziworaajjatulzsg.supabase.co";
const BUCKET = "MS_VACATIONS";
const PREFIX = "porto-norte";
const INPUT_DIR = path.join(process.cwd(), "porto-norte-photos");

async function main() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("Defina SUPABASE_SERVICE_ROLE_KEY para subir fotos.");
  }

  let files: string[];
  try {
    files = await readdir(INPUT_DIR);
  } catch {
    throw new Error(`Cree la carpeta ${INPUT_DIR} con las fotos a subir.`);
  }

  const images = files.filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (images.length === 0) {
    throw new Error(`No hay imágenes en ${INPUT_DIR}.`);
  }

  for (const file of images.sort()) {
    const base = file.replace(/\.(jpe?g|png|webp)$/i, "");
    const objectPath = `${PREFIX}/${base}.webp`;
    const input = await readFile(path.join(INPUT_DIR, file));
    const webp = await sharp(input).webp({ quality: 82 }).toBuffer();

    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "image/webp",
          "x-upsert": "true",
        },
        body: webp,
      },
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Error subiendo ${objectPath} (${res.status}): ${text}`);
    }

    console.log(`OK ${objectPath}`);
  }

  console.log(`Subidas ${images.length} fotos a ${BUCKET}/${PREFIX}/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
