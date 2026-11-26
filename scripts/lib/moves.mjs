// Which version group supplies a species' move list.
const SCARLET_VIOLET = ["scarlet-violet", "the-teal-mask", "the-indigo-disk"];
const NOT_MAIN_SERIES = new Set(["colosseum", "xd"]);
// Used only when a species has nothing else.
const LAST_RESORT = ["legends-za", "mega-dimension", "champions"];

/**
 * @param available Set of version group identifiers that have moves
 * @param groups Map of identifier -> sort order
 */
export function chooseVersionGroup(available, groups) {
  const sv = SCARLET_VIOLET.find((name) => available.has(name));
  if (sv) return sv;

  const latest = (names) =>
    names.sort((a, b) => groups.get(b) - groups.get(a))[0] ?? null;

  const main = [...available].filter(
    (name) => !NOT_MAIN_SERIES.has(name) && !LAST_RESORT.includes(name),
  );
  return latest(main) ?? latest(LAST_RESORT.filter((name) => available.has(name)));
}
