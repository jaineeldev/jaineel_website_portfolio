"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import Buddy from "@/components/Buddy";
import { PRELOADER_DONE_EVENT, isPreloaderDone } from "@/components/Preloader";
import ThemeToggle from "@/components/ThemeToggle";
import type { Release } from "./page";

const EASE = [0.16, 1, 0.3, 1] as const;
const PAGE_URL = "https://jaineel.dev/desktopbuddy";
const GITHUB = "https://github.com/jaineeldev/desktop_buddy";
const NAME = "DesktopBuddy";

const HIDDEN = { opacity: 0, y: 14, filter: "blur(4px)" };
const SHOWN = { opacity: 1, y: 0, filter: "blur(0px)" };

// The page opens in sequence once the preloader is out of the way, as the home Hero does;
// everything further down materialises as it scrolls into view.
const opening = (ready: boolean, delay: number) => ({
  initial: HIDDEN,
  animate: ready ? SHOWN : HIDDEN,
  transition: { duration: 0.9, ease: EASE, delay: ready ? delay : 0 },
});
const onScroll = (delay = 0) => ({
  initial: HIDDEN,
  whileInView: SHOWN,
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: EASE, delay },
});

// No display value here: each use sets its own, so the phone and desktop buttons can swap cleanly.
const PRIMARY =
  "group items-center gap-3 border border-transparent bg-fg px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-bg transition duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-accent/30 hover:brightness-110";
const SECONDARY =
  "inline-flex items-center gap-3 border border-border px-6 py-3.5 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--cta-hover-bg)] hover:text-fg";
const SECTION = "px-7 py-16 sm:px-10 sm:py-20 md:px-14 md:py-28";
const TITLE = "font-display font-extrabold leading-[0.95] tracking-[-0.035em] text-fg";
const TITLE_SIZE = { fontSize: "clamp(1.75rem, 4vw, 3.75rem)" };
const BODY = "text-[15.5px] leading-[1.55] text-fg-muted sm:text-[17px] sm:leading-[1.5]";

/**
 * A looping clip of the real app, recorded at twice the size it's shown (sharp on high-DPI screens),
 * once on each theme's background so it sits on the page with no frame around it.
 * Files: /desktopbuddy/<file>-<dark|light>.mp4, with a .webp of the frame it starts on as its poster.
 * `show` is the widest it's drawn (up to twice its size, still sharp); `start` is a lively moment to
 * begin on, rather than the loop's quiet start.
 */
type Clip = { file: string; width: number; height: number; show: number; start: number; alt: string };

const HERO_CLIP: Clip = {
  file: "buddies",
  width: 960,
  height: 175,
  show: 1280,
  start: 1,
  alt: "Nine different buddies breathing and blinking, with Sora in the middle. Sora falls in love, then the others take turns to wink, tilt their heads, get dizzy and look confused.",
};

const FEATURES: { title: string; body: string[]; clip: Clip }[] = [
  {
    title: "Moods",
    body: [
      "It has fifteen moods, from happy and sleepy to smug and dizzy, and it slides from one to the next.",
      "Leave your computer for two minutes and it gets bored. Leave it for five and it dozes off. It wakes up when you come back.",
    ],
    clip: { file: "moods", width: 800, height: 214, show: 960, start: 0, alt: "Sora, the default buddy, in all fifteen moods, each one breathing and blinking." },
  },
  {
    title: "Play",
    body: [
      "Press on it and it squishes. Pick it up and it swings along behind your cursor. Shake it and it gets dizzy.",
      "Stroke your cursor back and forth over it for a belly rub and it melts. Now and then it has something to say.",
    ],
    clip: {
      file: "reactions",
      width: 480,
      height: 340,
      show: 760,
      start: 5,
      alt: "A cursor pets Sora, gives it a belly rub until it falls in love, picks it up so it swings along behind, then shakes it until it's dizzy.",
    },
  },
  {
    title: "Peeking",
    body: [
      "Push it past the edge of your screen and it tucks in halfway, leaning out to peek at you.",
      "It only goes where you put it. It never wanders off on its own.",
    ],
    clip: {
      file: "peek",
      width: 440,
      height: 330,
      show: 700,
      start: 3.5,
      alt: "Sora is dragged past the edge of a screen, tucks in halfway, says Peekaboo and follows the cursor with its eyes.",
    },
  },
  {
    title: "Customise",
    body: [
      "Right-click it to change its name, shape, eyes, colour and size. Six of the shapes are hand-drawn extras.",
      "Everything saves on your PC, and it stays exactly where you put it.",
    ],
    clip: {
      file: "customise",
      width: 546,
      height: 592,
      show: 600,
      start: 6,
      alt: "The settings panel beside Sora: renamed Pip, its face changes with every letter, then it gets a kitty shape, a pink colour and square eyes.",
    },
  },
];

