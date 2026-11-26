# Pocket Index: System Architecture

How the website is built and how it works. The visual design is in `design.md`.
Facts about versions, limits and data were checked on 26 November 2026.

## 1. Summary
A **static website**: data is converted before deployment, pages are prerendered at build time, and search and filters run in the browser. There is no database, custom backend or login.

```
PokéAPI CSVs + sprites (pinned commit)
        │  npm run data   (run on your computer)
        ▼
data/  + public/data/ + public/sprites/   (committed to Git)
        │  git push
        ▼
Vercel runs next build → static pages → CDN → browser
                                              └─ search, filters, tabs, shiny
```

The site makes no calls to PokéAPI while visitors use it.

## 2. Stack
| Need | Choice | Why |
|---|---|---|
| Framework | Next.js 16, App Router | Prerendered pages, routing, simple Vercel deployment |
| UI | React 19 | Reusable components |
| Language | TypeScript | Catches data shape mistakes |
| Styling | CSS Modules + CSS variables | Suits the custom borders and shadows in the design |
| State | React state + URL query | No state library needed |
| Data script | Node.js with `csv-parse` | One language across the project |
| Validation | Zod | Stops bad data before deployment |
| Tests | Vitest; Playwright | Logic tests and main page flows |
| Fonts | `next/font/google` | Press Start 2P; VT323 for long text |
| Hosting | Vercel | Git-based deployment and previews |

**Why Next.js instead of Vite:** Vite would also work. Next.js is the better fit here because each Pokémon gets its own prerendered page with its own title and preview metadata.

**Versions:** latest on npm when checked: `next` 16.4.6, `react` 19.3.1, `csv-parse` 7.0.3, `zod` 4.6.7, `vitest` 5.1.2. Next.js requires Node.js 20.9.0 or later. Use a currently supported LTS release that Vercel offers. Keep the TypeScript version that `create-next-app` installs; do not upgrade it separately without checking compatibility. Commit `package-lock.json`.

## 3. Routes
| URL | Page | Rendering |
|---|---|---|
| `/` | Browse | Prerendered; filtering in the browser |
| `/pokemon/[slug]` | Detail, for example `/pokemon/charizard` | 1,025 prerendered pages |
| `/about` | Credits and disclaimer | Static |
| unknown | Retro "not found" screen | `not-found.tsx` |

Browse state lives in the URL: `/?q=char&type=fire&gen=1&sort=number&page=1`. Results can be shared and survive refresh and Back.
Detail tab: `?tab=info|moves|forms`.

```tsx
export const dynamicParams = false; // unknown slugs return 404

export function generateStaticParams() {
  return getIndex().map(({ slug }) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pokemon = await getPokemon(slug);
  return <PokemonDetail pokemon={pokemon} />;
}
```

Leave Cache Components disabled, because `dynamicParams` is not available with it. Do not set `output: 'export'`; Vercel can serve the prerendered Next.js app as is.

Components that call `useSearchParams` must be Client Components inside a `<Suspense>` boundary. Give the browse fallback useful content, such as the first page of the list. Read the detail tab only inside the tabs component so the rest of the page stays prerendered.

## 4. Folder structure
```
pocket-index/
├─ docs/                    design.md, system-architecture.md
├─ scripts/
│  ├─ fetch-source.mjs      download pinned sources into .cache/
│  ├─ build-data.mjs        CSV → JSON, copy sprites
│  └─ lib/                  parsing, evolution, matchup logic
├─ data/                    generated, read on the server
│  ├─ index.json
│  └─ pokemon/{slug}.json
├─ public/
│  ├─ data/moves/{id}.json  generated, loaded on demand
│  └─ sprites/              {id}.png and shiny/{id}.png
├─ src/
│  ├─ app/                  layout, page, about, not-found, pokemon/[slug]
│  ├─ components/
│  │  ├─ device/            DeviceShell, LcdScreen, TitleBar, ControlDeck
│  │  ├─ browse/            SearchInput, FilterPanel, PokemonRow, Preview
│  │  ├─ detail/            Tabs, StatBar, TypeMatchups, Evolution, Moves, Forms
│  │  └─ ui/                PixelButton, TypeBadge, SpriteStage, DialogBox
│  ├─ lib/                  data.ts, filter.ts, types.ts
│  └─ styles/tokens.css
├─ tests/
└─ .cache/                  downloaded sources (gitignored)
```

## 5. Data pipeline

