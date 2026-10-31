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
  /** A small cut of the capture for the home list (see scripts/make-thumbs.mjs). Only where a real capture exists. */
  thumb?: { src: string; srcLight?: string };
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
    thumb: { src: "/work/thumbs/blimo-dark.webp", srcLight: "/work/thumbs/blimo-light.webp" },
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
        text: "I designed the architecture. AI coding assistants helped write the code, and it’s still being added to.",
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
    tags: ["Next.js", "Supabase", "Postgres"],
    lead: "Client workflow for Australian freelance devs and agencies: proposals, approvals, milestones, invoicing, PDF export and a client portal in one flow.",
    image: {
      src: "/projects/velo.png",
      width: 1280,
      height: 800,
      alt: "The Velo marketing site",
      caption: "The Velo marketing site.",
    },
    thumb: { src: "/work/thumbs/velo.webp" },
    facts: [
      ["Stack", "Next.js, TypeScript, Supabase (auth and Postgres), Resend, Stripe"],
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
    thumb: { src: "/work/thumbs/hawthorne.webp" },
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
    slug: "irtx",
    name: "Incident Response Exercise",
    kind: "Security",
    status: "Complete",
    meta: "Complete · Aug 2026 · Cert IV group project",
    summary: "Led the red team in a six-person exercise that tested an incident response plan. The blue team caught two of three attacks.",
    tags: ["Red team", "Metasploit", "Incident response"],
    lead: "A six-person incident response exercise for a fictional company, RightPoint, run as three red-versus-blue pairs on an isolated lab network. I led the red team and wrote the playbook for the phishing attack.",
    facts: [
      ["Role", "Red team lead"],
      ["Team", "Six: three red, three blue, with the teacher observing as a purple team"],
      ["Attacks", "Phishing with a reverse TCP payload, a vsftpd 2.3.4 backdoor, a denial of service"],
      ["Lab", "Isolated Kali Linux, Metasploitable 2 and Ubuntu machines"],
      ["Live run", "28 August 2026, inside a two-hour window"],
      ["Measured against", "NIST SP 800-61"],
    ],
    sections: [
      {
        label: "My attack",
        items: [
          "A single phishing email, relayed through the blue team’s mail server, linking to a Linux reverse TCP payload built with msfvenom and served from Kali.",
          "A blue team member playing the target had to click the link, download the file and run it. That opened a Meterpreter session on my listener.",
          "Proof of access was two harmless commands, getuid and sysinfo. The session was closed straight after.",
          "Each step went into an attack log with the message ID, payload hash and timestamps, so the blue team’s logs could be matched against mine afterwards.",
        ],
      },
      {
        label: "A decision I’d defend",
        lead: "No evasion. The payload stayed plain, with no encoders.",
        text: "The exercise measured whether the blue team could detect and respond, not whether I could slip past them. The rules in my playbook also limited us to one attempt, no persistence, no lateral movement and no data theft without approval, and kept every action inside the lab.",
      },
      {
        label: "What happened",
        items: [
          "The blue team caught two of the three attacks. The vsftpd backdoor was spotted within a minute, from traffic on port 6200 and a root shell started by the vsftpd process.",
          "My phishing payload ran at 08:30 and was identified at 08:42. It was contained at 08:58.",
          "The denial of service was not detected.",
          "The blue team caught post-exploitation behaviour, such as the command-and-control connection and the backdoor shells. It did not catch the delivery: the phishing email, or the exploit traffic aimed at the FTP service.",
          "Observers noted the blue team spent more time reading raw logs than using its alerting dashboards.",
        ],
      },
      {
        label: "What I’d change",
        items: [
          "Test the lab before the live run. Static IP addresses made the network fragile, and fixing it cost about 15 minutes of a two-hour window.",
          "Keep the playbooks and the real lab configuration in step, so nobody re-checks basic connectivity on the day.",
          "Pair any firewall change made for an attack with a written teardown step, so cleanup isn’t left to memory.",
          "Practise the communication plan properly. Skipping it in rehearsal forced a full reset of the practice run.",
          "Put more weight on people. One urgent-sounding pretext was enough to get the payload run.",
        ],
      },
      {
        label: "Where it came from",
        text: "A Cert IV in Cybersecurity group assessment. I authored the red team playbook and the reporting templates, and contributed to the project charter and the closure reports. The classmates and the teacher aren’t named here.",
      },
    ],
  },
  {
    slug: "cloud-security-plan",
    name: "Cloud Security Plan",
    kind: "Security",
    status: "Complete",
    meta: "Complete · Cert IV assessment",
    summary: "A security upgrade plan for a fictional coffee franchise’s single-server AWS ordering site, within a AU$200,000 budget.",
    tags: ["AWS", "CloudFormation", "Security design"],
    lead: "A cloud security plan for Rossco’s Coffee, a fictional five-store franchise running its online ordering site on one AWS server: what was wrong, what to build instead, how to move over without downtime, and what to do when something breaks.",
    facts: [
      ["Scenario", "A fictional franchise with five stores and over 800 customers"],
      ["Budget", "AU$200,000"],
      ["Platform", "AWS, deployed with CloudFormation"],
      ["Covers", "Evaluation, upgrade plan, testing and migration, monitoring, cloud incident response"],
      ["Framework", "NIST four-phase incident response model"],
    ],
    sections: [
      {
        label: "What I found",
        items: [
          "One small EC2 instance ran the website, the application and the database. A single point of failure.",
          "Web and SSH access were open to the whole internet, and the site used plain HTTP, so logins and payment details travelled unencrypted.",
          "The database root password was hard-coded in the CloudFormation user-data script.",
          "One shared IAM user, no multi-factor authentication and no least-privilege roles, so nobody was accountable for what was done.",
          "No web application firewall, load balancer, backups, disaster recovery or data loss prevention.",
        ],
      },
      {
        label: "What I proposed",
        items: [
          "Web servers in an Auto Scaling Group across two Availability Zones, behind a load balancer that ends HTTPS.",
          "A web application firewall on the load balancer, aimed at the fake orders the business was seeing, plus a network firewall.",
          "The database in a private subnet, encrypted at rest and in transit, with a standby in the other zone.",
          "Individual IAM roles with multi-factor authentication, and CloudTrail recording every action.",
        ],
      },
      {
        label: "A decision I’d defend",
        lead: "Managed AWS services, in one region.",
        text: "Rossco’s has no security team and a fixed budget, so every control uses a managed service instead of custom tooling. I ruled out a second region as not worth the cost for five stores. Two Availability Zones cover the likelier failure, one instance or one zone going down.",
      },
      {
        label: "Moving over safely",
        text: "A blue-green move inside AWS. The old environment keeps serving customers until the new one has passed testing, and traffic can be switched back if it doesn’t. Development, staging and production use the same CloudFormation templates, so the security settings match at every stage.",
      },
      {
        label: "Where it came from",
        text: "Built for an assessment in my Cert IV in Cybersecurity, against a case study business.",
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
    thumb: { src: "/work/thumbs/fingerprint.webp" },
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
      {
        label: "Where it came from",
        text: "Built for an assessment in my Cert IV in Cybersecurity, so some of its limits come from the assessment’s rules rather than my own tuning.",
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
