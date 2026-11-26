// Builds the software-focused résumé (v2) from your main résumé PDF, keeping its look: same fonts, sizes, colours,
// rules and spacing. This file holds v2's own wording: the summary, the skills, the Projects section and the
// bartending bullets. It also tidies Education (no course codes, short-month dates), drops References, and shares
// that space out between the sections. The header and the rest of Experience and Education are your PDF's own.
//
// Usage: node scripts/resume/make-v2.mjs
//   then: node scripts/resume/add-links.mjs scripts/resume/source/Jaineel_Khatri_Resume_v2.pdf public/resume/Jaineel_Khatri_Resume.pdf
// The output is the résumé the site's Résumé link opens.
//
// Writing rules, because the PDF only carries the letters your résumé already used:
// - Body text can't use z, X, Y, Z, 8, #, &, apostrophes or quotes.
// - **Bold** can't use G, j, q, z, the digits 4 5 7 8 9, or . , - / | –. The script stops and says which letter if one slips in.
// - The page must stay one page: the script stops if the Projects section would run into Experience.
// - Skills lines must each fit on one line.
import { PDFDocument, PDFName, PDFDict, PDFArray, PDFString, decodePDFRawStream } from "pdf-lib";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = resolve(root, "scripts/resume/source/Jaineel_Khatri_Resume.pdf");
const OUT = resolve(root, "scripts/resume/source/Jaineel_Khatri_Resume_v2.pdf");

// ---------------------------------------------------------------------------------------------------------------
// v2's wording. **double asterisks** mark bold; [word](https://…) makes a link.

// Role first, then background, then one plain-language sentence each for the two live projects.
const SUMMARY =
  "Seeking a junior full-stack developer role, part-time or casual alongside a **Bachelor of IT** at **QUT** from 2027. **Cert IV in Cyber Security** graduate who builds and ships real software. Creator of **Blimo**, a free desktop pet for Windows and Mac that follows your cursor and reacts to your music. Also built and maintains the website for **Hawthorne Corner Store**, which Brisbane locals use to check opening hours, call ahead and ﬁnd the shop.";

// Course codes taken off the start of Education lines.
const DROP_PREFIXES = ["22603VIC ", "AVI30316 "];

// Dates rewritten to one format (short month and year), kept flush right.
const DATES = {
  "April 2022 – Present": "Apr 2022 – Present",
  "October 2025 – September 2026": "Oct 2025 – Sep 2026",
};

// The bartending bullets, aimed at what carries over to a developer job. One line each.
const EXPERIENCE_BULLETS = [
  "Over four years in a high-volume venue: staying calm under pressure, resolving conﬂict and handling cash accurately.",
  "Trusted with RSA and liquor licensing compliance, making quick judgement calls and refusing service when needed.",
];

// References is dropped ("available on request" is assumed); its space is shared out as this much extra room
// above each section heading below the summary.
const SECTION_GAP = 10;

// v2's skills, grouped the way full-stack job ads are, in the original's style: a bold label, then the list.
// One line each; the script stops if a line is too long. Every item is backed by a project on the page.
const SKILLS = [
  { label: "Languages:", text: "TypeScript, JavaScript, Python, SQL, Bash, C (learning)" },
  { label: "Frontend:", text: "React, Next.js, Tailwind CSS, Vite, Framer Motion, Electron" },
  { label: "Backend & data:", text: "Node.js, PostgreSQL, Supabase (auth, Postgres), REST APIs, Stripe webhooks, Upstash Redis" },
  { label: "Cloud & tooling:", text: "Git, Vercel, Cloudﬂare Workers, AWS (EC2, VPC, CloudFormation), Linux, Windows" },
  { label: "Security:", text: "Secure-by-default design, rate limiting, webhook veriﬁcation, Wireshark, Nmap, vulnerability assessment" },
];

