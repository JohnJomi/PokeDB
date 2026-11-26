"use client";

import { useEffect, useState } from "react";
import { LcdScreen } from "@/components/device/LcdScreen";
import { TitleBar } from "@/components/device/TitleBar";
import { PixelButton } from "@/components/ui/PixelButton";
import { TypeBadge } from "@/components/ui/TypeBadge";
import type { Move, MoveFile } from "@/lib/types";
import styles from "./Moves.module.css";

const METHODS: Record<string, string> = { "level-up": "Level up", machine: "TM", egg: "Egg", tutor: "Tutor" };
const label = (method: string) => METHODS[method] ?? method.replaceAll("-", " ");

type State = { status: "loading" } | { status: "error" } | { status: "ready"; file: MoveFile };

export function MovesTab({ id }: { id: number }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [method, setMethod] = useState<string>();

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/data/moves/${id}.json`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<MoveFile>;
      })
      .then((file) => setState({ status: "ready", file }))
      .catch(() => {
        if (!controller.signal.aborted) setState({ status: "error" });
      });
    return () => controller.abort();
  }, [id, attempt]);

  const moves: Move[] = state.status === "ready" ? state.file.moves : [];
  const methods = [...new Set(moves.map((m) => m.method))].sort(
    (a, b) => Number(b === "level-up") - Number(a === "level-up") || a.localeCompare(b),
  );
  const active = method && methods.includes(method) ? method : methods[0];
  const rows = moves.filter((m) => m.method === active);

  return (
    <LcdScreen aria-label="Moves">
      <TitleBar title="MOVES" value={state.status === "ready" ? rows.length : "--"} />
      {state.status === "loading" && <p className={styles.state} role="status">LOADING…</p>}
      {state.status === "error" && (
        <div className={styles.state} role="alert">
          <p>LOAD FAILED</p>
          <PixelButton
            tone="yellow"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt(attempt + 1);
            }}
          >
            Retry
          </PixelButton>
        </div>
      )}
      {state.status === "ready" && moves.length === 0 && <p className={styles.state}>NO MOVES FOUND</p>}
      {state.status === "ready" && moves.length > 0 && (
        <>
          <div className={styles.methods} role="group" aria-label="Learn method">
            {methods.map((m) => (
              <PixelButton key={m} tone={m === active ? "yellow" : "cream"} aria-pressed={m === active} onClick={() => setMethod(m)}>
                {label(m)}
              </PixelButton>
            ))}
          </div>
          <div className={styles.scroll} tabIndex={0} data-scroll role="region" aria-label="Move table">
            <table className={styles.table}>
              <thead>
                <tr>
                  {active === "level-up" && <th scope="col">Lv</th>}
                  <th scope="col">Move</th>
                  <th scope="col">Type</th>
                  <th scope="col">Class</th>
                  <th scope="col">Pow</th>
                  <th scope="col">Acc</th>
                  <th scope="col">PP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={`${m.name}-${m.level}`}>
                    {active === "level-up" && <td>{m.level || "—"}</td>}
                    <th scope="row">{m.name}</th>
                    <td><TypeBadge type={m.type} /></td>
                    <td>{m.category}</td>
                    <td>{m.power ?? "—"}</td>
                    <td>{m.accuracy ?? "—"}</td>
                    <td>{m.pp ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.note}>
            Learn list: {state.file.versionGroup.replaceAll("-", " ")}. Power, accuracy and PP are current
            values and may differ in older games.
          </p>
        </>
      )}
    </LcdScreen>
  );
}
