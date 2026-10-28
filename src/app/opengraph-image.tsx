import { ImageResponse } from "next/og";

export const alt =
  "Jaineel Khatri — developer and cybersecurity student in Brisbane. Open to junior security and fullstack roles.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// No User-Agent on purpose: Google then answers with one complete TrueType file, which is what the
// image renderer reads. A browser's User-Agent gets split subsets (and WOFF2), so the first file found
// lacks the Latin letters and the text falls back to a default font.
async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\) format\('truetype'\)/);
  if (!match) throw new Error(`Font not found: ${family} ${weight}`);
  return await (await fetch(match[1])).arrayBuffer();
}

// The mascot, from the Blimo app's own icon.
const BODY =
  "M77.62 53.7C76.98 79.12 76.48 79.56 49.35 78.87C22.21 78.19 21.74 77.72 22.38 52.3C23.02 26.88 23.52 26.44 50.65 27.13C77.79 27.81 78.26 28.28 77.62 53.7Z";

export default async function Image() {
  const [funnelMedium, funnelExtraBold, geistMono] = await Promise.all([
    loadGoogleFont("Funnel Display", 500),
    loadGoogleFont("Funnel Display", 800),
    loadGoogleFont("Geist Mono", 500),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d1214",
          color: "#e8eeec",
          fontFamily: "Funnel Display",
          padding: "72px 88px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "center" }}>
          <svg width="132" height="132" viewBox="20.02 23.02 59.96 59.96">
            <path fill="#00d5ee" d={BODY} />
            <ellipse cx="38.33" cy="54.05" rx="5.18" ry="4.85" fill="#041518" />
            <ellipse cx="61.29" cy="54.05" rx="5.18" ry="4.85" fill="#041518" />
          </svg>

          <div
            style={{
              display: "flex",
              marginTop: 44,
              fontFamily: "Funnel Display",
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              color: "#e8eeec",
            }}
          >
            Jaineel Khatri
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontFamily: "Funnel Display",
              fontSize: 40,
              fontWeight: 500,
              letterSpacing: "-0.018em",
              color: "#9fadab",
            }}
          >
            Student · Developer · Cybersecurity
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            width: "100%",
            fontFamily: "Geist Mono",
            fontSize: 17,
            fontWeight: 500,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#9fadab",
          }}
        >
          <span style={{ display: "flex" }}>jaineel.dev</span>
          <span style={{ display: "flex" }}>Brisbane · Open to junior security and fullstack roles</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Funnel Display", data: funnelMedium, weight: 500, style: "normal" },
        { name: "Funnel Display", data: funnelExtraBold, weight: 800, style: "normal" },
        { name: "Geist Mono", data: geistMono, weight: 500, style: "normal" },
      ],
    },
  );
}
