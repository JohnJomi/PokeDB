import type { Stats } from "@/lib/types";
import styles from "./Detail.module.css";

const SEGMENTS = 16;

export function StatBar({ stat, label, value }: { stat: keyof Stats; label: string; value: number }) {
  const filled = Math.min(SEGMENTS, Math.round((value / 160) * SEGMENTS));
  return (
    <div className={styles.stat}>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <div className={styles.track} style={{ color: `var(--stat-${stat})` }} aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} data-filled={i < filled || undefined} />
        ))}
      </div>
    </div>
  );
}
