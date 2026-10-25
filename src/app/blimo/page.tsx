import type { Metadata } from "next";
import BlimoPage from "./BlimoPage";

export const metadata: Metadata = {
  title: "Blimo",
  description:
    "A tiny creature that lives on your desktop, on Windows and Mac. It watches your cursor, reacts when you play with it, bops to your music and looks like no one else's. Free.",
  alternates: { canonical: "/blimo" },
};

// Checked again at most once an hour, so the download button follows new releases on its own.
export const revalidate = 3600;

const REPO = "https://github.com/jaineeldev/blimo_app";
const RELEASES = `${REPO}/releases/latest`;

export type Release = {
  version: string | null;
  download: string;
  sizeMb: number | null;
  /** The Mac download, when the latest release has one. */
  mac: { download: string; sizeMb: number | null } | null;
};

// The newest installer, from the latest.yml every release carries for the app's own updater. It's a
// plain file download, so unlike GitHub's API (60 requests an hour, shared by everyone on a host's
// address) it doesn't run out, and the page always agrees with what the app updates to.
async function latestRelease(): Promise<Release> {
  const mac = await latestMac();
  try {
    const res = await fetch(`${RELEASES}/download/latest.yml`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const yml = await res.text();
    const version = yml.match(/^version:\s*(\S+)/m)?.[1];
    const file = yml.match(/^path:\s*(\S+)/m)?.[1];
    const size = Number(yml.match(/^\s+size:\s*(\d+)/m)?.[1]);
    if (!version || !file) throw new Error("latest.yml has no version or file");
    return {
      version,
      download: `${REPO}/releases/download/v${version}/${file}`,
      sizeMb: size ? Math.round(size / 1_000_000) : null,
      mac,
    };
  } catch {
    // GitHub unreachable: the release page always has the installer.
    return { version: null, download: RELEASES, sizeMb: null, mac };
  }
}

// The Mac download, from the latest-mac.yml a release with a Mac version carries: the .dmg it lists
// (its `path` is the zip, which is for updating). None if the latest release has no Mac version.
async function latestMac(): Promise<Release["mac"]> {
  try {
    const res = await fetch(`${RELEASES}/download/latest-mac.yml`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const yml = await res.text();
    const version = yml.match(/^version:\s*(\S+)/m)?.[1];
    const dmg = yml.split(/^\s*-\s+url:\s*/m).find((entry) => /^\S+\.dmg\s/.test(entry));
    const file = dmg?.match(/^(\S+)/)?.[1];
    const size = Number(dmg?.match(/^\s+size:\s*(\d+)/m)?.[1]);
    if (!version || !file) return null;
    return { download: `${REPO}/releases/download/v${version}/${file}`, sizeMb: size ? Math.round(size / 1_000_000) : null };
  } catch {
    return null;
  }
}

export default async function Page() {
  return <BlimoPage release={await latestRelease()} />;
}
