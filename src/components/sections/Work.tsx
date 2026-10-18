"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Buddy from "@/components/Buddy";

const EASE = [0.16, 1, 0.3, 1] as const;

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  LIVE:      { bg: "var(--status-live-bg)",     text: "var(--status-live-text)",     border: "var(--status-live-border)" },
  WIP:       { bg: "var(--status-wip-bg)",      text: "var(--status-wip-text)",      border: "var(--status-wip-border)" },
  COMPLETE:  { bg: "var(--status-complete-bg)", text: "var(--status-complete-text)", border: "var(--status-complete-border)" },
  ACTIVE:    { bg: "var(--status-active-bg)",   text: "var(--status-active-text)",   border: "var(--status-active-border)" },
  COLLAB:    { bg: "var(--status-collab-bg)",   text: "var(--status-collab-text)",   border: "var(--status-collab-border)" },
  PAUSED:    { bg: "var(--status-paused-bg)",   text: "var(--status-paused-text)",   border: "var(--status-paused-border)" },
  "ON HOLD": { bg: "var(--status-paused-bg)",   text: "var(--status-paused-text)",   border: "var(--status-paused-border)" },
};

type Project = {
  index: string;
  name: string;
  description: string;
  status: "Live" | "WIP" | "Complete" | "Active" | "Paused";
  category: "Security" | "Web" | "Desktop";
  range: string;
  href: string;
  tech: string[];
  thumbnail?: string;
  thumbnailFit?: "cover" | "contain";
  external?: boolean;
  note?: string;
  // More than one place to go: clicking the row opens a popup to pick one (href stays the default
  // for ctrl/middle-click and no-JS).
  choices?: Choice[];
  // Sora sits after the name in that popup, as it does on the DesktopBuddy page.
  mascot?: boolean;
};

type Choice = { label: string; detail: string; href: string; external?: boolean };

const PROJECTS: Project[] = [
  {
    index: "01",
    name: "DesktopBuddy",
    description:
      "Windows desktop pet whose face is generated from its name, so the same name always gives the same buddy. Fifteen moods, eyes that follow your cursor, and reactions to being petted, carried, shaken or left alone. Ships as an installer with automatic updates; it needs no admin rights and only contacts GitHub to check for updates.",
    status: "Live",
    category: "Desktop",
    range: "2026 —",
    href: "/desktopbuddy",
    tech: ["Electron", "TypeScript", "React", "Framer Motion"],
    thumbnail: "/projects/desktopbuddy.svg",
    thumbnailFit: "contain",
    note: "Free for Windows 10 and 11",
    choices: [
      { label: "Website", detail: "jaineel.dev/desktopbuddy", href: "/desktopbuddy" },
      {
        label: "GitHub",
        detail: "jaineeldev/desktop_buddy",
        href: "https://github.com/jaineeldev/desktop_buddy",
        external: true,
      },
    ],
    mascot: true,
  },
  {
    index: "02",
    name: "Velo",
    description:
      "Client workflow platform for Australian freelance devs and agencies — proposals, approvals, milestones, invoicing, PDF export, and a client portal in one flow. The marketing site and waitlist are live; the product itself is still being built.",
    status: "WIP",
    category: "Web",
    range: "Mar 2026 —",
    href: "https://project-velo.vercel.app/",
    tech: ["Next.js", "TypeScript", "Postgres", "Clerk"],
    thumbnail: "/projects/velo.png",
    external: true,
    note: "In development — no launch date yet",
  },
  {
    index: "03",
    name: "Hawthorne Corner Store",
    description:
      "Live site for a Brisbane convenience store — digital menu, opening hours, and click-through ordering links, built for an actual owner and actual foot traffic. In production since 2025 and still the store's primary online presence.",
    status: "Live",
    category: "Web",
    range: "2025 —",
    href: "https://hawthornecornerstore.com.au",
    tech: ["Next.js", "Tailwind", "Vercel"],
    thumbnail: "/projects/hawthorne.png",
    external: true,
  },
  {
    index: "04",
    name: "System Fingerprint Tool",
    description:
      "Python GUI for security recon — multi-threaded scanner covering all 65,535 TCP ports plus common UDP services, host fingerprinting, and one-click CSV export. Threading cuts a full local sweep from minutes down to under 30 seconds.",
    status: "Complete",
    category: "Security",
    range: "2025",
    href: "https://github.com/jaineeldev/system-fingerprint-tool",
    tech: ["Python", "Tkinter", "CSV"],
    // No thumbnail on purpose: it's a desktop GUI with no screenshot, so the row shows a monogram.
    external: true,
  },
  {
    index: "05",
    name: "Typosquat / Phishing Domain Detector",
    description:
      "Flags lookalike domains registered to impersonate a brand — generates typosquat candidates via character omission, adjacent-key swaps, insertion, and homoglyph substitution, then scores each 0–100 using WHOIS registration, DNS/MX records, SSL certs, and content similarity. Ships as a CLI, a FastAPI web UI, and a standalone Windows .exe.",
    status: "Complete",
    category: "Security",
    range: "2026",
    href: "https://github.com/jaineeldev/typosquat-detector",
    tech: ["Python", "FastAPI", "dnspython", "WHOIS"],
    thumbnail: "/projects/typosquat-detector.png",
    external: true,
  },
  {
    index: "06",
    name: "Portfolio v2",
    description: "This site. Next.js, Framer Motion, and a deliberate restraint problem.",
    status: "Live",
    category: "Web",
    range: "2026",
    href: "https://jaineel.dev",
    tech: ["Next.js", "Framer Motion", "TypeScript"],
    thumbnail: "/projects/portfolio-v2.png",
    external: true,
  },
];

