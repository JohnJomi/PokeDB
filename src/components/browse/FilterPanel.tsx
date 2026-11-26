"use client";

import { useState } from "react";
import { TYPE_NAMES } from "@/lib/filter";
import type { TypeName } from "@/lib/types";
import styles from "./Browse.module.css";

const FIRST: TypeName[] = ["fire", "water", "grass", "electric", "psychic", "dragon", "normal", "ghost"];

export function FilterPanel({ type, onChange }: { type: TypeName | null; onChange: (type: TypeName | null) => void }) {
  const [more, setMore] = useState(false);
  const expanded = more || (type !== null && !FIRST.includes(type));
  const shown = expanded ? TYPE_NAMES : FIRST;

  return (
    <div className={styles.panel} role="group" aria-label="Filter by type">
      {shown.map((name) => (
        <button
          key={name}
          type="button"
          className={styles.chip}
          data-type={name}
          aria-pressed={type === name}
          onClick={() => onChange(type === name ? null : name)}
        >
          {name}
        </button>
      ))}
      <button type="button" className={styles.chip} aria-expanded={expanded} onClick={() => setMore(!expanded)}>
        {expanded ? "Less" : `+${TYPE_NAMES.length - FIRST.length} more`}
      </button>
    </div>
  );
}
