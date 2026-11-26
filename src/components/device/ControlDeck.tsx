import styles from "./ControlDeck.module.css";

interface Control {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

interface Props {
  up?: Control;
  down?: Control;
  left?: Control;
  right?: Control;
  a?: Control;
  b?: Control;
  /** Extra buttons between the D-pad and A/B. */
  children?: React.ReactNode;
}

const ARROWS = { up: "▲", down: "▼", left: "◀", right: "▶" } as const;

function Key({ control, className, text }: { control?: Control; className: string; text: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={control?.onPress}
      disabled={!control || control.disabled}
      aria-label={control?.label ?? "Not used"}
      title={control?.label}
    >
      <span aria-hidden="true">{text}</span>
    </button>
  );
}

export function ControlDeck({ a, b, children, ...directions }: Props) {
  return (
    <div className={styles.deck}>
      <div className={styles.dpad} role="group" aria-label="Direction pad">
        {(Object.keys(ARROWS) as (keyof typeof ARROWS)[]).map((dir) => (
          <Key
            key={dir}
            control={directions[dir]}
            className={`${styles.arrow} ${styles[dir]}`}
            text={ARROWS[dir]}
          />
        ))}
        <span className={styles.centre} aria-hidden="true">
          <span />
        </span>
      </div>
      <div className={styles.extra}>{children}</div>
      <div className={styles.faces}>
        <Key control={b} className={`${styles.face} ${styles.b}`} text="B" />
        <Key control={a} className={`${styles.face} ${styles.a}`} text="A" />
      </div>
      <div className={styles.grille} aria-hidden="true">
        <span /><span /><span /><span /><span /><span />
      </div>
    </div>
  );
}
