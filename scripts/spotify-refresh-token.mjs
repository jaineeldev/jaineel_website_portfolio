#!/usr/bin/env node
// Gets a fresh Spotify refresh token for the "listening to" line and saves it into .env.local.
//
// Spotify's refresh tokens last 180 days, so run this again when the line stops appearing:
//
//   node scripts/spotify-refresh-token.mjs
//
// Then put the same SPOTIFY_REFRESH_TOKEN value in the host's environment settings (Vercel / Cloudflare).
// The token is written straight to .env.local and never printed. You only click "Agree" in your browser.

import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";

const ENV_FILE = ".env.local";
// One of the redirect addresses already registered on the Spotify app. Nothing needs to be listening there:
// after you agree, the browser lands on a page that doesn't load, and you paste its address back here.
const REDIRECT_URI = "http://127.0.0.1:3000/api/spotify/callback";
const SCOPE = "user-read-currently-playing";

function readEnv() {
  const text = readFileSync(ENV_FILE, "utf8");
  const get = (key) =>
    text.match(new RegExp(`^\\s*${key}\\s*=\\s*(.*?)\\s*$`, "m"))?.[1]?.replace(/^['"]|['"]$/g, "");
  return { text, id: get("SPOTIFY_CLIENT_ID"), secret: get("SPOTIFY_CLIENT_SECRET") };
}

function saveToken(text, token) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const line = `SPOTIFY_REFRESH_TOKEN=${token}`;
  const next = /^\s*SPOTIFY_REFRESH_TOKEN\s*=.*$/m.test(text)
    ? text.replace(/^\s*SPOTIFY_REFRESH_TOKEN\s*=.*$/m, line)
    : text.replace(/\s*$/, eol) + line + eol;
  writeFileSync(ENV_FILE, next);
}

const { text, id, secret } = readEnv();
if (!id || !secret) {
  console.error(`Couldn't find SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in ${ENV_FILE}. Run this from the project folder.`);
  process.exit(1);
}

const state = randomBytes(12).toString("hex");
const authorize = new URL("https://accounts.spotify.com/authorize");
authorize.search = new URLSearchParams({
  response_type: "code",
  client_id: id,
  scope: SCOPE,
  redirect_uri: REDIRECT_URI,
  state,
  show_dialog: "true",
}).toString();

console.log("\n1. Open this address in your browser and click Agree:\n");
console.log(authorize.toString());
console.log("\n2. The next page won't load, and that's expected. Copy its full address from the address bar");
console.log(`   (it starts with ${REDIRECT_URI}?code=...) and paste it here.\n`);

const rl = createInterface({ input: process.stdin, output: process.stdout });
const pasted = (await rl.question("Pasted address: ")).trim();
rl.close();

let params;
try {
  params = new URL(pasted).searchParams;
} catch {
  console.error("That doesn't look like a web address. Run the script again and paste the whole thing.");
  process.exit(1);
}
if (params.get("error")) {
  console.error(`Spotify said: ${params.get("error")}. Nothing was changed.`);
  process.exit(1);
}
if (params.get("state") !== state) {
  console.error("That address is from a different attempt. Run the script again and use the address it just gave you.");
  process.exit(1);
}
const code = params.get("code");
if (!code) {
  console.error("No code in that address. Nothing was changed.");
  process.exit(1);
}

const res = await fetch("https://accounts.spotify.com/api/token", {
  method: "POST",
  headers: {
    Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: REDIRECT_URI }),
});
const data = await res.json().catch(() => ({}));
if (!res.ok || !data.refresh_token) {
  console.error(`Spotify refused the code (HTTP ${res.status}${data.error ? `, ${data.error}` : ""}). Nothing was changed.`);
  process.exit(1);
}

saveToken(text, data.refresh_token);
console.log(`\nSaved a new SPOTIFY_REFRESH_TOKEN to ${ENV_FILE} (not shown).`);

// Prove it works: ask what's playing. 200 means something is, 204 means nothing is right now. Both are fine.
const now = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
  headers: { Authorization: `Bearer ${data.access_token}` },
});
console.log(
  `Test request: HTTP ${now.status}${now.status === 204 ? " (connected, nothing playing right now)" : now.status === 200 ? " (connected, something is playing)" : " (unexpected)"}`,
);
console.log("\nIf the line doesn't show on the site, restart `npm run dev`.");
console.log("Also copy the new SPOTIFY_REFRESH_TOKEN value into your host's environment settings.");
