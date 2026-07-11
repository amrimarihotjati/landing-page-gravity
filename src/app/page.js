import Link from "next/link";
import appsData from "../data/apps.json";
import styles from "./page.module.css";

export const metadata = {
  title: "Aplikasi Android Profesional",
  description: "Jelajahi berbagai aplikasi Android berkualitas dari kami.",
};

export default function Home() {
  return (
    <div className="animate-fade-in">
      <main>
        {/* Hero Section */}
        <section className={`container ${styles.hero}`}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Solusi Digital <span>Terbaik</span> Untuk Anda
            </h1>
            <p className={styles.subtitle}>
              Kami membangun aplikasi yang memberikan solusi nyata untuk kebutuhan harian Anda dengan antarmuka yang modern, aman, dan mudah digunakan.
            </p>
            <a href="#apps" className="btn">Lihat Aplikasi</a>
          </div>
          <div className={styles.heroImageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/hero-mockup.jpg" 
              alt="Smartphone App Mockup" 
              className={styles.heroImage} 
            />
          </div>
        </section>

        {/* Waves SVG */}
        <div className={styles.waveContainer}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.26,200,107.57,241.69,100.52,283.47,81.43,321.39,56.44Z" className={styles.shapeFill}></path>
          </svg>
        </div>

        {/* Apps Listing Section */}
        <section id="apps" className={styles.appsSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2>Jelajahi Ekosistem Kami</h2>
            </div>
            <div className={styles.grid}>
              {appsData.map((app) => (
                <div key={app.id} className={styles.appCard}>
                  <div className={styles.appHeader}>
                    <div className={styles.appIconWrapper}>
                      {app.icon.startsWith("http") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={app.icon} alt={app.name} className={styles.appIconImage} />
                      ) : (
                        app.icon
                      )}
                    </div>
                    <h3 className={styles.appName}>{app.name}</h3>
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
                    <Link href={`/privacy/${app.id}`} className="btn btn-outline">
                      Privacy Policy
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
