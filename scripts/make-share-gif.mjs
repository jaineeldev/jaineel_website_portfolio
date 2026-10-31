// An animated version of the share card: the left side holds still while the column of real captures slides up one
// slot at a time, so it cycles through Blimo, Velo, Hawthorne and the Fingerprint Tool. It starts on the same frame
// as the still card (src/app/opengraph-image.tsx), so anything that only shows a first frame shows that card.
// Usage: node scripts/make-share-gif.mjs   Output: public/share/jaineel-card.gif
import { createElement as h } from "react";
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/dist/compiled/@vercel/og/index.node.js";
import { captures, renderCapture, toDataUri } from "./lib/captures.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = resolve(root, "public/share/jaineel-card.gif");

// Same numbers as the still card.
const SIZE = { width: 1200, height: 630 };
const FRAME = { x: 748, width: 380, height: 238 };
const STEP = 256; // one slot: a 238 px frame and an 18 px gap
const MIDDLE_TOP = 196; // the focused frame is centred on the card
const GROUND = "#0d1214";
const MASCOT = {
  viewBox: "20.02 23.02 59.96 59.96",
  body: "M77.62 53.7C76.98 79.12 76.48 79.56 49.35 78.87C22.21 78.19 21.74 77.72 22.38 52.3C23.02 26.88 23.52 26.44 50.65 27.13C77.79 27.81 78.26 28.28 77.62 53.7Z",
  eyes: [
    { cx: 38.33, cy: 54.05, rx: 5.18, ry: 4.85 },
    { cx: 61.29, cy: 54.05, rx: 5.18, ry: 4.85 },
  ],
  bodyColour: "#00d5ee",
  eyeColour: "#041518",
};

// Timing: each project holds, then the column slides up one slot in a few quick, eased frames.
const HOLD_MS = 2400;
const SLIDE_FRAMES = 7;
const SLIDE_MS = 45;
const ease = (x) => 1 - Math.pow(1 - x, 3);

async function loadGoogleFont(family, weight) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\) format\('truetype'\)/);
  if (!match) throw new Error(`Font not found: ${family} ${weight}`);
  return await (await fetch(match[1])).arrayBuffer();
}

const [funnelMedium, funnelExtraBold, geistMono] = await Promise.all([
  loadGoogleFont("Funnel Display", 500),
  loadGoogleFont("Funnel Display", 800),
  loadGoogleFont("Geist Mono", 500),
]);
const fonts = [
  { name: "Funnel Display", data: funnelMedium, weight: 500, style: "normal" },
  { name: "Funnel Display", data: funnelExtraBold, weight: 800, style: "normal" },
  { name: "Geist Mono", data: geistMono, weight: 500, style: "normal" },
];

// Order matters: the first frame has Velo above, Blimo in the middle and Hawthorne below, like the still card.
const order = ["velo", "blimo", "hawthorne", "fingerprint"];
const uris = {};
for (const capture of captures) uris[capture.name] = toDataUri(await renderCapture(capture));

const text = (style, children) => h("div", { style: { display: "flex", ...style } }, children);

/** One frame of the card with the column scrolled `step` slots plus `slide` px (0 to STEP). */
function card(step, slide) {
  const frames = [-1, 0, 1, 2, 3].map((j) => {
    const name = order[(((step + j) % order.length) + order.length) % order.length];
    return h(
      "div",
      {
        key: j,
        style: {
          position: "absolute",
          left: FRAME.x,
          top: MIDDLE_TOP + (j - 1) * STEP - slide,
          width: FRAME.width,
          height: FRAME.height,
          display: "flex",
          border: "1px solid rgba(232, 238, 236, 0.2)",
          background: "#141b1e",
        },
      },
      h("img", { src: uris[name], width: FRAME.width - 2, height: FRAME.height - 2, style: { objectFit: "cover" } }),
    );
  });

  const mascot = h(
    "svg",
    { width: 84, height: 84, viewBox: MASCOT.viewBox },
    h("path", { fill: MASCOT.bodyColour, d: MASCOT.body }),
    ...MASCOT.eyes.map((e) => h("ellipse", { key: e.cx, ...e, fill: MASCOT.eyeColour })),
  );

  const left = h(
    "div",
    { style: { display: "flex", flexDirection: "column", width: 676, height: "100%", padding: "72px 0 64px 72px" } },
    mascot,
    text({ flex: 1 }),
    text(
      { fontSize: 104, fontWeight: 800, letterSpacing: "-0.045em", lineHeight: 0.95, color: "#e8eeec" },
      "Jaineel Khatri",
    ),
    text(
      { marginTop: 32, fontSize: 36, fontWeight: 500, letterSpacing: "-0.015em", lineHeight: 1.2, whiteSpace: "nowrap", color: "#9fadab" },
      "Student · Developer · Cybersecurity",
    ),
    text(
      { marginTop: 52, fontFamily: "Geist Mono", fontSize: 17, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9fadab" },
      "jaineel.dev · Brisbane",
    ),
  );

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        background: GROUND,
        color: "#e8eeec",
        fontFamily: "Funnel Display",
        display: "flex",
        position: "relative",
        overflow: "hidden",
      },
    },
    ...frames,
    left,
  );
}

const pngs = [];
const delays = [];
for (let step = 0; step < order.length; step++) {
  const slides = [{ slide: 0, delay: HOLD_MS }];
  for (let k = 1; k <= SLIDE_FRAMES; k++) slides.push({ slide: Math.round(ease(k / (SLIDE_FRAMES + 1)) * STEP), delay: SLIDE_MS });
  for (const { slide, delay } of slides) {
    const response = new ImageResponse(card(step, slide), { ...SIZE, fonts });
    pngs.push(Buffer.from(await response.arrayBuffer()));
    delays.push(delay);
  }
  process.stdout.write(`step ${step + 1}/${order.length}\r`);
}

const gif = await sharp(pngs, { join: { animated: true } })
  .gif({ delay: delays, loop: 0, colours: 256, effort: 7, dither: 0 })
  .toBuffer();
await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, gif);
console.log(`\nWrote ${OUT}: ${pngs.length} frames, ${(gif.length / 1024 / 1024).toFixed(2)} MB`);
