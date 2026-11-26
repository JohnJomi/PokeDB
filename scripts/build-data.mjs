// CSV -> JSON and sprites. Run `npm run data`; commit the output.
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createReader, englishNames, ENGLISH, groupBy, indexBy, must } from "./lib/csv.mjs";
import { buildTree, methodsFor } from "./lib/evolution.mjs";
import { buildChart, matchupsFor, TYPES } from "./lib/matchups.mjs";
import { chooseVersionGroup } from "./lib/moves.mjs";
import * as schema from "./lib/schema.mjs";
import { cleanText, titleCase } from "./lib/text.mjs";

const read = createReader(".cache/pokeapi/data/v2/csv");
const SPRITES = ".cache/sprites/sprites/pokemon";
const SPECIES_COUNT = 1025;

// Newest main-series English text first.
const FLAVOR_PRIORITY = [
  "scarlet", "violet", "sword", "shield", "legends-arceus", "brilliant-diamond",
  "shining-pearl", "lets-go-pikachu", "lets-go-eevee", "ultra-sun", "ultra-moon", "sun", "moon",
  "omega-ruby", "alpha-sapphire", "x", "y",
];

const STAT_KEYS = { 1: "hp", 2: "atk", 3: "def", 4: "spa", 5: "spd", 6: "spe" };

// ---- lookups ----
const speciesRows = read("pokemon_species").sort((a, b) => Number(a.id) - Number(b.id));
const speciesNameRows = read("pokemon_species_names");
const speciesName = englishNames(speciesNameRows, "pokemon_species_id");
const genus = englishNames(speciesNameRows, "pokemon_species_id", "genus");

const typeName = new Map(read("types").map((t) => [t.id, t.identifier]));
const chart = buildChart(read("type_efficacy"), typeName);

const pokemonRows = read("pokemon");
const pokemonBySpecies = groupBy(pokemonRows, "species_id");
const typesByPokemon = groupBy(read("pokemon_types"), "pokemon_id");
const statsByPokemon = groupBy(read("pokemon_stats"), "pokemon_id");
const abilitiesByPokemon = groupBy(read("pokemon_abilities"), "pokemon_id");
const abilityName = englishNames(read("ability_names"), "ability_id");

const formRows = read("pokemon_forms");
const formsByPokemon = groupBy(formRows, "pokemon_id");
const formNameRows = read("pokemon_form_names");
const formFullName = englishNames(formNameRows, "pokemon_form_id", "pokemon_name");
const formShortName = englishNames(formNameRows, "pokemon_form_id", "form_name");
const typesByForm = groupBy(read("pokemon_form_types"), "pokemon_form_id");

const versionName = new Map(read("versions").map((v) => [v.id, v.identifier]));
const flavorBySpecies = groupBy(
  read("pokemon_species_flavor_text").filter((f) => f.language_id === ENGLISH),
  "species_id",
);

const moveRows = indexBy(read("moves"));
const moveName = englishNames(read("move_names"), "move_id");

const evolutionLookups = {
  trigger: new Map(read("evolution_triggers").map((t) => [t.id, t.identifier])),
  item: englishNames(read("item_names"), "item_id"),
  move: moveName,
  location: englishNames(read("location_names"), "location_id"),
  type: typeName,
  species: speciesName,
  region: englishNames(read("region_names"), "region_id"),
  form: new Map(formRows.map((f) => [f.id, f.identifier])),
};
const evolutionBySpecies = groupBy(read("pokemon_evolution"), "evolved_species_id");
const chains = groupBy(speciesRows, "evolution_chain_id");

// ---- helpers ----
function standardTypes(rows, what) {
  const types = [...rows]
    .sort((a, b) => Number(a.slot) - Number(b.slot))
    .map((r) => typeName.get(r.type_id))
    .filter((t) => TYPES.includes(t));
  if (!types.length) throw new Error(`No standard types for ${what}`);
  return types;
}

