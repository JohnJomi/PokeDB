# Pocket Index: Design Specification

A Pokédex-style website with a retro pixel handheld look. Unofficial, non-commercial fan project.

**Reference:** artboard "B · Retro handheld" on the design canvas.
Sections marked **(proposed)** are not in the mockup yet.

## 1. Principles
- **Feels like a game device:** screens sit inside a physical shell.
- **Hard pixel edges:** solid borders and offset shadows with no blur. Keep corners square, except round buttons and the 3px radius below.
- **Colour carries meaning, with text:** type badges and stats always have labels.
- **Readability first:** decoration stays outside the data.

## 2. Colours

### Core
| Token | Hex | Use |
|---|---|---|
| `--ink` | `#1B1426` | Borders, text, title bars, hard shadows |
| `--bg` | `#241A45` | Page background |
| `--shell` | `#E0443A` | Device body, dialog inner ring |
| `--shell-light` | `#FF7261` | Shell top-left bevel |
| `--shell-dark` | `#A52A2A` | Shell bottom-right bevel |
| `--shell-screw` | `#FFB3A7` | Screws |
| `--grille-shadow` | `#FF8A78` | Speaker grille highlight |
| `--screen` | `#D8EFB0` | LCD base |
| `--screen-line` | `#CFE6A5` | Scanlines |
| `--screen-shadow` | `#7D9A58` | Unselected list card shadow |
| `--cream` | `#FFF4D6` | Cards, dialog, title plate |
| `--yellow` | `#FFCC33` | Selected state, primary buttons |
| `--blue` | `#6FD3FF` | Sort button, stars |
| `--purple` | `#7C3AED` | A button, Shiny button |
| `--panel` | `#38304A` | Filter panel, D-pad, B button |
| `--bezel` | `#4A4458` | Screen bezel |
| `--bezel-light` / `--bezel-dark` | `#6D6580` / `#2D2838` | Bezel bevel |
| `--pink` | `#FF7AD9` | Stars, Speed bar |

White (`#FFFFFF`) is used for inputs, highlights and text on dark badges.

### Type badges
| Type | Background | Text |
|---|---|---|
| Normal | `#C9BFA5` | ink |
| Fire | `#FF7A2F` | ink |
| Water | `#3D9BFF` | ink |
| Grass | `#5ECB5A` | ink |
| Electric | `#FFD426` | ink |
| Fighting | `#B83A2E` | white |
| Poison | `#8E44AD` | white |
| Ground | `#D9A752` | ink |
| Flying | `#A9C4FF` | ink |
| Bug | `#A8C020` | ink |
| Rock | `#B59B55` | ink |
| Ghost | `#5A4A8F` | white |
| Dragon | `#4B4FD1` | white |
| Steel | `#B8C4D4` | ink |
| Fairy | `#FF9CCB` | ink |
| Ice **(proposed)** | `#9BE7F0` | ink |
| Psychic **(proposed)** | `#FF6F9F` | ink |
| Dark **(proposed)** | `#5A4A42` | white |

### Stat bars
| Stat | Colour |
|---|---|
| HP | `#5EE06A` |
| Attack | `#FFCC33` |
| Defense | `#FF9A3D` |
| Sp. Atk | `#FF5D5D` |
| Sp. Def | `#5AB8FF` |
| Speed | `#FF7AD9` |

Empty segments: `#443A57`. Track: ink.

## 3. Typography
- **Font:** [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P), fallback `monospace`.
- **Case:** uppercase for names, labels, badges and headings.

| Role | Size in mockup |
|---|---|
| Preview Pokémon name | 20px |
| Device title | 14px |
| List name, buttons, title bars, dialog | 11px |
| Stats, profile rows, section labels, search | 10px |
| Number, badges, small notes | 9px |
| List image placeholder | 8px |

Line height: about 2 to 2.1 for multi-line text, 1.4 for badges.

**Build recommendation (proposed):** pixel text is hard to read when small. Use at least 10px for labels, and test a more readable pixel font such as VT323 (18px or larger) for descriptions and move tables.

