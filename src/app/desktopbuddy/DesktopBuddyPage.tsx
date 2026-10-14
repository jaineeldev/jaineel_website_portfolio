"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Buddy from "@/components/Buddy";
import { PRELOADER_DONE_EVENT, isPreloaderDone } from "@/components/Preloader";
import ThemeToggle from "@/components/ThemeToggle";
import type { Release } from "./page";

const EASE = [0.16, 1, 0.3, 1] as const;
const PAGE_URL = "https://jaineel.dev/desktopbuddy";
const GITHUB = "https://github.com/jaineeldev/desktop_buddy";

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

type Art = { src: string; width: number; height: number; alt: string };

const FEATURES: { title: string; body: string[]; art: Art }[] = [
  {
    title: "Moods",
    body: [
      "It has fifteen moods, from happy and sleepy to smug and dizzy, and it slides from one to the next.",
      "Leave your computer for two minutes and it gets bored. Leave it for five and it dozes off. It wakes up when you come back.",
    ],
    art: {
      src: "/desktopbuddy/moods.gif",
      width: 800,
      height: 214,
      alt: "Sora, the default buddy, in all fifteen moods, each one breathing and blinking.",
    },
  },
  {
    title: "Play",
    body: [
      "Press on it and it squishes. Pick it up and it swings along behind your cursor. Shake it and it gets dizzy.",
      "Stroke your cursor back and forth over it for a belly rub and it melts. Now and then it has something to say.",
    ],
    art: {
      src: "/desktopbuddy/reactions.gif",
      width: 480,
      height: 340,
      alt: "A cursor pets Sora, gives it a belly rub until it falls in love, picks it up so it swings along behind, then shakes it until it's dizzy.",
    },
  },
  {
    title: "Peeking",
    body: [
      "Push it past the edge of your screen and it tucks in halfway, leaning out to peek at you.",
      "It only goes where you put it. It never wanders off on its own.",
    ],
    art: {
      src: "/desktopbuddy/peek.gif",
      width: 440,
      height: 330,
      alt: "Sora is dragged past the edge of a screen, tucks in halfway, says Peekaboo and follows the cursor with its eyes.",
    },
  },
  {
    title: "Customise",
    body: [
      "Right-click it to change its name, shape, eyes, colour and size. Six of the shapes are hand-drawn extras.",
      "Everything saves on your PC, and it stays exactly where you put it.",
    ],
    art: {
      src: "/desktopbuddy/customise.gif",
      width: 546,
      height: 592,
      alt: "The settings panel beside Sora: renamed Pip, its face changes with every letter, then it gets a kitty shape, a pink colour and square eyes.",
    },
  },
];

const PRIVACY = [
  "It reads where your mouse pointer is, so its eyes can follow it.",
  "It checks how long since you last used your keyboard or mouse, so it knows when you're away. It never sees what you type.",
  "On a laptop, it reads the battery level and whether it's charging.",
  "It connects to GitHub to check for updates, and nothing else. No accounts and no tracking.",
  "It doesn't use your camera, microphone, location, clipboard or files.",
];

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
  const facts = [release.version && `v${release.version}`, release.sizeMb && `${release.sizeMb} MB`, "Windows 10 and 11", "Free"];
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

  return (
    <main className="relative flex min-h-svh flex-col bg-bg">
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

      {/* The name, with Sora sitting where the full stop would be. */}
      <section className="px-7 pb-16 pt-24 sm:px-10 sm:pb-20 sm:pt-28 md:px-14 md:pb-28 md:pt-32">
        <div className="w-full max-w-[1500px]">
          <motion.div
            {...opening(ready, 0.2)}
            className="flex items-end gap-[0.08em]"
            style={{ fontSize: "clamp(2.25rem, 6.5vw, 8rem)" }}
          >
            <h1 className="font-display font-extrabold leading-[0.9] tracking-[-0.045em] text-fg">
              DesktopBuddy
            </h1>
            <Buddy className="mb-[0.06em] h-[0.62em] w-[0.62em] shrink-0 cursor-pointer" />
          </motion.div>

          <motion.p
            {...opening(ready, 0.45)}
            className="mt-5 max-w-[42ch] font-display text-[1rem] font-medium leading-[1.18] tracking-[-0.018em] text-fg-muted sm:mt-7 sm:max-w-[34ch] sm:text-[clamp(1.25rem,2.6vw,2rem)]"
          >
            A tiny creature that lives on your desktop. Give it a name and it grows a face of its own.
          </motion.p>

          <motion.div {...opening(ready, 0.6)} className="mt-14 sm:mt-20">
            <Get release={release} />
            <Details release={release} />
          </motion.div>

          <motion.div {...opening(ready, 0.8)} className="mt-16 sm:mt-24">
            <Image
              src="/desktopbuddy/buddies.gif"
              width={960}
              height={175}
              unoptimized
              priority
              alt="Nine different buddies breathing and blinking, with Sora in the middle. Sora falls in love, then the others take turns to wink, tilt their heads, get dizzy and look confused."
              className="h-auto w-full max-w-[960px]"
            />
          </motion.div>
        </div>
      </section>

      {FEATURES.map((feature) => (
        <section key={feature.title} className={SECTION}>
          <div className="grid w-full max-w-[1400px] grid-cols-1 gap-y-10 md:grid-cols-[minmax(0,26rem)_1fr] md:gap-x-16">
            <div>
              <motion.h2 {...onScroll()} className={TITLE} style={TITLE_SIZE}>
                {feature.title}
              </motion.h2>
              {feature.body.map((line, i) => (
                <motion.p key={line} {...onScroll(0.07 * (i + 1))} className={`mt-6 max-w-[48ch] ${BODY}`}>
                  {line}
                </motion.p>
              ))}
            </div>
            <motion.div {...onScroll(0.14)} className="md:pt-3">
              <Image
                src={feature.art.src}
                width={feature.art.width}
                height={feature.art.height}
                unoptimized
                alt={feature.art.alt}
                className="h-auto w-full"
                style={{ maxWidth: feature.art.width }}
              />
            </motion.div>
          </div>
        </section>
      ))}

      <section className={SECTION}>
        <div className="w-full max-w-[1400px]">
          <motion.h2 {...onScroll()} className={TITLE} style={TITLE_SIZE}>
            Privacy
          </motion.h2>
          <ul className="mt-8 flex max-w-[60ch] flex-col gap-4">
            {PRIVACY.map((line, i) => (
              <motion.li key={line} {...onScroll(0.06 * i)} className={BODY}>
                {line}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-7 pb-10 pt-16 sm:px-10 sm:pb-12 sm:pt-20 md:px-14 md:pb-14 md:pt-28">
        <div className="w-full max-w-[1400px]">
          <motion.h2 {...onScroll()} className={TITLE} style={TITLE_SIZE}>
            Free for Windows.
          </motion.h2>
          <motion.div {...onScroll(0.08)} className="mt-10 sm:mt-12">
            <Get release={release} />
            <Details release={release} />
          </motion.div>
          <motion.p {...onScroll(0.14)} className={`mt-10 max-w-[52ch] ${BODY}`}>
            Windows may say it doesn&apos;t recognise the app, because it isn&apos;t code-signed yet. Click More info, then Run
            anyway. After that it keeps itself up to date.
          </motion.p>
          <motion.p {...onScroll(0.18)} className={`mt-4 max-w-[52ch] ${BODY}`}>
            I built DesktopBuddy with help from AI, and I&apos;m still adding to it. Bopping along to your music is next.
          </motion.p>

          <motion.div
            {...onScroll(0.22)}
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
