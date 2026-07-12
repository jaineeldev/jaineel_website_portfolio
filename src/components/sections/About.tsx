"use client";

import { motion } from "framer-motion";

const EASE = [0.16, 1, 0.3, 1] as const;

type Block = {
  label: string;
  body: React.ReactNode;
};

const BLOCKS: Block[] = [
  {
    label: "Right now",
    body: (
      <>
        Finishing my Cert IV in Cybersecurity at TAFE Queensland (Sep 2026).
        Building Velo on the side. Learning C.
      </>
    ),
  },
  {
    label: "Before this",
    body: (
      <>
        Five years at Balmoral State High School — Maths, Physics, Aerospace,
        and Digital Solutions. Picked up web development along the way and
        attempted CCNA, which is where the networking interest started.
      </>
    ),
  },
  {
    label: "Off-the-record",
    body: (
      <>
        AVI30316 remote-pilot licence — drones, visual line of sight. Brisbane
        local. Coffee-funded via{" "}
        <a
          href="https://ko-fi.com/jaineeldev"
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-fg-faint underline-offset-[5px] transition-colors duration-300 hover:text-accent hover:decoration-accent"
        >
          Ko-fi
        </a>{" "}
        if anything here makes you smile.
      </>
    ),
  },
];

type TimelineEntry = {
  range: string;
  org: string;
  detail: string;
};

const TIMELINE: TimelineEntry[] = [
  {
    range: "2027 —",
    org: "QUT",
    detail: "Bachelor of Computer Science (intended)",
  },
  {
    range: "Oct 2025 – Sep 2026",
    org: "TAFE Queensland",
    detail: "Cert IV in Cybersecurity",
  },
  {
    range: "2016 – 2021",
    org: "Balmoral State High School",
    detail: "QCE — Maths, Physics, Aerospace, Digital Solutions",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative bg-bg px-7 py-16 sm:px-10 sm:py-20 md:px-14 md:py-28"
    >
      <div className="mx-auto w-full max-w-[1400px]">
        <motion.h2
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-10 font-display font-extrabold leading-[0.95] tracking-[-0.035em] text-fg sm:mb-14"
          style={{ fontSize: "clamp(1.75rem, 4vw, 3.75rem)" }}
        >
          About
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.0, ease: EASE, delay: 0.08 }}
          className="max-w-[32ch] font-display font-medium tracking-[-0.018em] text-fg"
          style={{ fontSize: "clamp(1.625rem, 3.4vw, 2.625rem)", lineHeight: 1.22 }}
        >
          I&apos;m Jaineel — a cybersecurity student in Brisbane heading toward
          a CS degree at QUT. I build practical projects, mostly across security
          tooling and web, and I learn by shipping them and iterating. The
          portfolio is the receipts.
        </motion.p>

        <div className="mt-20 grid grid-cols-1 gap-x-12 gap-y-12 sm:mt-24 md:grid-cols-3 md:gap-x-16">
          {BLOCKS.map((block, i) => (
            <motion.div
              key={block.label}
              initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
              className="flex flex-col gap-4"
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim">
                {block.label}
              </div>
              <p className="max-w-[44ch] text-[17px] leading-[1.6] text-fg-muted sm:text-[18.5px]">
                {block.body}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mt-20 sm:mt-28"
        >
          <div className="mb-8 font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim sm:mb-10">
            Education
          </div>

          <ul className="flex flex-col">
            {TIMELINE.map((entry, i) => (
              <motion.li
                key={entry.org + entry.range}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.06 }}
              >
                <div className="grid grid-cols-1 gap-y-1.5 px-1 py-5 sm:grid-cols-[10rem_10rem_1fr] sm:gap-x-8 sm:py-6 md:grid-cols-[12rem_12rem_1fr]">
                  <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-fg-dim sm:pt-[0.4rem]">
                    {entry.range}
                  </span>
                  <span className="font-display text-[17px] tracking-[-0.005em] text-fg sm:text-[18px]">
                    {entry.org}
                  </span>
                  <span className="font-display text-[15px] leading-[1.55] text-fg-muted sm:text-[16px]">
                    {entry.detail}
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
