"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import NowPlaying from "@/components/NowPlaying";
import ThemeToggle from "@/components/ThemeToggle";
import { PRELOADER_DONE_EVENT, isPreloaderDone } from "@/components/Preloader";

const HEADLINE_1 = "Hi, I'm Jaineel.";
const HEADLINE_2 =
  "Cybersecurity student heading into Computer Science and software engineering.";

const EMAIL = "jaineelk.dev@gmail.com";

const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#stack" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

const T = {
  topBar: 0.05,
  line1: 0.3,
  line2: 1.4,
  ctas: 1.55,
  nowPlaying: 1.75,
};

const LETTER_STAGGER = 0.04;
const LETTER_DURATION = 0.7;

const HIDDEN_LETTER = { y: 40, opacity: 0, filter: "blur(8px)" };
const VISIBLE_LETTER = { y: 0, opacity: 1, filter: "blur(0px)" };

function StaggeredText({
  text,
  startDelay,
  stagger = LETTER_STAGGER,
  ready,
}: {
  text: string;
  startDelay: number;
  stagger?: number;
  ready: boolean;
}) {
  return (
    <span aria-label={text} className="inline-block whitespace-pre-wrap">
      {Array.from(text).map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          aria-hidden
          className="inline-block will-change-transform"
          initial={HIDDEN_LETTER}
          animate={ready ? VISIBLE_LETTER : HIDDEN_LETTER}
          transition={{
            duration: LETTER_DURATION,
            ease: EASE,
            delay: ready ? startDelay + i * stagger : 0,
          }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      aria-hidden
    >
      <path d="M2.5 7h9" />
      <path d="M7.5 3l4 4-4 4" />
    </svg>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isPreloaderDone()) {
      setReady(true);
      return;
    }
    const onReady = () => setReady(true);
    window.addEventListener(PRELOADER_DONE_EVENT, onReady);
    const safety = window.setTimeout(() => setReady(true), 4000);
    return () => {
      window.removeEventListener(PRELOADER_DONE_EVENT, onReady);
      window.clearTimeout(safety);
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative isolate flex min-h-svh flex-col overflow-hidden bg-bg"
    >
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 flex min-h-svh flex-col"
      >
        {/* ─── Top bar ─── */}
        <motion.header
          initial={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.7, ease: EASE, delay: ready ? T.topBar : 0 }}
          className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-7 pt-6 sm:px-10 sm:pt-8 md:px-14 md:pt-10"
        >
          <a
            href="#home"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-fg transition-colors duration-300 hover:text-accent"
            aria-label="Back to top"
          >
            JK.
          </a>

          <div className="flex items-center gap-7 sm:gap-8">
            <nav
              aria-label="Primary"
              className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.18em] sm:flex"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-fg-muted transition-colors duration-300 hover:text-accent"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <ThemeToggle />
          </div>
        </motion.header>

        {/* ─── Main composition ─── */}
        <div className="flex flex-1 items-center px-7 py-24 sm:px-10 sm:py-28 md:px-14 md:py-32">
          <div className="w-full max-w-[1500px]">
            <h1
              className="font-display font-extrabold leading-[0.9] tracking-[-0.045em] text-fg"
              style={{ fontSize: "clamp(2.25rem, 6.5vw, 8rem)" }}
            >
              <span className="block overflow-hidden pb-[0.08em]">
                <StaggeredText text={HEADLINE_1} startDelay={T.line1} ready={ready} />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 12, filter: "blur(4px)" }}
              transition={{ duration: 0.9, ease: EASE, delay: ready ? T.line2 : 0 }}
              className="mt-5 max-w-[42ch] font-display font-medium leading-[1.18] tracking-[-0.018em] text-fg-muted text-[1rem] sm:mt-7 sm:max-w-[34ch] sm:text-[clamp(1.25rem,2.6vw,2rem)]"
            >
              {HEADLINE_2}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 10, filter: "blur(4px)" }}
              transition={{ duration: 0.8, ease: EASE, delay: ready ? T.ctas : 0 }}
              className="mt-14 flex flex-col items-start gap-3 sm:mt-20 sm:flex-row sm:items-center sm:gap-5"
            >
              <a
                href="#work"
                className="group inline-flex items-center gap-3 border border-transparent bg-fg px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-bg transition duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-accent/30 hover:brightness-110"
              >
                <span>See the work</span>
                <ArrowRight className="transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
              </a>

              <a
                href="/resume/Jaineel_Khatri_Professionalv2.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 border border-border px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--cta-hover-bg)] hover:text-fg"
              >
                <span>Resume</span>
              </a>

              <a
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center gap-3 border border-border px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--cta-hover-bg)] hover:text-fg"
              >
                <span>Email · {EMAIL}</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* ─── Ambient now-playing — hides itself when nothing's playing ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: ready ? T.nowPlaying : 0 }}
          className="pointer-events-none absolute inset-x-0 bottom-0 px-7 pb-6 sm:px-10 sm:pb-8 md:px-14 md:pb-10"
        >
          <NowPlaying />
        </motion.div>
      </motion.div>
    </section>
  );
}
