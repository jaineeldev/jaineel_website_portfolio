import { ImageResponse } from "next/og";
import { MASCOT_BODY, MASCOT_COLOURS, MASCOT_EYES, MASCOT_VIEWBOX } from "@/lib/mascot";

// The home-screen icon iOS asks for. Square, with the mascot centred on the site's dark ground.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: MASCOT_COLOURS.ground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="118" height="118" viewBox={MASCOT_VIEWBOX}>
          <path fill={MASCOT_COLOURS.body} d={MASCOT_BODY} />
          {MASCOT_EYES.map((e) => (
            <ellipse key={e.cx} {...e} fill={MASCOT_COLOURS.eyes} />
          ))}
        </svg>
      </div>
    ),
    size,
  );
}
