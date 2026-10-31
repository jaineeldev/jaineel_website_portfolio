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

type Token = { token: string } | { reason: string; missing?: string[] };

/** The reason is a short label, never a secret, so the response says why the line is hidden. */
async function getAccessToken(): Promise<Token> {
  const id = process.env.SPOTIFY_CLIENT_ID;
  const secret = process.env.SPOTIFY_CLIENT_SECRET;
  const refresh = process.env.SPOTIFY_REFRESH_TOKEN;
  const missing = [
    !id && "SPOTIFY_CLIENT_ID",
    !secret && "SPOTIFY_CLIENT_SECRET",
    !refresh && "SPOTIFY_REFRESH_TOKEN",
  ].filter(Boolean);
  if (!id || !secret || !refresh) {
    console.warn(`Spotify is not configured: missing ${missing.join(", ")}.`);
    return { reason: "not-configured", missing: missing as string[] };
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

const idle = (reason: string, missing?: string[]) =>
  NextResponse.json({ isPlaying: false, reason, ...(missing ? { missing } : {}) }, { status: 200 });

export async function GET() {
  const access = await getAccessToken();
  if (!("token" in access)) return idle(access.reason, access.missing);

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
