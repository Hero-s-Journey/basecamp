#!/usr/bin/env node
/**
 * Scans hexagon PNGs in public/photos/ and computes the normalized (0..1)
 * center of the visible (non-transparent) content. The result is written to
 * src/data/hex-anchors.json so the React layout can pin overlays (Hero Score,
 * pills) precisely to the actual hex center — independent of the PNG canvas.
 *
 * Run automatically before `vite dev` and `vite build` via package.json hooks.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PHOTOS_DIR = path.join(ROOT, "public", "photos");
const OUT_DIR = path.join(ROOT, "src", "data");
const OUT_FILE = path.join(OUT_DIR, "hex-anchors.json");

/** PNG files to analyze. Add more here if needed. */
const TARGETS = ["hex_big.png", "hex_small.png", "hex_front.png", "man.png"];

/** Alpha threshold (0..255) for "visible" pixel detection. */
const ALPHA_THRESHOLD = 16;

function analyze(filepath) {
  const buf = fs.readFileSync(filepath);
  const png = PNG.sync.read(buf);
  const { width, height, data } = png;

  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  let any = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4 + 3; // alpha channel
      const a = data[idx];
      if (a > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        any = true;
      }
    }
  }

  if (!any) {
    return { width, height, centerX: 0.5, centerY: 0.5, bbox: null };
  }

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  return {
    width,
    height,
    centerX: +(cx / width).toFixed(5),  // 0..1
    centerY: +(cy / height).toFixed(5), // 0..1
    bbox: {
      minX: +(minX / width).toFixed(5),
      maxX: +(maxX / width).toFixed(5),
      minY: +(minY / height).toFixed(5),
      maxY: +(maxY / height).toFixed(5),
    },
  };
}

function main() {
  if (!fs.existsSync(PHOTOS_DIR)) {
    console.error(`[analyze-hex] photos dir not found: ${PHOTOS_DIR}`);
    process.exit(1);
  }

  /** @type {Record<string, ReturnType<typeof analyze>>} */
  const out = {};
  for (const name of TARGETS) {
    const filepath = path.join(PHOTOS_DIR, name);
    if (!fs.existsSync(filepath)) {
      console.warn(`[analyze-hex] skip (missing): ${name}`);
      continue;
    }
    out[name.replace(/\.png$/i, "")] = analyze(filepath);
    const r = out[name.replace(/\.png$/i, "")];
    console.log(
      `[analyze-hex] ${name}: ${r.width}x${r.height}, center=(${r.centerX}, ${r.centerY})`,
    );
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2) + "\n");
  console.log(`[analyze-hex] wrote ${path.relative(ROOT, OUT_FILE)}`);
}

main();
