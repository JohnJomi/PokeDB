import styles from "./Stars.module.css";

const COLOURS = ["var(--yellow)", "var(--white)", "var(--blue)", "var(--pink)"];

// Fixed pseudo-random layout, identical on server and client.
const STARS = Array.from({ length: 70 }, (_, i) => {
  const offset = (i * 37) % 100;
  return {
    size: 4 + (i % 3) * 2,
    top: (i * 61) % 100,
    left: i % 2 === 0 ? offset * 0.09 : 90 + offset * 0.09,
    colour: COLOURS[(i * 7) % COLOURS.length],
  };
});

export function Stars() {
  return (
    <div className={styles.field} aria-hidden="true">
      {STARS.map((star, i) => (
        <span
          key={i}
          style={{
            width: star.size,
            height: star.size,
            top: `${star.top}%`,
            left: `${star.left}%`,
            background: star.colour,
          }}
        />
      ))}
    </div>
  );
}
