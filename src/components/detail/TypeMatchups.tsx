import { TypeBadge } from "@/components/ui/TypeBadge";
import type { Pokemon, TypeName } from "@/lib/types";
import styles from "./Detail.module.css";

export function TypeMatchups({ matchups }: { matchups: Pokemon["matchups"] }) {
  const entries = Object.entries(matchups) as [TypeName, number][];
  const groups = [
    { title: "Weak to", list: entries.filter(([, m]) => m > 1).sort((a, b) => b[1] - a[1]) },
    { title: "Resists", list: entries.filter(([, m]) => m > 0 && m < 1).sort((a, b) => a[1] - b[1]) },
    { title: "Immune to", list: entries.filter(([, m]) => m === 0) },
  ];

  return (
    <div className={styles.matchups}>
      {groups.map(({ title, list }) => (
        <div key={title}>
          <h3>{title}</h3>
          <div className={styles.badges}>
            {list.length
              ? list.map(([type, m]) => <TypeBadge key={type} type={type} multiplier={m} />)
              : <span>None</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
