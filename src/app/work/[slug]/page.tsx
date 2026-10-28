import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ContactLine from "@/components/ContactLine";
import ProjectImage from "@/components/ProjectImage";
import SiteHeader from "@/components/SiteHeader";
import { getProject, projects, type ProjectSection } from "@/content/projects";
import { latestBlimoVersion } from "@/lib/blimo";
import { rise } from "@/lib/rise";

export const revalidate = 3600;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

const LABEL = "mb-4 font-mono text-[11px] font-normal uppercase tracking-[0.14em] text-fg-dim";
const LIST_ROW = "border-b border-border py-2";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.lead,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${project.name} · Jaineel Khatri`, description: project.lead, type: "article" },
  };
}

function Section({ section }: { section: ProjectSection }) {
  return (
    <section className="mt-12 sm:mt-14" aria-label={section.label}>
      <h2 className={LABEL}>{section.label}</h2>
      {"lead" in section && section.lead && (
        <p className="mb-3 max-w-[36em] text-[1.1rem] leading-[1.5] text-fg">{section.lead}</p>
      )}
      {"text" in section && section.text && <p className="max-w-[36em] text-fg-muted">{section.text}</p>}
      {"items" in section && (
        <ul className="max-w-[36em] border-t border-border">
          {section.items.map((item) => (
            <li key={item} className={`${LIST_ROW} text-fg-muted`}>
              {item}
            </li>
          ))}
        </ul>
      )}
      {"releases" in section && (
        <ul className="border-t border-border">
          {section.releases.map((r) => (
            <li
              key={r.text}
              className="flex flex-col gap-0.5 border-b border-border py-2.5 sm:flex-row sm:justify-between sm:gap-4"
            >
              <span className="text-fg">{r.text}</span>
              <span className="whitespace-nowrap pt-[3px] font-mono text-[11px] uppercase tracking-[0.08em] text-fg-dim">
                {r.date}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const version = project.slug === "blimo" ? await latestBlimoVersion() : null;
  const meta = version ? `Live · v${version} · Oct 2026` : project.meta;

  return (
    <main className="mx-auto w-full max-w-[680px] px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-20">
      <SiteHeader />

      <div className="rise" style={rise(1)}>
        <Link
          href="/#work"
          className="link-draw mt-10 inline-flex gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-muted transition-colors duration-300 hover:text-accent sm:mt-16"
        >
          <span aria-hidden>←</span> Work
        </Link>

        <h1 className="mt-9 text-balance font-display text-[clamp(2.2rem,7vw,3.2rem)] font-bold leading-none tracking-[-0.03em] text-fg">
          {project.name}
        </h1>
        <p className="mt-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-fg-dim">{meta}</p>
        <p className="mt-5 max-w-[32em] text-[1.2rem] leading-[1.5] text-fg">{project.lead}</p>
      </div>

      <div className="rise" style={rise(2)}>
        {project.image && <ProjectImage image={project.image} />}
      </div>

      <dl className="mt-8 grid grid-cols-1 gap-x-6 gap-y-3.5 sm:grid-cols-2">
        {project.facts.map(([label, value]) => (
          <div key={label}>
            <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-fg-dim">{label}</dt>
            <dd className="mt-0.5 text-[15px] text-fg">{value}</dd>
          </div>
        ))}
      </dl>

      {project.links && (
        <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          {project.links.map((l) =>
            l.href.startsWith("http") ? (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-draw text-fg-muted transition-colors duration-300 hover:text-accent"
              >
                {l.label} ↗
              </a>
            ) : (
              <Link key={l.href} href={l.href} className="link-draw text-fg-muted transition-colors duration-300 hover:text-accent">
                {l.label} →
              </Link>
            ),
          )}
        </p>
      )}

      {project.sections.map((s) => (
        <Section key={s.label} section={s} />
      ))}

      <section className="mt-16 border-t border-border pt-8 sm:mt-20" aria-label="Contact">
        <ContactLine />
      </section>
    </main>
  );
}
