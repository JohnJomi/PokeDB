import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync("src/styles/tokens.css", "utf8");

const TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

describe("design tokens", () => {
  it.each(TYPES)("defines colours for the %s type", (type) => {
    expect(css).toContain(`[data-type="${type}"]`);
  });
});
