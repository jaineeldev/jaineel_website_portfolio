import { ImageResponse } from "next/og";
import { MASCOT_BODY, MASCOT_COLOURS, MASCOT_EYES, MASCOT_VIEWBOX } from "@/lib/mascot";

export const alt =
  "Jaineel Khatri — developer and cybersecurity student in Brisbane. Open to entry-level IT roles, including security and fullstack.";
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
          <svg width="132" height="132" viewBox={MASCOT_VIEWBOX}>
            <path fill={MASCOT_COLOURS.body} d={MASCOT_BODY} />
            {MASCOT_EYES.map((e) => (
              <ellipse key={e.cx} {...e} fill={MASCOT_COLOURS.eyes} />
            ))}
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
          <span style={{ display: "flex" }}>Brisbane · Open to entry-level IT roles</span>
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
