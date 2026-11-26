export const TYPES = [
  "normal", "fire", "water", "grass", "electric", "ice", "fighting", "poison", "ground",
  "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy",
];

/** chart[attacker][defender] = multiplier */
export function buildChart(efficacyRows, typeNameById) {
  const chart = {};
  for (const row of efficacyRows) {
    const attacker = typeNameById.get(row.damage_type_id);
    const defender = typeNameById.get(row.target_type_id);
    if (!TYPES.includes(attacker) || !TYPES.includes(defender)) continue;
    (chart[attacker] ??= {})[defender] = Number(row.damage_factor) / 100;
  }
  return chart;
}

/** Incoming damage multipliers for the defending types. 1x is omitted. */
export function matchupsFor(chart, defenderTypes) {
  const result = {};
  for (const attacker of TYPES) {
    let multiplier = 1;
    for (const defender of defenderTypes) {
      const factor = chart[attacker]?.[defender];
      if (factor === undefined) throw new Error(`No efficacy for ${attacker} -> ${defender}`);
      multiplier *= factor;
    }
    if (multiplier !== 1) result[attacker] = multiplier;
  }
  return result;
}
