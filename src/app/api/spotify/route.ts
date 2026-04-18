export const dynamic = "force-dynamic";
export const revalidate = 0;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET ?? "";
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN ?? "";

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";

async function getAccessToken(): Promise<string> {
  const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: REFRESH_TOKEN,
    }),
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error("Failed to refresh Spotify access token");
  }

  return data.access_token;
}

export async function GET() {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    return Response.json({ isPlaying: false });
  }

  try {
    const accessToken = await getAccessToken();

    const res = await fetch(NOW_PLAYING_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    });

    if (res.status === 204) {
      return Response.json({ isPlaying: false });
    }

    if (!res.ok) {
      return Response.json({ isPlaying: false });
    }

    const data = await res.json();

    if (!data.item || !data.is_playing) {
      return Response.json({ isPlaying: false });
    }

    return Response.json({
      isPlaying: true,
      title: data.item.name,
      artist: data.item.artists
        .map((a: { name: string }) => a.name)
        .join(", "),
      albumArt:
        data.item.album.images?.[2]?.url ??
        data.item.album.images?.[0]?.url ??
        null,
      songUrl: data.item.external_urls?.spotify ?? null,
    });
  } catch (error) {
    console.error("Spotify now playing error:", error);
    return Response.json({ isPlaying: false });
  }
}
