"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import Buddy from "@/components/Buddy";
import ThemeToggle from "@/components/ThemeToggle";
import type { Release } from "./page";

const EASE = [0.16, 1, 0.3, 1] as const;
const PAGE_URL = "https://jaineel.dev/blimo";
const GITHUB = "https://github.com/jaineeldev/blimo_app";
const NAME = "Blimo";

const HIDDEN = { opacity: 0, y: 14, filter: "blur(4px)" };
const SHOWN = { opacity: 1, y: 0, filter: "blur(0px)" };

// The page opens in sequence as it loads; everything further down materialises as it scrolls into view.
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
  "group items-center gap-3 border border-transparent bg-fg px-6 py-3.5 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-bg transition duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-accent/30 hover:brightness-110";
// The outlined button, again with no display value (the other platform's download hides on a phone).
const OUTLINE =
  "items-center gap-3 border border-border px-6 py-3.5 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-fg-muted transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--cta-hover-bg)] hover:text-fg";
const SECONDARY = `inline-flex ${OUTLINE}`;
const SECTION = "px-7 py-16 sm:px-10 sm:py-20 md:px-14 md:py-28";
// One column for every section, centred, so the page sits in the middle of a wide screen and every
// section starts on the same edge.
const COLUMN = "mx-auto w-full max-w-[93.75rem]";
// Up to 1920 px wide the page is its usual size; past that everything sized in rem (text, spacing,
// the column, the clips) grows with the screen, so a big monitor gets a bigger page, not an emptier one.
const PAGE_SCALE = "html{font-size:clamp(16px,0.8333vw,22px)}";
const TITLE = "font-display font-extrabold leading-[0.95] tracking-[-0.035em] text-fg";
const TITLE_SIZE = { fontSize: "clamp(1.75rem, 4vw, 3.75rem)" };
const BODY = "text-[0.96875rem] leading-[1.55] text-fg-muted sm:text-[1.0625rem] sm:leading-[1.5]";

