import styles from "./DeviceShell.module.css";

interface Props {
  title: string;
  /** Rendered next to the title plate, for example the detail tabs. */
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function DeviceShell({ title, header, children }: Props) {
  return (
    <div className={styles.shell}>
      {["tl", "tr", "bl", "br"].map((corner) => (
        <span key={corner} className={`${styles.screw} ${styles[corner]}`} aria-hidden="true" />
      ))}
      <div className={styles.top}>
        <h1 className={styles.plate}>{title}</h1>
        {header}
        <div className={styles.power} aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
      </div>
      {children}
    </div>
  );
}
