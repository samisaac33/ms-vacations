#!/usr/bin/env node
/**
 * Exporta tarjetas del flujo de reserva (1080×1350) para redes y descarga en admin.
 *
 * Requisitos:
 *   - Servidor local: npm run dev
 *   - Capturas base: npm run screenshots:booking
 *
 * Uso: npm run content:export-booking
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import puppeteer from "puppeteer-core";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public/images/content/booking-flow");
const SRC_DIR = path.join(process.cwd(), "public/images/booking-flow-mobile");

const EXPORTS = [
  { step: "1", output: "paso-1-elige-alojamiento.png" },
  { step: "2", output: "paso-2-completa-reserva.png" },
  { step: "3", output: "paso-3-confirmacion.png" },
];

const VIEWPORT = { width: 1080, height: 1350, deviceScaleFactor: 1 };

function chromePath() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [
    "/usr/local/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  return candidates.find((p) => fs.existsSync(p)) ?? candidates[0];
}

function ensureBaseScreenshots() {
  const required = ["01-propiedad-movil-light.png", "02-reservar-movil-light.png", "03-confirmacion-movil-light.png"];
  const missing = required.filter((file) => !fs.existsSync(path.join(SRC_DIR, file)));
  if (missing.length === 0) return;

  console.log("Capturas base no encontradas, ejecutando screenshots:booking…");
  const result = spawnSync("node", ["scripts/capture-booking-screenshots.mjs"], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error("No se pudieron generar las capturas base.");
  }
}

async function exportStep(page, { step, output }) {
  const url = `${BASE}/admin/contenido/export/${step}`;
  await page.setViewport(VIEWPORT);
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
  await page.waitForSelector("#booking-flow-export", { timeout: 30_000 });
  await new Promise((r) => setTimeout(r, 800));

  const card = await page.$("#booking-flow-export");
  if (!card) throw new Error(`No se encontró #booking-flow-export en ${url}`);

  await card.screenshot({
    path: path.join(OUT_DIR, output),
    type: "png",
  });
  console.log(`✓ ${output} ← ${url}`);
}

async function main() {
  ensureBaseScreenshots();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  for (const item of EXPORTS) {
    await exportStep(page, item);
  }
  await page.close();
  await browser.close();

  console.log(`\nExportaciones guardadas en ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
