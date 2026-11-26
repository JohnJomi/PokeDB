import type { Metadata } from "next";
import { DeviceShell } from "@/components/device/DeviceShell";
import { LcdScreen } from "@/components/device/LcdScreen";
import { TitleBar } from "@/components/device/TitleBar";
import { PixelLink } from "@/components/ui/PixelButton";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "About", description: "Credits and disclaimer for Pocket Index." };

export default function AboutPage() {
  return (
    <DeviceShell title="● ABOUT">
      <LcdScreen aria-label="Credits">
        <TitleBar title="CREDITS" />
        <div className={styles.text}>
          <p>
            Pocket Index is an unofficial, non-commercial fan project. Pokémon names and images belong to
            their respective owners (Nintendo, Game Freak and The Pokémon Company). This notice does not
            grant permission to use them.
          </p>
          <p>
            Data comes from <a href="https://github.com/PokeAPI/pokeapi">PokeAPI/pokeapi</a> and sprites from{" "}
            <a href="https://github.com/PokeAPI/sprites">PokeAPI/sprites</a>. Their{" "}
            <a href="https://github.com/JohnJomi/PokeDB/tree/main/licenses">licence notices</a> are included
            with the source. Those licences do not necessarily cover the Pokémon images and names.
          </p>
          <p>Type matchups use the current type chart and ignore abilities and items.</p>
        </div>
      </LcdScreen>
      <PixelLink tone="yellow" href="/">Back to index</PixelLink>
    </DeviceShell>
  );
}
