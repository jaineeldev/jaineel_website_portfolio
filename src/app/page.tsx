import Link from "next/link";
import ContactLine from "@/components/ContactLine";
import LocalTime from "@/components/LocalTime";
import NowPlaying from "@/components/NowPlaying";
import Preloader from "@/components/Preloader";
import SiteHeader from "@/components/SiteHeader";
import { projects } from "@/content/projects";
import { latestBlimoVersion } from "@/lib/blimo";
import { rise } from "@/lib/rise";

// Rechecked at most once an hour, so Blimo's version follows new releases on its own.
export const revalidate = 3600;

const LABEL = "mb-4 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-fg-dim";
const WHEN = "whitespace-nowrap pt-[3px] font-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim";

const BACKGROUND: { what: string; note?: string; when: string }[] = [
  { what: "Certificate IV in Cyber Security, TAFE Queensland", when: "2025 to 2026" },
  {
    what: "Bachelor of Information Technology, QUT",
    note: "(Computer Science major planned)",
    when: "Planned 2027",
  },
  { what: "Balmoral State High School", when: "2016 to 2021" },
  { what: "Certificate III in Aviation (Remote Pilot)", when: "AVI30316" },
];

export default async function Home() {
  const version = await latestBlimoVersion();
  const minor = version?.split(".").slice(0, 2).join(".");

  return (
    <>
      <Preloader />
      <main className="has-preloader mx-auto w-full max-w-[680px] px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
        <SiteHeader heading />

        <p
          className="rise mt-10 max-w-[34em] text-[1.05rem] leading-[1.5] text-fg sm:mt-16 sm:text-[1.3rem]"
          style={rise(1)}
        >
          I build and ship software, with a growing focus on security.{" "}
          <span className="text-fg-muted">
            I finished a Certificate IV in Cyber Security this year and plan to start a Bachelor of Information Technology at
            QUT in 2027, majoring in Computer Science. Based in Brisbane, open to entry-level IT roles, including security and fullstack.
          </span>
        </p>

        <section className="rise mt-12 sm:mt-[4.5rem]" style={rise(2)} aria-labelledby="now-heading">
          <h2 id="now-heading" className={LABEL}>
            Now
          </h2>
          <p className="max-w-[36em] text-fg-muted">
            {minor ? `Blimo ${minor} is out for Windows and Mac.` : "Blimo is out for Windows and Mac."} Velo is in
            development. Learning C.
          </p>
          {/* Only while something is playing. The height is reserved, so the page doesn't move when it appears. */}
          <div className="mt-3 h-5">
            <NowPlaying />
          </div>
        </section>

        <section id="work" className="rise mt-12 scroll-mt-8 sm:mt-[4.5rem]" style={rise(3)} aria-labelledby="work-heading">
          <h2 id="work-heading" className={LABEL}>
            Work
          </h2>
          <ul className="grid gap-[1.875rem]">
            {projects.map((p) => {
              const status = p.slug === "blimo" && version ? `Live · v${version}` : p.status;
              return (
                <li key={p.slug}>
                  <Link href={`/work/${p.slug}`} className="group block">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="inline-flex items-baseline gap-2">
                        <span className="border-b border-transparent font-semibold text-fg transition-colors duration-300 group-hover:border-accent group-hover:text-accent group-focus-visible:border-accent group-focus-visible:text-accent">
                          {p.name}
                        </span>
                        <span
                          aria-hidden
                          className="-translate-x-1 text-accent opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100"
                        >
                          →
                        </span>
                      </span>
                      <span className="whitespace-nowrap text-right font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-dim">
                        {p.kind} · {status}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-[15px] leading-[1.5] text-fg-muted">{p.summary}</span>
                    <span className="mt-1.5 block font-mono text-[10.5px] uppercase tracking-[0.08em] text-fg-dim">
                      {p.tags.join(" · ")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rise mt-12 sm:mt-[4.5rem]" style={rise(4)} aria-labelledby="background-heading">
          <h2 id="background-heading" className={LABEL}>
            Background
          </h2>
          <ul className="border-t border-border">
            {BACKGROUND.map((row) => (
              <li
                key={row.what}
                className="flex flex-col gap-0.5 border-b border-border py-2.5 sm:flex-row sm:justify-between sm:gap-4"
              >
                <span className="text-fg">
                  {row.what}
                  {row.note && <span className="text-fg-muted"> {row.note}</span>}
                </span>
                <span className={WHEN}>{row.when}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rise mt-12 sm:mt-[4.5rem]" style={rise(5)} aria-labelledby="contact-heading">
          <h2 id="contact-heading" className={LABEL}>
            Contact
          </h2>
          <ContactLine />
          <p className="mt-7 text-sm text-fg-dim">
            <LocalTime />
          </p>
        </section>
      </main>
    </>
  );
}
