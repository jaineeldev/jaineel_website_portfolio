// A small file from elsewhere (Blimo's latest.yml on GitHub), kept for an hour so a page doesn't wait on GitHub
// every time someone opens it.
//
// The site runs on Cloudflare without Next's page or data cache (see open-next.config.ts), so `next: { revalidate }`
// alone does nothing there: every visit fetched from GitHub again, and the Blimo page took over a second. This keeps a
// copy in two places: in memory, for as long as the worker stays warm, and in Cloudflare's edge cache, which survives
// between workers. Locally (`next dev`) there's no edge cache, so only the memory copy is used.

const TTL_SECONDS = 3600;

const memory = new Map<string, { text: string; at: number }>();

/** Cloudflare's cache for this site, when running on Cloudflare. */
function edgeCache(): Cache | undefined {
  try {
    return (globalThis as { caches?: CacheStorage & { default?: Cache } }).caches?.default;
  } catch {
    return undefined;
  }
}

/** The body of `url`, from a copy at most an hour old if there is one. Null if it can't be fetched. */
export async function cachedText(url: string): Promise<string | null> {
  const remembered = memory.get(url);
  if (remembered && Date.now() - remembered.at < TTL_SECONDS * 1000) return remembered.text;

  const edge = edgeCache();
  if (edge) {
    try {
      const hit = await edge.match(url);
      if (hit) {
        const text = await hit.text();
        memory.set(url, { text, at: Date.now() });
        return text;
      }
    } catch {
      // A cache that can't be read is the same as an empty one.
    }
  }

  let text: string;
  try {
    // `revalidate` keeps Next treating the page as regenerated hourly, as it did before this cache existed.
    const res = await fetch(url, { next: { revalidate: TTL_SECONDS } });
    if (!res.ok) return null;
    text = await res.text();
  } catch {
    return null;
  }

  memory.set(url, { text, at: Date.now() });
  if (edge) {
    try {
      await edge.put(url, new Response(text, { headers: { "Cache-Control": `public, max-age=${TTL_SECONDS}` } }));
    } catch {
      // Not being able to save a copy only means the next visit fetches again.
    }
  }
  return text;
}
