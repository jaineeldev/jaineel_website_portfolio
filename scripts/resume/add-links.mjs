// Makes every link in the résumé look like one: blue, underlined, with a small arrow after it. That covers the project
// names and the contact details (phone, email, LinkedIn, website, GitHub). Nothing else on the page changes.
//
// The résumé is the PDF you made yourself (scripts/resume/source/Jaineel_Khatri_Resume.pdf). Its links are already
// clickable, but they look like plain text. This reads that file, finds the text under each link, recolours it, draws
// an underline and an arrow, then writes the result out. Every other word and font is left as it was, and the links
// keep their addresses.
//
// The site publishes two: the software-focused one (built by make-v2.mjs) as public/resume/Jaineel_Khatri_Resume.pdf,
// which the site's Résumé link opens, and your original, security-focused one as
// public/resume/Jaineel_Khatri_Resume_Security.pdf.
//
// The one layout change: on the centred contact lines, each item sits close to its "|" separator, so the items are
// spaced out just enough to fit their arrows and the line is re-centred. Project names have room already.
//
// Usage: node scripts/resume/add-links.mjs [source.pdf] [output.pdf]
//   With no arguments it does the security-focused résumé. For the software-focused one (after make-v2.mjs):
//   node scripts/resume/add-links.mjs scripts/resume/source/Jaineel_Khatri_Resume_v2.pdf public/resume/Jaineel_Khatri_Resume.pdf
// When your résumé changes: save the new PDF over the source file, then run make-v2.mjs and both commands again.
import { PDFDocument, PDFName, PDFDict, PDFArray, decodePDFRawStream, rgb } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = resolve(root, process.argv[2] ?? "scripts/resume/source/Jaineel_Khatri_Resume.pdf");
const OUT = resolve(root, process.argv[3] ?? "public/resume/Jaineel_Khatri_Resume_Security.pdf");

// The blue the site uses for "Complete" in light mode (#1d4ed8): clearly a link colour, and readable on white.
const BLUE = { r: 29 / 255, g: 78 / 255, b: 216 / 255 };
const BLUE_OP = `${BLUE.r.toFixed(3)} ${BLUE.g.toFixed(3)} ${BLUE.b.toFixed(3)} rg`;

/** The arrow's size and gap, relative to the text size. Its full width is what a contact item is moved over by. */
const ARROW_GAP = 0.7;
const ARROW_REACH = 0.4;

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

/** Glyph id to advance width (in 1/1000 of the font size), from a CID font's W array. */
function parseWidths(font, context) {
  const descendant = context.lookup(font.lookup(PDFName.of("DescendantFonts"), PDFArray).get(0), PDFDict);
  const fallback = descendant.lookup(PDFName.of("DW"))?.asNumber?.() ?? 1000;
  const widths = new Map();
  const w = descendant.lookup(PDFName.of("W"), PDFArray)?.asArray() ?? [];
  for (let i = 0; i < w.length; ) {
    const first = context.lookup(w[i]).asNumber();
    const next = context.lookup(w[i + 1]);
    if (next instanceof PDFArray) {
      next.asArray().forEach((n, k) => widths.set(first + k, context.lookup(n).asNumber()));
      i += 2;
    } else {
      const last = next.asNumber();
      const width = context.lookup(w[i + 2]).asNumber();
      for (let g = first; g <= last; g++) widths.set(g, width);
      i += 3;
    }
  }
  return (gid) => widths.get(gid) ?? fallback;
}

const streamText = (stream) => Buffer.from(decodePDFRawStream(stream).decode()).toString("latin1");

const doc = await PDFDocument.load(await readFile(SOURCE), { updateMetadata: false });
const context = doc.context;
const report = [];

