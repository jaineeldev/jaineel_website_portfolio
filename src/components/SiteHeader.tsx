import Link from "next/link";
import Buddy from "@/components/Buddy";
import ThemeToggle from "@/components/ThemeToggle";

const NAME =
  "block font-display text-[22px] font-bold leading-[1.1] tracking-[-0.02em] text-fg sm:text-2xl";

/**
 * Name and role on the left, with the mascot as the logo mark. Links home from every page.
 * `heading` makes the name the page's <h1>; the home page sets it, and project pages keep their own title as the <h1>.
 */
export default function SiteHeader({ heading = false }: { heading?: boolean }) {
  return (
    // Named so the page fade (globals.css) leaves it in place while the content changes beneath it.
    <header className="flex items-center justify-between gap-4" style={{ viewTransitionName: "site-header" }}>
      <Link href="/" aria-label="Jaineel Khatri, home" className="flex items-center gap-3.5">
        <Buddy className="h-[38px] w-[38px] flex-none" />
        <div>
          {heading ? <h1 className={NAME}>Jaineel Khatri</h1> : <span className={NAME}>Jaineel Khatri</span>}
          <span className="block text-sm text-fg-muted sm:text-[15px]">Student · Developer · Cybersecurity</span>
        </div>
      </Link>
      <ThemeToggle />
    </header>
  );
}
