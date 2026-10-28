# Deployment

The site is hosted on Cloudflare only. Pushing to `master` triggers the
Cloudflare build, which deploys it.

## Cloudflare Workers

Cloudflare Pages projects now sit on top of the unified Workers platform.
This project uses the official [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare)
adapter — Cloudflare deprecated the older `@cloudflare/next-on-pages` package.

### What's in the repo

| File | Purpose |
|---|---|
| `wrangler.toml` | Worker config: name `jaineelportfolio`, points at `.open-next/worker.js`, enables `nodejs_compat`. |
| `open-next.config.ts` | OpenNext build config — currently minimal (no R2/KV/D1 bindings). |
| `next.config.ts` | Calls `initOpenNextCloudflareForDev()` so `next dev` exercises the Workers runtime locally. |
| `.dev.vars.example` | Template for local Workers env vars (Spotify creds). Copy to `.dev.vars`. |

### Scripts

```
npm run cf:build     # opennextjs-cloudflare build  →  .open-next/
npm run cf:preview   # build + run via wrangler dev locally
npm run cf:deploy    # build + wrangler deploy to Cloudflare
```

`npm run build` (plain `next build`) is a quick check that the app compiles; it
doesn't produce the Cloudflare bundle.

### Cloudflare dashboard setup

1. **Create a Workers (or Pages) project** named `jaineelportfolio` (it has to match `name` in `wrangler.toml`) and connect the
   repo. Cloudflare will detect the framework, but override the defaults:
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Build output directory:** `.open-next`
   - **Root directory:** project root
2. **Add environment variables.** All three are sensitive — add them as
   **Secrets**, not plain Variables, so they can't be read back from the
   dashboard or CLI after creation. The names must match exactly:

   | Name | Where to get it |
   |---|---|
   | `SPOTIFY_CLIENT_ID` | Spotify developer dashboard → app settings |
   | `SPOTIFY_CLIENT_SECRET` | Spotify developer dashboard → app settings → "View client secret" |
   | `SPOTIFY_REFRESH_TOKEN` | One-time exchange via the authorization-code flow with scope `user-read-currently-playing` |

   These are read in `src/app/api/spotify/now-playing/route.ts`. If any are
   missing, the route returns `{ isPlaying: false }` — the site doesn't crash,
   the "now playing" widget just stays empty.
3. **Trigger a deploy.** The build runs `opennextjs-cloudflare build`, which
   emits `.open-next/worker.js` + `.open-next/assets/`. Wrangler picks up
   `wrangler.toml` and uploads the worker.

### Local Cloudflare testing

```
cp .dev.vars.example .dev.vars
# fill in the three Spotify values
npm run cf:preview
```

This runs the Workers build and serves it via `wrangler dev`, which is the
closest local approximation of production behaviour.

### Migration notes

- The Spotify route uses `Buffer.from(...).toString("base64")`. That's a Node
  API and works because `wrangler.toml` enables the `nodejs_compat` flag.
- No `export const runtime = "edge"` annotations are needed — OpenNext runs
  routes under Node compatibility on Workers.
- `@vercel/analytics` and `@vercel/speed-insights` are still in `layout.tsx`, but
  they only report on Vercel, so on Cloudflare they do nothing. They can be
  removed if you don't plan to host on Vercel again.
