"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

/* ── Project data ── */
type TerminalLine = {
  prefix: ">" | "[+]" | "[!]" | "[-]" | "[*]";
  text: string;
};

type Project = {
  title: string;
  description: string;
  features?: string[];
  stack: string[];
  liveUrl: string | null;
  liveLabel?: string;
  liveDisabled?: boolean;
  githubUrl: string | null;
  accentColor: string;
  variant: "ui" | "terminal";
  terminalLabel?: string;
  terminalLines?: TerminalLine[];
  uiLabel?: string;
  uiKind?: "website" | "mascot";
  wip?: boolean;
  collab?: boolean;
};

const PROJECTS: Project[] = [
  {
    title: "Portfolio v2",
    description:
      "A personal portfolio built from scratch to showcase my work, progression, and range as a developer. Designed around clean structure, subtle motion, and a strong visual identity \u2014 with every detail intentional and every interaction refined.",
    features: [
      "Polished entrance flow with a custom preloader and staggered section reveals. Scroll-driven transitions, cursor-reactive depth, and cohesive motion language throughout \u2014 built to feel fast, premium, and alive.",
    ],
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    liveUrl: "https://jaineel.dev",
    liveLabel: "You\u2019re already here",
    liveDisabled: true,
    githubUrl: "https://github.com/jaineeldev/jaineel_website_portfolio",
    accentColor: "37,99,235",
    variant: "ui",
    uiLabel: "jaineel.dev",
  },
  {
    title: "Hawthorne Corner Store",
    description:
      "A clean, modern website built for a local convenience store to improve visibility, accessibility, and customer trust. Designed to clearly present store information, services, and location while maintaining a simple and reliable user experience.",
    features: [
      "Focused on real-world usability \u2014 including clear opening hours, location access, and mobile-friendly layout. Built to feel fast, familiar, and easy to navigate for everyday users.",
    ],
    stack: ["React", "Vite", "Tailwind CSS"],
    liveUrl: "https://www.hawthornecornerstore.com.au/",
    githubUrl: "https://github.com/jaineeldev/hcs_2.0",
    accentColor: "20,184,166",
    variant: "ui",
    uiLabel: "hawthornecornerstore.com.au",
  },
  {
    title: "System Fingerprint Tool",
    description:
      "Python-based system reconnaissance tool that collects host fingerprint data and performs full-range port scanning using concurrent execution. Designed to simulate real-world enumeration workflows in cybersecurity.",
    features: [
      "Full port scan (1\u201365535)",
      "Host fingerprinting",
      "Multi-threading",
      "CSV output",
      "GUI with live status",
    ],
    stack: ["Python", "Networking", "Threading", "Port Scanning", "System Analysis"],
    liveUrl: null,
    githubUrl: "https://github.com/jaineeldev/system-fingerprint-tool",
    accentColor: "99,102,241",
    variant: "terminal",
    terminalLabel: "recon",
    terminalLines: [
      { prefix: ">", text: "scanning ports..." },
      { prefix: "[+]", text: "port 22 open" },
      { prefix: "[+]", text: "port 80 open" },
      { prefix: "[+]", text: "fingerprint collected" },
    ],
  },
  {
    title: "Network Intrusion Detection System – Machine Learning (NIDS-ML)",
    description:
      "An ML-powered network intrusion detection system that captures live traffic and flags malicious connections in real time. Built collaboratively — I lead the security and networking side (packet capture, traffic handling, threat framing) while a friend drives the machine learning pipeline.",
    features: [
      "Live packet capture with Scapy",
      "NSL-KDD trained classifier",
      "Real-time threat prediction",
      "Flask dashboard with auto-refresh",
      "Modular capture, training, and inference pipeline",
    ],
    stack: ["Python", "Scikit-learn", "Scapy", "Flask", "Pandas", "NumPy"],
    liveUrl: null,
    githubUrl: "https://github.com/jaineeldev/nids-ml",
    accentColor: "16,185,129",
    variant: "terminal",
    terminalLabel: "nids · live",
    terminalLines: [
      { prefix: ">", text: "capturing flows..." },
      { prefix: "[*]", text: "1,284 packets" },
      { prefix: "[+]", text: "predict: normal · 0.97" },
      { prefix: "[!]", text: "anomaly: 192.168.1.42" },
    ],
    wip: true,
    collab: true,
  },
  {
    title: "DesktopBuddy",
    description:
      "An animated desktop mascot for Windows that reflects how your machine is feeling. The buddy reacts to CPU, RAM, and temperature in real time \u2014 shifting moods, surfacing stats, and adding a small bit of personality to the desktop.",
    features: [
      "State-driven mascot (idle, happy, sleepy, stressed)",
      "Native C module for live CPU, RAM, and temperature",
      "Interactive speech bubbles and stat HUD",
      "System tray integration with persistent settings",
      "Customizable name, scale, and opacity",
    ],
    stack: ["Electron", "React", "TypeScript", "Framer Motion", "Tailwind CSS", "C"],
    liveUrl: null,
    githubUrl: "https://github.com/jaineeldev/desktop_buddy",
    accentColor: "236,72,153",
    variant: "ui",
    uiLabel: "buddy · phase 0",
    uiKind: "mascot",
    wip: true,
  },
];

