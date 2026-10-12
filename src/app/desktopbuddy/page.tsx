import type { Metadata } from "next";
import DesktopBuddyPage from "./DesktopBuddyPage";

export const metadata: Metadata = {
  title: "DesktopBuddy",
  description:
    "A tiny creature that lives on your Windows desktop. It watches your cursor, reacts when you play with it, and looks like no one else's. Free.",
  alternates: { canonical: "/desktopbuddy" },
};

// Checked again at most once an hour, so the download button follows new releases on its own.
export const revalidate = 3600;

const RELEASES = "https://github.com/jaineeldev/desktop_buddy/releases/latest";

export type Release = {
  version: string | null;
  download: string;
  sizeMb: number | null;
};

type GitHubRelease = {
  tag_name?: string;
  assets?: { name: string; browser_download_url: string; size: number }[];
};

// The newest installer. The file name carries the version, so it's looked up rather than written in.
async function latestRelease(): Promise<Release> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/jaineeldev/desktop_buddy/releases/latest",
      { headers: { Accept: "application/vnd.github+json" }, next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    const data: GitHubRelease = await res.json();
    const setup = data.assets?.find((asset) => asset.name.endsWith("Setup.exe"));
    return {
      version: data.tag_name?.replace(/^v/, "") ?? null,
      download: setup?.browser_download_url ?? RELEASES,
      sizeMb: setup ? Math.round(setup.size / 1_000_000) : null,
    };
  } catch {
    // GitHub unreachable or rate-limited: the release page always has the installer.
    return { version: null, download: RELEASES, sizeMb: null };
  }
}

export default async function Page() {
  return <DesktopBuddyPage release={await latestRelease()} />;
}
