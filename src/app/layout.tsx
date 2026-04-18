import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import CustomCursor from "@/components/CustomCursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jaineel.dev"),
  title: {
    default: "Jaineel Khatri — Builder · Brisbane",
    template: "%s · Jaineel Khatri",
  },
  description:
    "Portfolio of Jaineel Khatri — a Brisbane-based student building toward a career in software engineering and security. Full-stack web, systems tooling, and security projects.",
  keywords: [
    "Jaineel Khatri",
    "portfolio",
    "software engineer",
    "web developer",
    "Next.js",
    "React",
    "TypeScript",
    "cybersecurity",
    "Brisbane",
    "Australia",
  ],
  authors: [{ name: "Jaineel Khatri" }],
  creator: "Jaineel Khatri",
  applicationName: "Jaineel Khatri — Portfolio",
  openGraph: {
    title: "Jaineel Khatri — Builder · Brisbane",
    description:
      "Brisbane-based student building toward a career in software engineering and security. Shipping full-stack web, systems tooling, and security projects.",
    url: "https://jaineel.dev",
    siteName: "Jaineel Khatri",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaineel Khatri — Builder · Brisbane",
    description:
      "Brisbane-based student building toward a career in software engineering and security.",
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

export const viewport: Viewport = {
  themeColor: "#050508",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Jaineel Khatri",
  url: "https://jaineel.dev",
  jobTitle: "Software Engineer & Builder",
  description:
    "Brisbane-based student building toward a career in software engineering and security.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Brisbane",
    addressRegion: "QLD",
    addressCountry: "AU",
  },
  sameAs: [
    "https://github.com/jaineeldev",
    "https://www.linkedin.com/in/jaineel-khatri/",
  ],
  knowsAbout: [
    "Software Engineering",
    "Web Development",
    "Cybersecurity",
    "Next.js",
    "React",
    "TypeScript",
    "Python",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} font-sans antialiased bg-bg text-text-primary`}
      >
        <CustomCursor />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}