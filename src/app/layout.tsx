import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";

const pixel = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const readable = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-readable",
});

export const metadata: Metadata = {
  title: { default: "Pocket Index", template: "%s | Pocket Index" },
  description: "A retro handheld Pokédex. Unofficial, non-commercial fan project.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${pixel.variable} ${readable.variable}`}>
      <body>
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          Unofficial fan project. Pokémon names and images belong to their respective owners.
        </footer>
      </body>
    </html>
  );
}
