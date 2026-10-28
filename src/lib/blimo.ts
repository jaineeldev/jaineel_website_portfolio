const RELEASES = "https://github.com/jaineeldev/blimo_app/releases/latest";

/**
 * The newest Blimo version, read from the latest.yml every release carries for the app's own updater.
 * It's a plain file download, so it doesn't count against GitHub's API limits, and the site always
 * agrees with what the app updates to. Null if GitHub can't be reached.
 */
export async function latestBlimoVersion(): Promise<string | null> {
  try {
    const res = await fetch(`${RELEASES}/download/latest.yml`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const yml = await res.text();
    return yml.match(/^version:\s*(\S+)/m)?.[1] ?? null;
  } catch {
    return null;
  }
}
