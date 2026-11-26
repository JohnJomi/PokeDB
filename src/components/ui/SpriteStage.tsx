import { Sprite } from "./Sprite";
import styles from "./SpriteStage.module.css";

interface Props {
  src: string | null;
  alt: string;
  height: number;
  spriteSize?: number;
  sky?: "day" | "dusk";
}

/** Pixel scene on a 64 x 40 grid with the sprite standing on the platform. */
export function SpriteStage({ src, alt, height, spriteSize = 192, sky = "day" }: Props) {
  return (
    <div className={styles.stage} style={{ height }}>
      <svg
        className={styles.scene}
        viewBox="0 0 64 40"
        preserveAspectRatio="none"
        shapeRendering="crispEdges"
        aria-hidden="true"
      >
        <rect width="64" height="40" fill={sky === "dusk" ? "#FFB36B" : "#8FD6FF"} />
        <path fill="#fff" d="M5 6h10v3H5zM7 4h6v2H7zM45 10h11v2H45zM48 8h5v2h-5z" />
        <path
          fill="#6CC46A"
          d="M0 25h6v-3h5v-2h8v2h5v3h5v3h8v-2h5v-3h7v-2h7v2h4v3h4v17H0z"
        />
        <rect y="31" width="64" height="9" fill="#3F9A4F" />
        <path
          fill="#8BE07A"
          d="M3 34h2v1H3zM11 37h2v1h-2zM53 33h2v1h-2zM59 37h2v1h-2zM7 32h1v1H7zM57 35h1v1h-1z"
        />
        <path fill="#C9A15C" d="M18 31h28v2h4v3h-4v2H18v-2h-4v-3h4z" />
        <path fill="#ECD08C" d="M20 31h24v1H20zM18 33h4v1h-4z" />
      </svg>
      <div className={styles.sprite} style={{ width: spriteSize }}>
        <Sprite src={src} alt={alt} size={spriteSize} />
      </div>
    </div>
  );
}
