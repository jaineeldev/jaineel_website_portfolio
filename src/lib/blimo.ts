import { cachedText } from "@/lib/cached-text";

const RELEASES = "https://github.com/jaineeldev/blimo_app/releases/latest";

export type BlimoRelease = {
  version: string;
  /** "Nov 2026", from the release's own date. Null if latest.yml doesn't carry one. */
  month: string | null;
};

/**
 * The newest Blimo release, read from the latest.yml every release carries for the app's own updater.
 * It's a plain file download, so it doesn't count against GitHub's API limits, and the site always
 * agrees with what the app updates to. Null if GitHub can't be reached.
 */
export async function latestBlimoRelease(): Promise<BlimoRelease | null> {
  try {
    const yml = await cachedText(`${RELEASES}/download/latest.yml`);
    if (!yml) return null;
    const version = yml.match(/^version:\s*(\S+)/m)?.[1];
    if (!version) return null;
    const released = new Date(yml.match(/^releaseDate:\s*'?([^'\s]+)/m)?.[1] ?? "");
    const month = Number.isNaN(released.getTime())
      ? null
      : released.toLocaleDateString("en-AU", { month: "short", year: "numeric", timeZone: "Australia/Brisbane" });
    return { version, month };
  } catch {
    return null;
  }
}