// In page order. Technical bullets, exactly three each.
const PROJECTS = [
  {
    name: "Blimo",
    // Joined with a pipe, like the tech list. Both link to Blimo's page, which offers the right download for the
    // visitor's computer first and always has the newest version.
    description: ["Open-source desktop app for [Windows](https://jaineel.dev/blimo)", "[Mac](https://jaineel.dev/blimo)"],
    tech: "Electron, React, TypeScript",
    date: "Oct 2026 – Present",
    link: "jaineel.dev/blimo",
    bullets: [
      "Built an **Electron** app around a transparent, click-through, always-on-top window, hit-testing the cursor so clicks reach only the pet or its settings panel.",
      "Kept all OS access in the **main process** (cursor tracking 60 times a second, idle time, tray, auto-updates), exposed to the **React** UI only through a preload bridge of named **IPC** calls.",
      // GitHub's own counts: 8 releases 9 Oct to 10 Nov 2026, 65 installer downloads (some are Windows auto-updates).
      "Shipped eight releases in a month with more than 60 downloads; each face is **hashed** from its name. Designed the architecture; AI assistants helped write the code.",
    ],
  },
  {
    name: "Hawthorne Corner Store",
    description: ["Website for a local business"],
    tech: "React, Vite, Tailwind CSS",
    date: "2025 – Present",
    link: "hawthornecornerstore.com.au",
    bullets: [
      "Built with **React**, **Vite** and **Tailwind CSS** and deployed on **Vercel**, running in production since 2025.",
      "Shows open or closed status live from the opening hours, so it never needs updating by hand.",
      "Gives customers click to call, directions, Google reviews and in-store services from a fast, static single-page app.",
    ],
  },
  {
    name: "Velo",
    description: ["Client workflow platform"],
    tech: "Next.js, TypeScript, Supabase, Postgres",
    date: "2026",
    link: "project-velo.vercel.app",
    bullets: [
      "Built on Next.js, **TypeScript**, **Supabase** auth and **Postgres**, with **Stripe** Checkout, veriﬁed webhooks and Resend email.",
      "Wrapped proposal approval in a single **Postgres transaction** that creates the project, milestones and deposit invoice, with a conditional claim so double clicks never create duplicates.",
      "Secured client share links with 64-character random tokens, uniform not-found responses, no caching and **rate limiting** of 30 requests a minute per IP on **Upstash Redis**.",
    ],
  },
];

// Links in the main résumé that v2 drops, with their projects.
const DROP_LINKS = ["/work/fingerprint", "/work/irtx", "/work/cloud-security-plan"];

// ---------------------------------------------------------------------------------------------------------------
// Reading the PDF.

const doc = await PDFDocument.load(await readFile(SOURCE), { updateMetadata: false });
const page = doc.getPages()[0];
const ctx = doc.context;
const streamText = (s) => Buffer.from(decodePDFRawStream(s).decode()).toString("latin1");

