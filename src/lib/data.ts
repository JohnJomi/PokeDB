import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import index from "../../data/index.json";
import type { IndexEntry, Pokemon } from "./types";

export function getIndex(): IndexEntry[] {
  return index as IndexEntry[];
}

/** `slug` must come from the index; unknown routes are rejected before this. */
export async function getPokemon(slug: string): Promise<Pokemon> {
  const file = join(process.cwd(), "data", "pokemon", `${slug}.json`);
  return JSON.parse(await readFile(file, "utf8")) as Pokemon;
}