function ArrowUpRight({ className = "" }: { className?: string }) {
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
      <path d="M3.5 10.5L10.5 3.5" />
      <path d="M5 3.5h5.5V9" />
    </svg>
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

const CHOICE_ROW =
  "group relative flex items-center justify-between gap-6 px-6 py-5 outline-none transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-accent before:opacity-0 before:transition-opacity before:duration-[250ms] before:ease-[cubic-bezier(0.16,1,0.3,1)] before:content-[''] hover:bg-[var(--cta-hover-bg)] hover:before:opacity-100 focus-visible:bg-[var(--cta-hover-bg)] focus-visible:before:opacity-100 sm:px-8";

/**
 * The popup for a project with more than one place to go. It's a real modal dialog: focus stays
 * inside, Esc or a click outside closes it, and focus goes back to the row afterwards.
 */
function ChoiceDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const firstRef = useRef<HTMLAnchorElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!project || !dialog || dialog.open) return;
    dialog.showModal();
    firstRef.current?.focus();
  }, [project]);

  // The page behind stays put while it's open, without hiding the scrollbar (which shifts the page).
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const hold = (e: Event) => e.preventDefault();
    dialog.addEventListener("wheel", hold, { passive: false });
    dialog.addEventListener("touchmove", hold, { passive: false });
    return () => {
      dialog.removeEventListener("wheel", hold);
      dialog.removeEventListener("touchmove", hold);
    };
  }, []);

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
      className="fixed inset-0 m-0 size-full max-h-none max-w-none bg-transparent p-0 text-fg backdrop:bg-transparent open:flex open:items-center open:justify-center"
    >
      <AnimatePresence onExitComplete={() => ref.current?.close()}>
        {project && (
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
        {project?.choices && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 14, scale: 0.985, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 8, scale: 0.99, filter: "blur(2px)", transition: { duration: 0.2, ease: EASE } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative w-[min(30rem,calc(100vw-2.5rem))] border border-border-strong bg-bg"
          >
            <div className="flex items-start justify-between gap-6 px-6 pb-7 pt-6 sm:px-8 sm:pt-7">
              <div className="min-w-0">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim">
                  {project.index} — {project.category}
                </span>
                <h3
                  id={titleId}
                  className="mt-4 flex items-end gap-[0.12em] font-display font-extrabold leading-[0.95] tracking-[-0.035em] text-fg"
                  style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
                >
                  {project.name}
                  {project.mascot && <Buddy className="mb-[0.06em] h-[0.62em] w-[0.62em] shrink-0 cursor-pointer" />}
                </h3>
                <p className="mt-3 text-[14px] leading-[1.55] text-fg-muted sm:text-[15px]">
                  Where would you like to go?
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 -mt-1 p-2 text-fg-dim outline-none transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-fg focus-visible:text-accent"
              >
                <Cross />
              </button>
            </div>

            <ul>
              {project.choices.map((choice, i) => {
                const inner = (
                  <>
                    <span className="flex min-w-0 flex-col gap-1.5 transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[6px] group-focus-visible:translate-x-[6px]">
                      <span className="font-display text-[1.25rem] font-semibold leading-[1.15] tracking-[-0.018em] text-fg">
                        {choice.label}
                      </span>
                      <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
                        {choice.detail}
                      </span>
                    </span>
                    {choice.external ? (
                      <ArrowUpRight className="shrink-0 text-fg-dim transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-accent group-focus-visible:text-accent" />
                    ) : (
                      <ArrowRight className="shrink-0 text-fg-dim transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-accent group-focus-visible:text-accent" />
                    )}
                  </>
                );
                return (
                  <li key={choice.href} className="border-t border-border">
                    {choice.external ? (
                      // Opens in a new tab, so the popup is closed by the time they come back.
                      <a
                        ref={i === 0 ? firstRef : undefined}
                        href={choice.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className={CHOICE_ROW}
                      >
                        {inner}
                      </a>
                    ) : (
                      <Link ref={i === 0 ? firstRef : undefined} href={choice.href} className={CHOICE_ROW}>
                        {inner}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}

function ProjectThumbnail({
  src,
  alt,
  monogram,
  fit = "cover",
}: {
  src?: string;
  alt: string;
  monogram: string;
  fit?: "cover" | "contain";
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className="relative row-span-2 aspect-[4/3] w-full overflow-hidden border border-border bg-fg-faint sm:row-span-1">
      {showImage && src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 6rem, (min-width: 640px) 5.5rem, 3.5rem"
          className={fit === "contain" ? "object-contain p-1.5" : "object-cover"}
          onError={() => setFailed(true)}
        />
      )}
      {!showImage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden
            className="font-mono text-[12px] font-medium uppercase tracking-[0.18em] text-fg-dim sm:text-[14px] md:text-[16px]"
          >
            {monogram}
          </span>
        </div>
      )}
    </div>
  );
}

function ProjectRow({ project, i, onChoose }: { project: Project; i: number; onChoose: (project: Project) => void }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
      className="border-b border-[var(--work-divider)]"
    >
      <a
        href={project.href}
        target={project.external ? "_blank" : undefined}
        rel={project.external ? "noopener noreferrer" : undefined}
        aria-haspopup={project.choices ? "dialog" : undefined}
        onClick={(e) => {
          // A plain click asks where to go; ctrl, shift or middle-click still opens the link itself.
          if (!project.choices || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          onChoose(project);
        }}
        className="group relative grid grid-cols-[3.5rem_1fr] items-start gap-x-4 gap-y-3 px-1 py-5 transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-accent before:opacity-0 before:transition-opacity before:duration-[250ms] before:ease-[cubic-bezier(0.16,1,0.3,1)] before:content-[''] hover:before:opacity-100 sm:grid-cols-[5.5rem_2.75rem_5rem_1fr_auto] sm:gap-x-8 sm:py-6 md:grid-cols-[6rem_3rem_5.5rem_1fr_auto] md:py-7"
      >
        <ProjectThumbnail
          src={project.thumbnail}
          alt={`${project.name} preview`}
          monogram={project.name
            .split(/\s+/)
            .map((word) => word[0])
            .join("")
            .slice(0, 3)}
          fit={project.thumbnailFit}
        />

        <div className="col-start-2 flex flex-row items-baseline gap-x-3 sm:col-start-auto sm:flex-col sm:gap-1 sm:pt-[0.4rem]">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim">
            {project.index}
          </span>
          <span className="whitespace-nowrap font-mono text-[9.5px] uppercase tracking-[0.16em] text-fg-dim">
            {project.range}
          </span>
        </div>

        <div className="col-start-2 flex flex-row flex-wrap gap-1.5 sm:col-start-auto sm:mt-[0.35rem] sm:flex-col">
          {(() => {
            const key = project.status.toUpperCase();
            const s = STATUS_STYLES[key] ?? { bg: "transparent", text: "var(--color-fg-muted)", border: "var(--color-border)" };
            return (
              <span
                className="inline-flex w-fit items-center self-start border px-1.5 py-[2px] font-mono text-[10px] font-medium uppercase tracking-[0.14em]"
                style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
              >
                {key}
              </span>
            );
          })()}
          <span className="inline-flex w-fit items-center self-start border border-border px-1.5 py-[2px] font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-fg-dim">
            {project.category.toUpperCase()}
          </span>
        </div>

        <div className="col-span-2 flex min-w-0 flex-col gap-2 sm:col-span-1">
          <h3
            className="font-display font-semibold leading-[1.15] tracking-[-0.018em] text-fg transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[6px]"
            style={{ fontSize: "clamp(1.125rem, 1.7vw, 1.4rem)" }}
          >
            {project.name}
          </h3>

          <p className="max-w-[62ch] text-[14px] leading-[1.55] text-fg-muted sm:text-[15px]">
            {project.description}
          </p>

          {project.note && (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
              {project.note}
            </span>
          )}

          {project.external && project.href.includes("vercel.app") && (
            <span className="mt-0.5 inline-flex w-fit items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-accent">
              {project.href.replace(/^https?:\/\//, "").replace(/\/$/, "")}
              <ArrowUpRight className="h-[9px] w-[9px]" />
            </span>
          )}

          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fg-dim">
            {project.tech.map((t, idx) => (
              <span key={t} className="flex items-center gap-2.5">
                <span>{t}</span>
                {idx < project.tech.length - 1 && (
                  <span aria-hidden className="text-fg-faint">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <ArrowUpRight className="hidden text-fg-dim transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-accent sm:mt-[0.45rem] sm:block" />
      </a>
    </motion.li>
  );
}

export default function Work() {
  const [choosing, setChoosing] = useState<Project | null>(null);
  return (
    <section
      id="work"
      className="relative bg-bg px-7 pt-10 pb-16 sm:px-10 sm:pt-12 sm:pb-20 md:px-14 md:pt-14 md:pb-28"
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <motion.header
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-12 sm:mb-16"
        >
          <h2
            className="font-display font-extrabold leading-[0.95] tracking-[-0.035em] text-fg"
            style={{ fontSize: "clamp(1.75rem, 4vw, 3.75rem)" }}
          >
            Work
          </h2>
          <p className="mt-5 max-w-[44ch] text-[14.5px] leading-[1.55] text-fg-muted sm:mt-6 sm:text-[15px]">
            Six projects. Some live, some still in progress — across web and security.
          </p>
        </motion.header>

        <ul className="border-t border-[var(--work-divider)]">
          {PROJECTS.map((p, i) => (
            <ProjectRow key={p.index} project={p} i={i} onChoose={setChoosing} />
          ))}
        </ul>
      </div>
      <ChoiceDialog project={choosing} onClose={() => setChoosing(null)} />
    </section>
  );
}
