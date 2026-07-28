#!/usr/bin/env node
/**
 * Compone capturas reales del flujo de reserva con anotaciones (flechas + callouts).
 * Requiere capturas base light en public/images/booking-flow-mobile/
 *
 * Uso: npm run content:booking-illustrations
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";

const SRC_DIR = path.join(process.cwd(), "public/images/booking-flow-mobile");
const OUT_DIR = path.join(process.cwd(), "public/images/content/booking-flow");

const SCREENSHOT_W = 900;
const MARGIN_X = 220;

const STEPS = [
  {
    source: "01-propiedad-movil-light.png",
    output: "paso-1-elige-alojamiento.png",
    step: "1",
    callout: "Toca Reservar con tus fechas",
    /** Punto en la captura (0–1) donde apunta la flecha */
    target: { x: 0.78, y: 0.92 },
    /** Origen del callout relativo al canvas extendido */
    calloutSide: "right",
  },
  {
    source: "02-reservar-movil-light.png",
    output: "paso-2-completa-reserva.png",
    step: "2",
    callout: "Revisa fechas, huéspedes y pago",
    target: { x: 0.5, y: 0.38 },
    calloutSide: "left",
  },
  {
    source: "03-confirmacion-movil-light.png",
    output: "paso-3-confirmacion.png",
    step: "3",
    callout: "Confirmación y referencia al instante",
    target: { x: 0.5, y: 0.32 },
    calloutSide: "right",
  },
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAnnotationSvg({ canvasW, canvasH, screenshotW, screenshotH, screenshotX, step, callout, target, calloutSide }) {
  const tx = screenshotX + target.x * screenshotW;
  const ty = target.y * screenshotH;

  const calloutW = 200;
  const calloutH = 44;
  let calloutX;
  let calloutY = ty - calloutH / 2;

  if (calloutSide === "right") {
    calloutX = screenshotX + screenshotW + 24;
  } else {
    calloutX = screenshotX - calloutW - 24;
  }

  calloutY = Math.max(16, Math.min(canvasH - calloutH - 16, calloutY));

  const calloutCx = calloutSide === "right" ? calloutX : calloutX + calloutW;
  const calloutCy = calloutY + calloutH / 2;

  const cx = (calloutCx + tx) / 2;
  const cy = calloutCy < ty ? (calloutCy + ty) / 2 - 30 : (calloutCy + ty) / 2 + 30;

  return Buffer.from(`<svg width="${canvasW}" height="${canvasH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
      <polygon points="0 0, 10 4, 0 8" fill="#009dad"/>
    </marker>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#1a2b2b" flood-opacity="0.18"/>
    </filter>
  </defs>

  <rect x="12" y="12" width="72" height="36" rx="18" fill="#009dad" filter="url(#shadow)"/>
  <text x="48" y="36" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="700" fill="#ffffff">Paso ${step}</text>

  <rect x="${calloutX}" y="${calloutY}" width="${calloutW}" height="${calloutH}" rx="12" fill="#ffffff" stroke="#009dad" stroke-width="2.5" filter="url(#shadow)"/>
  <text x="${calloutX + calloutW / 2}" y="${calloutY + calloutH / 2 + 6}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="#0a5858">${escapeXml(callout)}</text>

  <path d="M ${calloutCx} ${calloutCy} Q ${cx} ${cy} ${tx} ${ty}" fill="none" stroke="#009dad" stroke-width="4" marker-end="url(#arrowhead)"/>

  <circle cx="${tx}" cy="${ty}" r="16" fill="none" stroke="#e8a838" stroke-width="3" opacity="0.95"/>
  <circle cx="${tx}" cy="${ty}" r="7" fill="#e8a838"/>
</svg>`);
}

async function composeStep(stepConfig) {
  const sourcePath = path.join(SRC_DIR, stepConfig.source);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(
      `Falta ${stepConfig.source}. Ejecuta: npm run dev && npm run screenshots:booking`,
    );
  }

  const meta = await sharp(sourcePath).metadata();
  const srcW = meta.width ?? 780;
  const srcH = meta.height ?? 1688;
  const screenshotH = Math.round((SCREENSHOT_W / srcW) * srcH);

  const screenshot = await sharp(sourcePath)
    .resize(SCREENSHOT_W, screenshotH, { fit: "fill" })
    .png()
    .toBuffer();

  const screenshotX = MARGIN_X;
  const canvasW = SCREENSHOT_W + MARGIN_X * 2;
  const canvasH = screenshotH + 32;

  const background = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 3,
      background: "#faf8f4",
    },
  })
    .png()
    .toBuffer();

  const annotations = buildAnnotationSvg({
    canvasW,
    canvasH,
    screenshotW: SCREENSHOT_W,
    screenshotH,
    screenshotX,
    step: stepConfig.step,
    callout: stepConfig.callout,
    target: stepConfig.target,
    calloutSide: stepConfig.calloutSide,
  });

  const outputPath = path.join(OUT_DIR, stepConfig.output);
  await sharp(background)
    .composite([
      { input: screenshot, top: 16, left: screenshotX },
      { input: annotations, top: 0, left: 0 },
    ])
    .png()
    .toFile(outputPath);

  console.log(`✓ ${stepConfig.output}`);
}

function ensureBaseScreenshots() {
  const missing = STEPS.filter((s) => !fs.existsSync(path.join(SRC_DIR, s.source)));
  if (missing.length === 0) return;

  console.log("Capturas base no encontradas, ejecutando screenshots:booking…");
  const result = spawnSync("node", ["scripts/capture-booking-screenshots.mjs"], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error("No se pudieron generar las capturas base. ¿Está corriendo npm run dev?");
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  ensureBaseScreenshots();

  for (const step of STEPS) {
    await composeStep(step);
  }
  console.log(`\nCapturas anotadas guardadas en ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
