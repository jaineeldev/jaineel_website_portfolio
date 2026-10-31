import { ImageResponse } from "next/og";
import { createElement } from "react";
import { MASCOT_BODY, MASCOT_COLOURS, MASCOT_EYES, MASCOT_VIEWBOX } from "@/lib/mascot";

// Crawlers and older browsers still ask for /favicon.ico. Browsers read the image by its bytes, so a PNG is fine.
export function GET() {
  const mascot = createElement(
    "svg",
    { width: 28, height: 28, viewBox: MASCOT_VIEWBOX },
    createElement("path", { fill: MASCOT_COLOURS.body, d: MASCOT_BODY }),
    ...MASCOT_EYES.map((e) => createElement("ellipse", { key: e.cx, ...e, fill: MASCOT_COLOURS.eyes })),
  );
  return new ImageResponse(
    createElement(
      "div",
      {
        style: {
          width: "100%",
          height: "100%",
          background: MASCOT_COLOURS.ground,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      mascot,
    ),
    { width: 32, height: 32 },
  );
}