const fonts = {};
for (const [name, ref] of page.node.Resources().lookup(PDFName.of("Font"), PDFDict).entries()) {
  const font = ctx.lookup(ref, PDFDict);
  const key = name.decodeText().replace(/^\//, "");
  const toUnicode = streamText(font.lookup(PDFName.of("ToUnicode")));
  const text = new Map();
  for (const b of toUnicode.matchAll(/beginbfchar([\s\S]*?)endbfchar/g))
    for (const m of b[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g))
      text.set(parseInt(m[1], 16), String.fromCharCode(...m[2].match(/.{4}/g).map((h) => parseInt(h, 16))));
  for (const b of toUnicode.matchAll(/beginbfrange([\s\S]*?)endbfrange/g))
    for (const m of b[1].matchAll(/<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>/g)) {
      const [lo, hi, start] = [1, 2, 3].map((i) => parseInt(m[i], 16));
      for (let g = lo; g <= hi; g++) text.set(g, String.fromCharCode(start + g - lo));
    }
  const descendant = ctx.lookup(font.lookup(PDFName.of("DescendantFonts"), PDFArray).get(0), PDFDict);
  const w = descendant.lookup(PDFName.of("W"), PDFArray).asArray();
  const widths = new Map();
  for (let i = 0; i < w.length; ) {
    const first = ctx.lookup(w[i]).asNumber();
    const next = ctx.lookup(w[i + 1]);
    if (next instanceof PDFArray) {
      next.asArray().forEach((n, k) => widths.set(first + k, ctx.lookup(n).asNumber()));
      i += 2;
    } else {
      for (let g = first; g <= next.asNumber(); g++) widths.set(g, ctx.lookup(w[i + 2]).asNumber());
      i += 3;
    }
  }
  const glyphOf = new Map([...text].filter(([, s]) => s.length === 1).map(([g, s]) => [s, g]));
  fonts[key] = { text, widths, glyphOf };
}

const raw = streamText(page.node.Contents());
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
const L = raw.split(/\r?\n/).map((l) => l.trim());

const REGULAR = "F5";
const BOLD = "F4";
const SIZE = 13.3299999;
const COLUMN = 681; // the text column's width, from the section rules

const fontBefore = (i) => { for (let j = i; j >= 0; j--) if (L[j].endsWith(" Tf")) return L[j].split(" ")[0].replace("/", ""); };
const colourBefore = (i) => { for (let j = i; j >= 0; j--) if (L[j].endsWith(" rg")) return L[j]; return "0 0 0 RG 0 0 0 rg"; };
const bdcBefore = (i) => { for (let j = i; j >= 0; j--) if (L[j].endsWith("BDC")) return j; };
function blockText(tm) {
  let s = "";
  let f = fontBefore(tm);
  for (let i = tm; L[i] !== "ET"; i++) {
    if (L[i].endsWith(" Tf")) f = L[i].split(" ")[0].replace("/", "");
    const m = L[i].match(/<([0-9A-Fa-f]+)> Tj$/);
    if (m) s += m[1].match(/.{4}/g).map((h) => fonts[f].text.get(parseInt(h, 16))).join("");
  }
  return s;
}
/** Every text block on the page: where its Tm line is, its position, text and fill colour. Re-run after editing L. */
const scan = () => L.flatMap((l, i) => {
  const m = l.match(/^1 0 0 -1 (-?[\d.]+) (-?[\d.]+) Tm$/);
  return m ? [{ tm: i, x: +m[1], y: +m[2], text: blockText(i), colour: colourBefore(i) }] : [];
});
const blocks = scan();
const find = (pred, what) => { const b = blocks.find(pred); if (!b) throw new Error(`Could not find ${what} in the résumé`); return b; };
const startsWith = (s) => find((b) => b.text.startsWith(s), `"${s}"`);
const endOfBlock = (b) => L.indexOf("ET", b.tm);

// ---------------------------------------------------------------------------------------------------------------
// Laying out text.

/** "**bold**, [link](url) and plain" -> [{text, font, href?}] */
const parse = (s) =>
  s.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/).filter(Boolean).map((p) => {
    if (p.startsWith("**")) return { text: p.slice(2, -2), font: BOLD };
    const link = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    return link ? { text: link[1], font: REGULAR, href: link[2] } : { text: p, font: REGULAR };
  });
// add-links.mjs draws an arrow after each link and moves what follows over by its width; leave that room.
const ARROW_ROOM = 6.5;
function glyph(font, ch, where) {
  const g = fonts[font].glyphOf.get(ch);
  if (g == null) throw new Error(`The ${font === BOLD ? "bold" : "regular"} font has no "${ch}" (in "${where}")`);
  return g;
}
const advance = (font, g) => (fonts[font].widths.get(g) * SIZE) / 1000;
const width = (segments) => segments.reduce((t, s) => t + [...s.text].reduce((u, ch) => u + advance(s.font, glyph(s.font, ch, s.text)), 0), 0);

