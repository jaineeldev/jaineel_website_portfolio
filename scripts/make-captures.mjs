// WebP copies of the full-size project captures, for the project pages.
// Usage: node scripts/make-captures.mjs   (re-run when a capture changes; commit the .webp files next to the .png)
//
// The site runs on Cloudflare without Next's image optimizer (images.unoptimized in next.config.ts), so whatever
// file the page names is what the visitor downloads. The PNGs stay as the sources, and make-thumbs.mjs reads them.
import sharp from "sharp";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// Shown at most 680px wide, so 1360px covers high-density screens; smaller captures keep their own size.
const MAX_WIDTH = 1360;

const captures = ["public/projects/velo.png", "public/projects/hawthorne.png", "public/work/system-fingerprint-tool.png"];

for (const src of captures) {
  const out = src.replace(/\.png$/, ".webp");
  const info = await sharp(resolve(root, src))
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(resolve(root, out));
  console.log(out.padEnd(42), `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(1)} KB`);
}
