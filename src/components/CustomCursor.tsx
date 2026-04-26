"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) {
      el.style.display = "none";
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.display = "none";
      return;
    }

    /* Resolve theme-aware cursor color from CSS variables. */
    const readCursorTokens = () => {
      const styles = getComputedStyle(document.documentElement);
      const rgb = styles.getPropertyValue("--cursor-rgb").trim() || "140,170,255";
      const blend = (styles.getPropertyValue("--cursor-blend").trim() || "screen") as
        | "screen"
        | "multiply"
        | "normal";
      return { rgb, blend };
    };

    let tokens = readCursorTokens();

    let mouseX = 0, mouseY = 0;
    let curX = 0, curY = 0;
    let hovering = false;
    let clicking = false;
    let curScale = 1;
    let glowOpacity = 1;
    let isIdle = false;
    let lastTarget: Element | null = null;
    let idleTimer: ReturnType<typeof setTimeout>;
    let raf: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const writeShadow = () => {
      const intensity = hovering ? 1.6 : 1;
      el.style.boxShadow = `0 0 ${12 * intensity}px rgba(${tokens.rgb}, ${0.25 * intensity}), 0 0 ${24 * intensity}px rgba(${tokens.rgb}, ${0.15 * intensity})`;
    };

    const applyTheme = () => {
      tokens = readCursorTokens();
      const bgAlpha = tokens.blend === "normal" ? 1 : 0.85;
      el.style.backgroundColor = `rgba(${tokens.rgb}, ${bgAlpha})`;
      el.style.mixBlendMode = tokens.blend;
      writeShadow();
    };
    applyTheme();

    const themeObserver = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.attributeName === "data-theme") {
          applyTheme();
          break;
        }
      }
    });
    themeObserver.observe(document.documentElement, { attributes: true });

    const resetIdle = () => {
      isIdle = false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => { isIdle = true; }, 1000);
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const target = e.target as Element | null;
      if (target !== lastTarget) {
        lastTarget = target;
        const next = !!target?.closest("a, button, [role='button'], input, textarea, select");
        if (next !== hovering) {
          hovering = next;
          writeShadow();
        }
      }
      resetIdle();
    };

    const onDown = () => { clicking = true; };
    const onUp = () => { clicking = false; };
    const onEnter = () => { el.style.opacity = "1"; };
    const onLeave = () => { el.style.opacity = "0"; };

    const tick = () => {
      curX = lerp(curX, mouseX, 0.2);
      curY = lerp(curY, mouseY, 0.2);

      const targetScale = clicking ? 0.9 : hovering ? 1.4 : 1;
      curScale = lerp(curScale, targetScale, 0.15);
      glowOpacity = lerp(glowOpacity, isIdle ? 0.4 : 1, 0.04);

      el.style.transform = `translate3d(${curX - 4}px, ${curY - 4}px, 0) scale(${curScale})`;
      el.style.opacity = `${glowOpacity}`;

      raf = requestAnimationFrame(tick);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    resetIdle();
    raf = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      themeObserver.disconnect();
      clearTimeout(idleTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="hero-cursor fixed top-0 left-0 z-9998 pointer-events-none"
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "rgba(140,170,255,0.85)",
        opacity: 0,
        mixBlendMode: "screen",
        willChange: "transform",
      }}
    />
  );
}
