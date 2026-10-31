import { ImageResponse } from "next/og";
import { blimo, hawthorne, velo } from "@/lib/og/assets";
import { MASCOT_BODY, MASCOT_COLOURS, MASCOT_EYES, MASCOT_VIEWBOX } from "@/lib/mascot";

export const alt =
  "Jaineel Khatri, developer and cybersecurity student in Brisbane, with screenshots of Blimo, Velo and the Hawthorne Corner Store site.";
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

// The captures are real crops of the projects, kept as data URIs by scripts/make-og-assets.mjs.

// Fixed layout, in px on the 1200 x 630 card: a column of three frames on the right that runs off the top and
// bottom edges, so it reads as a glimpse of more work. Blimo, the best-finished, sits whole in the middle.
const FRAME = { x: 748, width: 380, height: 238 };
// 18 px between frames; the middle one is centred on the card (315 - 119 = 196).
const FRAME_TOPS = [-60, 196, 452];

export default async function Image() {
  const [funnelMedium, funnelExtraBold, geistMono] = await Promise.all([
    loadGoogleFont("Funnel Display", 500),
    loadGoogleFont("Funnel Display", 800),
    loadGoogleFont("Geist Mono", 500),
  ]);

  const frames = [
    { src: velo, top: FRAME_TOPS[0] },
    { src: blimo, top: FRAME_TOPS[1] },
    { src: hawthorne, top: FRAME_TOPS[2] },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: MASCOT_COLOURS.ground,
          color: "#e8eeec",
          fontFamily: "Funnel Display",
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {frames.map((f) => (
          <div
            key={f.top}
            style={{
              position: "absolute",
              left: FRAME.x,
              top: f.top,
              width: FRAME.width,
              height: FRAME.height,
              display: "flex",
              border: "1px solid rgba(232, 238, 236, 0.2)",
              background: "#141b1e",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img src={f.src} width={FRAME.width - 2} height={FRAME.height - 2} style={{ objectFit: "cover" }} />
          </div>
        ))}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 640,
            height: "100%",
            padding: "72px 0 64px 72px",
          }}
        >
          <svg width="84" height="84" viewBox={MASCOT_VIEWBOX}>
            <path fill={MASCOT_COLOURS.body} d={MASCOT_BODY} />
            {MASCOT_EYES.map((e) => (
              <ellipse key={e.cx} {...e} fill={MASCOT_COLOURS.eyes} />
            ))}
          </svg>

          <div style={{ display: "flex", flex: 1 }} />

          <div
            style={{
              display: "flex",
              fontSize: 104,
              fontWeight: 800,
              letterSpacing: "-0.045em",
              lineHeight: 0.95,
              color: "#e8eeec",
            }}
          >
            Jaineel Khatri
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 30,
              maxWidth: 560,
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: "-0.015em",
              lineHeight: 1.22,
              color: "#9fadab",
            }}
          >
            I build and ship software, with a growing focus on security.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 52,
              fontFamily: "Geist Mono",
              fontSize: 17,
              fontWeight: 500,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#9fadab",
            }}
          >
            jaineel.dev · Brisbane
          </div>
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
