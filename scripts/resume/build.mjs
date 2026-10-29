// Renders scripts/resume/resume.html to public/resume/Jaineel_Khatri_Resume.pdf with headless Edge or Chrome.
// Usage: node scripts/resume/build.mjs
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = resolve(here, "resume.html");
const output = resolve(here, "../../public/resume/Jaineel_Khatri_Resume.pdf");

const browsers = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
];
const browser = browsers.find(existsSync);
if (!browser) throw new Error("No Edge or Chrome found; edit the paths in build.mjs.");

execFileSync(browser, [
  "--headless=new",
  "--disable-gpu",
  "--no-pdf-header-footer",
  `--print-to-pdf=${output}`,
  pathToFileURL(source).href,
]);
console.log(`Wrote ${output}`);
