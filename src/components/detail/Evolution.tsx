import Link from "next/link";
import { LcdScreen } from "@/components/device/LcdScreen";
import { TitleBar } from "@/components/device/TitleBar";
import { Sprite } from "@/components/ui/Sprite";
import type { EvoNode } from "@/lib/types";
import styles from "./Evolution.module.css";

function Branch({ node, stage, current }: { node: EvoNode; stage: number; current: number }) {
  return (
    <div className={styles.branch}>
      <Link
        href={`/pokemon/${node.slug}`}
        prefetch={false}
        className={styles.card}
        aria-current={node.id === current ? "page" : undefined}
      >
        <span className={styles.stage}>Stage {stage}</span>
        <Sprite src={`/sprites/${node.id}.png`} alt="" size={96} lazy />
        <span>{node.name}</span>
        {node.methods.map((method) => (
          <span key={method} className={styles.method}>{method}</span>
        ))}
      </Link>
      {node.next.length > 0 && (
        <>
          <span className={styles.arrow} aria-hidden="true" />
          <ul className={node.next.length > 2 ? styles.grid : styles.children}>
            {node.next.map((child) => (
              <li key={child.slug}>
                <Branch node={child} stage={stage + 1} current={current} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export function Evolution({ tree, current }: { tree: EvoNode; current: number }) {
  return (
    <LcdScreen aria-label="Evolution">
      <TitleBar title="EVOLUTION" />
      <Branch node={tree} stage={1} current={current} />
      {tree.next.length === 0 && <p className={styles.none}>This Pokémon does not evolve.</p>}
    </LcdScreen>
  );
}