const QUESTIONS: [string, string][] = [
  [
    "Is it safe?",
    "Yes. It needs no admin rights and no special permissions. It reads where your mouse is and how long since you last used your keyboard or mouse, never what you type. It doesn't touch your camera, microphone, location, clipboard or files, and the only thing it connects to is GitHub, to check for updates. The code is open source, so anyone can check.",
  ],
  [
    "Why does Windows warn me when I install it?",
    "Windows shows “Windows protected your PC” for apps that aren't code-signed, and signing costs money every year. Click More info, then Run anyway. You only see it once, because after that it updates itself.",
  ],
  ["Will it slow my computer down?", "No. It sits quietly between moments. On my PC it uses about 2% of the processor while idle."],
  [
    "How do I close or hide it?",
    "Right-click your buddy and press Quit DesktopBuddy at the bottom of its panel. To hide it for a bit, press Ctrl+Alt+B, and press it again to bring it back.",
  ],
  ["How do I uninstall it?", "Like any other app: open Settings, then Apps, find DesktopBuddy and uninstall it."],
  ["Is there a Mac version?", "Not yet. Windows comes first, and a Mac version is on the list."],
];

type Theme = "dark" | "light";
const readTheme = (): Theme => (document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark");
const watchTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};
/** The site's theme, following the toggle. The server renders the dark default. */
function useTheme(): Theme {
  return useSyncExternalStore(watchTheme, readTheme, () => "dark");
}

/** A clip for the current theme. It plays only while on screen; with reduced motion it rests on its first frame. */
function Loop({ clip, eager = false }: { clip: Clip; eager?: boolean }) {
  const theme = useTheme();
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [reduceMotion, theme]);

  const src = `/desktopbuddy/${clip.file}-${theme}`;
  return (
    <video
      key={theme}
      ref={ref}
      muted
      loop
      playsInline
      preload={eager ? "auto" : "metadata"}
      poster={`${src}.webp`}
      onLoadedMetadata={(e) => {
        if (clip.start && e.currentTarget.currentTime < 0.01) e.currentTarget.currentTime = clip.start;
      }}
      width={clip.width}
      height={clip.height}
      role="img"
      aria-label={clip.alt}
      className="block h-auto w-full"
      style={{ maxWidth: clip.show }}
    >
      <source src={`${src}.mp4`} type="video/mp4" />
    </video>
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

// On a phone the installer is no use, so the main button there copies the page's link instead.
function Get({ release }: { release: Release }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PAGE_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard access: the address is written out just below anyway.
    }
  };
  return (
    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
      <a href={release.download} className={`${PRIMARY} hidden sm:inline-flex`}>
        <span>Download for Windows</span>
        <ArrowRight className="transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
      </a>
      <button type="button" onClick={copy} className={`${PRIMARY} inline-flex sm:hidden`}>
        <span>{copied ? "Link copied" : "Copy link for your PC"}</span>
      </button>
      <a href={GITHUB} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
        <span>View on GitHub</span>
      </a>
    </div>
  );
}

