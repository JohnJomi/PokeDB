import styles from "./DialogBox.module.css";

export function DialogBox({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.dialog}>
      <p className={styles.text}>{children}</p>
      <span className={styles.marker} aria-hidden="true">▼</span>
    </div>
  );
}
