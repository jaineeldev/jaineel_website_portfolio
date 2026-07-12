"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;
const EMAIL = "jaineelk.dev@gmail.com";

const LINKS = [
  { label: "GitHub", href: "https://github.com/jaineeldev" },
  { label: "LinkedIn", href: "https://linkedin.com/in/jaineel-khatri" },
];

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        aria-hidden
      >
        <path d="M3 7.5L6 10.5L11 4.5" />
      </svg>
    );
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="square"
      aria-hidden
    >
      <rect x="4" y="4" width="7" height="7" />
      <path d="M3 10V3h7" />
    </svg>
  );
}

export default function Contact() {
  const [copied, setCopied] = useState(false);

  function copyEmail(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(EMAIL).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <section
      id="contact"
      className="relative bg-bg px-7 pt-16 pb-10 sm:px-10 sm:pt-20 sm:pb-12 md:px-14 md:pt-28 md:pb-14"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.h2
          initial={{ opacity: 0, y: 80, filter: "blur(10px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.9, ease: EASE, delay: 0.05 }}
          className="font-display font-extrabold leading-[0.98] tracking-[-0.05em] text-fg"
          style={{ fontSize: "clamp(1.5rem, 5vw, 5.25rem)" }}
        >
          Open to junior security and fullstack roles. Reach out.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="mt-8 max-w-[48ch] text-[15.5px] leading-[1.55] text-fg-muted sm:mt-10 sm:text-[17px] sm:leading-[1.5]"
        >
          Email is the fastest way. Brisbane local — happy to talk remote, hybrid,
          or in-person.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.25 }}
          className="mt-12 flex flex-wrap items-center gap-x-5 gap-y-3 sm:mt-14"
        >
          <a
            href={`mailto:${EMAIL}`}
            className="group inline-flex items-baseline gap-3 font-display font-extrabold tracking-[-0.02em] text-fg"
            style={{ fontSize: "clamp(1.625rem, 3.75vw, 2.75rem)" }}
          >
            <span className="border-b border-fg-faint pb-1 transition-colors duration-500 group-hover:border-accent">
              {EMAIL}
            </span>
          </a>

          <button
            type="button"
            onClick={copyEmail}
            aria-label={copied ? "Email copied" : "Copy email to clipboard"}
            className="inline-flex items-center gap-2 self-center font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim transition-colors duration-300 hover:text-accent"
          >
            <CopyIcon copied={copied} />
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.22em] sm:mt-20 sm:gap-x-10"
        >
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-fg-muted transition-colors duration-300 hover:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </motion.ul>

        <motion.div
          initial={{ opacity: 0, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.55 }}
          className="mt-28 flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.22em] sm:mt-36"
        >
          <span className="text-fg-muted">Brisbane, AU · Available for work · {new Date().getFullYear()}</span>
          <span className="text-fg-dim">© Jaineel Khatri</span>
        </motion.div>
      </div>
    </section>
  );
}
