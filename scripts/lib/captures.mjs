// The real captures, cropped to the frame size the share card draws them at (2x). Shared by
// make-og-assets.mjs (the still card) and make-share-gif.mjs (the animated one).
import sharp from "sharp";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const W = 760;
export const H = 475;

export const captures = [
  // The whole mood grid, not a crop: scaled to the frame width and centred on the capture's own background.
  { src: "public/blimo/moods-dark.webp", name: "blimo", fitWhole: true, png: true },
  { src: "public/projects/velo.png", name: "velo", position: "top" },
  { src: "public/projects/hawthorne.png", name: "hawthorne", position: "top" },
  { src: "public/work/system-fingerprint-tool.png", name: "fingerprint", position: "left top" },
];

async function wholeOnItsBackground(file) {
  // Sample the capture's corner so the padding above and below matches it exactly.
  const { data } = await sharp(file).extract({ left: 2, top: 2, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true });
  const scaled = await sharp(file).resize(W).toBuffer();
  return sharp({ create: { width: W, height: H, channels: 3, background: { r: data[0], g: data[1], b: data[2] } } }).composite([
    { input: scaled, gravity: "centre" },
  ]);
}

/** One capture as bytes plus its mime type. */
export async function renderCapture({ src, position, png, fitWhole }) {
  const file = resolve(root, src);
  const image = fitWhole ? await wholeOnItsBackground(file) : sharp(file).resize(W, H, { fit: "cover", position });
  const bytes = png
    ? await image.png({ palette: true, quality: 90 }).toBuffer()
    : await image.jpeg({ quality: 84, mozjpeg: true }).toBuffer();
  return { bytes, mime: png ? "image/png" : "image/jpeg" };
}

export const toDataUri = ({ bytes, mime }) => `data:${mime};base64,${bytes.toString("base64")}`;
