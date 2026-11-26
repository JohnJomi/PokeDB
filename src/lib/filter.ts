import type { IndexEntry, TypeName } from "./types";

export const PAGE_SIZE = 30;
export const SORTS = ["number", "name", "total"] as const;
export type Sort = (typeof SORTS)[number];

export const TYPE_NAMES: TypeName[] = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

export interface Query {
  q: string;
  type: TypeName | null;
  gen: number | null;
  sort: Sort;
  page: number;
}

export const DEFAULT_QUERY: Query = { q: "", type: null, gen: null, sort: "number", page: 1 };

/** Invalid values fall back to defaults. */
export function parseQuery(params: { get(key: string): string | null }): Query {
  const type = params.get("type") as TypeName;
  const gen = Number(params.get("gen"));
  const sort = params.get("sort") as Sort;
  const page = Number(params.get("page"));
  return {
    q: (params.get("q") ?? "").slice(0, 40),
    type: TYPE_NAMES.includes(type) ? type : null,
    gen: Number.isInteger(gen) && gen >= 1 && gen <= 9 ? gen : null,
    sort: SORTS.includes(sort) ? sort : "number",
    page: Number.isInteger(page) && page >= 1 ? page : 1,
  };
}

/** Query string with defaults left out. */
export function toSearch(query: Query): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.type) params.set("type", query.type);
  if (query.gen) params.set("gen", String(query.gen));
  if (query.sort !== "number") params.set("sort", query.sort);
  if (query.page > 1) params.set("page", String(query.page));
  const text = params.toString();
  return text ? `?${text}` : "";
}

const normalise = (text: string) =>
  text.normalize("NFD").toLowerCase().replace(/[^a-z0-9♀♂]/g, "");

function matches(entry: IndexEntry, q: string): boolean {
  const number = q.trim().match(/^#?0*(\d+)$/);
  if (number && entry.id === Number(number[1])) return true;
  if (q.trim().startsWith("#")) return false;
  const needle = normalise(q);
  return needle !== "" && normalise(entry.name).includes(needle);
}

const COMPARE: Record<Sort, (a: IndexEntry, b: IndexEntry) => number> = {
  number: (a, b) => a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name, "en") || a.id - b.id,
  total: (a, b) => b.total - a.total || a.id - b.id,
};

/** search → type → generation → sort → paginate */
export function filterEntries(entries: IndexEntry[], query: Query) {
  const found = entries
    .filter((e) => !query.q.trim() || matches(e, query.q))
    .filter((e) => !query.type || e.types.includes(query.type))
    .filter((e) => !query.gen || e.gen === query.gen)
    .sort(COMPARE[query.sort]);
  const pages = Math.max(1, Math.ceil(found.length / PAGE_SIZE));
  const page = Math.min(query.page, pages);
  return {
    total: found.length,
    pages,
    page,
    rows: found.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
  };
}

export const formatNumber = (id: number) => `#${String(id).padStart(3, "0")}`;
