import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  title: {
    default: "Amri Marihotjati — Android Developer",
    template: "%s | Amri Marihotjati",
  },
  description:
    "Jelajahi koleksi aplikasi Android berkualitas tinggi karya Amri Marihotjati.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