/** Splits segments into lines no wider than `max`, breaking at spaces. */
function wrap(segments, max) {
  const words = []; // each word is a list of segments; spaces between words are regular
  let current = [];
  for (const s of segments) {
    s.text.split(/( )/).forEach((part) => {
      if (part === " ") { if (current.length) words.push(current); current = []; }
      else if (part) current.push({ text: part, font: s.font, href: s.href });
    });
  }
  if (current.length) words.push(current);
  const lines = [];
  let line = [];
  const needs = (segments) => width(segments) + segments.filter((s) => s.href).length * ARROW_ROOM;
  for (const word of words) {
    const candidate = line.length ? [...line, { text: " ", font: REGULAR }, ...word] : word;
    if (line.length && needs(candidate) > max) { lines.push(line); line = word; }
    else line = candidate;
  }
  if (line.length) lines.push(line);
  return lines;
}

/** One text object drawing segments from x on baseline y. Fonts and colours switch inside it. */
function textObject(x, y, segments) {
  const out = ["BT"];
  let font = null;
  let colour = null;
  let previous = null;
  out.push(`1 0 0 -1 ${+x.toFixed(5)} ${+y.toFixed(5)} Tm`);
  for (const s of segments) {
    for (const ch of s.text) {
      const g = glyph(s.font, ch, s.text);
      if (s.colour && s.colour !== colour) { out.push(s.colour); colour = s.colour; }
      if (s.font !== font) { out.push(`/${s.font} ${SIZE} Tf`); font = s.font; }
      const hex = `<${g.toString(16).toUpperCase().padStart(4, "0")}> Tj`;
      out.push(previous ? `${+previous.toFixed(7)} 0 Td ${hex}` : hex);
      previous = advance(s.font, g);
    }
  }
  // Tm has to follow the first Tf: move it after it.
  const tf = out.findIndex((l) => l.endsWith(" Tf"));
  const [tm] = out.splice(1, 1);
  out.splice(tf, 0, tm);
  out.push("ET");
  return out;
}
/**
 * Draws a line of segments from x, giving each linked word its own text object (so add-links.mjs can make room for
 * its arrow) and recording where it landed in `linkBoxes`. Returns the content lines.
 */
const linkBoxes = [];
function drawLine(x, y, segments) {
  const pieces = [];
  for (const s of segments) {
    if (s.href || !pieces.length || pieces.at(-1)[0].href) pieces.push([s]);
    else pieces.at(-1).push(s);
  }
  const out = [];
  for (const piece of pieces) {
    out.push(...textObject(x, y, piece));
    const w = width(piece);
    if (piece[0].href) linkBoxes.push({ href: piece[0].href, x, w, y });
    x += w;
  }
  return out;
}
const shiftY = (lines, dy) => lines.map((l) => {
  let m = l.match(/^1 0 0 -1 (-?[\d.]+) (-?[\d.]+) Tm$/);
  if (m) return `1 0 0 -1 ${m[1]} ${+(+m[2] + dy).toFixed(5)} Tm`;
  m = l.match(/^(-?[\d.]+) (-?[\d.]+) (-?[\d.]+) (-?[\d.]+) re$/);
  if (m) return `${m[1]} ${+(+m[2] + dy).toFixed(5)} ${m[3]} ${m[4]} re`;
  return l.replace(/^(.*) (m|l|c)$/, (all, nums, op) => nums.split(" ").map((n, k) => (k % 2 ? +(+n + dy).toFixed(5) : n)).join(" ") + " " + op);
});

// ---------------------------------------------------------------------------------------------------------------
// Measurements and styles taken from the main résumé.

const summaryLines = blocks.filter((b) => b.x === 0 && b.y > startsWith("SUMMARY").y && b.y < startsWith("TECHNICAL SKILLS").y);
const summaryColour = summaryLines[0].colour;

const skillLabel = startsWith("Web & tooling:");
const skillText = find((b) => b.y === skillLabel.y && b.x > 0, "the last skills line");
const skillPitch = skillLabel.y - startsWith("Programming:").y;

