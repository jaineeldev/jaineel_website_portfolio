import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";

type TokenResponse = { access_token?: string };
type Artist = { name: string };
type Track = { name: string; artists: Artist[] };
type NowPlayingResponse = { is_playing?: boolean; item?: Track | null };

type Token = { token: string } | { reason: string; missing?: string[]; seen?: string[] };

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

/** The reason is a short label, never a secret, so the response says why the line is hidden. */
async function getAccessToken(): Promise<Token> {
  const env = workerEnv();
  const id = readEnv("SPOTIFY_CLIENT_ID", env);
  const secret = readEnv("SPOTIFY_CLIENT_SECRET", env);
  const refresh = readEnv("SPOTIFY_REFRESH_TOKEN", env);
  const missing = [
    !id && "SPOTIFY_CLIENT_ID",
    !secret && "SPOTIFY_CLIENT_SECRET",
    !refresh && "SPOTIFY_REFRESH_TOKEN",
  ].filter(Boolean);
  if (!id || !secret || !refresh) {
    console.warn(`Spotify is not configured: missing ${missing.join(", ")}.`);
    // Names only, never values: what the worker can see, to tell a typo or the wrong worker from nothing set.
    return { reason: "not-configured", missing: missing as string[], seen: Object.keys(env).sort() };
  }

  const basic = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    // Say so in the server log, so a revoked or expired token (they last 180 days) isn't mistaken for silence.
    console.warn(`Spotify token request failed (HTTP ${res.status}). Run scripts/spotify-refresh-token.mjs for a new one.`);
    return { reason: `token-rejected-${res.status}` };
  }
  const data = (await res.json()) as TokenResponse;
  return data.access_token ? { token: data.access_token } : { reason: "no-access-token" };
}

const idle = (reason: string, extra: { missing?: string[]; seen?: string[] } = {}) =>
  NextResponse.json({ isPlaying: false, reason, ...extra }, { status: 200 });

export async function GET() {
  const access = await getAccessToken();
  if (!("token" in access)) return idle(access.reason, { missing: access.missing, seen: access.seen });

  const res = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: { Authorization: `Bearer ${access.token}` },
    cache: "no-store",
  });

  if (res.status === 204) return idle("nothing-playing");
  if (res.status >= 400) {
    console.warn(`Spotify currently-playing request failed (HTTP ${res.status}).`);
    return idle(`api-error-${res.status}`);
  }

  const data = (await res.json()) as NowPlayingResponse;
  const item = data.item;
  if (!data.is_playing || !item) return idle("paused");

  return NextResponse.json(
    {
      isPlaying: true,
      title: item.name,
      artist: item.artists.map((a) => a.name).join(", "),
    },
    {
      status: 200,
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
