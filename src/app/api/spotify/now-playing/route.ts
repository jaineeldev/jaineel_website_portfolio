import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT = "https://api.spotify.com/v1/me/player/currently-playing";

/** Every visitor's tab polls every 30s; one answer is shared for this long, so traffic doesn't multiply Spotify calls. */
const RESULT_TTL_MS = 15_000;
/** Refresh the access token this long before Spotify says it expires. */
const TOKEN_MARGIN_MS = 60_000;

type TokenResponse = { access_token?: string; expires_in?: number };
type Artist = { name: string };
type Track = { name: string; artists: Artist[] };
type NowPlayingResponse = { is_playing?: boolean; item?: Track | null };

type Result = { isPlaying: true; title: string; artist: string } | { isPlaying: false; reason: string };

// Module state lives as long as the worker isolate, which on Cloudflare serves many requests in a row.
let cachedToken: { token: string; expiresAt: number } | null = null;
let cachedResult: { result: Result; at: number } | null = null;
let inFlight: Promise<Result> | null = null;

/** What the Cloudflare runtime itself exposes: secrets and variables set on the worker, by name. */
function workerEnv(): Record<string, unknown> {
  try {
    return getCloudflareContext().env as unknown as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** process.env first (local dev, and hosts that fill it), then the worker bindings Cloudflare passes in. */
function readEnv(name: string, env: Record<string, unknown>): string | undefined {
  const value = process.env[name] ?? env[name];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** A token, or a short reason label. Details for debugging go to the server log only, never into the response. */
async function getAccessToken(): Promise<{ token: string } | { reason: string }> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return { token: cachedToken.token };

  const env = workerEnv();
  const id = readEnv("SPOTIFY_CLIENT_ID", env);
  const secret = readEnv("SPOTIFY_CLIENT_SECRET", env);
  const refresh = readEnv("SPOTIFY_REFRESH_TOKEN", env);
  if (!id || !secret || !refresh) {
    const missing = [!id && "SPOTIFY_CLIENT_ID", !secret && "SPOTIFY_CLIENT_SECRET", !refresh && "SPOTIFY_REFRESH_TOKEN"]
      .filter(Boolean)
      .join(", ");
    // Names only, never values, and only in the log: tells a typo or the wrong worker apart from nothing set.
    console.warn(`Spotify is not configured: missing ${missing}. Worker sees: ${Object.keys(env).sort().join(", ") || "nothing"}.`);
    return { reason: "not-configured" };
  }

  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refresh }),
    cache: "no-store",
  });
  if (!res.ok) {
    // Say so in the server log, so a revoked or expired token (they last 180 days) isn't mistaken for silence.
    console.warn(`Spotify token request failed (HTTP ${res.status}). Run scripts/spotify-refresh-token.mjs for a new one.`);
    return { reason: "token-rejected" };
  }
  const data = (await res.json()) as TokenResponse;
  if (!data.access_token) return { reason: "no-access-token" };

  const lifetimeMs = (data.expires_in ?? 3600) * 1000;
  cachedToken = { token: data.access_token, expiresAt: Date.now() + Math.max(lifetimeMs - TOKEN_MARGIN_MS, 0) };
  return { token: data.access_token };
}

async function fetchNowPlaying(): Promise<Result> {
  const access = await getAccessToken();
  if (!("token" in access)) return { isPlaying: false, reason: access.reason };

  const res = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${access.token}` },
    cache: "no-store",
  });

  if (res.status === 204) return { isPlaying: false, reason: "nothing-playing" };
  if (res.status === 401) cachedToken = null; // Revoked early: get a new one next time.
  if (res.status >= 400) {
    console.warn(`Spotify currently-playing request failed (HTTP ${res.status}).`);
    return { isPlaying: false, reason: "api-error" };
  }

  const data = (await res.json()) as NowPlayingResponse;
  const item = data.item;
  if (!data.is_playing || !item) return { isPlaying: false, reason: "paused" };
  return { isPlaying: true, title: item.name, artist: item.artists.map((a) => a.name).join(", ") };
}

/** The cached answer while it's fresh; otherwise one shared request, however many visitors ask at once. */
async function nowPlaying(): Promise<Result> {
  if (cachedResult && Date.now() - cachedResult.at < RESULT_TTL_MS) return cachedResult.result;
  inFlight ??= fetchNowPlaying()
    .catch((err): Result => {
      console.warn("Spotify request threw:", err);
      return { isPlaying: false, reason: "unreachable" };
    })
    .then((result) => {
      cachedResult = { result, at: Date.now() };
      return result;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export async function GET() {
  return NextResponse.json(await nowPlaying(), {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
