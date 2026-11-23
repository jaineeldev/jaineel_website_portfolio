// Makes the project names in the résumé look like links: blue, underlined, with a small arrow after each. Nothing else
// on the page changes.
//
// The résumé is the PDF you made yourself (scripts/resume/source/Jaineel_Khatri_Resume.pdf). Its project names are
// already clickable, but they look like plain text. This reads that file, recolours the letters of each project name,
// draws an underline and an arrow, then writes the result to public/resume/Jaineel_Khatri_Resume.pdf. Every other
// word, font and position is left exactly as it was, and the existing links keep their addresses.
//
// Usage: node scripts/resume/add-links.mjs
// When the résumé changes: save the new PDF over the source file, then run this again.
import { PDFDocument, PDFName, PDFDict, PDFArray, decodePDFRawStream, rgb } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = resolve(root, "scripts/resume/source/Jaineel_Khatri_Resume.pdf");
const OUT = resolve(root, "public/resume/Jaineel_Khatri_Resume.pdf");

// The project names, as they start each project's heading line ("Blimo – Open-source desktop app ...").
const NAMES = ["Blimo", "Velo", "Hawthorne Corner Store", "System Fingerprint Tool", "Incident Response Team Exercise", "Cloud Security Plan"];

// The blue the site uses for "Complete" in light mode (#1d4ed8): clearly a link colour, and readable on white.
const BLUE = { r: 29 / 255, g: 78 / 255, b: 216 / 255 };
const BLUE_OP = `${BLUE.r.toFixed(3)} ${BLUE.g.toFixed(3)} ${BLUE.b.toFixed(3)} rg`;

// How this PDF maps its text space onto the page is read from the "cm" lines at the top of its content (here a 0.24
// flip, then a 3.125 scale, which combine to 0.75), not assumed, so a re-export with different numbers still works.

