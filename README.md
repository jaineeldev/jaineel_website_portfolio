# jaineel.dev

Personal portfolio site, running on Cloudflare Workers.

## tech

- Next.js 16 (App Router), React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Deployed to Cloudflare with OpenNext (`@opennextjs/cloudflare`)

## running locally

```bash
npm install
npm run dev          # Next dev server (webpack)
npm run cf:preview   # the real Cloudflare build, served locally by wrangler
```

Checks: `npm run typecheck` and `npm run lint`.

## where things live

- `src/content/projects.ts`: every project, in the order the home page shows them
- `src/app/work/[slug]`: the project pages
- `src/app/blimo`: Blimo's download page
- `src/app/api/spotify/now-playing`: the "Listening to" line (needs the Spotify secrets in DEPLOYMENT.md)
- `next.config.ts`: security headers, redirects
- `scripts/`: image, thumbnail, OG and résumé generators, and the Spotify token helper

Deployment and secrets are covered in [DEPLOYMENT.md](./DEPLOYMENT.md).