function Details({ release }: { release: Release }) {
  const facts = [release.version && `v${release.version}`, release.sizeMb && `${release.sizeMb} MB`, "Windows 10 and 11", "Free and open source"];
  return (
    <>
      <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim">
        {facts.filter(Boolean).join(" · ")}
      </p>
      <p className={`mt-4 max-w-[42ch] sm:hidden ${BODY}`}>
        DesktopBuddy runs on Windows. Open jaineel.dev/desktopbuddy on your PC to get it.
      </p>
    </>
  );
}

export default function DesktopBuddyPage({ release }: { release: Release }) {
  // Already done when arriving from another page of the site; otherwise wait for its signal.
  const [ready, setReady] = useState(isPreloaderDone);
  const reduceMotion = useReducedMotion();
  // Sora starts out of sight past the edge, so it can't watch for itself; the closing section does.
  const endRef = useRef<HTMLElement>(null);
  const endInView = useInView(endRef, { once: true, amount: 0.35 });
  useEffect(() => {
    if (ready) return;
    // It may have finished between the first render and now, before there was anything listening.
    if (isPreloaderDone()) {
      const frame = window.requestAnimationFrame(() => setReady(true));
      return () => window.cancelAnimationFrame(frame);
    }
    const onReady = () => setReady(true);
    window.addEventListener(PRELOADER_DONE_EVENT, onReady);
    const safety = window.setTimeout(() => setReady(true), 4000);
    return () => {
      window.removeEventListener(PRELOADER_DONE_EVENT, onReady);
      window.clearTimeout(safety);
    };
  }, [ready]);

  // The name arrives a letter at a time, as the home greeting does, and Sora lands last as its full stop.
  const letterDelay = (i: number) => 0.2 + i * 0.04;
  const soraDelay = letterDelay(NAME.length) + 0.15;

  return (
    <main className="relative flex min-h-svh flex-col overflow-x-clip bg-bg">
      <motion.header
        {...opening(ready, 0.05)}
        className="flex items-center justify-between px-7 pt-6 sm:px-10 sm:pt-8 md:px-14 md:pt-10"
      >
        <Link
          href="/"
          className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-fg transition-colors duration-300 hover:text-accent"
          aria-label="Back to jaineel.dev"
        >
          JK.
        </Link>
        <div className="flex items-center gap-7 sm:gap-8">
          <Link
            href="/#work"
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-fg-muted transition-colors duration-300 hover:text-accent"
          >
            Work
          </Link>
          <ThemeToggle />
        </div>
      </motion.header>

      <section className="px-7 pb-16 pt-20 sm:px-10 sm:pb-20 sm:pt-24 md:px-14 md:pb-28 md:pt-28">
        <div className="w-full max-w-[1500px]">
          <div className="flex items-end gap-[0.06em]" style={{ fontSize: "clamp(2.75rem, 10vw, 9.5rem)" }}>
            <h1 aria-label={NAME} className="font-display font-extrabold leading-[0.9] tracking-[-0.045em] text-fg">
              {NAME.split("").map((letter, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="inline-block"
                  initial={{ opacity: 0, y: "0.25em", filter: "blur(4px)" }}
                  animate={ready ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
                  transition={{ duration: 0.7, ease: EASE, delay: letterDelay(i) }}
                >
                  {letter}
                </motion.span>
              ))}
            </h1>
            <motion.div
              className="mb-[0.06em] shrink-0"
              initial={{ opacity: 0, scale: 0.4, filter: "blur(4px)" }}
              animate={ready ? { opacity: 1, scale: 1, filter: "blur(0px)" } : undefined}
              transition={{ duration: 0.8, ease: EASE, delay: soraDelay }}
            >
              <Buddy className="h-[0.62em] w-[0.62em] cursor-pointer" />
            </motion.div>
          </div>

          <motion.p
            {...opening(ready, soraDelay + 0.1)}
            className="mt-6 max-w-[42ch] font-display text-[1.05rem] font-medium leading-[1.18] tracking-[-0.018em] text-fg-muted sm:mt-8 sm:max-w-[34ch] sm:text-[clamp(1.25rem,2.6vw,2rem)]"
          >
            A tiny creature that lives on your desktop. Give it a name and it grows a face of its own.
          </motion.p>

          <motion.div {...opening(ready, soraDelay + 0.25)} className="mt-12 sm:mt-16">
            <Get release={release} />
            <Details release={release} />
          </motion.div>

          <motion.div {...opening(ready, soraDelay + 0.4)} className="mt-16 sm:mt-24">
            <Loop clip={HERO_CLIP} eager />
          </motion.div>
        </div>
      </section>

      {FEATURES.map((feature, i) => {
        // Text and clip swap sides every other section on wider screens, so the page has a rhythm.
        const flip = i % 2 === 1;
        return (
          <section key={feature.title} className={SECTION}>
            <div
              className={`grid w-full max-w-[1500px] grid-cols-1 items-center gap-y-10 md:gap-x-16 ${
                flip ? "md:grid-cols-[1fr_minmax(0,26rem)]" : "md:grid-cols-[minmax(0,26rem)_1fr]"
              }`}
            >
              <div className={flip ? "md:order-2" : undefined}>
                <motion.h2 {...onScroll()} className={TITLE} style={TITLE_SIZE}>
                  {feature.title}
                </motion.h2>
                {feature.body.map((line, j) => (
                  <motion.p key={line} {...onScroll(0.07 * (j + 1))} className={`mt-6 max-w-[48ch] ${BODY}`}>
                    {line}
                  </motion.p>
                ))}
              </div>
              <motion.div {...onScroll(0.14)} className={flip ? "md:order-1" : undefined}>
                <Loop clip={feature.clip} />
              </motion.div>
            </div>
          </section>
        );
      })}

      <section className={SECTION}>
        <div className="w-full max-w-[1400px]">
          <motion.h2 {...onScroll()} className={TITLE} style={TITLE_SIZE}>
            Questions
          </motion.h2>
          <dl className="mt-10 flex max-w-[62ch] flex-col gap-9 sm:mt-14 sm:gap-10">
            {QUESTIONS.map(([question, answer], i) => (
              <motion.div key={question} {...onScroll(0.05 * i)}>
                <dt className="font-display text-[clamp(1.125rem,1.7vw,1.4rem)] font-semibold leading-[1.2] tracking-[-0.015em] text-fg">
                  {question}
                </dt>
                <dd className={`mt-3 ${BODY}`}>{answer}</dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </section>

      <section ref={endRef} className="relative px-7 pb-10 pt-16 sm:px-10 sm:pb-12 sm:pt-20 md:px-14 md:pb-14 md:pt-28">
        {/* Sora, tucked in behind the edge of the page and peeking out, the way it does on a desktop. */}
        <motion.div
          className="pointer-events-auto absolute right-0 top-[18%] w-[clamp(84px,11vw,150px)]"
          initial={reduceMotion ? { x: "45%", rotate: -10 } : { x: "100%", rotate: 0 }}
          animate={endInView ? { x: "45%", rotate: -10 } : undefined}
          transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
        >
          <Buddy className="aspect-square w-full cursor-pointer" />
        </motion.div>

        <div className="w-full max-w-[1400px]">
          <motion.h2
            initial={{ opacity: 0, y: 80, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.9, ease: EASE }}
            className="font-display font-extrabold leading-[0.98] tracking-[-0.035em] text-fg"
            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            Free for Windows.
          </motion.h2>
          <motion.div {...onScroll(0.3)} className="mt-10 sm:mt-12">
            <Get release={release} />
            <Details release={release} />
          </motion.div>
          <motion.p {...onScroll(0.4)} className={`mt-10 max-w-[52ch] ${BODY}`}>
            I built DesktopBuddy with help from AI, and I&apos;m still adding to it. Bopping along to your music is next.
          </motion.p>

          <motion.div
            {...onScroll(0.45)}
            className="mt-20 flex flex-col gap-4 sm:mt-28 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <Link
              href="/"
              className="group inline-flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-fg-muted transition-colors duration-300 hover:text-accent"
            >
              <span>Back to jaineel.dev</span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim">
              © {new Date().getFullYear()} Jaineel Khatri
            </span>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
