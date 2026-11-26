"use client";

import { useState } from "react";
import styles from "./Sprite.module.css";

interface Props {
  /** Null shows the "?" box. */
  src: string | null;
  alt: string;
  size: number;
  lazy?: boolean;
  className?: string;
}

export function Sprite({ src, alt, size, lazy, className = "" }: Props) {
  // Remember which source failed, so a new source gets its own attempt.
  const [failed, setFailed] = useState<string | null>(null);

  if (!src || failed === src) {
    return (
      <span
        className={`${styles.missing} ${className}`}
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${alt} (no image)`}
      >
        ?
      </span>
    );
  }

  return (
    // Tiny pixel art: next/image optimisation adds nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`${styles.sprite} ${className}`}
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading={lazy ? "lazy" : undefined}
      onError={() => setFailed(src)}
      // An image can fail before React attaches onError.
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) setFailed(src);
      }}
    />
  );
}
