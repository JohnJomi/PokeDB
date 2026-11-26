export type TypeName =
  | "normal" | "fire" | "water" | "grass" | "electric" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export interface IndexEntry {
  id: number;
  slug: string;
  name: string;
  gen: number;
  types: TypeName[];
  total: number;
  heightM: number;
  weightKg: number;
}

export interface Stats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface EvoNode {
  id: number;
  slug: string;
  name: string;
  /** How this node is reached; empty for the root. */
  methods: string[];
  next: EvoNode[];
}

export interface Form {
  slug: string;
  name: string;
  types: TypeName[];
  /** Null when the pinned sprite set has no image for this form. */
  sprite: string | null;
}

export interface Pokemon extends IndexEntry {
  genus: string;
  description: string;
  stats: Stats;
  abilities: { name: string; hidden: boolean }[];
  /** Incoming damage multipliers; 1x is omitted. */
  matchups: Partial<Record<TypeName, number>>;
  evolution: EvoNode;
  forms: Form[];
  prevSlug: string | null;
  nextSlug: string | null;
}

export interface Move {
  name: string;
  type: TypeName;
  category: "physical" | "special" | "status";
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  method: string;
  level: number | null;
}

export interface MoveFile {
  versionGroup: string;
  moves: Move[];
}
