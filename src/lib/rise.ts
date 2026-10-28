import type { CSSProperties } from "react";

/** Stagger for the `.rise` load-in: block 0 settles first, block 1 a beat later, and so on. */
export const rise = (order: number) => ({ "--i": order }) as CSSProperties;
