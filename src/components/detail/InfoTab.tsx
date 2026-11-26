import { LcdScreen } from "@/components/device/LcdScreen";
import { TitleBar } from "@/components/device/TitleBar";
import { DialogBox } from "@/components/ui/DialogBox";
import { SpriteStage } from "@/components/ui/SpriteStage";
import { TypeBadge } from "@/components/ui/TypeBadge";
import { formatNumber } from "@/lib/filter";
import type { Pokemon, Stats } from "@/lib/types";
import { Evolution } from "./Evolution";
import { StatBar } from "./StatBar";
import { TypeMatchups } from "./TypeMatchups";
import styles from "./Detail.module.css";

const STAT_LABELS: [keyof Stats, string][] = [
  ["hp", "HP"], ["atk", "Attack"], ["def", "Defense"],
  ["spa", "Sp. Atk"], ["spd", "Sp. Def"], ["spe", "Speed"],
];

export function InfoTab({ pokemon, shiny }: { pokemon: Pokemon; shiny: boolean }) {
  const { id, name } = pokemon;
  const abilities = pokemon.abilities.filter((a) => !a.hidden).map((a) => a.name);
  const hidden = pokemon.abilities.filter((a) => a.hidden).map((a) => a.name);
  const facts = [
    ["Height", `${pokemon.heightM}m`],
    ["Weight", `${pokemon.weightKg}kg`],
    ["Ability", abilities.join(" / ")],
    ["Hidden", hidden.join(" / ") || "—"],
  ];

  return (
    <>
      <div className={styles.columns}>
        <LcdScreen aria-label="Profile">
          <TitleBar title={formatNumber(id)} value={`GEN ${pokemon.gen}`} />
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.genus}>{pokemon.genus}</p>
          <SpriteStage
            src={shiny ? `/sprites/shiny/${id}.png` : `/sprites/${id}.png`}
            alt={shiny ? `Shiny ${name}` : name}
            height={330}
            sky="dusk"
          />
          <div className={styles.badges}>
            {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
          </div>
          <dl className={styles.facts}>
            {facts.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
        </LcdScreen>

        <LcdScreen aria-label="Stats">
          <TitleBar title="BASE STATS" value={pokemon.total} />
          <dl className={styles.stats}>
            {STAT_LABELS.map(([key, label]) => (
              <StatBar key={key} stat={key} label={label} value={pokemon.stats[key]} />
            ))}
          </dl>
          <TitleBar title="TYPE MATCHUPS" />
          <TypeMatchups matchups={pokemon.matchups} />
        </LcdScreen>
      </div>
      <DialogBox>{pokemon.description}</DialogBox>
      <Evolution tree={pokemon.evolution} current={id} />
    </>
  );
}
