// Small card thumbnails for the home page's Work list, cut from the full captures.
// Usage: node scripts/make-thumbs.mjs   (re-run when a capture changes; commit the output in public/work/thumbs)
import sharp from "sharp";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = (name) => resolve(root, "public/work/thumbs", `${name}.webp`);

// 288x180 is more than 2x the largest size shown (128x80), so it stays sharp on high-density screens.
const W = 288;
const H = 180;

const jobs = [
  { src: "public/blimo/moods-dark.webp", name: "blimo-dark", position: "centre" },
  { src: "public/blimo/moods-light.webp", name: "blimo-light", position: "centre" },
  { src: "public/projects/velo.png", name: "velo", position: "top" },
  { src: "public/projects/hawthorne.png", name: "hawthorne", position: "top" },
  { src: "public/work/system-fingerprint-tool.png", name: "fingerprint", position: "left top" },
];

for (const { src, name, position } of jobs) {
  const info = await sharp(resolve(root, src))
    .resize(W, H, { fit: "cover", position })
    .webp({ quality: 82 })
    .toFile(out(name));
  console.log(name.padEnd(12), `${info.width}x${info.height}`, `${(info.size / 1024).toFixed(1)} KB`);
}
