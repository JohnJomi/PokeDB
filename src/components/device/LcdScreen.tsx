import styles from "./LcdScreen.module.css";

interface Props extends React.ComponentPropsWithoutRef<"section"> {
  children: React.ReactNode;
}

export function LcdScreen({ children, className = "", ...rest }: Props) {
  return (
    <section {...rest} className={`${styles.bezel} ${className}`}>
      <div className={styles.surface}>{children}</div>
    </section>
  );
}