/** Glyph id to text, from the font's ToUnicode map. */
function parseToUnicode(text) {
  const map = new Map();
  const unit = (h) => String.fromCharCode(...(h.match(/.{4}/g) ?? []).map((u) => parseInt(u, 16)));
  for (const block of text.matchAll(/beginbfchar([\s\S]*?)endbfchar/g)) {
    for (const m of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) map.set(parseInt(m[1], 16), unit(m[2]));
  }
  for (const block of text.matchAll(/beginbfrange([\s\S]*?)endbfrange/g)) {
    for (const m of block[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      const [lo, hi, start] = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
      for (let g = lo; g <= hi; g++) map.set(g, String.fromCharCode(start + (g - lo)));
    }
  }
  return map;
}

const streamText = (stream) => Buffer.from(decodePDFRawStream(stream).decode()).toString("latin1");

const doc = await PDFDocument.load(await readFile(SOURCE), { updateMetadata: false });
const context = doc.context;
const report = [];

for (const [pageIndex, page] of doc.getPages().entries()) {
  const fonts = page.node.Resources().lookup(PDFName.of("Font"), PDFDict);
  const cmaps = new Map();
  for (const [name, ref] of fonts.entries()) {
    const toUnicode = context.lookup(ref, PDFDict).lookup(PDFName.of("ToUnicode"));
    if (toUnicode) cmaps.set(name.decodeText().replace(/^\//, ""), parseToUnicode(streamText(toUnicode)));
  }

  const raw = streamText(page.node.Contents());
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const lines = raw.split(eol);

  // The page-wide transform: multiply the leading "a 0 0 d e f cm" lines together (scale and offset only).
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0; // in the flipped space the page is drawn in
  let flipped = false;
  for (const line of lines) {
    const t = line.trim();
    if (t === "BT") break;
    const m = t.match(/^(-?[\d.]+) 0 0 (-?[\d.]+) (-?[\d.]+) (-?[\d.]+) cm$/);
    if (!m) continue;
    const [a, d, e, f] = m.slice(1).map(Number);
    if (offsetX === 0 && offsetY === 0 && scale === 1 && !flipped) {
      scale = a;
      flipped = d < 0;
      offsetX = e;
      offsetY = f;
    } else {
      // An inner transform nested inside the first: scale, then translate within it.
      offsetX += scale * e;
      offsetY += scale * f * (flipped ? -1 : 1);
      scale *= a;
    }
  }

  const glyphs = [];
  let colour = "0 0 0 rg";
  let font = "";
  let size = 0;
  let tm = { x: 0, y: 0 };
  let cum = { x: 0, y: 0 };
  lines.forEach((line, index) => {
    const t = line.trim();
    const fill = t.match(/(-?[\d.]+ -?[\d.]+ -?[\d.]+ rg)$/);
    if (fill) colour = fill[1];
    if (t === "BT") cum = { x: 0, y: 0 };
    else if (t.endsWith(" Tf")) {
      const [f, s] = t.split(" ");
      font = f.replace(/^\//, "");
      size = Number(s);
    } else if (t.endsWith(" Tm")) {
      const n = t.split(" ").map(Number);
      tm = { x: n[4], y: n[5] };
      cum = { x: 0, y: 0 };
    } else {
      const m = t.match(/^(?:(-?[\d.]+) (-?[\d.]+) Td )?<([0-9A-Fa-f]+)> Tj$/);
      if (!m) return;
      cum.x += Number(m[1] ?? 0);
      cum.y += Number(m[2] ?? 0);
      glyphs.push({
        index,
        char: cmaps.get(font)?.get(parseInt(m[3], 16)) ?? "�",
        x: offsetX + scale * (tm.x + cum.x),
        // offsetY is already measured up from the bottom of the page, so a flipped page counts downward from it.
        baseline: flipped ? offsetY - scale * (tm.y - cum.y) : offsetY + scale * (tm.y - cum.y),
        size: size * scale,
        colour,
      });
    }
  });

  // The page's text, and which glyph each character came from (a glyph can stand for zero or several characters).
  let pageText = "";
  const owner = [];
  glyphs.forEach((g, i) => {
    pageText += g.char;
    for (let k = 0; k < g.char.length; k++) owner.push(i);
  });
  const edits = [];
  const underlines = [];
  for (const name of NAMES) {
    // The heading starts the project's line: the name, a space, then a dash.
    const at = pageText.search(new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} [\\u2013\\u2014-]`));
    if (at < 0) continue;
    const indexes = [...new Set(owner.slice(at, at + name.length))];
    const run = indexes.map((i) => glyphs[i]);
    if (run.map((g) => g.char).join("") !== name) throw new Error(`Could not read "${name}" back from the page`);
    const first = run[0];
    const last = run[run.length - 1];
    const next = glyphs[indexes[indexes.length - 1] + 1];
    const width = next && next.baseline === last.baseline && next.x > last.x && next.x - last.x < 30 ? next.x - last.x : last.size * 0.5;

    // Blue before the name's first letter, and back to whatever it was after the last one.
    edits.push({ at: first.index, line: BLUE_OP });
    edits.push({ at: last.index + 1, line: last.colour });
    underlines.push({ x0: first.x, x1: last.x + width, y: first.baseline - 1.4, baseline: first.baseline, size: first.size });
    report.push(`page ${pageIndex + 1}: ${name} (x ${first.x.toFixed(1)} to ${(last.x + width).toFixed(1)}, baseline ${first.baseline.toFixed(1)})`);
  }

  if (edits.length) {
    // From the bottom up, so the earlier line numbers stay valid.
    for (const e of edits.sort((a, b) => b.at - a.at)) lines.splice(e.at, 0, e.line);
    page.node.set(PDFName.of("Contents"), context.register(context.flateStream(Buffer.from(lines.join(eol), "latin1"))));
  }
  const blue = rgb(BLUE.r, BLUE.g, BLUE.b);
  const links = page.node.Annots();
  for (const u of underlines) {
    page.drawLine({ start: { x: u.x0, y: u.y }, end: { x: u.x1, y: u.y }, thickness: 0.7, color: blue });

    // A small arrow pointing up and to the right, raised like a superscript so it sits above the space and dash
    // that follow the name and never touches your wording. It is drawn as lines, so it adds no text.
    const reach = u.size * 0.4; // how far the arrow extends each way
    const ax = u.x1 + 0.7;
    const ay = u.baseline + u.size * 0.5;
    const stroke = { thickness: 0.8, color: blue };
    page.drawLine({ start: { x: ax, y: ay }, end: { x: ax + reach, y: ay + reach }, ...stroke });
    page.drawLine({ start: { x: ax + reach * 0.15, y: ay + reach }, end: { x: ax + reach, y: ay + reach }, ...stroke });
    page.drawLine({ start: { x: ax + reach, y: ay + reach * 0.15 }, end: { x: ax + reach, y: ay + reach }, ...stroke });

    // The link box your PDF already has stretches to take in the arrow, so clicking it works too.
    for (let k = 0; k < (links?.size() ?? 0); k++) {
      const box = context.lookup(links.get(k), PDFDict);
      const rect = box.lookup(PDFName.of("Rect"), PDFArray).asArray().map((n) => n.asNumber());
      if (Math.abs(rect[0] - u.x0) < 1.5 && u.baseline > rect[1] && u.baseline < rect[3]) {
        box.set(PDFName.of("Rect"), context.obj([rect[0], rect[1], Math.max(rect[2], ax + reach + 1), rect[3]]));
      }
    }
  }
}

await writeFile(OUT, await doc.save());
console.log(report.join("\n") || "No project names found.");
console.log(`Wrote ${OUT}`);
