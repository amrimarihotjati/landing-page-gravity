import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "SpellApp — Crafting Powerful Mobile Experiences",
    template: "%s | SpellApp",
  },
  description:
    "SpellApp membangun aplikasi Android berkualitas tinggi untuk kebutuhan harian Anda.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