for (const [pageIndex, page] of doc.getPages().entries()) {
  const annots = page.node.Annots();
  const linkBoxes = [];
  for (let k = 0; k < (annots?.size() ?? 0); k++) {
    const box = context.lookup(annots.get(k), PDFDict);
    if (box.lookup(PDFName.of("Subtype"))?.toString() !== "/Link") continue;
    const rect = box.lookup(PDFName.of("Rect"), PDFArray).asArray().map((n) => n.asNumber());
    const uri = box.lookup(PDFName.of("A"), PDFDict)?.lookup(PDFName.of("URI"))?.decodeText?.() ?? "";
    linkBoxes.push({ box, rect, uri });
  }
  if (!linkBoxes.length) continue;

  const fonts = page.node.Resources().lookup(PDFName.of("Font"), PDFDict);
  const cmaps = new Map();
  const widthOf = new Map();
  for (const [name, ref] of fonts.entries()) {
    const font = context.lookup(ref, PDFDict);
    const key = name.decodeText().replace(/^\//, "");
    const toUnicode = font.lookup(PDFName.of("ToUnicode"));
    if (toUnicode) cmaps.set(key, parseToUnicode(streamText(toUnicode)));
    widthOf.set(key, parseWidths(font, context));
  }

  const raw = streamText(page.node.Contents());
  const eol = raw.includes("\r\n") ? "\r\n" : "\n";
  const lines = raw.split(eol);

  // The page-wide transform, read from the leading "a 0 0 d e f cm" lines (scale and offset only), not assumed,
  // so a re-export with different numbers still works. Here it's a 0.24 flip, then a 3.125 scale: 0.75 overall.
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

  // Every piece of text drawn: which line draws it, where it starts and ends on the page, and the fill colour then.
  const runs = [];
  let colour = "0 0 0 rg";
  let font = "";
  let size = 0;
  let tm = { x: 0, y: 0, line: -1 };
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
      tm = { x: n[4], y: n[5], line: index };
      cum = { x: 0, y: 0 };
    } else {
      const m = t.match(/^(?:(-?[\d.]+) (-?[\d.]+) Td )?<([0-9A-Fa-f]+)> Tj$/);
      if (!m) return;
      cum.x += Number(m[1] ?? 0);
      cum.y += Number(m[2] ?? 0);
      const gids = (m[3].match(/.{4}/g) ?? []).map((h) => parseInt(h, 16));
      const advance = gids.reduce((sum, g) => sum + (widthOf.get(font)?.(g) ?? 0), 0) / 1000;
      const x = offsetX + scale * (tm.x + cum.x);
      runs.push({
        index,
        text: gids.map((g) => cmaps.get(font)?.get(g) ?? "�").join(""),
        x,
        end: x + scale * size * advance,
        // offsetY is already measured up from the bottom of the page, so a flipped page counts downward from it.
        baseline: flipped ? offsetY - scale * (tm.y - cum.y) : offsetY + scale * (tm.y - cum.y),
        size: size * scale,
        colour,
        tmLine: tm.line,
      });
    }
  });

  // The text under each link: the runs that start inside its box, on a baseline inside it. A box can be a little
  // wider than its words, so spaces at either end are left out; the underline stops at the last letter.
  const blank = (r) => !r.text.trim();
  const links = linkBoxes.map((link) => {
    const [x0, y0, x1, y1] = link.rect;
    const under = runs.filter((r) => r.x >= x0 - 1 && r.x < x1 && r.baseline > y0 && r.baseline < y1);
    while (under.length && blank(under[0])) under.shift();
    while (under.length && blank(under[under.length - 1])) under.pop();
    if (!under.length) throw new Error(`No text found under the link to ${link.uri}`);
    return { ...link, runs: under };
  });

  // Centred lines where each item is its own text block (the contact lines): move each item over by the arrows
  // before it, then re-centre. Items move by their Tm, so a line only qualifies if no block on it also draws text on
  // another line. A project heading is one block running into the rest of its line, so it's never pulled apart.
  const shiftOf = new Map(); // tmLine -> points to move right
  const pageLeft = Math.min(...runs.map((r) => r.x));
  const pageRight = Math.max(...runs.map((r) => r.end));
  const onRow = (r, baseline) => Math.abs(r.baseline - baseline) < 0.5;
  for (const baseline of new Set(links.map((l) => l.runs[0].baseline))) {
    const blocks = [...new Set(runs.filter((r) => onRow(r, baseline)).map((r) => r.tmLine))];
    const selfContained = blocks.every((b) => runs.filter((r) => r.tmLine === b).every((r) => onRow(r, baseline)));
    const rowLinks = links.filter((l) => onRow(l.runs[0], baseline));
    const linkBlocks = new Set(rowLinks.flatMap((l) => l.runs.map((r) => r.tmLine)));
    // Each link must be its own block, or its arrow would land on whatever follows it in that block.
    if (blocks.length < 2 || !selfContained || rowLinks.some((l) => new Set(l.runs.map((r) => r.tmLine)).size !== 1)) continue;
    if (blocks.some((b) => linkBlocks.has(b) && runs.some((r) => r.tmLine === b && !rowLinks.some((l) => l.runs.includes(r))))) continue;
    const room = (l) => ARROW_GAP + l.runs[0].size * ARROW_REACH; // the arrow's width, in points
    const total = rowLinks.reduce((sum, l) => sum + room(l), 0);
    const row = runs.filter((r) => onRow(r, baseline));
    const blockStart = (b) => Math.min(...runs.filter((r) => r.tmLine === b).map((r) => r.x));
    const blockEnd = (b) => Math.max(...runs.filter((r) => r.tmLine === b).map((r) => r.end));
    // A line that starts in from the left margin is a centred one (the contact details): every item moves, and the
    // line is re-centred. One that starts at the margin (a project heading) keeps its start and its right-aligned
    // date; only what's between the link and the date moves over, and only if it still clears the date.
    const centred = Math.min(...row.map((r) => r.x)) > pageLeft + 20;
    const pinned = centred ? [] : blocks.filter((b) => blockEnd(b) > pageRight - 1);
    const moving = blocks.filter((b) => !pinned.includes(b));
    if (!centred) {
      const limit = pinned.length ? Math.min(...pinned.map(blockStart)) - 6 : pageRight;
      if (Math.max(...moving.map(blockEnd)) + total > limit) continue;
    }
    for (const b of moving) {
      const before = rowLinks.filter((l) => l.runs[0].x < blockStart(b)).reduce((sum, l) => sum + room(l), 0);
      shiftOf.set(b, centred ? before - total / 2 : before);
    }
  }
  for (const [tmLine, dx] of shiftOf) {
    const parts = lines[tmLine].trim().split(" ");
    parts[4] = String(Number(parts[4]) + dx / scale); // Tm is in text space; only y is flipped, not x
    lines[tmLine] = parts.join(" ");
    for (const r of runs.filter((r) => r.tmLine === tmLine)) {
      r.x += dx;
      r.end += dx;
    }
  }

  const edits = [];
  const blue = rgb(BLUE.r, BLUE.g, BLUE.b);
  const marks = [];
  for (const link of links) {
    const first = link.runs[0];
    const last = link.runs[link.runs.length - 1];
    // Blue just before the link's text, and back to whatever it was after it.
    edits.push({ at: first.index, line: BLUE_OP });
    edits.push({ at: last.index + 1, line: last.colour });
    marks.push({ link, x0: first.x, x1: last.end, baseline: first.baseline, size: first.size });
    report.push(`page ${pageIndex + 1}: ${link.runs.map((r) => r.text).join("").padEnd(32)} ${link.uri}`);
  }

  // From the bottom up, so the earlier line numbers stay valid.
  for (const e of edits.sort((a, b) => b.at - a.at)) lines.splice(e.at, 0, e.line);
  page.node.set(PDFName.of("Contents"), context.register(context.flateStream(Buffer.from(lines.join(eol), "latin1"))));

  for (const { link, x0, x1, baseline, size } of marks) {
    page.drawLine({ start: { x: x0, y: baseline - 1.4 }, end: { x: x1, y: baseline - 1.4 }, thickness: 0.7, color: blue });

    // A small arrow pointing up and to the right, raised like a superscript. It is drawn as lines, so it adds no text.
    const reach = size * ARROW_REACH;
    const ax = x1 + ARROW_GAP;
    const ay = baseline + size * 0.5;
    const stroke = { thickness: 0.8, color: blue };
    page.drawLine({ start: { x: ax, y: ay }, end: { x: ax + reach, y: ay + reach }, ...stroke });
    page.drawLine({ start: { x: ax + reach * 0.15, y: ay + reach }, end: { x: ax + reach, y: ay + reach }, ...stroke });
    page.drawLine({ start: { x: ax + reach, y: ay + reach * 0.15 }, end: { x: ax + reach, y: ay + reach }, ...stroke });

    // The link box follows its text if it moved, and stretches to take in the arrow, so clicking it works too.
    const [, y0, , y1] = link.rect;
    link.box.set(PDFName.of("Rect"), context.obj([x0, y0, Math.max(x1, ax + reach + 1), y1]));
  }
}

await writeFile(OUT, await doc.save());
console.log(report.join("\n") || "No links found.");
console.log(`Wrote ${OUT}`);
