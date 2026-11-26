# Pocket Index

A Pokédex for all 1,025 species with a retro pixel handheld look. It is a static Next.js site: no database, no backend, no login.

- [Design specification](docs/design.md)
- [System architecture](docs/system-architecture.md)

## Development

Requires Node.js 22.12 or later (CI uses Node 24).

```bash
npm install
npm run dev
```

| Script | Purpose |
|---|---|
| `npm run lint` | ESLint |
| `npm run typecheck` | Route types and TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run test:e2e` | End-to-end tests (Playwright, after `npm run build`) |
| `npm run build` | Production build |

## Disclaimer

Unofficial fan project. Pokémon names and images belong to their respective owners. Non-commercial; this notice does not grant permission to use them.
