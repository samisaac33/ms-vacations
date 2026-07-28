#!/usr/bin/env node
/**
 * Compone infografías ilustrativas del flujo de reserva móvil.
 * Requiere capturas base: npm run screenshots:booking
 *
 * Uso: npm run content:booking-illustrations
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SRC_DIR = path.join(process.cwd(), "public/images/booking-flow-mobile");
const OUT_DIR = path.join(process.cwd(), "public/images/content/booking-flow");

const CANVAS_W = 1080;
const CANVAS_H = 1400;
const PHONE_W = 340;
const PHONE_X = 370;
const PHONE_Y = 280;

const STEPS = [
  {
    source: "01-propiedad-movil-light.png",
    output: "paso-1-elige-alojamiento.png",
    step: "1",
    title: "Elige tu alojamiento",
    callout: "Explora fotos y toca Reservar",
    arrow: { x1: 720, y1: 980, x2: 620, y2: 1180, cx: 760, cy: 1080 },
  },
  {
    source: "02-reservar-movil-light.png",
    output: "paso-2-completa-reserva.png",
    step: "2",
    title: "Completa tu reserva",
    callout: "Revisa fechas, huéspedes y pago",
    arrow: { x1: 180, y1: 520, x2: 420, y2: 680, cx: 260, cy: 600 },
  },
  {
    source: "03-confirmacion-movil-light.png",
    output: "paso-3-confirmacion.png",
    step: "3",
    title: "Recibe confirmación",
    callout: "Confirmación y referencia al instante",
    arrow: { x1: 760, y1: 420, x2: 580, y2: 560, cx: 700, cy: 480 },
  },
];

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildOverlay({ step, title, callout, arrow }) {
  const { x1, y1, x2, y2, cx, cy } = arrow;
  return Buffer.from(`<svg width="${CANVAS_W}" height="${CANVAS_H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
      <polygon points="0 0, 10 4, 0 8" fill="#009dad"/>
    </marker>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#1a2b2b" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect width="${CANVAS_W}" height="120" fill="#009dad"/>
  <text x="540" y="52" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="#ffffff">MS Vacations</text>
  <text x="540" y="88" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" fill="#e6f7f9">Proceso de reserva en móvil</text>

  <circle cx="120" cy="200" r="44" fill="#009dad" filter="url(#shadow)"/>
  <text x="120" y="212" text-anchor="middle" font-family="system-ui, sans-serif" font-size="36" font-weight="700" fill="#ffffff">${step}</text>
  <text x="190" y="195" font-family="Georgia, serif" font-size="32" font-weight="700" fill="#1a2b2b">${escapeXml(title)}</text>
  <text x="190" y="228" font-family="system-ui, sans-serif" font-size="18" fill="#5c6b6b">Paso ${step} de 3</text>

  <rect x="${PHONE_X - 16}" y="${PHONE_Y - 16}" width="${PHONE_W + 32}" height="820" rx="48" fill="#ffffff" stroke="#efe6d8" stroke-width="4" filter="url(#shadow)"/>
  <rect x="${PHONE_X - 8}" y="${PHONE_Y - 8}" width="${PHONE_W + 16}" height="804" rx="40" fill="#faf8f4"/>

  <path d="M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}" fill="none" stroke="#009dad" stroke-width="5" marker-end="url(#arrowhead)"/>

  <rect x="${Math.min(x1, x2) - 20}" y="${Math.min(y1, y2) - 70}" width="320" height="52" rx="14" fill="#ffffff" stroke="#009dad" stroke-width="2" filter="url(#shadow)"/>
  <text x="${Math.min(x1, x2) + 140}" y="${Math.min(y1, y2) - 38}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="17" font-weight="600" fill="#0a5858">${escapeXml(callout)}</text>

  <circle cx="${x2}" cy="${y2}" r="14" fill="none" stroke="#e8a838" stroke-width="3"/>
  <circle cx="${x2}" cy="${y2}" r="6" fill="#e8a838"/>
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
  const phoneH = Math.round((PHONE_W / (meta.width ?? PHONE_W)) * (meta.height ?? PHONE_W * 2));

  const phoneImage = await sharp(sourcePath)
    .resize(PHONE_W, phoneH, { fit: "cover", position: "top" })
    .png()
    .toBuffer();

  const background = await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 3,
      background: "#faf8f4",
    },
  })
    .png()
    .toBuffer();

  const overlay = buildOverlay(stepConfig);

  const outputPath = path.join(OUT_DIR, stepConfig.output);
  await sharp(background)
    .composite([
      { input: phoneImage, top: PHONE_Y, left: PHONE_X },
      { input: overlay, top: 0, left: 0 },
    ])
    .png()
    .toFile(outputPath);

  console.log(`✓ ${stepConfig.output}`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const step of STEPS) {
    await composeStep(step);
  }
  console.log(`\nInfografías guardadas en ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