/* ── Shared easing ── */
const ease = [0.16, 1, 0.3, 1] as const;

/* ── Tech pill ── */
function TechPill({ name }: { name: string }) {
  return (
    <span
      className="px-3.5 py-1.5 rounded-full border border-fg/10 bg-fg/4 text-[11px] font-medium tracking-wide text-fg/55"
      style={{ boxShadow: "inset 0 1px 0 rgba(var(--fg-rgb),0.03)" }}
    >
      {name}
    </span>
  );
}

/* ── Single project block with mouse tracking ── */
function ProjectBlock({
  project,
  index,
}: {
  project: (typeof PROJECTS)[number];
  index: number;
}) {
  const isEven = index % 2 === 0;
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const mouse = useRef({ x: 0.5, y: 0.5, inside: false });
  const current = useRef({ gx: 50, gy: 50 });

  const lerp = useCallback((a: number, b: number, t: number) => a + (b - a) * t, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      mouse.current.x = (e.clientX - rect.left) / rect.width;
      mouse.current.y = (e.clientY - rect.top) / rect.height;
      mouse.current.inside = true;
    };

    const onLeave = () => {
      mouse.current.inside = false;
    };

    const tick = () => {
      const c = current.current;
      const m = mouse.current;

      const targetGx = m.inside ? m.x * 100 : 50;
      const targetGy = m.inside ? m.y * 100 : 50;

      c.gx = lerp(c.gx, targetGx, 0.1);
      c.gy = lerp(c.gy, targetGy, 0.1);

      if (glowRef.current) {
        glowRef.current.style.background =
          `radial-gradient(600px circle at ${c.gx}% ${c.gy}%, rgba(${project.accentColor},${m.inside ? 0.11 : 0}) 0%, transparent 60%)`;
      }

      raf.current = requestAnimationFrame(tick);
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    raf.current = requestAnimationFrame(tick);

    return () => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(raf.current);
    };
  }, [lerp, project.accentColor]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease }}
    >
      <div
        ref={cardRef}
        className="group relative rounded-2xl border overflow-hidden"
        style={{
          borderColor: "rgba(var(--fg-rgb),0.09)",
          background:
            "linear-gradient(135deg, rgba(var(--fg-rgb),0.04) 0%, rgba(var(--fg-rgb),0.018) 100%)",
          boxShadow:
            "0 4px 50px rgba(var(--shadow-rgb),0.28), 0 0 40px rgba(37,99,235,0.035), inset 0 1px 0 rgba(var(--fg-rgb),0.05)",
          transition:
            "box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            `0 24px 90px rgba(var(--shadow-rgb),0.5), 0 0 80px rgba(${project.accentColor},0.14), 0 0 0 1px rgba(${project.accentColor},0.08), inset 0 1px 0 rgba(var(--fg-rgb),0.08)`;
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(var(--fg-rgb),0.20)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            "0 4px 50px rgba(var(--shadow-rgb),0.28), 0 0 40px rgba(37,99,235,0.035), inset 0 1px 0 rgba(var(--fg-rgb),0.05)";
          (e.currentTarget as HTMLElement).style.borderColor =
            "rgba(var(--fg-rgb),0.09)";
        }}
      >
        {/* Mouse-tracking glow */}
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none z-10"
          style={{ transition: "opacity 0.4s ease" }}
        />

        {/* Static accent glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-700"
          style={{
            background: `radial-gradient(ellipse at ${
              isEven ? "20% 50%" : "80% 50%"
            }, rgba(${project.accentColor},0.10) 0%, transparent 60%)`,
          }}
        />

        {/* Inner layout -- alternating direction */}
        <div
          className={`relative flex flex-col ${
            isEven ? "md:flex-row" : "md:flex-row-reverse"
          }`}
        >
          {/* Visual preview area */}
          <div
            className="relative md:w-[45%] aspect-[16/10] md:aspect-auto min-h-45 md:min-h-65 overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <div
                className="w-full max-w-75 rounded-lg border border-fg/7 group-hover:border-fg/12 transition-all duration-500"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(var(--fg-rgb),0.04) 0%, rgba(var(--fg-rgb),0.015) 100%)",
                  boxShadow:
                    "0 12px 40px rgba(var(--shadow-rgb),0.3), inset 0 1px 0 rgba(var(--fg-rgb),0.04)",
                }}
              >
                {/* Window chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-fg/6">
                  <span className="w-2 h-2 rounded-full bg-fg/12" />
                  <span className="w-2 h-2 rounded-full bg-fg/8" />
                  <span className="w-2 h-2 rounded-full bg-fg/8" />
                  {project.variant === "terminal" && (
                    <span className="ml-auto text-[9px] font-mono tracking-[0.15em] text-fg/20 uppercase">
                      {project.terminalLabel ?? "recon"}
                    </span>
                  )}
                  {project.variant === "ui" && project.uiLabel && (
                    <span className="ml-auto text-[9px] font-mono tracking-widest text-fg/25 lowercase truncate max-w-[60%]">
                      {project.uiLabel}
                    </span>
                  )}
                </div>

                {project.variant === "terminal" ? (
                  /* Terminal output */
                  <div
                    className="px-4 py-4 font-mono text-[10px] leading-relaxed"
                    style={{ textRendering: "geometricPrecision", WebkitFontSmoothing: "antialiased" }}
                  >
                    {(project.terminalLines ?? []).map((line, i) => {
                      const prefixColor =
                        line.prefix === "[+]"
                          ? "text-emerald-400/85"
                          : line.prefix === "[!]"
                          ? "text-amber-400/90"
                          : line.prefix === "[-]"
                          ? "text-rose-400/85"
                          : line.prefix === "[*]"
                          ? "text-sky-400/80"
                          : "text-accent/80";
                      const textColor =
                        line.prefix === ">" ? "text-fg/55" : "text-fg/70";
                      return (
                        <div key={i} className={`flex gap-2 ${textColor}`}>
                          <span className={`${prefixColor} select-none`}>{line.prefix}</span>
                          <span>{line.text}</span>
                        </div>
                      );
                    })}
                    <div className="flex gap-2 text-fg/50 mt-1 items-center">
                      <span className="text-accent/80 select-none">&gt;</span>
                      <span
                        className="inline-block w-1.5 h-3 bg-fg/55"
                        style={{ animation: "preloader-dot-pulse 1s ease-in-out infinite" }}
                      />
                    </div>
                  </div>
                ) : project.uiKind === "mascot" ? (
                  /* Mascot + stat HUD mockup */
                  <div className="px-3.5 py-3 space-y-2.5">
                    {/* Mascot stage */}
                    <div className="relative h-13 flex items-center justify-center">
                      <div
                        className="relative w-10 h-10 rounded-2xl flex items-end justify-center pb-2"
                        style={{
                          background: `linear-gradient(135deg, rgba(${project.accentColor},0.85) 0%, rgba(${project.accentColor},0.55) 100%)`,
                          boxShadow: `0 4px 16px rgba(${project.accentColor},0.35), inset 0 1px 0 rgba(255,255,255,0.25)`,
                        }}
                      >
                        {/* Eyes */}
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-white/95" />
                          <span className="w-1 h-1 rounded-full bg-white/95" />
                        </div>
                        {/* Mouth */}
                        <span className="w-2 h-0.5 rounded-full bg-white/75" />
                      </div>
                      {/* Speech bubble */}
                      <div
                        className="absolute right-3 top-0 px-2 py-1 rounded-md text-[8px] font-mono"
                        style={{
                          background: "rgba(var(--fg-rgb),0.07)",
                          border: "1px solid rgba(var(--fg-rgb),0.1)",
                          color: "rgba(var(--fg-rgb),0.55)",
                        }}
                      >
                        hi!
                      </div>
                    </div>
                    {/* Stat strip */}
                    <div className="space-y-1">
                      {[
                        { label: "cpu", pct: 38 },
                        { label: "ram", pct: 62 },
                        { label: "tmp", pct: 45 },
                      ].map((s) => (
                        <div key={s.label} className="flex items-center gap-2">
                          <span className="text-[7px] font-mono uppercase tracking-widest text-fg/30 w-6">
                            {s.label}
                          </span>
                          <div className="flex-1 h-1 rounded-full bg-fg/6 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${s.pct}%`,
                                background: `rgba(${project.accentColor},0.55)`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : project.uiLabel ? (
                  /* Generic website mockup */
                  <div className="px-3.5 py-3.5 space-y-2.5">
                    {/* Top nav */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-1.5 rounded-sm"
                        style={{ background: `rgba(${project.accentColor},0.35)` }}
                      />
                      <div className="ml-auto flex gap-1.5">
                        <span className="w-4 h-1 rounded-full bg-fg/12" />
                        <span className="w-4 h-1 rounded-full bg-fg/9" />
                        <span className="w-4 h-1 rounded-full bg-fg/9" />
                      </div>
                    </div>
                    {/* Hero block */}
                    <div
                      className="rounded-md p-2 space-y-1"
                      style={{
                        background: `linear-gradient(135deg, rgba(${project.accentColor},0.16) 0%, rgba(${project.accentColor},0.04) 100%)`,
                        border: `1px solid rgba(${project.accentColor},0.12)`,
                      }}
                    >
                      <div className="h-1.5 w-[60%] rounded-full bg-fg/22" />
                      <div className="h-1 w-[42%] rounded-full bg-fg/12" />
                      <div className="pt-1">
                        <span
                          className="inline-block h-1.5 w-10 rounded-full"
                          style={{ background: `rgba(${project.accentColor},0.55)` }}
                        />
                      </div>
                    </div>
                    {/* Cards row */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="rounded-sm border border-fg/8 bg-fg/3 p-1.5 space-y-1">
                        <div className="h-1 w-[65%] rounded-full bg-fg/15" />
                        <div className="h-0.5 w-[45%] rounded-full bg-fg/8" />
                      </div>
                      <div className="rounded-sm border border-fg/8 bg-fg/3 p-1.5 space-y-1">
                        <div className="h-1 w-[55%] rounded-full bg-fg/15" />
                        <div className="h-0.5 w-[40%] rounded-full bg-fg/8" />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* UI placeholder lines */
                  <div className="px-4 py-5 space-y-3">
                    <div className="h-1.5 w-[45%] rounded-full bg-fg/7" />
                    <div className="h-1.5 w-[70%] rounded-full bg-fg/5" />
                    <div className="h-1.5 w-[55%] rounded-full bg-fg/4" />
                    <div className="h-1.5 w-[35%] rounded-full bg-fg/3" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Text content */}
          <div
            className="flex-1 flex flex-col justify-center px-5 py-8 md:px-12 md:py-14"
          >
            {/* Project number + WIP badge */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-fg/20">
                {String(index + 1).padStart(2, "0")}
              </span>
              {project.wip && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono tracking-[0.18em] uppercase"
                  style={{
                    borderColor: "rgba(245,158,11,0.25)",
                    background: "rgba(245,158,11,0.06)",
                    color: "rgba(245,158,11,0.85)",
                  }}
                >
                  <span
                    className="inline-block w-1 h-1 rounded-full"
                    style={{
                      background: "rgba(245,158,11,0.9)",
                      boxShadow: "0 0 6px rgba(245,158,11,0.6)",
                    }}
                  />
                  Work in progress
                </span>
              )}
              {project.collab && (
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[9px] font-mono tracking-[0.18em] uppercase"
                  style={{
                    borderColor: "rgba(37,99,235,0.30)",
                    background: "rgba(37,99,235,0.08)",
                    color: "rgba(96,165,250,0.95)",
                    boxShadow: "0 0 12px rgba(37,99,235,0.12)",
                  }}
                >
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-3.13a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Collaboration
                </span>
              )}
            </div>

            {/* Title */}
            <h3
              className="text-[clamp(1.6rem,3.2vw,2.5rem)] font-bold tracking-[-0.03em] text-fg/95 mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {project.title}
            </h3>

            {/* Description */}
            <p className="text-[14px] text-fg/40 leading-relaxed mb-5 max-w-md">
              {project.description}
            </p>

            {/* Key features — compact inline, only when provided */}
            {project.features && project.features.length > 0 && (
              <p className="text-[11px] font-mono tracking-[0.02em] text-fg/30 leading-relaxed mb-7 max-w-md">
                {project.features.join("  \u00b7  ")}
              </p>
            )}

            {/* Tech stack pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {project.stack.map((tech) => (
                <TechPill key={tech} name={tech} />
              ))}
            </div>

            {/* Actions */}
            <div className="relative z-20 flex items-center gap-3">
              {project.liveUrl && !project.liveDisabled && (
                <a
                  href={project.liveUrl}
                  className="group/btn inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-fg/12 hover:border-fg/25 bg-fg/4 hover:bg-fg/8 transition-all duration-300"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(var(--fg-rgb),0.04)",
                    transition: "box-shadow 0.4s ease, background 0.3s ease, border-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 24px 3px rgba(37,99,235,0.15), 0 0 48px 6px rgba(37,99,235,0.08), inset 0 1px 0 rgba(var(--fg-rgb),0.06)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "inset 0 1px 0 rgba(var(--fg-rgb),0.04)";
                  }}
                >
                  <span className="text-[13px] font-medium tracking-wide text-fg/65 group-hover/btn:text-fg/95 transition-colors duration-300">
                    {project.liveLabel ?? "View project"}
                  </span>
                  <svg
                    className="w-3.5 h-3.5 text-fg/30 group-hover/btn:text-fg/70 transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </a>
              )}
              {project.liveDisabled && project.liveLabel && (
                <div
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-fg/8 bg-fg/2 cursor-default select-none"
                  style={{ boxShadow: "inset 0 1px 0 rgba(var(--fg-rgb),0.03)" }}
                  aria-disabled="true"
                >
                  <span className="relative flex h-1.5 w-1.5">
                    <span
                      className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping"
                      style={{ animationDuration: "2.5s" }}
                    />
                    <span
                      className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400/80"
                      style={{ boxShadow: "0 0 6px rgba(52,211,153,0.4)" }}
                    />
                  </span>
                  <span className="text-[12px] font-mono tracking-[0.06em] text-fg/55">
                    {project.liveLabel}
                  </span>
                </div>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-fg/8 hover:border-fg/18 bg-fg/2 hover:bg-fg/5 transition-all duration-300"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(var(--fg-rgb),0.02)",
                    transition: "box-shadow 0.4s ease, background 0.3s ease, border-color 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "0 0 16px 2px rgba(37,99,235,0.08), inset 0 1px 0 rgba(var(--fg-rgb),0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.boxShadow =
                      "inset 0 1px 0 rgba(var(--fg-rgb),0.02)";
                  }}
                >
                  <span className="text-[12px] tracking-wide text-fg/45 group-hover/btn:text-fg/80 transition-colors duration-300">
                    GitHub
                  </span>
                  <svg
                    className="w-3 h-3 text-fg/20 group-hover/btn:text-fg/55 transition-colors duration-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Main Projects section ── */
export default function Projects() {
  const sectionRef = useRef<HTMLDivElement>(null);

  /* Scroll-driven entrance */
  const { scrollYProgress: enterProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.45"],
  });

  /* Scroll-driven exit */
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["end 0.85", "end 0.35"],
  });

  const enterOpacity = useTransform(enterProgress, [0, 0.5, 1], [0, 0.7, 1]);
  const exitOpacity = useTransform(exitProgress, [0, 1], [1, 0]);
  const rawOpacity = useTransform(() => enterOpacity.get() * exitOpacity.get());

  const enterY = useTransform(enterProgress, [0, 1], [40, 0]);
  const exitY = useTransform(exitProgress, [0, 1], [0, -25]);
  const rawY = useTransform(() => enterY.get() + exitY.get());

  const enterScale = useTransform(enterProgress, [0, 1], [0.98, 1]);
  const exitScale = useTransform(exitProgress, [0, 1], [1, 0.985]);
  const rawScale = useTransform(() => enterScale.get() * exitScale.get());

  const enterBlur = useTransform(enterProgress, [0, 0.5], [5, 0]);
  const exitBlur = useTransform(exitProgress, [0, 1], [0, 4]);
  const rawBlur = useTransform(() => enterBlur.get() + exitBlur.get());

  const opacity = useSpring(rawOpacity, { stiffness: 60, damping: 20 });
  const scrollY = useSpring(rawY, { stiffness: 60, damping: 20 });
  const scale = useSpring(rawScale, { stiffness: 60, damping: 20 });
  const blur = useSpring(rawBlur, { stiffness: 60, damping: 20 });
  const filterBlur = useMotionTemplate`blur(${blur}px)`;

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative min-h-screen bg-bg pt-20 pb-32"
    >
      {/* Ambient environment */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "60vmax",
            height: "60vmax",
            background:
              "radial-gradient(ellipse at center, rgba(37,99,235,0.04) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 20%, rgba(var(--bg-rgb),0.5) 100%)",
          }}
        />
      </div>

      {/* Scroll-transitioned content */}
      <motion.div
        className="relative z-10 max-w-5xl mx-auto px-6"
        style={{
          opacity,
          y: scrollY,
          scale,
          filter: filterBlur,
        }}
      >
        {/* Section header */}
        <div className="text-center mb-20">
          <motion.p
            className="text-[11px] font-mono tracking-[0.3em] uppercase text-fg/35 mb-3"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease }}
          >
            Selected
          </motion.p>
          <motion.h2
            className="text-[clamp(1.6rem,4.5vw,3.5rem)] font-bold tracking-[-0.04em] text-fg/90"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
          >
            Work
          </motion.h2>
          <motion.p
            className="mt-4 text-[14px] text-fg/35 max-w-sm mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.24, ease }}
          >
            Projects I've built and things I'm working on.
          </motion.p>
        </div>

        {/* Project blocks */}
        <div className="space-y-16 md:space-y-24">
          {PROJECTS.map((project, i) => (
            <ProjectBlock key={project.title} project={project} index={i} />
          ))}
        </div>

        {/* Studies & Writeups */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease }}
        >
          <p className="text-center text-[10px] font-mono tracking-[0.3em] uppercase text-fg/25 mb-5">
            Studies & Writeups
          </p>
          <a
            href="https://github.com/jaineeldev/cybersecurity-assessments"
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl border border-fg/8 hover:border-fg/18 bg-fg/2 hover:bg-fg/4 px-5 py-4 transition-all duration-300 max-w-2xl mx-auto"
            style={{ boxShadow: "inset 0 1px 0 rgba(var(--fg-rgb),0.03)" }}
          >
            <div className="flex items-center gap-4">
              <div
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(99,102,241,0.08)",
                  border: "1px solid rgba(99,102,241,0.18)",
                }}
              >
                <svg className="w-4 h-4 text-indigo-300/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[14px] font-medium text-fg/85 group-hover:text-fg/95 transition-colors">
                  Cybersecurity Assessments
                </h4>
                <p className="text-[12px] text-fg/40 leading-snug mt-0.5">
                  Refined writeups on cybersecurity legislation, policy, and algorithmic problem-solving.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] font-mono tracking-wide text-fg/45 px-2 py-0.5 rounded-full border border-fg/8 bg-fg/3">
                    Legislation & Policy
                  </span>
                  <span className="text-[10px] font-mono tracking-wide text-fg/45 px-2 py-0.5 rounded-full border border-fg/8 bg-fg/3">
                    Algorithmic Solutions
                  </span>
                </div>
              </div>
              <svg
                className="shrink-0 w-3.5 h-3.5 text-fg/25 group-hover:text-fg/60 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </div>
          </a>
        </motion.div>

        {/* Coming soon footer */}
        <motion.p
          className="text-center mt-16 text-[12px] font-mono tracking-[0.2em] text-fg/20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          More projects coming soon.
        </motion.p>
      </motion.div>

      {/* Grain */}
    </section>
  );
}