function description(speciesId) {
  const entries = must(flavorBySpecies, speciesId, "flavor text");
  const byVersion = new Map(entries.map((e) => [versionName.get(e.version_id), e.flavor_text]));
  const preferred = FLAVOR_PRIORITY.find((v) => byVersion.has(v));
  const newest = [...entries].sort((a, b) => Number(b.version_id) - Number(a.version_id))[0];
  return cleanText(preferred ? byVersion.get(preferred) : newest.flavor_text);
}

function evolutionTree(species) {
  return buildTree(
    chains.get(species.evolution_chain_id),
    species.id,
    (s) => ({ id: Number(s.id), slug: s.identifier, name: must(speciesName, s.id, "name") }),
    (id) => methodsFor(evolutionBySpecies.get(id) ?? [], evolutionLookups),
  );
}

const formSprites = new Set();
function spriteFor(speciesId, pokemon, form) {
  // Alternate pokemon rows use their own id; cosmetic forms use "<species>-<form>".
  const candidates = [];
  if (form.form_identifier) candidates.push(`${speciesId}-${form.form_identifier}`);
  if (form.is_default === "1") candidates.push(pokemon.id);
  const file = candidates.find((name) => existsSync(`${SPRITES}/${name}.png`));
  if (!file) return null;
  formSprites.add(file);
  return `/sprites/${file}.png`;
}

function formsFor(species) {
  // Forms without a standard type (Arceus "???") are left out.
  const hasStandardType = (form) =>
    (typesByForm.get(form.id) ?? []).every((r) => TYPES.includes(typeName.get(r.type_id)));

  return must(pokemonBySpecies, species.id, "pokemon").flatMap((pokemon) =>
    must(formsByPokemon, pokemon.id, "forms").filter(hasStandardType).map((form) => {
      const name = speciesName.get(species.id);
      const short = formShortName.get(form.id);
      return {
        slug: form.identifier,
        name:
          formFullName.get(form.id) ||
          (short ? `${name} (${short})` : "") ||
          (form.form_identifier ? `${name} (${titleCase(form.form_identifier)})` : name),
        types: standardTypes(
          typesByForm.get(form.id) ?? must(typesByPokemon, pokemon.id, "types"),
          form.identifier,
        ),
        sprite: spriteFor(species.id, pokemon, form),
      };
    }),
  );
}

// ---- moves ----
const versionGroups = read("version_groups");
const groupName = new Map(versionGroups.map((g) => [g.id, g.identifier]));
const groupOrder = new Map(versionGroups.map((g) => [g.identifier, Number(g.order)]));
const methodName = new Map(read("pokemon_move_methods").map((m) => [m.id, m.identifier]));
const defaultPokemon = new Map(
  pokemonRows.filter((p) => p.is_default === "1").map((p) => [p.species_id, p]),
);
const wanted = new Set([...defaultPokemon.values()].map((p) => p.id));
const movesByPokemon = groupBy(
  read("pokemon_moves").filter((m) => wanted.has(m.pokemon_id)),
  "pokemon_id",
);
const DAMAGE_CLASS = { 1: "status", 2: "physical", 3: "special" };
const number = (value) => (value === "" ? null : Number(value));

function movesFor(pokemonId) {
  const rows = movesByPokemon.get(pokemonId) ?? [];
  const byGroup = groupBy(rows, "version_group_id");
  const available = new Set([...byGroup.keys()].map((id) => groupName.get(id)));
  const versionGroup = chooseVersionGroup(available, groupOrder);
  if (!versionGroup) return { versionGroup: "", moves: [] };

  const unique = new Map();
  for (const row of rows) {
    if (groupName.get(row.version_group_id) !== versionGroup) continue;
    const move = must(moveRows, row.move_id, "move");
    const method = must(methodName, row.pokemon_move_method_id, "move method");
    const level = method === "level-up" ? Number(row.level) : null;
    unique.set(`${row.move_id}:${method}:${level}`, {
      name: must(moveName, row.move_id, "move name"),
      type: typeName.get(move.type_id),
      category: DAMAGE_CLASS[move.damage_class_id],
      power: number(move.power),
      accuracy: number(move.accuracy),
      pp: number(move.pp),
      method,
      level,
    });
  }
  const moves = [...unique.values()].sort(
    (a, b) =>
      a.method.localeCompare(b.method) ||
      (a.level ?? 0) - (b.level ?? 0) ||
      a.name.localeCompare(b.name),
  );
  return { versionGroup, moves };
}

