import { z } from "zod";
import { TYPES } from "./matchups.mjs";

const type = z.enum(TYPES);
const slug = z.string().regex(/^[a-z0-9-]+$/);
const types = z.array(type).min(1).max(2);
const count = z.number().int().positive();

export const indexEntry = z.strictObject({
  id: count,
  slug,
  name: z.string().min(1),
  gen: z.number().int().min(1).max(9),
  types,
  total: count,
  heightM: z.number().positive(),
  weightKg: z.number().positive(),
});

const evoNode = z.strictObject({
  id: count,
  slug,
  name: z.string().min(1),
  methods: z.array(z.string().min(1)),
  get next() {
    return z.array(evoNode);
  },
});

export const pokemon = indexEntry.extend({
  genus: z.string().min(1),
  description: z.string().min(1),
  stats: z.strictObject({ hp: count, atk: count, def: count, spa: count, spd: count, spe: count }),
  abilities: z.array(z.strictObject({ name: z.string().min(1), hidden: z.boolean() })).min(1),
  matchups: z.partialRecord(type, z.number()),
  evolution: evoNode,
  forms: z
    .array(
      z.strictObject({
        slug,
        name: z.string().min(1),
        types,
        sprite: z.string().nullable(),
      }),
    )
    .min(1),
  prevSlug: slug.nullable(),
  nextSlug: slug.nullable(),
});

const stat = z.number().int().nonnegative().nullable();

export const moveFile = z.strictObject({
  versionGroup: z.string(),
  moves: z.array(
    z.strictObject({
      name: z.string().min(1),
      type,
      category: z.enum(["physical", "special", "status"]),
      power: stat,
      accuracy: stat,
      pp: stat,
      method: z.string().min(1),
      level: stat,
    }),
  ),
});
