# Pocket Index

A Pokédex for all 1,025 species with a retro pixel handheld look. It is a static Next.js site: no database, no backend, no login.

- [Design specification](docs/design.md)
- [System architecture](docs/system-architecture.md)

## Development

Requires Node.js 22.12 or later (CI uses Node 24).

```bash
npm install
npm run dev

# once, before running the end-to-end tests
npx playwright install chromium
```

| Script | Purpose |
|---|---|
| `npm run data` | Fetch the pinned sources and regenerate data and sprites |
| `npm run lint` | ESLint |
| `npm run typecheck` | Route types and TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright, after `npm run build`) |
| `npm run build` | Production build |

## Deploying

Import the repository in Vercel with the default Next.js preset. Set `NEXT_PUBLIC_SITE_URL` to the production URL.

## Data

`data/`, `public/data/` and `public/sprites/` are generated from pinned commits of [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi) and [PokeAPI/sprites](https://github.com/PokeAPI/sprites) and committed, so deploying only needs `next build`. To update, change the commit in `scripts/fetch-source.mjs`, run `npm run data`, test and review the diff. Their licence notices are in [`licenses/`](licenses).

## Disclaimer

Unofficial fan project. Pokémon names and images belong to their respective owners. Non-commercial; this notice does not grant permission to use them.
