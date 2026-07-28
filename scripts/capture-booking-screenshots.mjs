#!/usr/bin/env node
/**
 * Captura pantallas móviles del flujo de reserva para documentación/marketing.
 * Uso: node scripts/capture-booking-screenshots.mjs
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public/images/booking-flow-mobile");
const SLUG = "villa-palmera";
const CHECK_IN = "2026-08-15";
const CHECK_OUT = "2026-08-18";
const GUESTS = 4;

const SHOTS = [
  {
    file: "01-propiedad-movil.png",
    url: `${BASE}/propiedades/${SLUG}`,
    label: "Explora la propiedad",
  },
  {
    file: "02-reservar-movil.png",
    url: `${BASE}/reservar/${SLUG}?checkIn=${CHECK_IN}&checkOut=${CHECK_OUT}&huespedes=${GUESTS}`,
    label: "Completa tu reserva",
  },
  {
    file: "03-confirmacion-movil.png",
    url: `${BASE}/reserva/exito?bookingId=demo-reserva-movil`,
    label: "Confirmación",
  },
];

const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

async function capture(page, { url, file }) {
  await page.setViewport(VIEWPORT);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 60_000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(OUT_DIR, file),
    type: "png",
    fullPage: false,
  });
  console.log(`✓ ${file} ← ${url}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/local/bin/google-chrome",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  );

  for (const shot of SHOTS) {
    await capture(page, shot);
  }

  await browser.close();
  console.log(`\nCapturas guardadas en ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
