import Link from "next/link";
import { appsData } from "../data/apps";
import styles from "./page.module.css";

export const metadata = {
  title: "Aplikasi Android Profesional | Portofolio",
  description: "Jelajahi berbagai aplikasi Android berkualitas seperti Harga Emas Hari Ini dan Jual Beli Mobil Bekas.",
};

export default function Home() {
  return (
    <div className="container animate-fade-in">
      <main className={styles.main}>
        <h1 className={styles.title}>Jelajahi Aplikasi Kami</h1>
        <p className={styles.subtitle}>
          Kami membangun aplikasi yang memberikan solusi nyata untuk kebutuhan harian Anda dengan antarmuka yang modern dan mudah digunakan.
        </p>

        <div className={styles.grid}>
          {appsData.map((app) => (
            <div key={app.id} className="glass-card">
              <div className={styles.appCard}>
                <div className={styles.appHeader}>
                  <div className={styles.appIcon}>{app.icon}</div>
                  <h2 className={styles.appName}>{app.name}</h2>
                </div>
                <p className={styles.appDescription}>{app.description}</p>
                <div className={styles.cardActions}>
                  <a
                    href={app.playStoreLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                  >
                    Google Play
                  </a>
                  <Link href={`/privacy/${app.id}`} className="btn btnOutline">
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