// ---- build ----
if (speciesRows.length !== SPECIES_COUNT) {
  throw new Error(`Expected ${SPECIES_COUNT} species, got ${speciesRows.length}`);
}

const entries = [];
const details = [];
const moveFiles = [];

speciesRows.forEach((species, i) => {
  const id = Number(species.id);
  const pokemon = must(defaultPokemon, species.id, "default pokemon");
  const stats = {};
  for (const row of must(statsByPokemon, pokemon.id, "stats")) {
    const key = STAT_KEYS[row.stat_id];
    if (key) stats[key] = Number(row.base_stat);
  }
  const types = standardTypes(must(typesByPokemon, pokemon.id, "types"), species.identifier);

  const entry = {
    id,
    slug: species.identifier,
    name: must(speciesName, species.id, "name"),
    gen: Number(species.generation_id),
    types,
    total: Object.values(stats).reduce((sum, v) => sum + v, 0),
    heightM: Number(pokemon.height) / 10,
    weightKg: Number(pokemon.weight) / 10,
  };
  entries.push(schema.indexEntry.parse(entry));

  const abilities = must(abilitiesByPokemon, pokemon.id, "abilities")
    .sort((a, b) => Number(a.slot) - Number(b.slot))
    .map((a) => ({ name: must(abilityName, a.ability_id, "ability name"), hidden: a.is_hidden === "1" }));

  details.push(
    schema.pokemon.parse({
      ...entry,
      genus: must(genus, species.id, "genus"),
      description: description(species.id),
      stats,
      abilities,
      matchups: matchupsFor(chart, types),
      evolution: evolutionTree(species),
      forms: formsFor(species),
      prevSlug: speciesRows[i - 1]?.identifier ?? null,
      nextSlug: speciesRows[i + 1]?.identifier ?? null,
    }),
  );

  moveFiles.push([id, schema.moveFile.parse(movesFor(pokemon.id))]);
});

for (const key of ["id", "slug"]) {
  if (new Set(entries.map((e) => e[key])).size !== entries.length) {
    throw new Error(`Duplicate ${key} in index`);
  }
}
for (const { id } of entries) {
  for (const path of [`${id}.png`, `shiny/${id}.png`]) {
    if (!existsSync(`${SPRITES}/${path}`)) throw new Error(`Missing sprite ${path}`);
  }
}

// ---- write ----
for (const dir of ["data", "public/data", "public/sprites"]) {
  rmSync(dir, { recursive: true, force: true });
}
for (const dir of ["data/pokemon", "public/data/moves", "public/sprites/shiny"]) {
  mkdirSync(dir, { recursive: true });
}
const write = (path, value) => writeFileSync(path, `${JSON.stringify(value)}\n`);

write("data/index.json", entries);
for (const detail of details) write(`data/pokemon/${detail.slug}.json`, detail);
for (const [id, file] of moveFiles) write(`public/data/moves/${id}.json`, file);

for (const { id } of entries) {
  copyFileSync(`${SPRITES}/${id}.png`, `public/sprites/${id}.png`);
  copyFileSync(`${SPRITES}/shiny/${id}.png`, `public/sprites/shiny/${id}.png`);
}
for (const file of formSprites) {
  copyFileSync(`${SPRITES}/${file}.png`, `public/sprites/${file}.png`);
}

console.log(
  `Wrote ${entries.length} entries, ${moveFiles.filter(([, f]) => !f.moves.length).length} without moves, ` +
    `${formSprites.size} form sprites.`,
);
