import type { Metadata } from "next";
import { Press_Start_2P, VT323 } from "next/font/google";
import Link from "next/link";
import { Stars } from "@/components/ui/Stars";
import { SITE_URL } from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: { default: "Pocket Index", template: "%s | Pocket Index" },
  description: "A retro handheld Pokédex. Unofficial, non-commercial fan project.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${pixel.variable} ${readable.variable}`}>
      <body>
        <Stars />
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          Unofficial fan project. Pokémon names and images belong to their respective owners. <Link href="/about">About</Link>
        </footer>
      </body>
    </html>
  );
}