const projectsHeading = startsWith("PROJECTS");
const blimo = find((b) => b.text === "Blimo" && b.x === 0, "Blimo's heading");
const headingBlocks = blocks.filter((b) => b.y === blimo.y);
const style = {
  name: blimo.colour,
  description: headingBlocks.find((b) => b.text.startsWith(" –")).colour,
  pipe: headingBlocks.find((b) => b.text === "|").colour,
  tech: headingBlocks.find((b) => b.text.startsWith("Electron")).colour,
  date: headingBlocks.at(-1).colour,
};
const dateRight = (() => { const d = headingBlocks.at(-1); return d.x + width([{ text: d.text, font: REGULAR }]); })();
// The thin underline your PDF draws under each project name, and its colour.
const underlineAt = L.findIndex((l, i) => i < blimo.tm && i > projectsHeading.tm && / re$/.test(l));
const underlineColour = colourBefore(underlineAt);
const underlineOffset = +L[underlineAt].split(" ")[1] - blimo.y;

// The bullet: a small circle path, its colour, and where the text starts.
const firstDot = L.findIndex((l, i) => i > blimo.tm && l.startsWith("/Lbl"));
const dotEnd = L.indexOf("f", firstDot);
const dotPath = L.slice(firstDot + 1, dotEnd + 1);
const dotColour = colourBefore(firstDot);
const firstBulletText = blocks.find((b) => b.tm > firstDot);
const bulletX = firstBulletText.x;
const bulletColour = firstBulletText.colour;
const dotOffset = +dotPath[0].split(" ")[1] - firstBulletText.y; // the circle sits this far from its line's baseline

const LINE = firstBulletText.y - blimo.y; // 18: heading to first line, and line to line
const BETWEEN = find((b) => b.text === "Velo", "Velo's heading").y - blocks.filter((b) => b.x === bulletX && b.tm < find((b) => b.text === "Velo", "Velo").tm).at(-1).y; // 23
const experience = startsWith("EXPERIENCE");
const lastLineBefore = blocks.filter((b) => b.x === bulletX && b.y < experience.y).at(-1).y; // the section's last line in the main résumé

// ---------------------------------------------------------------------------------------------------------------
// 0. Education: take the course codes off, and slide the rest of each line left to close the gap.

const rightEdge = (b) => b.x + width([{ text: b.text, font: REGULAR }]);
// Bottom of the page first, so removing lines doesn't move the ones still to do.
for (const b of DROP_PREFIXES.map((prefix) => ({ ...startsWith(prefix), prefix })).sort((a, c) => c.tm - a.tm)) {
  const { prefix } = b;
  const lines = [];
  for (let i = b.tm + 1; L[i] !== "ET"; i++) lines.push(i);
  // Count glyph lines until they spell the prefix (a ligature glyph can stand for two letters).
  let spelled = "";
  let k = 0;
  const f = fontBefore(b.tm);
  while (spelled.length < prefix.length) spelled += fonts[f].text.get(parseInt(L[lines[k++]].match(/<([0-9A-Fa-f]{4})> Tj$/)[1], 16));
  if (spelled !== prefix) throw new Error(`"${prefix}" didn't match the start of "${b.text}"`);
  const firstKept = L[lines[k]].match(/^(-?[\d.]+) 0 Td (<[0-9A-Fa-f]{4}> Tj)$/);
  const removed = lines.slice(1, k + 1).reduce((t, i) => t + +L[i].split(" ")[0], 0); // how far the first kept letter was from the start
  L[lines[k]] = firstKept[2];
  L.splice(lines[0], k);
  // Everything after it on the line moves left, except a date pinned to the right edge.
  for (const other of blocks.filter((o) => o.y === b.y && o.x > b.x && rightEdge(o) < dateRight - 1)) {
    const at = L.findIndex((l) => l === `1 0 0 -1 ${other.x} ${other.y} Tm`);
    L[at] = `1 0 0 -1 ${+(other.x - removed).toFixed(5)} ${other.y} Tm`;
  }
}

