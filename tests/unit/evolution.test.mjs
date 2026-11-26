import { describe, expect, it } from "vitest";
import { buildTree, formatMethod, methodsFor } from "../../scripts/lib/evolution.mjs";

const lookups = {
  trigger: new Map([["1", "level-up"], ["3", "use-item"], ["5", "spin"]]),
  item: new Map([["1", "Water Stone"]]),
  move: new Map(),
  location: new Map(),
  type: new Map(),
  species: new Map(),
  region: new Map([["7", "Alola"]]),
  form: new Map([["52", "meowth"], ["10320", "meowth-galar"]]),
};

const row = (extra) => ({
  id: "1",
  evolved_species_id: "2",
  version_group_id: "1",
  is_default: "1",
  evolution_trigger_id: "1",
  needs_overworld_rain: "0",
  ...extra,
});

describe("formatMethod", () => {
  it("formats level and item evolutions", () => {
    expect(formatMethod(row({ minimum_level: "16" }), lookups)).toBe("Level 16");
    expect(formatMethod(row({ evolution_trigger_id: "3", trigger_item_id: "1" }), lookups)).toBe(
      "Use Water Stone",
    );
  });

  it("keeps a 0 relative stat, which means Attack = Defense", () => {
    expect(formatMethod(row({ minimum_level: "20", relative_physical_stats: "0" }), lookups)).toBe(
      "Level 20, Attack = Defense",
    );
  });

  it("fails on a column it does not support", () => {
    expect(() => formatMethod(row({ new_column: "5" }), lookups)).toThrow(/new_column/);
  });
});

describe("methodsFor", () => {
  const standard = row({ minimum_level: "28" });
  const galar = row({ minimum_level: "30", required_pokemon_form_id: "10320" });

  it("does not show a regional method as the standard one", () => {
    expect(methodsFor([standard, galar], lookups)).toEqual(["Level 28"]);
  });

  it("labels a method that only exists for a regional form", () => {
    expect(methodsFor([galar], lookups)).toEqual(["Galarian form: Level 30"]);
  });

  it("keeps every distinct default method", () => {
    const item = row({ evolution_trigger_id: "3", trigger_item_id: "1" });
    expect(methodsFor([standard, item, standard], lookups)).toEqual(["Level 28", "Use Water Stone"]);
  });
});

describe("buildTree", () => {
  const species = [
    { id: "1", evolves_from_species_id: "" },
    { id: "2", evolves_from_species_id: "1" },
    { id: "3", evolves_from_species_id: "1" },
    { id: "4", evolves_from_species_id: "" },
  ];
  const node = (s) => ({ id: Number(s.id) });

  it("builds branches from the root", () => {
    const tree = buildTree(species, "3", node, () => ["Level up"]);
    expect(tree.id).toBe(1);
    expect(tree.methods).toEqual([]);
    expect(tree.next.map((n) => n.id)).toEqual([2, 3]);
  });

  it("handles a chain shared by unrelated species", () => {
    expect(buildTree(species, "4", node, () => [])).toMatchObject({ id: 4, next: [] });
  });
});
