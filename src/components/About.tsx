"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

/* ── Identity fields ── */
const IDENTITY = [
  { label: "Name", value: "Jaineel Khatri" },
  { label: "Role", value: "Cybersecurity student & developer" },
  { label: "Location", value: "Brisbane, AU" },
  { label: "Status", value: "Available for work", accent: true },
];

/* ── Detail fields ── */
const DETAILS = [
  { label: "Focus", value: "Cybersecurity + software engineering" },
  { label: "Currently", value: "Cert IV Cyber Security (TAFE QLD)" },
  { label: "Interests", value: "Secure systems, UX, performance" },
  { label: "Goal", value: "Junior dev / security role" },
];

/* ── Row component ── */
function InfoRow({
  label,
  value,
  accent,
  delay,
}: {
  label: string;
  value: string;
  accent?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className="group relative flex items-baseline justify-between gap-6 py-3.5 px-3 -mx-3 rounded-lg border-b border-fg/6 last:border-b-0 hover:border-fg/12 hover:bg-fg/5 transition-all duration-300"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay, ease }}
    >
      {/* Left accent line on hover */}
      <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-blue-500/0 group-hover:bg-blue-500/40 transition-colors duration-300" style={{ boxShadow: "0 0 0 rgba(37,99,235,0)" }} />
      {/* Subtle row glow on hover */}
      <span
        className="absolute inset-0 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(ellipse 70% 100% at 0% 50%, rgba(37,99,235,0.08) 0%, transparent 70%)",
        }}
      />
      <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-fg/35 shrink-0 group-hover:text-fg/50 transition-colors duration-300">
        {label}
      </span>
      <span
        className={`text-[14px] text-right leading-relaxed transition-colors duration-300 ${
          accent
            ? "text-fg/80 group-hover:text-fg/95"
            : "text-fg/60 group-hover:text-fg/80"
        }`}
      >
        {accent && (
          <span
            className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/70 mr-2 relative -top-px animate-[statusPulse_2.5s_ease-in-out_infinite]"
            style={{
              boxShadow: "0 0 6px rgba(52,211,153,0.4), 0 0 12px rgba(52,211,153,0.15)",
            }}
          />
        )}
        {value}
      </span>
    </motion.div>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);

  /* Scroll-driven entrance */
  const { scrollYProgress: enterProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.35"],
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
      id="about"
      ref={sectionRef}
      className="relative min-h-screen bg-bg flex items-center justify-center pt-16"
    >
      {/* Ambient environment */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "50vmax",
            height: "50vmax",
            background:
              "radial-gradient(ellipse at center, rgba(37,99,235,0.04) 0%, transparent 60%)",
            filter: "blur(80px)",
          }}
        />
        {/* Focus glow behind content */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "55%",
            height: "45%",
            background:
              "radial-gradient(ellipse at center, rgba(37,99,235,0.06) 0%, transparent 55%)",
            filter: "blur(100px)",
          }}
        />
        {/* Center white highlight */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "65%",
            height: "50%",
            background:
              "radial-gradient(ellipse at center, rgba(var(--fg-rgb),0.015) 0%, transparent 55%)",
            filter: "blur(40px)",
          }}
        />
        {/* Subtle scan-line texture — technical feel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(var(--fg-rgb),0.008) 3px, rgba(var(--fg-rgb),0.008) 4px)",
            maskImage:
              "radial-gradient(ellipse 60% 55% at 50% 50%, black 0%, transparent 85%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 55% at 50% 50%, black 0%, transparent 85%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 20%, rgba(var(--bg-rgb),0.5) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-4xl mx-auto px-6 py-24"
        style={{
          opacity,
          y: scrollY,
          scale,
          filter: filterBlur,
        }}
      >
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-[11px] font-mono tracking-[0.3em] uppercase text-fg/30 mb-3"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease }}
          >
            Profile
          </motion.p>
          <motion.h2
            className="text-[clamp(1.6rem,4.5vw,3.5rem)] font-bold tracking-[-0.04em] text-fg/90"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.12, ease }}
          >
            About
          </motion.h2>
          <motion.p
            className="mt-4 text-[14px] text-fg/35 max-w-md mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.24, ease }}
          >
            Building tools across security and the web — and the software in between.
          </motion.p>
        </div>

        {/* Content container -- subtle elevation */}
        <div
          className="rounded-2xl border border-fg/5 backdrop-blur-sm px-6 py-8 md:px-10 md:py-10"
          style={{
            background: "rgba(var(--fg-rgb),0.02)",
            boxShadow: "inset 0 1px 0 rgba(var(--fg-rgb),0.03)",
          }}
        >
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-14">
            {/* Left -- Identity */}
            <div>
            <motion.p
              className="text-[10px] font-mono tracking-[0.25em] uppercase text-fg/25 mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              Identity
            </motion.p>
            <div className="border-t border-fg/6">
              {IDENTITY.map((item, i) => (
                <InfoRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  accent={item.accent}
                  delay={i * 0.06}
                />
              ))}
            </div>
          </div>

          {/* Right -- Details */}
          <div>
            <motion.p
              className="text-[10px] font-mono tracking-[0.25em] uppercase text-fg/25 mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5 }}
            >
              Details
            </motion.p>
            <div className="border-t border-fg/6">
              {DETAILS.map((item, i) => (
                <InfoRow
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  delay={i * 0.06 + 0.15}
                />
              ))}
            </div>
          </div>
          </div>
        </div>

        {/* Divider */}
        <motion.div
          className="mt-12 mb-5 h-px w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 5%, rgba(var(--fg-rgb),0.06) 30%, rgba(var(--fg-rgb),0.06) 70%, transparent 95%)",
          }}
          initial={{ opacity: 0, scaleX: 0.5 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease }}
        />

        {/* Bottom line */}
        <motion.p
          className="text-center text-[12px] font-mono tracking-[0.18em] text-fg/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Still learning. Always building.
        </motion.p>
      </motion.div>
    </section>
  );
}
