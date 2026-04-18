"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

const EMAIL = "jaineelk.dev@gmail.com";

const SOCIALS = [
  { label: "GitHub", href: "https://github.com/jaineeldev" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jaineel-khatri/" },
];

/* ── CTA container with cursor-reactive glow + ambient float ── */
function CTAContainer({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number>(0);
  const mouse = useRef({ x: 50, y: 50, inside: false });
  const current = useRef({ x: 50, y: 50 });

  const lerp = useCallback((a: number, b: number, t: number) => a + (b - a) * t, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouse.current.x = ((e.clientX - rect.left) / rect.width) * 100;
      mouse.current.y = ((e.clientY - rect.top) / rect.height) * 100;
      mouse.current.inside = true;
    };

    const onLeave = () => {
      mouse.current.inside = false;
    };

    const tick = () => {
      const c = current.current;
      const m = mouse.current;

      c.x = lerp(c.x, m.inside ? m.x : 50, 0.08);
      c.y = lerp(c.y, m.inside ? m.y : 50, 0.08);

      if (glowRef.current) {
        const op = m.inside ? 0.10 : 0;
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
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, delay: 0.3, ease }}
      className="w-full max-w-md mx-auto"
    >
      <motion.div
        ref={containerRef}
        className="relative rounded-2xl border border-white/10 backdrop-blur-sm px-5 py-8 md:px-10 md:py-12 text-center overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.03)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 32px rgba(0,0,0,0.25), 0 0 60px rgba(37,99,235,0.06)",
        }}
        animate={{
          y: [0, -6, 0],
          scale: [1, 1.01, 1],
        }}
        transition={{
          duration: 7,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        {/* Cursor-reactive glow */}
        <div
          ref={glowRef}
          className="absolute inset-0 pointer-events-none z-0"
        />
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Contact() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* silent fail — mailto fallback is always available */
    }
  }, []);

  /* Scroll-driven entrance */
  const { scrollYProgress: enterProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.4"],
  });

  /* Scroll-driven exit — gentler since it's the last section */
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["end 0.9", "end 0.5"],
  });

  const enterOpacity = useTransform(enterProgress, [0, 0.5, 1], [0, 0.7, 1]);
  const exitOpacity = useTransform(exitProgress, [0, 1], [1, 0.3]);
  const rawOpacity = useTransform(() => enterOpacity.get() * exitOpacity.get());

  const enterY = useTransform(enterProgress, [0, 1], [40, 0]);
  const exitY = useTransform(exitProgress, [0, 1], [0, -15]);
  const rawY = useTransform(() => enterY.get() + exitY.get());

  const enterScale = useTransform(enterProgress, [0, 1], [0.98, 1]);
  const exitScale = useTransform(exitProgress, [0, 1], [1, 0.99]);
  const rawScale = useTransform(() => enterScale.get() * exitScale.get());

  const enterBlur = useTransform(enterProgress, [0, 0.5], [5, 0]);
  const exitBlur = useTransform(exitProgress, [0, 1], [0, 2]);
  const rawBlur = useTransform(() => enterBlur.get() + exitBlur.get());

  const opacity = useSpring(rawOpacity, { stiffness: 60, damping: 20 });
  const scrollY = useSpring(rawY, { stiffness: 60, damping: 20 });
  const scale = useSpring(rawScale, { stiffness: 60, damping: 20 });
  const blur = useSpring(rawBlur, { stiffness: 60, damping: 20 });
  const filterBlur = useMotionTemplate`blur(${blur}px)`;

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative min-h-screen bg-bg flex items-center justify-center"
    >
      {/* Ambient environment */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Wide ambient orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "50vmax",
            height: "50vmax",
            background:
              "radial-gradient(ellipse at center, rgba(37,99,235,0.04) 0%, transparent 60%)",
            filter: "blur(90px)",
          }}
        />
        {/* Primary focal glow behind CTA */}
        <div
          className="absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "55%",
            height: "55%",
            background:
              "radial-gradient(circle at center, rgba(37,99,235,0.12) 0%, transparent 70%)",
            filter: "blur(160px)",
          }}
        />
        {/* Vignette — darker edges, lighter center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 55%, transparent 10%, rgba(5,5,8,0.6) 100%)",
          }}
        />
      </div>

      {/* Content — single centered column */}
      <motion.div
        className="relative z-10 w-full max-w-3xl mx-auto px-6 py-24 text-center"
        style={{
          opacity,
          y: scrollY,
          scale,
          filter: filterBlur,
        }}
      >
        {/* Label */}
        <motion.p
          className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/30 mb-3"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease }}
        >
          Contact
        </motion.p>

        {/* Headline */}
        <motion.h2
          className="text-[clamp(1.6rem,4.5vw,3.5rem)] font-bold tracking-[-0.04em] text-white/90"
          style={{ fontFamily: "var(--font-display)" }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.12, ease }}
        >
          Let&apos;s build something.
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          className="mt-4 text-[14px] text-white/35 leading-relaxed max-w-sm mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.24, ease }}
        >
          Open to opportunities, collaborations, or just a conversation.
        </motion.p>

        {/* Personality line */}
        <motion.p
          className="mt-2 text-[12px] font-mono tracking-[0.04em] text-white/25 italic"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.32, ease }}
        >
          Always open to building something interesting.
        </motion.p>

        {/* Availability indicator */}
        <motion.div
          className="mt-3 flex items-center gap-2.5 justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
        >
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inset-0 rounded-full bg-emerald-400/50 animate-ping"
              style={{ animationDuration: "2.5s" }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400/80"
              style={{
                boxShadow: "0 0 8px rgba(52,211,153,0.4), 0 0 16px rgba(52,211,153,0.15)",
              }}
            />
          </span>
          <span className="text-[12px] tracking-[0.12em] text-white/55">
            Available for work
          </span>
        </motion.div>

        {/* CTA container — visual anchor */}
        <div className="mt-10">
          <CTAContainer>
            {/* Primary CTA */}
            <a
              href={`mailto:${EMAIL}`}
              className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-white/18 hover:border-white/32 bg-white/6 hover:bg-white/10 transition-all duration-300"
              style={{
                boxShadow:
                  "0 0 28px 3px rgba(37,99,235,0.14), inset 0 1px 0 rgba(255,255,255,0.06)",
                transform: "scale(1.02)",
                transition:
                  "box-shadow 0.4s ease, background 0.3s ease, border-color 0.3s ease, transform 0.3s cubic-bezier(0.16,1,0.3,1)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 40px 6px rgba(37,99,235,0.24), 0 0 80px 14px rgba(37,99,235,0.12), inset 0 1px 0 rgba(255,255,255,0.10)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.04) translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "0 0 28px 3px rgba(37,99,235,0.14), inset 0 1px 0 rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
              }}
            >
              <span className="text-[14px] font-medium tracking-wide text-white/85 group-hover:text-white transition-colors duration-300">
                Email me
              </span>
              <svg
                className="w-4 h-4 text-white/35 group-hover:text-white/75 group-hover:translate-x-0.5 transition-all duration-300"
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

            {/* Copy-email affordance */}
            <button
              type="button"
              onClick={handleCopy}
              className="group relative mt-5 mx-auto flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-white/5 transition-colors duration-200"
              aria-label="Copy email address"
            >
              <span className="text-[11px] font-mono tracking-[0.04em] text-white/40 group-hover:text-white/65 transition-colors duration-200">
                {EMAIL}
              </span>
              <span className="relative w-3.5 h-3.5 inline-flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.svg
                      key="check"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.15 }}
                      className="w-3.5 h-3.5 text-emerald-400/90"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      key="copy"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.15 }}
                      className="w-3.5 h-3.5 text-white/35 group-hover:text-white/65 transition-colors duration-200"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </motion.svg>
                  )}
                </AnimatePresence>
              </span>
              <AnimatePresence>
                {copied && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    transition={{ duration: 0.2 }}
                    className="text-[10px] font-mono tracking-[0.12em] uppercase text-emerald-400/85"
                  >
                    Copied
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Animated accent line */}
            <motion.div
              className="mt-7 mx-auto h-px"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
              }}
              initial={{ width: "0%" }}
              whileInView={{ width: "60%" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />

            {/* Secondary links */}
            <div className="mt-7 flex items-center justify-center gap-8">
              {SOCIALS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative text-[13px] tracking-wide text-white/50 hover:text-white/85 transition-colors duration-300"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 group-hover:w-full h-px bg-white/25 transition-all duration-300" />
                </a>
              ))}
            </div>
          </CTAContainer>
        </div>

      </motion.div>
    </section>
  );
}
