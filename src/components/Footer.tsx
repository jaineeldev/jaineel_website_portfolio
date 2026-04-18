"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import Logo from "./Logo";

const LINKS = [
  { label: "GitHub", href: "https://github.com/jaineeldev" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jaineel-khatri/" },
  { label: "Email", href: "mailto:jaineelk.dev@gmail.com" },
];

export default function Footer() {
  const [footerLine, setFooterLine] = useState("Built with intention.");
  useEffect(() => {
    if (Math.random() < 0.1) setFooterLine("Built with purpose.");
  }, []);
  const footerRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const mouse = useRef({ x: 50, y: 50, inside: false });
  const current = useRef({ x: 50, y: 50 });

  const lerp = useCallback((a: number, b: number, t: number) => a + (b - a) * t, []);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 100;
      mouse.current.y = ((e.clientY - rect.top) / rect.height) * 100;
      mouse.current.inside = true;
    };
    const onLeave = () => { mouse.current.inside = false; };

    const tick = () => {
      const c = current.current;
      const m = mouse.current;
      c.x = lerp(c.x, m.inside ? m.x : 50, 0.05);
      c.y = lerp(c.y, m.inside ? m.y : 50, 0.05);
      if (glowRef.current) {
        const op = m.inside ? 0.11 : 0;
        glowRef.current.style.background =
          `radial-gradient(500px circle at ${c.x}% ${c.y}%, rgba(37,99,235,${op}) 0%, transparent 60%)`;
      }
      raf.current = requestAnimationFrame(tick);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(tick);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [lerp]);

  return (
    <footer ref={footerRef} className="relative mt-12 bg-bg">
      {/* Divider — same container width */}
      <div className="max-w-5xl mx-auto px-6">
        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(37,99,235,0.07) 30%, rgba(255,255,255,0.12) 50%, rgba(37,99,235,0.07) 70%, transparent 95%)",
          }}
        />
      </div>

      {/* Cursor glow */}
      <div ref={glowRef} className="absolute inset-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-7">
        <div className="relative flex items-center justify-between max-md:flex-col max-md:gap-4">
          {/* Left — monogram */}
          <div className="flex items-center group max-md:order-1 cursor-default text-white/45 group-hover:text-white/75 transition-colors duration-300">
            <Logo size={13} />
          </div>

          {/* Center — absolute positioned for true optical centering */}
          <p className="absolute left-1/2 -translate-x-1/2 text-[11px] font-mono tracking-[0.18em] text-white/30 whitespace-nowrap max-md:static max-md:translate-x-0 max-md:order-3">
            {footerLine}
          </p>

          {/* Right — links */}
          <div className="flex items-center gap-3 md:gap-5 max-md:order-2">
            {LINKS.map((link, i) => (
              <span key={link.label} className="flex items-center gap-5">
                {i > 0 && (
                  <span className="text-white/10 text-[9px]">&middot;</span>
                )}
                <a
                  href={link.href}
                  target={link.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={link.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  className="group relative text-[11px] tracking-[0.06em] text-white/32 hover:text-white/65 transition-all duration-300 hover:-translate-y-px"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-white/20 transition-all duration-300 ease-out" />
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
