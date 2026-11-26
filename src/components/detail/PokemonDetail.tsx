"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ControlDeck } from "@/components/device/ControlDeck";
import { DeviceShell } from "@/components/device/DeviceShell";
import { PixelButton, PixelLink } from "@/components/ui/PixelButton";
import type { Pokemon } from "@/lib/types";
import { InfoTab } from "./InfoTab";
import { TabbedContent } from "./TabbedContent";
import styles from "./Detail.module.css";

export function PokemonDetail({ pokemon }: { pokemon: Pokemon }) {
  const router = useRouter();
  const [shiny, setShiny] = useState(false);
  const { prevSlug, nextSlug } = pokemon;

  const go = (slug: string | null) => {
    if (slug) router.push(`/pokemon/${slug}`);
  };
  // Opened directly (no history in this tab): go to the index instead.
  const back = () => (window.history.length > 1 ? router.back() : router.push("/"));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if ((e.target as HTMLElement).closest("input, select, textarea, [role=tablist], [data-scroll]")) return;
      const slug = e.key === "ArrowLeft" ? prevSlug : e.key === "ArrowRight" ? nextSlug : null;
      if (slug) router.push(`/pokemon/${slug}`);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prevSlug, nextSlug, router]);

  const shinyButton = (
    <PixelButton tone="purple" aria-pressed={shiny} onClick={() => setShiny(!shiny)}>
      ✦ Shiny
    </PixelButton>
  );
  const info = <InfoTab pokemon={pokemon} shiny={shiny} />;

  return (
    <DeviceShell title="◆ ENTRY VIEW">
      <Suspense fallback={info}>
        <TabbedContent pokemon={pokemon} info={info} actions={shinyButton} />
      </Suspense>

      <nav className={styles.stepper} aria-label="Entry navigation">
        <PixelButton onClick={back}>Back</PixelButton>
        {prevSlug && <PixelLink href={`/pokemon/${prevSlug}`} prefetch={false}>◀ Prev</PixelLink>}
        {nextSlug && <PixelLink href={`/pokemon/${nextSlug}`} prefetch={false}>Next ▶</PixelLink>}
      </nav>

      <ControlDeck
        left={{ label: "Previous entry", onPress: () => go(prevSlug), disabled: !prevSlug }}
        right={{ label: "Next entry", onPress: () => go(nextSlug), disabled: !nextSlug }}
        a={{ label: "Toggle shiny", onPress: () => setShiny(!shiny) }}
        b={{ label: "Back", onPress: back }}
      >
        <PixelLink tone="blue" href="/">Index</PixelLink>
      </ControlDeck>
    </DeviceShell>
  );
}
