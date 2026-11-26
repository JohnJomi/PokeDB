"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PixelButton } from "@/components/ui/PixelButton";
import type { Pokemon } from "@/lib/types";
import { FormsTab } from "./FormsTab";
import { MovesTab } from "./MovesTab";
import styles from "./Detail.module.css";

const TABS = ["info", "moves", "forms"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  pokemon: Pokemon;
  info: React.ReactNode;
  actions: React.ReactNode;
}

/** The only component that reads ?tab=, so the rest stays prerendered. */
export function TabbedContent({ pokemon, info, actions }: Props) {
  const router = useRouter();
  const requested = useSearchParams().get("tab") as Tab;
  const tab = TABS.includes(requested) ? requested : "info";

  return (
    <>
      <div className={styles.tabs}>
        {TABS.map((name) => (
          <PixelButton
            key={name}
            tone={name === tab ? "yellow" : "cream"}
            aria-current={name === tab ? "page" : undefined}
            onClick={() => router.replace(name === "info" ? "?" : `?tab=${name}`, { scroll: false })}
          >
            {name}
          </PixelButton>
        ))}
        {actions}
      </div>
      {tab === "info" && info}
      {tab === "moves" && <MovesTab id={pokemon.id} />}
      {tab === "forms" && <FormsTab forms={pokemon.forms} />}
    </>
  );
}
