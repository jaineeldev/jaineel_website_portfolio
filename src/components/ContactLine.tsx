"use client";

import { useRef, useState } from "react";

const EMAIL = "jaineelk.dev@gmail.com";
const RESUME = "/resume/Jaineel_Khatri_Resume.pdf";

const LINK =
  "link-draw font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors duration-300 hover:text-accent";

/** The email as plain text, with a copy button, then the résumé and profile links. */
export default function ContactLine() {
  const emailRef = useRef<HTMLSpanElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Clipboard refused: select the address so a plain Ctrl+C works.
      const el = emailRef.current;
      if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-3">
      <span ref={emailRef} className="basis-full text-fg sm:basis-auto">
        {EMAIL}
      </span>
      <button type="button" onClick={copy} className={LINK} aria-live="polite">
        {copied ? "Copied" : "Copy"}
      </button>
      <a href={RESUME} target="_blank" rel="noopener noreferrer" className={LINK}>
        Résumé
      </a>
      <a href="https://github.com/jaineeldev" target="_blank" rel="noopener noreferrer" className={LINK}>
        GitHub
      </a>
      <a href="https://linkedin.com/in/jaineel-khatri" target="_blank" rel="noopener noreferrer" className={LINK}>
        LinkedIn
      </a>
    </div>
  );
}