/**
 * A looping clip of the real app, recorded at twice the size it's shown (sharp on high-DPI screens),
 * once on each theme's background so it sits on the page with no frame around it.
 * Files: /blimo/<file>-<dark|light>.mp4, with a .webp of the frame it starts on as its poster.
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
      "It has twenty-one moods, from happy and sleepy to shy, proud and dizzy, and it slides from one to the next.",
      "Leave your computer for two minutes and it gets bored. Leave it for five and it dozes off. It wakes up when you come back.",
    ],
    clip: { file: "moods", width: 800, height: 322, show: 960, start: 0, alt: "Sora, the default buddy, in all twenty-one moods, each one breathing and blinking." },
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
      show: 840,
      start: 5,
      alt: "A cursor pets Sora, gives it a belly rub until it falls in love, picks it up so it swings along behind, then shakes it until it's dizzy.",
    },
  },
  {
    title: "Music",
    body: [
      "When music plays, it bops along with little notes floating up. Turn on bop to the beat and it listens for the tempo, so every bop lands in time.",
      "Turn on show what's playing and hovering over it shows the song. Spotify, your browser and most players all count.",
    ],
    clip: {
      file: "music",
      width: 440,
      height: 360,
      show: 780,
      start: 5.5,
      alt: "A little now-playing card switches to playing. Sora smiles, says Ooh, I like this one, and bops along with gold music notes floating up. The cursor hovers over it and two pills appear underneath: the computer's stats, and the song, Veridis Quo by Daft Punk.",
    },
  },
  {
    title: "Movie night",
    body: [
      "When a video plays, it grabs a bucket of popcorn and watches with you, gasping at the good bits.",
      "When a game or video goes full screen, it steps out of the way until you're done.",
      "Music and movie night are on Windows for now.",
    ],
    clip: {
      file: "watching",
      width: 440,
      height: 300,
      show: 780,
      start: 3,
      alt: "Sora watches a night sky in a video window, eating from a striped bucket of popcorn. A shooting star crosses the screen and Sora gasps, Ooh, what happens next?",
    },
  },
  {
    title: "Your PC",
    body: [
      "Hover over it to see how hard your computer is working: the processor, the memory and, on Windows, the graphics card.",
      "When your computer works flat out for a while it gets stressed, and when the memory is nearly full it feels stuffed. It relaxes when things calm down.",
    ],
    clip: {
      file: "stats",
      width: 440,
      height: 330,
      show: 780,
      start: 6,
      alt: "The cursor hovers over Sora and a pill underneath shows CPU, RAM and GPU. The CPU jumps to 97% and Sora looks stressed, saying Your computer's working really hard! Then the memory fills to 94% and it puffs up, stuffed, before relaxing when things calm down.",
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
      show: 780,
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
    "Yes. It needs no admin rights and no special permissions. It reads where your mouse is and how long since you last used your keyboard or mouse, never what you type. It can tell when music or a video is playing, from Windows' own media info. It only listens to the music if you turn on bop to the beat, and only reads the song's name if you turn on show what's playing, and nothing it hears or reads is kept or sent. It doesn't touch your camera, microphone, location, clipboard or files, and the only thing it connects to is GitHub, to check for updates. The code is open source, so anyone can check.",
  ],
  [
    "Why does Windows warn me when I install it?",
    "Windows shows “Windows protected your PC” for apps that aren't code-signed, and signing costs money every year. Click More info, then Run anyway. You only see it once, because after that it updates itself.",
  ],
  ["Will it slow my computer down?", "No. It sits quietly between moments. On my PC it uses about 2% of the processor while idle."],
  [
    "How do I close or hide it?",
    "Right-click your buddy and press Quit Blimo at the bottom of its panel. To hide it for a bit, press Ctrl+Alt+B (Option+Command+B on a Mac), and press it again to bring it back.",
  ],
  ["How do I uninstall it?", "Like any other app. On Windows, open Settings, then Apps, find Blimo and uninstall it. On a Mac, drag it from Applications to the Bin."],
  [
    "Is there a Mac version?",
    "Yes, since 1.2. It isn't signed by Apple yet, so the first time you open it, macOS stops it: open System Settings, then Privacy & Security, and click Open Anyway. On a Mac it lives in the menu bar and tells you when there's a new version rather than updating itself. Music and movie night are Windows only for now. The Mac version is new, so if anything looks off, let me know on GitHub.",
  ],
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

  const src = `/blimo/${clip.file}-${theme}`;
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
      className="mx-auto block h-auto w-full"
      style={{ maxWidth: `${clip.show / 16}rem` }}
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

function Cross({ className = "" }: { className?: string }) {
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
      <path d="M3.5 3.5l7 7" />
      <path d="M10.5 3.5l-7 7" />
    </svg>
  );
}

const noChange = () => () => {};
/** A Mac (not an iPad, which says it's one too), so its download goes first. Windows until the page knows. */
function useOnMac(): boolean {
  return useSyncExternalStore(
    noChange,
    () => /Mac/.test(navigator.userAgent) && navigator.maxTouchPoints < 2,
    () => false,
  );
}

type Platform = "windows" | "mac";

/** A platform's download: where it is, its file's name (when the link is to the file itself) and its size. */
function downloadOf(release: Release, platform: Platform) {
  const { download, sizeMb } = platform === "mac" && release.mac ? release.mac : release;
  const file = download.match(/[^/]+\.(?:exe|dmg)$/)?.[0] ?? null;
  return { download, file, sizeMb };
}

// Three steps from the download to a buddy saying hello. `file` is the installer's name, if it's known.
const STEPS: Record<Platform, (file: string | null) => string[]> = {
  windows: (file) => [
    `Open ${file ?? "the Setup.exe file"} from your downloads.`,
    "If Windows shows “Windows protected your PC”, click More info, then Run anyway. That's only because the installer isn't signed yet.",
    "Follow the installer, and your new buddy wakes up and says hello. From then on, it keeps itself up to date.",
  ],
  mac: (file) => [
    `Open ${file ?? "the .dmg file"} from your downloads and drag Blimo into Applications.`,
    "Open Blimo from Applications. The first time, macOS stops it, because it isn't signed by Apple yet.",
    "Open System Settings, then Privacy & Security, scroll down and click Open Anyway. You only do this once. Your buddy lives in the menu bar.",
  ],
};

/**
 * How to install, for the computer just downloaded for, while the download gets going. A real modal
 * dialog, like the Work section's: focus stays inside, and Esc or a click outside closes it.
 */
