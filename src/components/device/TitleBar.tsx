import styles from "./TitleBar.module.css";

export function TitleBar({ title, value }: { title: string; value?: React.ReactNode }) {
  return (
    <div className={styles.bar}>
      <h2 className={styles.title}>{title}</h2>
      {value !== undefined && <span className={styles.value}>{value}</span>}
    </div>
  );
}
