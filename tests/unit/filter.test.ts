import { describe, expect, it } from "vitest";
import index from "../../data/index.json";
import { DEFAULT_QUERY, filterEntries, parseQuery, toSearch } from "../../src/lib/filter";
import type { IndexEntry } from "../../src/lib/types";

const entries = index as IndexEntry[];
const run = (query: object) => filterEntries(entries, { ...DEFAULT_QUERY, ...query });

describe("filterEntries", () => {
  it.each(["6", "#6", "006", "#006"])("finds number %s", (q) => {
    expect(run({ q }).rows.map((e) => e.id)).toEqual([6]);
  });
  it("ignores case, accents and punctuation", () => {
    expect(run({ q: "FLABEBE" }).rows[0].name).toBe("Flabébé");
    expect(run({ q: "mr mime" }).rows[0].name).toBe("Mr. Mime");
  });
  it("matches either type slot and combines with generation", () => {
    const result = run({ type: "flying", gen: 1 });
    expect(result.rows.map((e) => e.name)).toContain("Charizard");
    expect(result.rows.every((e) => e.gen === 1 && e.types.includes("flying"))).toBe(true);
  });
  it("sorts by total with number as the tie-breaker", () => {
    const { rows } = run({ sort: "total" });
    for (let i = 1; i < rows.length; i++) {
      const [a, b] = [rows[i - 1], rows[i]];
      expect(a.total > b.total || (a.total === b.total && a.id < b.id)).toBe(true);
    }
  });
  it("paginates 30 per page and clamps the page", () => {
    expect(run({}).rows).toHaveLength(30);
    expect(run({ page: 999 })).toMatchObject({ page: 35, pages: 35, total: 1025 });
    expect(run({ q: "zzzz" })).toMatchObject({ total: 0, pages: 1 });
  });
});

describe("URL state", () => {
  it("falls back on invalid values", () => {
    expect(parseQuery(new URLSearchParams("type=lava&gen=12&sort=x&page=-1"))).toEqual(DEFAULT_QUERY);
  });
  it("round-trips and omits defaults", () => {
    const query = parseQuery(new URLSearchParams("q=char&type=fire&gen=1&page=2"));
    expect(toSearch(query)).toBe("?q=char&type=fire&gen=1&page=2");
    expect(toSearch(DEFAULT_QUERY)).toBe("");
  });
});