function InstallDialog({ platform, release, onClose }: { platform: Platform | null; release: Release; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  // Kept while it animates away, so it doesn't go blank on the way out.
  const [shown, setShown] = useState<Platform>("windows");
  if (platform && platform !== shown) setShown(platform);
  const { download, file, sizeMb } = downloadOf(release, shown);

  useEffect(() => {
    const dialog = ref.current;
    if (!platform || !dialog || dialog.open) return;
    dialog.showModal();
    closeRef.current?.focus();
  }, [platform]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Esc: play the closing animation first, then close for real once it's done.
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none bg-transparent p-0 text-left text-fg backdrop:bg-transparent open:flex open:items-center open:justify-center"
    >
      <AnimatePresence onExitComplete={() => ref.current?.close()}>
        {platform && (
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={onClose}
            className="absolute inset-0 bg-[var(--scrim)]"
          />
        )}
        {platform && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 14, scale: 0.985, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(2px)", transition: { duration: 0.2, ease: EASE } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative w-[min(32rem,calc(100vw-2.5rem))] border border-border-strong bg-bg"
          >
            <div className="flex items-start justify-between gap-6 px-6 pb-7 pt-6 sm:px-8 sm:pt-7">
              <div className="min-w-0">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim">
                  {[release.version && `Blimo v${release.version}`, sizeMb && `${sizeMb} MB`].filter(Boolean).join(" · ")}
                </span>
                <h3
                  id={titleId}
                  className="mt-4 font-display font-extrabold leading-[0.95] tracking-[-0.035em] text-fg"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
                >
                  {shown === "mac" ? "Installing on a Mac" : "Installing on Windows"}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.55] text-fg-muted sm:text-[15px]">Your download has started.</p>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-1 p-2 text-fg-dim outline-none transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-fg focus-visible:text-accent"
              >
                <Cross />
              </button>
            </div>

            <ol>
              {STEPS[shown](file).map((step, i) => (
                <li key={step} className="flex gap-5 border-t border-border px-6 py-5 sm:px-8">
                  <span className="pt-[0.2em] font-mono text-[10.5px] tracking-[0.16em] text-fg-dim">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[14px] leading-[1.55] text-fg-muted sm:text-[15px]">{step}</span>
                </li>
              ))}
            </ol>

            <p className="border-t border-border px-6 py-5 font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim sm:px-8">
              Didn&apos;t start?{" "}
              <a href={download} className="text-fg-muted underline-offset-4 transition-colors duration-300 hover:text-accent hover:underline">
                Download again
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

// Both downloads, yours first and filled in, each opening the steps for that computer as it starts. On
// a phone an installer is no use, so the main button there copies the page's link instead.
function Get({ release, centred = false }: { release: Release; centred?: boolean }) {
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState<Platform | null>(null);
  const onMac = useOnMac();
  // Windows alone until a release has a Mac version.
  const platforms: Platform[] = !release.mac ? ["windows"] : onMac ? ["mac", "windows"] : ["windows", "mac"];
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
    <div className={`flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5 ${centred ? "md:justify-center" : ""}`}>
      {platforms.map((platform, i) => (
        <a
          key={platform}
          href={downloadOf(release, platform).download}
          // The link itself starts the download; the steps open alongside it.
          onClick={() => setInstalling(platform)}
          className={`${i === 0 ? PRIMARY : OUTLINE} hidden sm:inline-flex`}
        >
          <span>{platform === "mac" ? "Download for Mac" : "Download for Windows"}</span>
          {i === 0 && <ArrowRight className="transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />}
        </a>
      ))}
      <button type="button" onClick={copy} className={`${PRIMARY} inline-flex sm:hidden`}>
        <span>{copied ? "Link copied" : "Copy link for your computer"}</span>
      </button>
      <a href={GITHUB} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
        <span>View on GitHub</span>
      </a>
      <InstallDialog platform={installing} release={release} onClose={() => setInstalling(null)} />
    </div>
  );
}

function Details({ release }: { release: Release }) {
  const facts = [
    release.version && `v${release.version}`,
    "Windows 10 and 11",
    release.mac && "macOS, Apple Silicon and Intel",
    "Free and open source",
  ];
  return (
    <>
      <p className="mt-6 font-mono text-[0.65625rem] uppercase tracking-[0.22em] text-fg-dim">{facts.filter(Boolean).join(" · ")}</p>
      <p className={`mt-4 max-w-[42ch] sm:hidden ${BODY}`}>
        Blimo runs on Windows and Mac. Open jaineel.dev/blimo on your computer to get it.
      </p>
    </>
  );
}

export default function BlimoPage({ release }: { release: Release }) {
  const ready = true;
  const reduceMotion = useReducedMotion();
  // Sora starts out of sight past the edge, so it can't watch for itself; the closing section does.
  const endRef = useRef<HTMLElement>(null);
  const endInView = useInView(endRef, { once: true, amount: 0.35 });

  // The name arrives a letter at a time, as the home greeting does, and Sora lands last as its full stop.
  const letterDelay = (i: number) => 0.2 + i * 0.04;
  const soraDelay = letterDelay(NAME.length) + 0.15;

  return (
    <main className="relative flex min-h-svh flex-col overflow-x-clip bg-bg">
      <style>{PAGE_SCALE}</style>
      <motion.header {...opening(ready, 0.05)} className="px-7 pt-6 sm:px-10 sm:pt-8 md:px-14 md:pt-10">
        <div className={`${COLUMN} flex items-center justify-between`}>
          <Link
            href="/"
            className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-fg transition-colors duration-300 hover:text-accent"
            aria-label="Back to jaineel.dev"
          >
            JK.
          </Link>
          <div className="flex items-center gap-7 sm:gap-8">
            <Link
              href="/#work"
              className="font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-fg-muted transition-colors duration-300 hover:text-accent"
            >
              Work
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      <section className="px-7 pb-16 pt-20 sm:px-10 sm:pb-20 sm:pt-24 md:px-14 md:pb-28 md:pt-28">
        <div className={`${COLUMN} md:text-center`}>
          <div className="flex items-end gap-[0.06em] md:justify-center" style={{ fontSize: "clamp(2.75rem, 10vw, 9.5rem)" }}>
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
            className="mt-6 max-w-[42ch] font-display text-[1.05rem] font-medium leading-[1.18] tracking-[-0.018em] text-fg-muted sm:mt-8 sm:max-w-[34ch] md:mx-auto md:text-balance sm:text-[clamp(1.25rem,2.6vw,2rem)]"
          >
            A tiny creature that lives on your desktop. Give it a name and it grows a face of its own.
          </motion.p>

          <motion.div {...opening(ready, soraDelay + 0.25)} className="mt-12 sm:mt-16">
            <Get release={release} centred />
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
              className={`grid ${COLUMN} grid-cols-1 items-center gap-y-10 md:gap-x-16 ${
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
        <div className={COLUMN}>
          <motion.h2 {...onScroll()} className={TITLE} style={TITLE_SIZE}>
            Questions
          </motion.h2>
          <dl className="mt-10 grid grid-cols-1 gap-9 sm:mt-14 sm:gap-10 md:grid-cols-2 md:gap-x-16 xl:grid-cols-3">
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

        <div className={`${COLUMN} md:text-center`}>
          <motion.h2
            initial={{ opacity: 0, y: 80, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.9, ease: EASE }}
            className="font-display font-extrabold leading-[0.98] tracking-[-0.035em] text-fg"
            style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
          >
            Free for Windows and Mac.
          </motion.h2>
          <motion.div {...onScroll(0.3)} className="mt-10 sm:mt-12">
            <Get release={release} centred />
            <Details release={release} />
          </motion.div>
          <motion.p {...onScroll(0.4)} className={`mt-10 max-w-[52ch] md:mx-auto md:text-balance ${BODY}`}>
            I built Blimo (first called DesktopBuddy) with help from AI, and I&apos;m still adding to it.
          </motion.p>

          <motion.div
            {...onScroll(0.45)}
            className="mt-20 flex flex-col gap-4 sm:mt-28 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <Link
              href="/"
              className="group inline-flex items-baseline gap-3 font-mono text-[0.6875rem] uppercase tracking-[0.22em] text-fg-muted transition-colors duration-300 hover:text-accent"
            >
              <span>Back to jaineel.dev</span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <span className="font-mono text-[0.65625rem] uppercase tracking-[0.22em] text-fg-dim">
              © {new Date().getFullYear()} Jaineel Khatri
            </span>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