## 4. Borders, depth and spacing
| Element | Style |
|---|---|
| Device shell | 6px ink border, 30px padding, 8px inner bevels, 14px drop edge |
| LCD bezel | 5px ink border, 12px padding, 4px bevels |
| LCD surface | 4px ink border, 14px padding |
| Button | 4px ink border, 4px inner bevels, `0 5px 0 ink` |
| Type badge | 3px ink border, 3px inner bevels, 5px × 8px padding |
| Selected card | Yellow fill, `6px 6px 0 ink` |
| Unselected list card | Cream fill, `3px 3px 0 #7D9A58` |
| Evolution card | 4px ink border, `5px 5px 0 ink`, 8px padding |
| Dialog box | 5px ink border, cream 4px ring, red ring to 7px, 24px padding |

- **Common gaps:** 6, 8, 10, 12, 14, 16, 18, 22px.
- **Page:** max width 1120px, padding 44px × 20px, 64px between devices.
- **Corner radius:** 3px on the page content container.

## 5. Decorative elements
- **Page grid:** 2px lines of `#FFFFFF0D`, repeating every 32px.
- **Stars:** 70 squares of 4, 6 or 8px along the side margins, in yellow, white, blue and pink.
- **Screws:** four 10px squares with 3px ink borders, 10px from the shell corners.
- **Title plate:** cream, 4px border, `5px 5px 0 ink`. Titles: "★ POCKET INDEX" and "◆ ENTRY VIEW".
- **Power meter:** five 14 × 26px cells. Four `#6DFF8A`, one `#5A2130`.
- **Scanlines:** `repeating-linear-gradient(0deg, #D8EFB0 0 3px, #CFE6A5 3px 4px)`.
- **D-pad:** 102px pixel cross with four arrows and an ink centre.
- **A and B buttons:** 58px circles, purple A and panel-colour B.
- **Speaker grille:** six 7 × 48px bars, 7px apart.

### Sprite stage
A pixel scene drawn on a 64 × 40 grid with `shape-rendering="crispEdges"`:
- Sky: `#8FD6FF`. The large detail stage uses `#FFB36B`.
- Two white clouds (not fully distinct on small stages).
- Stepped hills `#6CC46A`, grass `#3F9A4F`, grass details `#8BE07A`.
- Platform `#C9A15C` with highlight `#ECD08C`.
- Sprite centred above the scene.

| Stage | Height |
|---|---|
| Preview | 300px |
| Detail | 330px |
| Evolution | 150px |

## 6. Sprites
**Decision:** use the ready-made default sprites everywhere. No artwork pixelation.

```
https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png
https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/{id}.png
```

- The main default sprite was found for all 1,025 species in the repository file list. Samples 6, 448, 700 and 1000 loaded at 96 × 96.
- Shiny coverage and alternate forms have **not** been checked.
- Always set `image-rendering: pixelated`.

**(proposed)** Display sizes, using whole multiples of 96 where possible:

| Place | Size |
|---|---|
| List thumbnail | 48px (replaces the 46px placeholder; half size, so check clarity) |
| Evolution | 96px |
| Preview and detail | 192px or 288px |

The placeholder boxes in the mockup do not set final sprite sizes. Position the sprite's feet on the platform and check this with real images. Use the Pokémon name as `alt` text. Lazy-load list images. If an image fails, show a "?" box.

## 7. Components
| Component | Contents |
|---|---|
| `DeviceShell` | Screws, title plate, power meter, content, control deck |
| `LcdScreen` | Bezel and scanline surface |
| `TitleBar` | Ink bar, cream title, yellow right-hand value |
| `SearchInput` | Full width, 48px tall, white, 4px border |
| `PokemonRow` | Cursor "▶", sprite, name, type badges, number |
| `TypeBadge` | Type name, optional multiplier |
| `SpriteStage` | Scene and sprite |
| `PixelButton` | At least 48px tall |
| `FilterPanel` | Dark panel with type badges and "more" label |
| `StatBar` | Label, value, 16 segments |
| `TypeMatchups` | Weak, resists, immune groups |
| `InfoRow` | Label and value with 3px dotted divider |
| `DialogBox` | Description and "▼" marker |
| `EvolutionCard` | Stage, name, condition; current one in yellow |
| `ControlDeck` | D-pad, buttons, A/B, grille |