// 1. Summary: new wording; if it needs more lines than before, the sections under it move down to match.
const SUMMARY_PITCH = 17.5;
const summaryWrapped = wrap(parse(SUMMARY), COLUMN);
const summaryY = (i) => (i < summaryLines.length ? summaryLines[i].y : summaryLines.at(-1).y + (i - summaryLines.length + 1) * SUMMARY_PITCH);
const summaryShift = summaryY(summaryWrapped.length - 1) - summaryLines.at(-1).y;
console.log(`Summary: ${summaryWrapped.length} lines (was ${summaryLines.length}), so the sections below move ${summaryShift} down.`);
const summaryStart = bdcBefore(summaryLines[0].tm);
const out = summaryWrapped.flatMap((line, i) => textObject(0, summaryY(i), line.map((s) => ({ ...s, colour: summaryColour }))));

// 2. Skills: the heading moves down with the summary; the lines are v2's own, in the original's style. More or
// fewer lines than the original's moves everything from PROJECTS down by that many lines.
const skillsHeading = startsWith("TECHNICAL SKILLS");
const headingStart = bdcBefore(skillsHeading.tm);
const headingLines = L.slice(headingStart, L.indexOf("EMC", endOfBlock(skillsHeading)) + 1);
if (headingLines.some((l) => /^(q|Q)$/.test(l) || l.endsWith(" cm"))) throw new Error("The skills heading changes the graphics state; it can't be moved safely");
const skillsShift = summaryShift + SECTION_GAP;
out.push(colourBefore(headingStart), ...shiftY(headingLines, skillsShift));
const originalRows = blocks.filter((b) => b.x === 0 && b.y > skillsHeading.y && b.y < projectsHeading.y);
SKILLS.forEach(({ label, text }, i) => {
  const segments = [
    { text: label, font: BOLD, colour: skillLabel.colour },
    { text: ` ${text}`, font: REGULAR, colour: skillText.colour },
  ];
  if (width(segments) > COLUMN) throw new Error(`The skills line "${label}" is too long for one line`);
  out.push(...textObject(0, originalRows[0].y + i * skillPitch + skillsShift, segments));
});
const shift = skillsShift + (SKILLS.length - originalRows.length) * skillPitch + SECTION_GAP;

// 3. Projects.
const regionEnd = bdcBefore(experience.tm) - 1;
const projectsStart = bdcBefore(projectsHeading.tm);
out.push(colourBefore(projectsStart), ...shiftY(L.slice(projectsStart, L.indexOf("EMC", endOfBlock(projectsHeading)) + 1), shift));
let y = blimo.y + shift;
const placed = {};
PROJECTS.forEach((project, p) => {
  if (p > 0) y += BETWEEN;
  if (project.bullets.length !== 3) throw new Error(`${project.name} needs exactly three bullets`);
  const nameWidth = width([{ text: project.name, font: BOLD }]);
  out.push(underlineColour, `0 ${+(y + underlineOffset).toFixed(5)} ${+nameWidth.toFixed(5)} 1 re`, "f");
  const pipe = { text: "|", font: REGULAR, colour: style.pipe };
  // Each part can carry [links](…); parts after the first are separated by a pipe.
  const description = project.description.flatMap((part, k) => [
    ...(k ? [pipe] : []),
    ...parse(`${k ? " " : " – "}${part} `).map((s) => ({ ...s, colour: style.description })),
  ]);
  // The name is its own text object (its link is the PDF's own), so add-links.mjs can move the rest over for its arrow.
  out.push(...textObject(0, y, [{ text: project.name, font: BOLD, colour: style.name }]));
  out.push(...drawLine(nameWidth, y, [...description, pipe, { text: ` ${project.tech}`, font: REGULAR, colour: style.tech }]));
  const dateWidth = width([{ text: project.date, font: REGULAR }]);
  out.push(...textObject(dateRight - dateWidth, y, [{ text: project.date, font: REGULAR, colour: style.date }]));
  placed[project.link] = { y, nameWidth };
  for (const bullet of project.bullets) {
    const lines = wrap(parse(bullet), COLUMN - bulletX - 2);
    const lastWidth = width(lines.at(-1));
    console.log(`  ${project.name}: ${lines.length} line(s), last line ${Math.round((lastWidth / (COLUMN - bulletX)) * 100)}% full | ${bullet.slice(0, 50)}…`);
    lines.forEach((line, k) => {
      y += LINE;
      if (k === 0) out.push(dotColour, ...shiftY(dotPath, y + dotOffset - +dotPath[0].split(" ")[1]));
      out.push(...drawLine(bulletX, y, line.map((s) => ({ ...s, colour: bulletColour }))));
    });
  }
});
// Leave the state as it was where the section ended.
let fill = "", gs = "";
for (let i = 0; i <= regionEnd; i++) { if (L[i].endsWith(" rg")) fill = L[i]; if (L[i].endsWith(" gs")) gs = L[i]; }
out.push(fill, gs);

