#!/usr/bin/env node
/**
 * Captura pantallas móviles del flujo de reserva (modo claro y oscuro).
 *
 * Requisitos:
 *   - Servidor local: npm run dev (por defecto http://localhost:3000)
 *   - Para el paso 2 con precios: DATABASE_URL + npm run db:push && npm run db:seed
 *   - Chrome/Chromium: CHROME_PATH (default /usr/local/bin/google-chrome)
 *
 * Uso: npm run screenshots:booking
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer-core";

const THEME_STORAGE_KEY = "ms-vacations-theme";
const BASE = process.env.SCREENSHOT_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public/images/booking-flow-mobile");
const SLUG = "villa-palmera";
const CHECK_IN = "2026-08-15";
const CHECK_OUT = "2026-08-18";
const GUESTS = 4;
const DEMO_BOOKING_ID = "demo-reserva-movil";

const SHOTS = [
  {
    base: "01-propiedad-movil",
    url: `${BASE}/propiedades/${SLUG}?checkIn=${CHECK_IN}&checkOut=${CHECK_OUT}&huespedes=${GUESTS}`,
    waitForText: "Reservar",
  },
  {
    base: "02-reservar-movil",
    url: `${BASE}/reservar/${SLUG}?checkIn=${CHECK_IN}&checkOut=${CHECK_OUT}&huespedes=${GUESTS}`,
    waitForText: "Revisa y continúa",
  },
  {
    base: "03-confirmacion-movil",
    url: `${BASE}/reserva/exito?bookingId=${DEMO_BOOKING_ID}`,
    waitForText: "Reserva confirmada",
  },
];

const THEMES = ["light", "dark"];

const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";

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

async function waitForText(page, text) {
  await page.waitForFunction(
    (needle) => document.body?.innerText.includes(needle),
    { timeout: 45_000 },
    text,
  );
}

async function capture(page, { url, file, theme, waitForText: needle }) {
  await page.setViewport(VIEWPORT);
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
  await waitForText(page, needle);
  await page.evaluate((value) => {
    document.documentElement.classList.toggle("dark", value === "dark");
  }, theme);
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((r) => setTimeout(r, 1200));
  await page.screenshot({
    path: path.join(OUT_DIR, file),
    type: "png",
    fullPage: false,
  });
  console.log(`✓ ${file} ← ${url} (${theme})`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  for (const theme of THEMES) {
    const page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    await page.evaluateOnNewDocument(
      (key, value) => {
        localStorage.setItem(key, value);
      },
      THEME_STORAGE_KEY,
      theme,
    );

    for (const shot of SHOTS) {
      const file = `${shot.base}-${theme}.png`;
      await capture(page, { ...shot, file, theme });
    }

    await page.close();
  }

  await browser.close();
  console.log(`\nCapturas guardadas en ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
