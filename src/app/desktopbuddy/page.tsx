import type { Metadata } from "next";
import DesktopBuddyPage from "./DesktopBuddyPage";

export const metadata: Metadata = {
  title: "DesktopBuddy",
  description:
    "A tiny creature that lives on your Windows desktop. It watches your cursor, reacts when you play with it, bops to your music and looks like no one else's. Free.",
  alternates: { canonical: "/desktopbuddy" },
};

// Checked again at most once an hour, so the download button follows new releases on its own.
export const revalidate = 3600;

const REPO = "https://github.com/jaineeldev/desktop_buddy";
const RELEASES = `${REPO}/releases/latest`;

export type Release = {
  version: string | null;
  download: string;
  sizeMb: number | null;
};

// The newest installer, from the latest.yml every release carries for the app's own updater. It's a
// plain file download, so unlike GitHub's API (60 requests an hour, shared by everyone on a host's
// address) it doesn't run out, and the page always agrees with what the app updates to.
async function latestRelease(): Promise<Release> {
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
    };
  } catch {
    // GitHub unreachable: the release page always has the installer.
    return { version: null, download: RELEASES, sizeMb: null };
  }
}

export default async function Page() {
  return <DesktopBuddyPage release={await latestRelease()} />;
}
