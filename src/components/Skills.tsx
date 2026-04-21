"use client";

import { useRef, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";

/* ── Skill data ── */
type SkillItem = { name: string; desc: string; altDesc?: string };
const EXPLORING: SkillItem[] = [
  { name: "C", desc: "Systems programming \u00b7 memory & performance" },
];
const SKILLS_GROUPS: { label: string; items: SkillItem[] }[] = [
  {
    label: "Frontend",
    items: [
      { name: "HTML", desc: "Semantic markup \u00b7 accessible structure" },
      { name: "CSS", desc: "Styling \u00b7 layout & responsive design" },
      { name: "Next.js", desc: "React framework \u00b7 SSR / App Router" },
      { name: "React", desc: "Component architecture \u00b7 hooks-driven UI" },
      { name: "TypeScript", desc: "Typed JavaScript \u00b7 scalable apps" },
      { name: "Tailwind CSS", desc: "Utility-first styling \u00b7 rapid prototyping" },
      { name: "Vite", desc: "Build tool \u00b7 fast dev server" },
      { name: "Framer Motion", desc: "Animation engine \u00b7 scroll-driven motion" },
    ],
  },
  {
    label: "Backend & Data",
    items: [
      { name: "Node.js", desc: "JS runtime \u00b7 server-side logic" },
      { name: "Express", desc: "HTTP framework \u00b7 REST routing" },
      { name: "PHP", desc: "Server-side scripting \u00b7 web backends" },
      { name: "REST APIs", desc: "Service design \u00b7 endpoint architecture" },
      { name: "SQL", desc: "Relational queries \u00b7 data modelling" },
    ],
  },
  {
    label: "Security",
    items: [
      { name: "Python", desc: "Scripting & automation \u00b7 security tooling", altDesc: "Scripting & automation \u00b7 materia linked" },
      { name: "Networking", desc: "Protocols & fundamentals \u00b7 TCP/IP stack" },
      { name: "Nmap", desc: "Port scanning \u00b7 network discovery" },
      { name: "Wireshark", desc: "Packet analysis \u00b7 network inspection" },
      { name: "Vulnerability Analysis", desc: "Threat identification \u00b7 risk assessment", altDesc: "Threat identification \u00b7 weak point found" },
      { name: "Penetration Testing", desc: "Offensive concepts \u00b7 ethical hacking" },
    ],
  },
  {
    label: "Systems",
    items: [
      { name: "Linux", desc: "Arch-based workflow \u00b7 system-level control" },
      { name: "Windows", desc: "Enterprise environments \u00b7 cross-platform" },
      { name: "Git & GitHub", desc: "Version control \u00b7 collaborative workflows" },
      { name: "Shell / Bash", desc: "Terminal scripting \u00b7 task automation", altDesc: "Terminal scripting \u00b7 command acquired" },
    ],
  },
];

/* ── Pill component ── */
function SkillPill({
  name,
  delay,
  isActive,
  isDimmed,
  onHover,
  onLeave,
}: {
  name: string;
  delay: number;
  isActive: boolean;
  isDimmed: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <motion.div
        className="relative px-5 py-2.5 rounded-full border backdrop-blur-md"
        animate={{
          scale: isActive ? 1.03 : 1,
          y: isActive ? -2 : 0,
          opacity: isDimmed ? 0.48 : 1,
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderColor: isActive ? "rgba(var(--fg-rgb),0.22)" : "rgba(var(--fg-rgb),0.10)",
          backgroundColor: isActive ? "rgba(var(--fg-rgb),0.08)" : "rgba(var(--fg-rgb),0.04)",
          boxShadow: isActive
            ? "0 4px 20px rgba(var(--shadow-rgb),0.3), 0 0 16px rgba(37,99,235,0.10), inset 0 1px 0 rgba(var(--fg-rgb),0.06)"
            : "0 2px 16px rgba(var(--shadow-rgb),0.25), inset 0 1px 0 rgba(var(--fg-rgb),0.04)",
          transition: "border-color 0.25s cubic-bezier(0.16,1,0.3,1), background-color 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <span
          className="text-[13px] font-medium tracking-wide transition-colors duration-300"
          style={{ color: isActive ? "rgba(var(--fg-rgb),0.98)" : "rgba(var(--fg-rgb),0.78)" }}
        >
          {name}
        </span>
      </motion.div>
    </motion.div>
  );
}

/* ── Main Skills section ── */
export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{ name: string; desc: string } | null>(null);

  const onPillHover = useCallback((name: string, desc: string, altDesc?: string) => {
    const useAlt = altDesc && Math.random() < 0.08;
    setHovered({ name, desc: useAlt ? altDesc : desc });
  }, []);
  const onPillLeave = useCallback(() => setHovered(null), []);

  /* Scroll-driven entrance */
  const { scrollYProgress: enterProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start 0.3"],
  });

  /* Scroll-driven exit — fades/blurs as section scrolls away */
  const { scrollYProgress: exitProgress } = useScroll({
    target: sectionRef,
    offset: ["end 0.85", "end 0.35"],
  });

  /* Compose enter + exit into final values */
  const enterOpacity = useTransform(enterProgress, [0, 0.5, 1], [0, 0.7, 1]);
  const exitOpacity = useTransform(exitProgress, [0, 1], [1, 0]);
  const rawOpacity = useTransform(() => enterOpacity.get() * exitOpacity.get());

  const enterY = useTransform(enterProgress, [0, 1], [40, 0]);
  const exitY = useTransform(exitProgress, [0, 1], [0, -30]);
  const rawY = useTransform(() => enterY.get() + exitY.get());

  const enterScale = useTransform(enterProgress, [0, 1], [0.98, 1]);
  const exitScale = useTransform(exitProgress, [0, 1], [1, 0.98]);
  const rawScale = useTransform(() => enterScale.get() * exitScale.get());

  const enterBlur = useTransform(enterProgress, [0, 0.5], [5, 0]);
  const exitBlur = useTransform(exitProgress, [0, 1], [0, 5]);
  const rawBlur = useTransform(() => enterBlur.get() + exitBlur.get());

  const opacity = useSpring(rawOpacity, { stiffness: 60, damping: 20 });
  const scrollY = useSpring(rawY, { stiffness: 60, damping: 20 });
  const scale = useSpring(rawScale, { stiffness: 60, damping: 20 });
  const blur = useSpring(rawBlur, { stiffness: 60, damping: 20 });
  const filterBlur = useMotionTemplate`blur(${blur}px)`;

  let pillIndex = 0;

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative min-h-screen bg-bg flex items-center justify-center"
    >
      {/* Ambient environment */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary ambient orb */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "50vmax",
            height: "50vmax",
            background:
              "radial-gradient(ellipse at center, rgba(37,99,235,0.05) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        {/* Center highlight — subtle depth behind content */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: "70%",
            height: "55%",
            background:
              "radial-gradient(ellipse at center, rgba(var(--fg-rgb),0.015) 0%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 75% 70% at 50% 50%, transparent 20%, rgba(var(--bg-rgb),0.5) 100%)",
          }}
        />
      </div>

      {/* Scroll-transitioned content wrapper */}
      <motion.div
        className="relative z-10 w-full max-w-3xl mx-auto px-6 py-24"
        style={{
          opacity,
          y: scrollY,
          scale,
          filter: filterBlur,
        }}
      >
        {/* Section header */}
        <div className="text-center mb-16">
          <motion.p
            className="text-[11px] font-mono tracking-[0.3em] uppercase text-fg/30 mb-3"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            System
          </motion.p>
          <motion.h2
            className="text-[clamp(1.6rem,4.5vw,3.5rem)] font-bold tracking-[-0.04em] text-fg/95"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          >
            Stack
          </motion.h2>
          <motion.p
            className="mt-4 text-[14px] text-fg/35 max-w-sm mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            Tools and technologies I build with.
          </motion.p>
        </div>

        {/* Skill groups */}
        <div className="space-y-10">
          {SKILLS_GROUPS.map((group) => (
            <div key={group.label}>
              <motion.p
                className="text-[11px] font-mono tracking-[0.22em] uppercase text-fg/35 mb-3.5 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
              >
                {group.label}
              </motion.p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {group.items.map((item) => {
                  const delay = pillIndex * 0.06;
                  pillIndex++;
                  return (
                    <SkillPill
                      key={item.name}
                      name={item.name}
                      delay={delay}
                      isActive={hovered?.name === item.name}
                      isDimmed={hovered !== null && hovered.name !== item.name}
                      onHover={() => onPillHover(item.name, item.desc, item.altDesc)}
                      onLeave={onPillLeave}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Currently exploring — aspirational row, visually distinct */}
        <div className="mt-14 pt-10 border-t border-fg/5">
          <motion.p
            className="text-[11px] font-mono tracking-[0.22em] uppercase text-fg/25 mb-3.5 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            Currently Exploring
          </motion.p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {EXPLORING.map((item, i) => {
              const delay = (pillIndex + i) * 0.06;
              const isActive = hovered?.name === item.name;
              const isDimmed = hovered !== null && !isActive;
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={() => onPillHover(item.name, item.desc)}
                  onMouseLeave={onPillLeave}
                >
                  <motion.div
                    className="relative px-4 py-1.5 rounded-full border border-dashed backdrop-blur-md"
                    animate={{
                      scale: isActive ? 1.03 : 1,
                      opacity: isDimmed ? 0.35 : 0.7,
                    }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      borderColor: isActive ? "rgba(var(--fg-rgb),0.16)" : "rgba(var(--fg-rgb),0.08)",
                      transition: "border-color 0.25s cubic-bezier(0.16,1,0.3,1)",
                    }}
                  >
                    <span className="text-[11px] font-mono tracking-[0.08em] text-fg/55">
                      {item.name}
                    </span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Active detail readout */}
        <div className="mt-14 h-9 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {hovered && (
              <motion.div
                key={hovered.name}
                className="flex items-center gap-4"
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -6, filter: "blur(3px)" }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-[14px] font-medium text-fg/95 tracking-wide">
                  {hovered.name}
                </span>
                <span className="w-5 h-px bg-fg/20" />
                <span className="text-[12px] font-mono text-fg/40 tracking-[0.08em]">
                  {hovered.desc}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Grain */}
    </section>
  );
}