// ---------------------------------------------------------------------------------------------------------------
// 4. Below Projects: Experience and Education keep their content (with tidier dates and new bartending bullets),
// move down by the extra section gaps, and References goes. These edits all sit after the stretch replaced in step 5,
// so they can't disturb its line numbers; each one rescans, since the edits before it change line numbers below.

/** Replaces a whole text block with new segments drawn from x (BT through ET). */
function replaceBlock(b, x, segments) {
  let bt = b.tm; while (L[bt] !== "BT") bt--;
  L.splice(bt, endOfBlock(b) - bt + 1, ...textObject(x, b.y, segments));
}
const education = startsWith("EDUCATION");
const references = startsWith("REFERENCES");
const below = () => scan().filter((b) => b.y > experience.y && b.y < references.y);
// Dates, bottom first.
for (const [from, to] of Object.entries(DATES)) {
  const b = below().find((d) => d.text === from);
  if (!b) throw new Error(`Could not find the date "${from}"`);
  replaceBlock(b, rightEdge(b) - width([{ text: to, font: REGULAR }]), [{ text: to, font: REGULAR, colour: b.colour }]);
}
// Bartending bullets: the bullet lines between EXPERIENCE and EDUCATION, last first.
const jobLines = below().filter((b) => b.x === bulletX && b.y < education.y);
if (jobLines.length !== EXPERIENCE_BULLETS.length) throw new Error(`Experience has ${jobLines.length} bullet lines; EXPERIENCE_BULLETS has ${EXPERIENCE_BULLETS.length}`);
EXPERIENCE_BULLETS.map((text, i) => [text, jobLines[i]]).reverse().forEach(([text, b]) => {
  const segments = parse(text).map((s) => ({ ...s, colour: b.colour }));
  if (width(segments) > COLUMN - bulletX - 2) throw new Error(`The Experience bullet "${text.slice(0, 40)}…" is too long for one line`);
  replaceBlock(b, bulletX, segments);
});
// References: its heading and its line.
const refs = scan().filter((b) => b.y >= references.y);
const refsStart = bdcBefore(refs[0].tm);
const removedRefs = L.splice(refsStart, L.indexOf("EMC", endOfBlock(refs.at(-1))) - refsStart + 1);
// The page's closing graphics-state restores (Q) sit inside that last block; keep them, or anything drawn after the
// page's content (add-links.mjs's underlines and arrows) would inherit its scaling and land in the wrong place.
L.splice(refsStart, 0, ...removedRefs.filter((l) => l === "q" || l === "Q"));
// Move Experience and Education down. Projects may also run a little past where they used to end.
// `y` already includes the gaps above Projects; Experience adds its own.
const experienceShift = Math.max(0, y - lastLineBefore) + SECTION_GAP;
const educationShift = experienceShift + SECTION_GAP;
const now = scan();
const expStart = bdcBefore(now.find((b) => b.text === "EXPERIENCE").tm);
const eduStart = bdcBefore(now.find((b) => b.text === "EDUCATION").tm);
const lastLine = now.filter((b) => b.y > education.y).at(-1);
const eduEnd = L.indexOf("EMC", endOfBlock(lastLine));
for (const [from, to, dy] of [[eduStart, eduEnd, educationShift], [expStart, eduStart - 1, experienceShift]]) {
  const lines = L.slice(from, to + 1);
  if (lines.some((l) => /^(q|Q)$/.test(l) || l.endsWith(" cm"))) throw new Error("Experience or Education changes the graphics state; it can't be moved safely");
  L.splice(from, to - from + 1, ...shiftY(lines, dy));
}
const bottom = lastLine.y + educationShift;
console.log(`Projects end at ${y}; the page's last line is now at ${bottom} (References used to end at ${references.y + 28}).`);
if (bottom > references.y + 28) throw new Error(`The page runs ${bottom - references.y - 28} too long: trim a line so it stays one page`);

