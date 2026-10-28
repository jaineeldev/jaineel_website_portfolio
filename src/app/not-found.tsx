import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[680px] px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
      <SiteHeader />

      <h1 className="mt-16 text-balance font-display text-[clamp(2.2rem,7vw,3.2rem)] font-bold leading-none tracking-[-0.03em] text-fg sm:mt-24">
        Lost signal.
      </h1>
      <p className="mt-5 max-w-[32em] text-[1.1rem] leading-[1.5] text-fg-muted">
        This page doesn&apos;t exist, or it moved. Head home and take a different path.
      </p>

      <Link
        href="/"
        className="link-draw mt-8 inline-flex gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors duration-300 hover:text-accent"
      >
        <span aria-hidden>←</span> Return home
      </Link>
    </main>
  );
}