**Stat segments:** `filled = round(value / 160 * 16)`. For real data **(proposed)**, cap at 16, since some stats exceed 160. Always show the number.

## 8. Screens

### Browse
- **Left screen:** "INDEX LIST", total count, search ("SEARCH NAME / No._") and Pokémon rows.
- **Right side:** "PREVIEW" screen with stage, name, badges, height, weight and stat total. Type filter panel below.
- **Controls:** D-pad, "GEN: ALL ▼", "SORT: No.", B, A and grille.
- The mockup shows 7 sample rows and 8 type filters.

### Detail
1. Tabs: Info, Moves, Forms, Shiny.
2. Left screen: number, name, generation, stage, badges, height, weight, ability, hidden ability.
3. Right screen: six stats, total and type matchups.
4. Description dialog.
5. Evolution path with arrows between cards.
6. Controls: D-pad, previous and next entry, B, A and grille.

Sample entry: #006 Charizard, Fire/Flying, 1.7m, 90.5kg. Stats 78 / 84 / 78 / 109 / 85 / 100, total 534.

## 9. Interaction **(proposed)**
The mockup is static.

| Action | Result |
|---|---|
| Click a row | Select it and update the preview |
| A | Open the selected entry |
| B | Go back |
| D-pad up/down | Move through the list |
| D-pad left/right | Previous or next entry |
| Search | Match name or number as you type |
| Type, generation, sort | Update the list |
| Shiny | Toggle the sprite and show pressed state |
| Evolution card | Open that entry |

- **Hover:** lift by 2px.
- **Pressed:** move down 4px and shrink the shadow.
- **Focus:** 4px white outline with an ink outer ring.
- **D-pad:** build each direction as a real button; the mockup's D-pad is only a drawing.
- **Motion:** use short, stepped animations and respect `prefers-reduced-motion`.
- **States:** "LOADING…", "NO MATCH FOUND" with a clear-filters button, and "LOAD FAILED" with retry.
- **List performance:** paginate or virtualize the 1,025 species.
- **Branching evolutions:** wrap branches into a grid and label each condition.
- **Moves and Forms:** layouts still need to be designed.

## 10. Responsive layout
The mockup uses wrapping flex rows with a 440px basis. It has not been visually checked.

**(proposed)** for mobile:
- Below 960px, stack into one column.
- Below 600px, use 12px shell padding and 4px shell borders.
- Show the list first. Tapping a row opens the detail page.
- Hide the decorative grille, power meter and stars. Replace the D-pad and A/B with clear Back, Previous and Next buttons.
- Stack evolution cards vertically with downward arrows.
- Let sprite stages shrink without horizontal scrolling.
- Keep touch targets at least 44px.

## 11. Accessibility **(proposed requirements)**
- Use real buttons, links and labelled inputs.
- Support full keyboard use without trapping arrow keys while typing.
- Check text contrast, including every type badge.
- Never rely on colour alone.
- Hide decorations from screen readers.

## 12. Data mapping
Source: [PokéAPI CSV data](https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv).

| UI | Main CSV files |
|---|---|
| Name, number, generation | `pokemon_species`, `pokemon_species_names`, `pokemon` |
| Height, weight | `pokemon` |
| Types | `pokemon_types`, `types` |
| Stats | `pokemon_stats`, `stats` |
| Abilities | `pokemon_abilities`, `abilities` |
| Description | `pokemon_species_flavor_text` (English `language_id` = 9) |
| Evolution | `pokemon_species`, `pokemon_evolution` |
| Matchups | `type_efficacy` (multiply for dual types) |
| Moves | `pokemon_moves`, `moves` |
| Forms | `pokemon`, `pokemon_forms` |

Height is stored in decimetres and weight in hectograms; divide each by 10 for m and kg.

## 13. Legal note
Include in the footer: "Unofficial fan project. Pokémon names and images belong to their respective owners." Keep it non-commercial. This notice does not itself grant permission to use them.
