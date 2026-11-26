import type { TypeName } from "@/lib/types";
import styles from "./TypeBadge.module.css";

export function TypeBadge({ type, multiplier }: { type: TypeName; multiplier?: number }) {
  return (
    <span className={styles.badge} data-type={type}>
      {type}
      {multiplier !== undefined && <span className={styles.multiplier}>{formatMultiplier(multiplier)}</span>}
    </span>
  );
}

export function formatMultiplier(value: number) {
  if (value === 0.5) return "½×";
  if (value === 0.25) return "¼×";
  return `${value}×`;
}
