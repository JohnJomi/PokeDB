import { describe, expect, it } from "vitest";
import { chooseVersionGroup } from "../../scripts/lib/moves.mjs";

const groups = new Map([
  ["sword-shield", 22], ["legends-arceus", 26], ["scarlet-violet", 27],
  ["legends-za", 30], ["champions", 32], ["xd", 10],
]);
const choose = (...names) => chooseVersionGroup(new Set(names), groups);

describe("chooseVersionGroup", () => {
  it("prefers Scarlet/Violet over newer spin-off groups", () => {
    expect(choose("champions", "scarlet-violet", "sword-shield")).toBe("scarlet-violet");
  });
  it("otherwise uses the latest main-series group", () => {
    expect(choose("sword-shield", "legends-arceus", "champions", "xd")).toBe("legends-arceus");
  });
  it("falls back to the excluded groups only when nothing else exists", () => {
    expect(choose("legends-za", "champions")).toBe("champions");
    expect(choose()).toBeNull();
  });
});