// 5. Summary through Projects is one stretch of the page, replaced in one go.
L.splice(summaryStart, regionEnd - summaryStart + 1, ...out);
// The rules under each section heading are drawn at the top of the page's content; move them with their headings,
// and drop the one under References.
const ruleAt = (heading) => L.findIndex((l) => { const m = l.match(new RegExp(`^0 (-?[\\d.]+) ${COLUMN} 1 re$`)); return m && +m[1] > heading.y && +m[1] < heading.y + 12; });
for (const [heading, dy] of [[skillsHeading, skillsShift], [projectsHeading, shift], [experience, experienceShift], [education, educationShift]]) {
  const at = ruleAt(heading);
  if (at < 0) throw new Error(`Could not find the rule under ${heading.text}`);
  L[at] = `0 ${+(+L[at].split(" ")[1] + dy).toFixed(5)} ${COLUMN} 1 re`;
}
const refRule = ruleAt(references);
if (refRule < 0 || L[refRule + 1] !== "f") throw new Error("Could not find the rule under REFERENCES");
L.splice(refRule, 2);
page.node.set(PDFName.of("Contents"), ctx.register(ctx.flateStream(Buffer.from(L.join(eol), "latin1"))));

// Links: drop the removed projects', and put each kept project's link on its name's new position.
// The page draws text at 0.75 scale from (42.75, 808.17), counting y downward.
const toPageX = (x) => 42.75 + 0.75 * x;
const toPageY = (y) => 808.17 - 0.75 * y;
const annots = page.node.Annots();
const kept = [];
for (let k = 0; k < annots.size(); k++) {
  const ref = annots.get(k);
  const a = ctx.lookup(ref, PDFDict);
  const uri = a.lookup(PDFName.of("A"), PDFDict)?.lookup(PDFName.of("URI"))?.decodeText?.() ?? "";
  if (DROP_LINKS.some((d) => uri.endsWith(d))) continue;
  const key = Object.keys(placed).find((link) => uri.includes(link));
  if (key) {
    const { y: baseline, nameWidth } = placed[key];
    a.set(PDFName.of("Rect"), ctx.obj([toPageX(0), toPageY(baseline) - 3, toPageX(nameWidth), toPageY(baseline) + 9.8]));
  }
  kept.push(ref);
}
// New links for linked words, built like the PDF's own (no border, a URI action).
for (const { href, x, w, y: baseline } of linkBoxes) {
  kept.push(ctx.register(ctx.obj({
    Type: "Annot",
    Subtype: "Link",
    // Ends just short of the word's last edge, so punctuation right after it isn't taken as part of the link.
    Rect: [toPageX(x), toPageY(baseline) - 3, toPageX(x + w) - 0.5, toPageY(baseline) + 9.8],
    Border: [0, 0, 0],
    A: { Type: "Action", S: "URI", URI: PDFString.of(href) },
  })));
}
page.node.set(PDFName.of("Annots"), ctx.obj(kept));

await writeFile(OUT, await doc.save());
console.log(`Wrote ${OUT}`);
