"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type Row = {
  category: string;
  items: string[];
  learning?: boolean;
};

const ROWS: Row[] = [
  {
    category: "Frontend",
    items: ["TypeScript", "React", "Next.js", "Tailwind CSS", "Framer Motion"],
  },
  {
    category: "Backend & data",
    items: ["Node", "Python", "CSV / JSON pipelines", "REST"],
  },
  {
    category: "Security",
    items: [
      "Network security",
      "Threat detection",
      "Vulnerability assessment",
      "Pen testing fundamentals",
      "Log analysis",
    ],
  },
  {
    category: "Systems",
    items: ["Python", "Bash", "C", "Electron"],
  },
  {
    category: "Tools",
    items: ["Git / GitHub", "Vercel", "VS Code"],
  },
  {
    category: "Currently learning",
    items: ["C", "Electron app architecture"],
    learning: true,
  },
];

function Pill({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-[4px] border font-mono text-[12px] uppercase tracking-[0.1em]"
      style={{
        padding: "8px 14px",
        backgroundColor: accent ? "rgba(59, 130, 246, 0.08)" : "var(--pill-bg)",
        borderColor: accent ? "rgba(59, 130, 246, 0.25)" : "var(--pill-border)",
        color: accent ? "#3B82F6" : "var(--color-fg)",
      }}
    >
      {label}
    </span>
  );
}

function StackRow({ row, i, isLast }: { row: Row; i: number; isLast: boolean }) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
      className={isLast ? "" : "border-b border-border"}
    >
      <div className="grid grid-cols-1 gap-y-5 py-8 md:grid-cols-[20rem_1fr] md:gap-x-12 md:py-10">
        <h3
          className="font-display font-bold leading-[1] tracking-[-0.02em]"
          style={{
            fontSize: "32px",
            color: row.learning ? "#3B82F6" : "var(--color-fg)",
          }}
        >
          {row.category}
        </h3>

        <div className="flex flex-wrap items-start gap-2.5">
          {row.items.map((item) => (
            <Pill key={item} label={item} accent={row.learning} />
          ))}
        </div>
      </div>
    </motion.li>
  );
}

export default function Stack() {
  return (
    <section
      id="stack"
      className="relative bg-bg px-7 pt-16 pb-16 sm:px-10 sm:pt-20 md:px-14 md:pt-28"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.header
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-8 sm:mb-11"
        >
          <h2
            className="font-display font-extrabold leading-[0.95] tracking-[-0.035em] text-fg"
            style={{ fontSize: "clamp(1.75rem, 4vw, 3.75rem)" }}
          >
            Stack
          </h2>
          <p className="mt-5 max-w-[44ch] text-[14.5px] leading-[1.55] text-fg-muted sm:mt-6 sm:text-[15px]">
            What I reach for. No proficiency bars — the work itself is the claim.
          </p>
        </motion.header>

        <ul className="flex flex-col">
          {ROWS.map((row, i) => (
            <StackRow
              key={row.category}
              row={row}
              i={i}
              isLast={i === ROWS.length - 1}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
