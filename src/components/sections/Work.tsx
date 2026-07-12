"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

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
  thumbnail: string;
  external?: boolean;
  progress?: {
    percent: number;
    label: string;
  };
};

const PROJECTS: Project[] = [
  {
    index: "01",
    name: "Velo",
    description:
      "Client workflow platform for freelance devs — proposal goes in, project and invoice come out automatically. Auth, client intake, project boards, and Stripe-backed invoicing are shipped; automated proposal-to-project handoff is the last piece before launch.",
    status: "WIP",
    category: "Web",
    range: "Mar 2026 —",
    href: "https://project-velo.vercel.app/",
    tech: ["Next.js", "TypeScript", "Postgres", "Clerk"],
    thumbnail: "/projects/velo.png",
    external: true,
    progress: {
      percent: 80,
      label: "Core workflow live — launching Q3",
    },
  },
  {
    index: "02",
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
    index: "03",
    name: "System Fingerprint Tool",
    description:
      "Python GUI for security recon — multi-threaded scanner covering all 65,535 TCP ports plus common UDP services, host fingerprinting, and one-click CSV export. Threading cuts a full local sweep from minutes down to under 30 seconds.",
    status: "Complete",
    category: "Security",
    range: "2025",
    href: "https://github.com/jaineeldev/system-fingerprint-tool",
    tech: ["Python", "Tkinter", "CSV"],
    thumbnail: "/projects/system-fingerprint-tool.png",
    external: true,
  },
  {
    index: "04",
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
    index: "05",
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
  {
    index: "06",
    name: "DesktopBuddy",
    description:
      "Electron desktop mascot with a live system HUD — CPU, RAM, disk, and network usage refreshed every few seconds, wrapped in a character with actual personality. Core HUD works; on hold while Velo and the Cert IV take priority.",
    status: "Paused",
    category: "Desktop",
    range: "2026",
    href: "https://github.com/jaineeldev/desktop_buddy",
    tech: ["Electron", "TypeScript", "React"],
    thumbnail: "/projects/desktopbuddy.png",
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

function ProjectThumbnail({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden border border-border bg-fg-faint">
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(min-width: 768px) 6rem, (min-width: 640px) 5.5rem, 3.5rem"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="absolute inset-0 flex items-center justify-center px-1">
          <span className="text-center font-mono text-[7px] uppercase leading-tight tracking-[0.1em] text-fg-dim sm:text-[8px] sm:tracking-[0.14em] md:text-[9px]">
            Coming
            <br />
            soon
          </span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="mt-1 flex max-w-[28rem] flex-col gap-1.5">
      <div className="h-[3px] w-full bg-fg-faint">
        <div className="h-full bg-fg-dim" style={{ width: `${percent}%` }} />
      </div>
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fg-dim">
        {label} · {percent}%
      </span>
    </div>
  );
}

function ProjectRow({ project, i }: { project: Project; i: number }) {
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
        className="group relative grid grid-cols-[3.5rem_1.75rem_4.25rem_1fr] items-start gap-x-3 px-1 py-5 transition-colors duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-accent before:opacity-0 before:transition-opacity before:duration-[250ms] before:ease-[cubic-bezier(0.16,1,0.3,1)] before:content-[''] hover:before:opacity-100 sm:grid-cols-[5.5rem_2.75rem_5rem_1fr_auto] sm:gap-x-8 sm:py-6 md:grid-cols-[6rem_3rem_5.5rem_1fr_auto] md:py-7"
      >
        <ProjectThumbnail src={project.thumbnail} alt={`${project.name} preview`} />

        <div className="flex flex-col gap-1 sm:pt-[0.4rem]">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim">
            {project.index}
          </span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-fg-faint">
            {project.range}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 sm:mt-[0.35rem]">
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

        <div className="flex min-w-0 flex-col gap-2">
          <h3
            className="font-display font-semibold leading-[1.15] tracking-[-0.018em] text-fg transition-transform duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[6px]"
            style={{ fontSize: "clamp(1.125rem, 1.7vw, 1.4rem)" }}
          >
            {project.name}
          </h3>

          <p className="max-w-[62ch] text-[14px] leading-[1.55] text-fg-muted sm:text-[15px]">
            {project.description}
          </p>

          {project.progress && <ProgressBar percent={project.progress.percent} label={project.progress.label} />}

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
            <ProjectRow key={p.index} project={p} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
