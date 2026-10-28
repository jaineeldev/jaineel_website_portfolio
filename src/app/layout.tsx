import type { Metadata, Viewport } from "next";
import { Funnel_Display, Funnel_Sans, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import MotionProvider from "@/components/MotionProvider";
import "./globals.css";

const funnelDisplay = Funnel_Display({
  variable: "--font-funnel-display",
  subsets: ["latin"],
  display: "swap",
});

const funnelSans = Funnel_Sans({
  variable: "--font-funnel-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const SITE_TITLE = "Jaineel Khatri — Developer & Cybersecurity Student, Brisbane";
const SITE_DESCRIPTION =
  "Jaineel Khatri is a developer and cybersecurity student in Brisbane, Australia. Projects include Blimo, a desktop pet for Windows and Mac, and a client workflow app, Velo. Open to junior security and fullstack roles.";

export const metadata: Metadata = {
  metadataBase: new URL("https://jaineel.dev"),
  title: {
    default: SITE_TITLE,
    template: "%s · Jaineel Khatri",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Jaineel Khatri — Portfolio",
  authors: [{ name: "Jaineel Khatri", url: "https://jaineel.dev" }],
  creator: "Jaineel Khatri",
  publisher: "Jaineel Khatri",
  keywords: [
    "Jaineel Khatri",
    "Jaineel",
    "Khatri",
    "cybersecurity student",
    "software developer",
    "Brisbane",
    "Australia",
    "QUT",
    "TAFE Queensland",
    "Cert IV in Cybersecurity",
    "developer portfolio",
    "Next.js",
    "TypeScript",
    "Electron",
    "Blimo",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "https://jaineel.dev",
    siteName: "Jaineel Khatri",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jaineel Khatri",
  givenName: "Jaineel",
  familyName: "Khatri",
  url: "https://jaineel.dev",
  image: "https://jaineel.dev/opengraph-image",
  jobTitle: "Developer and cybersecurity student",
  description: SITE_DESCRIPTION,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Brisbane",
    addressRegion: "QLD",
    addressCountry: "AU",
  },
  alumniOf: [
    { "@type": "EducationalOrganization", name: "TAFE Queensland", url: "https://tafeqld.edu.au" },
    { "@type": "EducationalOrganization", name: "Balmoral State High School" },
  ],
  knowsAbout: [
    "Cybersecurity",
    "Web development",
    "TypeScript",
    "Next.js",
    "Python",
    "Electron",
  ],
  sameAs: [
    "https://github.com/jaineeldev",
    "https://linkedin.com/in/jaineel-khatri",
    "https://ko-fi.com/jaineeldev",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Jaineel Khatri",
  alternateName: "jaineel.dev",
  url: "https://jaineel.dev",
  inLanguage: "en-AU",
  author: { "@type": "Person", name: "Jaineel Khatri", url: "https://jaineel.dev" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0d1214" },
    { media: "(prefers-color-scheme: light)", color: "#f1f4f3" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeInitScript = `
(function(){try{var p=localStorage.getItem('theme');var s=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';var t=p||s;if(t==='light')document.documentElement.setAttribute('data-theme','light');}catch(e){}})();
`.trim();

const preloaderSkipScript = `
(function(){try{var seen=sessionStorage.getItem('jk_preloader_seen')==='1';var reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;if(seen||reduced||location.pathname!=='/'){document.documentElement.classList.add('jk-skip-preload');if(!seen)sessionStorage.setItem('jk_preloader_seen','1');}}catch(e){}})();
`.trim();

const consoleEggScript = `
(function(){try{if(typeof sessionStorage==='undefined')return;if(sessionStorage.getItem('jk_console')==='1')return;sessionStorage.setItem('jk_console','1');console.log('%cHello.\\n%cA save point lies at /secret.','font:500 12px ui-monospace,monospace;line-height:1.6;','font:11px ui-monospace,monospace;opacity:0.55;line-height:1.6;');}catch(e){}})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${funnelDisplay.variable} ${funnelSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: preloaderSkipScript }} />
        <script dangerouslySetInnerHTML={{ __html: consoleEggScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="bg-bg text-fg antialiased font-sans">
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
