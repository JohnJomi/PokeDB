// Turns pokemon_evolution rows into readable conditions and a tree.
// Any populated column or value that is not handled here fails the build.
import { titleCase } from "./text.mjs";

const METADATA = new Set(["id", "evolved_species_id", "version_group_id", "is_default"]);

/** Columns that are 0 when unused. */
const FLAGS = new Set([
  "needs_overworld_rain", "turn_upside_down", "needs_multiplayer", "near_special_rock",
]);

const REGIONAL = /(^|-)(alola|galar|hisui|paldea)/;
const REGION_ADJECTIVE = { alola: "Alolan", galar: "Galarian", hisui: "Hisuian", paldea: "Paldean" };

const EXPRESSIONS = {
  "PID 16 >> 10 % 4 <=": "random (personality value)",
  "PID 16 >> 10 % 5 >=": "random (personality value)",
  "EC 100 % 0 !=": "random (usual result)",
  "EC 100 % 0 ==": "random (rare result)",
  "EC 16 >> 10 % 4 <=": "random (personality value)",
  "EC 16 >> 10 % 5 >=": "random (personality value)",
};

function expressionLabel(expression) {
  if (EXPRESSIONS[expression]) return EXPRESSIONS[expression];
  // Alcremie spin conditions; the form depends on direction, duration and time.
  if (/^SPIN_(DIR|SEC) /.test(expression)) return "spin the trainer";
  throw new Error(`Unsupported condition_expression: ${expression}`);
}

const NATURES = [
  "Hardy", "Lonely", "Brave", "Adamant", "Naughty", "Bold", "Docile", "Relaxed", "Impish", "Lax",
  "Timid", "Hasty", "Serious", "Jolly", "Naive", "Modest", "Mild", "Quiet", "Bashful", "Rash",
  "Calm", "Gentle", "Sassy", "Careful", "Quirky",
];

function natureLabel(bitmask) {
  const names = NATURES.filter((_, i) => Number(bitmask) & (1 << i));
  return `with ${names.join("/")} nature`;
}

const TIME = { day: "during the day", night: "at night", dusk: "at dusk", "full-moon": "on a full moon" };

const STATS = { 1: "Attack > Defense", "-1": "Attack < Defense", 0: "Attack = Defense" };

function oneOf(map, key, what) {
  if (map[key] === undefined) throw new Error(`Unsupported ${what}: ${key}`);
  return map[key];
}

function triggerLabel(trigger, row) {
  switch (trigger) {
    case "level-up":
      return row.minimum_level ? `Level ${row.minimum_level}` : "Level up";
    case "trade":
      return "Trade";
    case "use-item":
      return "Use";
    case "shed":
      return "Empty party slot and spare Poké Ball";
    case "spin":
      return "Spin";
    case "tower-of-darkness":
      return "Tower of Darkness";
    case "tower-of-waters":
      return "Tower of Waters";
    case "three-critical-hits":
      return "Three critical hits in one battle";
    case "take-damage":
      return "Take damage in battle";
    case "in-battle-level-up":
      return "Level up in battle";
    case "agile-style-move":
      return "Use a move in Agile Style";
    case "strong-style-move":
      return "Use a move in Strong Style";
    case "recoil-damage":
      return "Lose HP to recoil";
    case "use-move":
      return "Use a move";
    case "three-defeated-bisharp":
      return "Defeat three Bisharp that lead a pack";
    case "gimmighoul-coins":
      return "Collect 999 Gimmighoul Coins";
    case "meltan-candies":
      return "400 Meltan Candies (Pokémon GO)";
    case "unclassified":
      return "Special condition";
    default:
      throw new Error(`Unsupported evolution trigger: ${trigger}`);
  }
}

/**
 * @param lookups { trigger, item, move, location, type, species, region, form }
 *   Maps of id -> name. `form` maps pokemon_forms id -> form identifier.
 */
