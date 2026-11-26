import Link from "next/link";
import styles from "./PixelButton.module.css";

export type ButtonTone = "yellow" | "cream" | "purple" | "blue" | "panel";

export function buttonClass(tone: ButtonTone = "cream", extra = "") {
  return `${styles.button} ${styles[tone]} ${extra}`.trim();
}

type ButtonProps = React.ComponentPropsWithoutRef<"button"> & { tone?: ButtonTone };

export function PixelButton({ tone, className, type = "button", ...rest }: ButtonProps) {
  return <button {...rest} type={type} className={buttonClass(tone, className)} />;
}

type LinkProps = React.ComponentProps<typeof Link> & { tone?: ButtonTone };

export function PixelLink({ tone, className, ...rest }: LinkProps) {
  return <Link {...rest} className={buttonClass(tone, className)} />;
}
