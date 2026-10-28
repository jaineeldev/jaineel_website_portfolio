"use client";

import { useEffect } from "react";

/**
 * A short opening for the home page: "JK." and a line that fills, about a second, once per session.
 * The animation is all CSS (see globals.css), so there is no state to get stuck. The effect marks the session as
 * seen, so a refresh skips it (the <head> script in layout.tsx reads that mark), and once the opening has played it
 * flags the page so coming back to the home page by link doesn't replay it.
 */
export default function Preloader() {
  useEffect(() => {
    try {
      sessionStorage.setItem("jk_preloader_seen", "1");
    } catch {}
    // Not cleared on unmount: leaving early still ends the opening for the session.
    window.setTimeout(() => document.documentElement.classList.add("jk-skip-preload"), 1500);
  }, []);

  return (
    <div aria-hidden className="jk-preloader">
      <div className="jk-preloader__inner">
        <span className="jk-preloader__mark">JK.</span>
        <span className="jk-preloader__rail">
          <span className="jk-preloader__fill" />
        </span>
      </div>
    </div>
  );
}
