// Checks the committed output of `npm run data`.
import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as schema from "../../scripts/lib/schema.mjs";

const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const index = json("data/index.json");
const detail = (slug) => json(`data/pokemon/${slug}.json`);
const names = (node) => [node.name, ...node.next.flatMap(names)];

describe("generated data", () => {
  it("has 1,025 entries with unique ids and slugs", () => {
    expect(index).toHaveLength(1025);
    expect(new Set(index.map((e) => e.id)).size).toBe(1025);
    expect(new Set(index.map((e) => e.slug)).size).toBe(1025);
  });

  it("has valid detail, move and sprite files for every entry", () => {
    for (const entry of index) {
      schema.indexEntry.parse(entry);
      schema.pokemon.parse(detail(entry.slug));
      schema.moveFile.parse(json(`public/data/moves/${entry.id}.json`));
      expect(existsSync(`public/sprites/${entry.id}.png`)).toBe(true);
      expect(existsSync(`public/sprites/shiny/${entry.id}.png`)).toBe(true);
    }
  });

  it("matches the Charizard sample in the design", () => {
    const charizard = detail("charizard");
    expect(charizard).toMatchObject({
      id: 6,
      types: ["fire", "flying"],
      heightM: 1.7,
      weightKg: 90.5,
      total: 534,
      stats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    });
    expect(charizard.matchups).toMatchObject({ rock: 4, water: 2, electric: 2, ground: 0 });
  });

  it.each([
    ["charmander", ["Charmander", "Charmeleon", "Charizard"]],
    ["eevee", ["Eevee", "Vaporeon", "Jolteon", "Flareon", "Espeon", "Umbreon", "Leafeon", "Glaceon", "Sylveon"]],
    ["wurmple", ["Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox"]],
    ["tyrogue", ["Tyrogue", "Hitmonlee", "Hitmonchan", "Hitmontop"]],
    ["tauros", ["Tauros"]],
  ])("builds the %s evolution tree", (slug, expected) => {
    expect(names(detail(slug).evolution)).toEqual(expected);
  });
});