export function formatMethod(row, lookups) {
  const get = (table, id) => {
    const value = lookups[table].get(id);
    if (!value) throw new Error(`Missing ${table} name for id ${id}`);
    return value;
  };
  const trigger = get("trigger", row.evolution_trigger_id);
  let head = triggerLabel(trigger, row);
  const parts = [];

  for (const [column, value] of Object.entries(row)) {
    if (METADATA.has(column) || value === "" || (FLAGS.has(column) && value === "0")) continue;
    switch (column) {
      case "evolution_trigger_id":
      case "required_pokemon_form_id":
      case "evolved_pokemon_form_id":
      case "region_id":
        break; // handled outside this loop
      case "minimum_level":
        if (trigger !== "level-up") parts.push(`at level ${value}+`);
        break;
      case "trigger_item_id":
        if (trigger === "use-item") head = `Use ${get("item", value)}`;
        else parts.push(`with ${get("item", value)}`);
        break;
      case "held_item_id":
        parts.push(`holding ${get("item", value)}`);
        break;
      case "gender_id":
        parts.push(oneOf({ 1: "female", 2: "male" }, value, "gender_id"));
        break;
      case "location_id":
        parts.push(`at ${get("location", value)}`);
        break;
      case "time_of_day":
        parts.push(oneOf(TIME, value, "time_of_day"));
        break;
      case "known_move_id":
        parts.push(`knowing ${get("move", value)}`);
        break;
      case "known_move_type_id":
        parts.push(`knowing a ${titleCase(get("type", value))} move`);
        break;
      case "minimum_happiness":
        parts.push(`friendship ${value}+`);
        break;
      case "minimum_beauty":
        parts.push(`beauty ${value}+`);
        break;
      case "minimum_affection":
        parts.push(`affection ${value}+`);
        break;
      case "relative_physical_stats":
        parts.push(oneOf(STATS, value, "relative_physical_stats"));
        break;
      case "party_species_id":
        parts.push(`with ${get("species", value)} in party`);
        break;
      case "party_type_id":
        parts.push(`with a ${titleCase(get("type", value))} Pokémon in party`);
        break;
      case "trade_species_id":
        parts.push(`for ${get("species", value)}`);
        break;
      case "needs_overworld_rain":
        parts.push("while raining");
        break;
      case "turn_upside_down":
        parts.push("holding console upside down");
        break;
      case "needs_multiplayer":
        parts.push("in multiplayer");
        break;
      case "near_special_rock":
        parts.push("near a special rock");
        break;
      case "used_move_id":
        if (trigger === "use-move") head = `Use ${get("move", value)}`;
        else parts.push(`after using ${get("move", value)}`);
        break;
      case "minimum_move_count":
        parts.push(`${value} times`);
        break;
      case "minimum_steps":
        parts.push(`after ${value} steps`);
        break;
      case "minimum_damage_taken":
        parts.push(`${value}+ HP lost`);
        break;
      case "nature_bitmask":
        parts.push(natureLabel(value));
        break;
      case "condition_expression":
        parts.push(expressionLabel(value));
        break;
      case "percentage_chance":
        parts.push(`${value}% chance`);
        break;
      default:
        throw new Error(`Unsupported evolution column "${column}" = ${value}`);
    }
  }

  if (row.region_id) parts.push(`in ${get("region", row.region_id)}`);
  return [head, ...parts].join(", ");
}

/** Region key when a row only applies to a regional form or region. */
export function regionalKey(row, lookups) {
  for (const column of ["required_pokemon_form_id", "evolved_pokemon_form_id"]) {
    const match = row[column] && lookups.form.get(row[column])?.match(REGIONAL);
    if (match) return match[2];
  }
  if (row.region_id) return lookups.region.get(row.region_id).toLowerCase();
  return null;
}

/**
 * Distinct methods from the default rows. Regional rows are left out when a
 * standard route exists, and labelled with their region when it does not.
 */
export function methodsFor(rows, lookups) {
  const defaults = rows.filter((row) => row.is_default === "1");
  const chosen = defaults.length ? defaults : rows;
  const standard = chosen.filter((row) => !regionalKey(row, lookups));
  const methods = standard.length
    ? standard.map((row) => formatMethod(row, lookups))
    : chosen.map((row) => {
        const key = regionalKey(row, lookups);
        // "in <region>" is already part of the text when region_id is set.
        const method = formatMethod(row, lookups);
        return row.region_id ? method : `${REGION_ADJECTIVE[key]} form: ${method}`;
      });
  // Alcremie has one row per sweet and time of day; they only change its look.
  if (chosen.every((row) => lookups.trigger.get(row.evolution_trigger_id) === "spin") && methods.length > 1) {
    return ["Spin while holding a Sweet (look depends on sweet, time and spin)"];
  }
  return [...new Set(methods)];
}

/**
 * Tree that contains `speciesId`. Most chains have one root; Phione and Manaphy
 * share a chain without evolving into each other.
 *
 * @param species rows of pokemon_species in one evolution chain
 * @param node (speciesRow) => { id, slug, name }
 * @param methods (speciesId) => string[]
 */
export function buildTree(species, speciesId, node, methods) {
  const byId = new Map(species.map((s) => [s.id, s]));
  let root = byId.get(speciesId);
  while (root?.evolves_from_species_id) root = byId.get(root.evolves_from_species_id);
  if (!root) throw new Error(`No evolution root for species ${speciesId}`);

  const build = (row, isRoot) => ({
    ...node(row),
    methods: isRoot ? [] : methods(row.id),
    next: species
      .filter((s) => s.evolves_from_species_id === row.id)
      .sort((a, b) => Number(a.id) - Number(b.id))
      .map((child) => build(child, false)),
  });
  return build(root, true);
}
