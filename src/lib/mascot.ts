/** The mascot, from the Blimo app's own icon: one viewBox, the body path and the two eyes. */
export const MASCOT_VIEWBOX = "20.02 23.02 59.96 59.96";
export const MASCOT_BODY =
  "M77.62 53.7C76.98 79.12 76.48 79.56 49.35 78.87C22.21 78.19 21.74 77.72 22.38 52.3C23.02 26.88 23.52 26.44 50.65 27.13C77.79 27.81 78.26 28.28 77.62 53.7Z";
export const MASCOT_EYES = [
  { cx: 38.33, cy: 54.05, rx: 5.18, ry: 4.85 },
  { cx: 61.29, cy: 54.05, rx: 5.18, ry: 4.85 },
] as const;
export const MASCOT_COLOURS = { body: "#00d5ee", eyes: "#041518", ground: "#0d1214" } as const;