### Pinned sources
| Repository | Commit checked |
|---|---|
| [PokeAPI/pokeapi](https://github.com/PokeAPI/pokeapi), `data/v2/csv` | `de6760be38b60a3024f1d9054330ff265f0dc619` |
| [PokeAPI/sprites](https://github.com/PokeAPI/sprites) | `c0542f7c51215d9672439012838c99f520596cbd` |

Use sparse, shallow Git checkouts. Fetch these exact commits, and download only the needed folders. To update, change the commit, regenerate, test and review the diff.

**Commit the generated output.** Vercel then needs only `next build`, and an upstream change cannot silently alter your site.

### Steps
1. Parse CSVs and build lookup maps by ID. Do not rescan large files for each Pokémon.
2. Use English names (`local_language_id = 9`).
3. Join data using the rules below.
4. Validate with Zod. Fail on missing required data.
5. Write JSON and copy sprites.

### Output shapes
```ts
type TypeName = 'normal' | 'fire' | 'water' | 'grass' | 'electric' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

interface IndexEntry {
  id: number; slug: string; name: string; gen: number;
  types: TypeName[]; total: number;
  heightM: number; weightKg: number;     // used by the preview screen
}

interface Pokemon extends IndexEntry {
  genus: string;
  description: string;
  stats: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number };
  abilities: { name: string; hidden: boolean }[];
  matchups: Partial<Record<TypeName, number>>; // omit 1x
  evolution: EvoNode;
  forms: { slug: string; name: string; types: TypeName[] }[];
  prevSlug: string | null;
  nextSlug: string | null;
}

interface EvoNode {
  id: number; slug: string; name: string;
  methods: string[];          // how this node is reached; empty for the root
  next: EvoNode[];            // a tree, so branches work
}

interface Move {
  name: string; type: TypeName; category: string;
  power: number | null; accuracy: number | null; pp: number | null;
  method: string; level: number | null;
}

interface MoveFile { versionGroup: string; moves: Move[] }
```

A test build of `id, slug, name, gen, types, total` for 1,025 species was **91 KB, or 17 KB gzipped**. Adding height and weight will make it somewhat larger.

### Join rules
| Topic | Rule |
|---|---|
| Default Pokémon | Use the `pokemon` row with `is_default`; match by `species_id` |
| Units | Height ÷ 10 = metres; weight ÷ 10 = kg |
| Types | Order by `slot`; show only the 18 standard types. The source also has `stellar`, `unknown` and `shadow` |
| Generation | `pokemon_species.generation_id` |
| Description | `pokemon_species_flavor_text`, language 9. Pick by an explicit version priority. Replace line breaks, form feeds and extra spaces; check soft hyphens |
| Abilities | Join `abilities` and `ability_names`; keep `is_hidden` |
| Previous/next | National number order |
| Forms | All `pokemon` rows with the same species, joined to `pokemon_forms`. Some cosmetic forms share one `pokemon` row |

### Type matchups
For each attacking type, multiply `damage_factor / 100` across the defending Pokémon's types in `type_efficacy`. Start at 1. These are current-table type multipliers; abilities and items are not included.

A test for Fire/Flying gave Rock 4×, Water and Electric 2×, and Ground 0×, matching the mockup.

### Evolution
1. Group species by `evolution_chain_id`.
2. Build the tree from `evolves_from_species_id`.
3. Add conditions from `pokemon_evolution`, using `evolution_triggers` and the item, move, location and type tables.
4. Prefer rows marked `is_default`. In the checked data, 484 species have evolution rows, all have a default, and **48 have more than one default row**. Keep all distinct methods; do not take only the first.
5. Format every populated condition. For a condition the formatter does not support, fail the build so it is not silently lost.
6. Check regional-form columns separately so a regional method is not shown as the standard one.

Test with Charmander (linear), Eevee (many branches), Wurmple (split), Tyrogue (stat conditions) and a species with no evolution.

### Moves
`pokemon_moves` had 665,810 rows, so keep moves out of the index and detail JSON. Write one file per species and fetch it when the Moves tab opens.

Species have **different latest version groups**. Some latest records are from `legends-za` or `champions`. Proposed rule for each species:
1. Choose one Scarlet/Violet group that has data, in this order: `scarlet-violet`, `the-teal-mask`, `the-indigo-disk`. First inspect whether the expansion groups contain only additions; if so, merge them and remove duplicates.
2. Otherwise use the latest main-series group with data, by `version_groups.order`, excluding `legends-za` and `champions`.
3. If none exists, review those two groups as an explicit fallback.
4. Show the source group in the UI.

Move values come from the current `moves` table and may differ from the values in an older game. Say so on the Moves screen.

## 6. Sprites
**Host the sprites with your site** instead of linking to GitHub. This replaces the GitHub URLs in `design.md` section 6.

| Set | Files | Size |
|---|---|---|
| Default | 1,025 | 1.09 MB |
| Shiny | 1,025 | 1.05 MB |

Both sets are complete for species numbers 1–1025 at the pinned commit. The sizes are totals of the file contents.

- Paths: `/sprites/{id}.png`, `/sprites/shiny/{id}.png`
- Use a plain `<img>` with width, height, `alt` and `image-rendering: pixelated`. The files are tiny, so Vercel image optimization adds no needed benefit here.
- Lazy-load list sprites. Load shiny sprites only when requested.
- Alternate-form sprites are unchecked. Show a placeholder when one is missing.
- Hosting copies is redistribution. See section 12.

## 7. How it works at runtime

### Browse
1. The server component reads `data/index.json`.
2. It passes the entries to a client component, so they are included in the page payload.
3. The component reads filters from the URL.
4. Pure function: `index → search → type → generation → sort → paginate`.
5. Show 30 rows per page.
6. Selecting a row updates the preview. "Open" goes to the detail page.

Search ignores case and accents. It matches names, and numbers with or without `#` or leading zeros. Changing a filter resets to page 1. Use `router.replace` for typing and filters, with `{ scroll: false }`; use `push` for page changes. Invalid query values fall back to defaults. With one type selected, either type slot may match.

Sort options: number, name, stat total. Use number as the tie-breaker.

### Detail
1. The page is built from one Pokémon JSON file.
2. Client components handle tabs and the shiny toggle.
3. Opening Moves fetches `/data/moves/{id}.json`. Show loading, error with retry, and empty states.
4. Links go to previous, next and evolution entries.

Keep server file reads in `src/lib/data.ts` and mark it server-only. Never import all detail files into client code.

### Controls
Keyboard behaviour follows `design.md`. A, B and the D-pad call the same actions as normal buttons. Do not capture arrow keys while a user is typing.

## 8. Styling
- Put design tokens in `styles/tokens.css`.
- One CSS Module per component.
- Pass type colours through a `data-type` attribute.
- Draw scenes as inline SVG or CSS.
- Server Components by default; add `"use client"` only for interaction.
- Load Press Start 2P and VT323 with `next/font/google`, which serves the font files with your site.

## 9. Performance, SEO and accessibility
**Targets (not yet measured):** on mobile, LCP under 2.5s, CLS under 0.1, INP under 200ms.

- `generateMetadata` gives each detail page a title and description.
- Add `sitemap.ts` and `robots.ts`.
- Set `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- Disable automatic prefetch on long lists (`prefetch={false}`).
- Give sprites fixed dimensions to avoid layout shift.
- Follow the accessibility section in `design.md`.

## 10. Testing
| Level | Checks |
|---|---|
| Data | 1,025 entries; unique IDs and slugs; types, stats and default sprites present |
| Unit | Search, filters, sort, pagination, matchups, evolution formatting, move version choice |
| End to end | Search → open → shiny → Moves → evolution → Back; unknown slug gives 404; mobile width has no horizontal scrolling |
| Before release | `npm run lint`, type check, tests, `npm run build` |

Spot-check a sample of values against another reference. A complete file does not prove every value is correct.

```json
"scripts": {
  "data:fetch": "node scripts/fetch-source.mjs",
  "data": "npm run data:fetch && node scripts/build-data.mjs",
  "dev": "next dev",
  "build": "next build",
  "typecheck": "next typegen && tsc --noEmit",
  "test": "vitest run",
  "test:e2e": "playwright test"
}
```
Keep the lint script that your project setup creates. If it creates none, add ESLint.

## 11. Deploying to Vercel
1. Push the project to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Keep the detected **Next.js** preset and default build settings.
4. Add `NEXT_PUBLIC_SITE_URL` with your production URL. If you do not know it yet, deploy, add it and redeploy. No secrets are needed.
5. Deploy. Test the preview and production pages.

With Git integration, pushes to other branches create preview deployments and pushes to the production branch (usually `main`) update production. Use Vercel's rollback feature if a release breaks.

Add a GitHub Actions workflow to run lint, type check, tests and build on pull requests. A failed check does not by itself stop Vercel from deploying, so protect `main` and require the check before merging.

### Hobby plan
| Item | Published guideline |
|---|---|
| Use | Non-commercial, personal only |
| Fast Data Transfer | First 100 GB per month |
| Fast Origin Transfer | First 10 GB per month |
| Function invocations | First 1,000,000 per month |

Limits can change: check [Vercel's fair use guidelines](https://vercel.com/docs/limits/fair-use-guidelines) before launch. This design needs no custom server functions. Actual usage depends on traffic and has not been estimated.

## 12. Security and legal
- No accounts, user data or secrets are required.
- React escapes text by default; do not render data with `dangerouslySetInnerHTML`.
- Validate URL parameters against allowed values.
- Keep dependencies updated and review `npm audit`.
- Footer: "Unofficial fan project. Pokémon names and images belong to their respective owners."
- No ads, payments or donations in this version.
- Include the source repositories' licence notices and credits. A code or repository licence does **not** necessarily cover Nintendo / Game Freak / The Pokémon Company images and names.
- A disclaimer and non-commercial use do not grant permission. A public site that hosts these assets can face a takedown request.

## 13. Build plan
| Phase | Work | Done when |
|---|---|---|
| 0 | Create project, tokens, fonts; deploy a placeholder | It opens on Vercel |
| 1 | Data scripts, validation, sprites | 1,025 entries pass |
| 2 | Shared device and UI components | They match the design |
| 3 | Browse, search, filters, pagination | URL state works |
| 4 | Detail, stats, matchups, shiny | All 1,025 pages build |
| 5 | Evolution tree | Test cases pass |
| 6 | Moves and Forms (design first) | Version rule and fallbacks work |
| 7 | Mobile, accessibility, metadata, tests | Release checks pass |

Create the project:
```bash
npx create-next-app@latest pocket-index --typescript --app --src-dir --eslint --no-tailwind
```
Accept or review any extra prompts; leave Cache Components disabled.

**Later:** comparison page, favourites stored in the browser, team builder.
