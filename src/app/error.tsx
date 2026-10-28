"use client";

import Link from "next/link";
import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-[680px] px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
      <SiteHeader />

      <h1 className="mt-16 text-balance font-display text-[clamp(2.2rem,7vw,3.2rem)] font-bold leading-none tracking-[-0.03em] text-fg sm:mt-24">
        Something broke.
      </h1>
      <p className="mt-5 max-w-[32em] text-[1.1rem] leading-[1.5] text-fg-muted">
        Unexpected error on this page. Try again, or head home and take a different path.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.12em] text-fg-dim">ref: {error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-3 font-mono text-[11px] uppercase tracking-[0.14em]">
        <button
          type="button"
          onClick={reset}
          className="link-draw text-fg-muted transition-colors duration-300 hover:text-accent"
        >
          Try again
        </button>
        <Link href="/" className="link-draw text-fg-muted transition-colors duration-300 hover:text-accent">
          Return home →
        </Link>
      </div>
    </main>
  );
}
