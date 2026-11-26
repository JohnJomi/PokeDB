import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";

export const ENGLISH = "9";

export function createReader(dir) {
  return (name) => parse(readFileSync(`${dir}/${name}.csv`), { columns: true, bom: true });
}

/** Map of key -> row. */
export function indexBy(rows, key = "id") {
  return new Map(rows.map((row) => [row[key], row]));
}

/** Map of key -> rows, in file order. */
export function groupBy(rows, key) {
  const groups = new Map();
  for (const row of rows) {
    const list = groups.get(row[key]);
    if (list) list.push(row);
    else groups.set(row[key], [row]);
  }
  return groups;
}

/** Map of id -> English value from a *_names table. */
export function englishNames(rows, idKey, valueKey = "name") {
  return new Map(
    rows.filter((r) => r.local_language_id === ENGLISH).map((r) => [r[idKey], r[valueKey]]),
  );
}

/** Lookup that fails loudly instead of returning undefined. */
export function must(map, key, what) {
  const value = map.get(key);
  if (value === undefined || value === "") throw new Error(`Missing ${what} for id ${key}`);
  return value;
}
