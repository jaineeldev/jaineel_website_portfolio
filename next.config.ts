import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Short links to share. Kept here so they work on Vercel and on the Cloudflare build alike.
  async redirects() {
    return [
      // The short link from the DesktopBuddy launch story, easy to type on a PC after seeing it on a phone.
      // Temporary (307) rather than permanent, so it's free to point somewhere else later.
      {
        source: "/buddy",
        destination: "/desktopbuddy",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

// Hooks Cloudflare bindings into `next dev` so the Workers runtime can be
// exercised locally. No-op outside of dev — safe to leave in place when
// building for Vercel.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
