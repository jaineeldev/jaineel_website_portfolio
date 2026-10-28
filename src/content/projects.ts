export type ProjectKind = "Software" | "Security";

export type ProjectSection =
  | { label: string; lead?: string; text?: string }
  | { label: string; items: string[] }
  | { label: string; releases: { text: string; date: string }[] };

export type ProjectImage = {
  src: string;
  /** A light-mode version, when the capture has one. */
  srcLight?: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
  /** Wider than a phone can show legibly: scrolls sideways at full size instead of shrinking. */
  scroll?: boolean;
};

export type Project = {
  slug: string;
  name: string;
  kind: ProjectKind;
  /** On the home list, e.g. "Live". Blimo's version is added from the latest release. */
  status: string;
  /** Under the project's title, e.g. "Live · Since 2025". */
  meta: string;
  /** One line on the home list. */
  summary: string;
  tags: string[];
  /** The opening sentence of the project's own page. */
  lead: string;
  image?: ProjectImage;
  facts: [label: string, value: string][];
  links?: { label: string; href: string }[];
  sections: ProjectSection[];
};

/**
 * In the order they appear on the home page: strongest first.
 * Only claims the code, the live site or the release notes back up. See the project repos before changing any.
 */
export const projects: Project[] = [
  {
    slug: "blimo",
    name: "Blimo",
    kind: "Software",
    status: "Live",
    meta: "Live · Oct 2026",
    summary: "A desktop pet for Windows and Mac with 21 moods and a face generated from its name.",
    tags: ["Electron", "TypeScript", "React"],
    lead: "A desktop pet for Windows and Mac whose face is generated from its name, so the same name always gives the same buddy.",
    image: {
      src: "/blimo/moods-dark.webp",
      srcLight: "/blimo/moods-light.webp",
      width: 1600,
      height: 644,
      alt: "All 21 Blimo moods",
      caption: "The 21 moods, from the app.",
      scroll: true,
    },
    facts: [
      ["Platform", "Windows 10 and 11, macOS (Apple Silicon and Intel)"],
      ["Stack", "Electron, React, TypeScript, Framer Motion"],
      ["Moods", "21"],
      ["Cost", "Free"],
    ],
    links: [
      { label: "Download and details", href: "/blimo" },
      { label: "Source", href: "https://github.com/jaineeldev/blimo_app" },
    ],
    sections: [
      {
        label: "What it is",
        lead: "A small creature that sits on top of your windows, follows your cursor and reacts to being petted, carried, shaken or left alone.",
        text: "Twenty-one moods and a customise panel. Only the buddy itself catches mouse clicks.",
      },
      {
        label: "A decision I’d defend",
        lead: "Electron, because the app needs a transparent, click-through, always-on-top window.",
        text: "That window type is the product. The cost is installer size, and I took it on knowing it.",
      },
      {
        label: "Shipping and privacy",
        items: [
          "The Windows installer updates itself from GitHub Releases and needs no admin rights.",
          "Neither build is code-signed. Windows shows “Windows protected your PC” once. macOS needs Open Anyway in Privacy & Security.",
          "On Mac it lives in the menu bar and tells you about updates instead of installing them.",
          "It reads cursor position and idle time, never keystroke content, and contacts GitHub only to check for updates.",
          "Music and movie reactions are Windows-only for now.",
        ],
      },
      {
        label: "How it was built",
        text: "Built with help from AI coding assistants, and still being added to.",
      },
      {
        label: "Releases",
        releases: [
          { text: "v1.2.0 · macOS support, Apple Silicon and Intel", date: "25 Oct" },
          { text: "v1.1.0 · Reacts to music, videos and full-screen activity", date: "18 Oct" },
          { text: "v1.0.1 · Stays on top, Quiet mode, Start with Windows, new icon", date: "14 Oct" },
          { text: "v1.0.0 · First full release", date: "12 Oct" },
          { text: "v0.3.0 · Early access", date: "11 Oct" },
          { text: "v0.2.0 · Early access", date: "10 Oct" },
          { text: "v0.1.0 · First build", date: "9 Oct" },
        ],
      },
    ],
  },
  {
    slug: "velo",
    name: "Velo",
    kind: "Software",
    status: "In development",
    meta: "In development · Started Mar 2026",
    summary: "Client workflow for Australian freelance devs and agencies.",
    tags: ["Next.js", "Postgres", "Clerk"],
    lead: "Client workflow for Australian freelance devs and agencies: proposals, approvals, milestones, invoicing, PDF export and a client portal in one flow.",
    image: {
      src: "/projects/velo.png",
      width: 1280,
      height: 800,
      alt: "The Velo marketing site",
      caption: "The Velo marketing site.",
    },
    facts: [
      ["Stack", "Next.js, TypeScript, Postgres, Clerk"],
      ["Status", "In development"],
      ["Launch", "Not scheduled"],
    ],
    links: [{ label: "Marketing site", href: "https://project-velo.vercel.app/" }],
    sections: [
      {
        label: "What it covers",
        items: ["Proposals and client approvals", "Milestones", "Invoicing and PDF export", "A client portal"],
      },
      {
        label: "Where it stands",
        text: "The marketing site and waitlist are live. The product itself is still being built, and there is no launch date yet.",
      },
    ],
  },
  {
    slug: "hawthorne",
    name: "Hawthorne Corner Store",
    kind: "Software",
    status: "Live",
    meta: "Live · Since 2025",
    summary: "The website for a Brisbane convenience store, in production since 2025.",
    tags: ["React", "Vite", "Tailwind"],
    lead: "The website for a Brisbane convenience store, built for an actual owner and actual foot traffic.",
    image: {
      src: "/projects/hawthorne.png",
      width: 1280,
      height: 800,
      alt: "The Hawthorne Corner Store website",
      caption: "The live site.",
    },
    facts: [
      ["Stack", "React, Vite, Tailwind, Vercel"],
      ["Status", "In production since 2025"],
      ["Client", "A local store, real customers"],
    ],
    links: [{ label: "Live site", href: "https://hawthornecornerstore.com.au" }],
    sections: [
      {
        label: "What it does",
        items: [
          "Opening hours with an open or closed status",
          "Click to call, directions and Google reviews",
          "What is in stock, and in-store services such as dry cleaning drop-off and SodaStream gas exchange",
        ],
      },
      {
        label: "Where it stands",
        text: "In production since 2025 and still the store’s primary online presence.",
      },
    ],
  },
  {
    slug: "fingerprint",
    name: "System Fingerprint Tool",
    kind: "Security",
    status: "Complete",
    meta: "Complete · 2025 · Cert IV assessment",
    summary: "Collects host details and scans all 65,535 TCP ports with 200 threads into a CSV inventory.",
    tags: ["Python", "Tkinter"],
    lead: "A Python GUI that collects a computer’s fingerprint, scans every local TCP port with 200 threads, and appends the results to a CSV inventory.",
    image: {
      src: "/work/system-fingerprint-tool.png",
      width: 980,
      height: 546,
      alt: "The System Fingerprint Tool window",
      caption: "The desktop app.",
    },
    facts: [
      ["Stack", "Python, Tkinter"],
      ["Items", "Eight, seven optional"],
      ["Scans", "All 65,535 TCP ports, local machine"],
      ["Output", "CSV, one new row per save"],
    ],
    links: [{ label: "Source", href: "https://github.com/jaineeldev/system-fingerprint-tool" }],
    sections: [
      {
        label: "What it collects",
        items: [
          "Computer name, IP address and MAC address",
          "Processor model and operating system",
          "System time and internet speed",
          "Active TCP ports",
        ],
      },
      {
        label: "How it works",
        text: "Tick the items you want, run the collection, then Save / Append to add a new row to the inventory CSV. The port scan splits 1 to 65,535 across 200 threads with a 0.15 second timeout per port. The computer name is always included.",
      },
      { label: "Where it came from", text: "Built for an assessment in my Cert IV in Cybersecurity." },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
