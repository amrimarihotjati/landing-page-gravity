import Link from "next/link";
import { supabase } from "../lib/supabase";
import styles from "./page.module.css";

export const revalidate = 0;

export const metadata = {
  title: "Premium Android Apps",
  description: "Jelajahi ekosistem aplikasi Android kami.",
};

export default async function Home() {
  const { data: appsData } = await supabase
    .from('apps')
    .select('*')
    .order('created_at', { ascending: true });

  const apps = appsData || [];

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
              alt="Premium App Showcase" 
              className={styles.heroImage} 
            />
          </div>

          <div className={styles.waveContainer}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.26,200,107.57,241.69,100.52,283.47,81.43,321.39,56.44Z" className={styles.shapeFill}></path>
            </svg>
          </div>
        </section>

        {/* Apps Listing Section */}
        <section id="apps" className={styles.appsSection}>
          <div className={styles.sectionHeader}>
            <h2>Jelajahi Ekosistem Kami</h2>
            <p>Berbagai pilihan aplikasi untuk kebutuhan harian Anda</p>
          </div>
          <div className={styles.grid}>
            {apps.map((app) => {
              // Menentukan URL Privacy Policy (Custom eksternal, custom CMS, atau Bawaan)
              const privacyUrl = app.customprivacylink && app.customprivacylink.trim() !== '' 
                ? app.customprivacylink 
                : `/privacy/${app.id}`;
              
              const isExternalPrivacy = privacyUrl.startsWith('http');

              return (
                <div key={app.id} className={styles.appCard}>
                  <div className={styles.appHeader}>
                    <div className={styles.appIconWrapper}>
                      {app.icon && app.icon.startsWith('http') ? (
                        <img src={app.icon} alt={app.name} className={styles.iconImage} />
                      ) : (
                        <span>{app.icon || '📱'}</span>
                      )}
                    </div>
                    <h3>{app.name}</h3>
                  </div>
                  
                  <p className={styles.appDescription}>{app.description}</p>
                  
                  {app.screenshots && app.screenshots.length > 0 && (
                    <div className={styles.screenshotsGallery}>
                      {app.screenshots.map((ss, idx) => (
                        <img key={idx} src={ss} alt={`Screenshot ${idx}`} className={styles.screenshotImg} />
                      ))}
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    {app.playstorelink && (
                      <a 
                        href={app.playstorelink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.playStoreBtn}
                      >
                      Google Play
                    </a>
                    )}
                    
                    {isExternalPrivacy ? (
                      <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className={styles.privacyLink}>
                        Privacy Policy ↗
                      </a>
                    ) : (
                      <Link href={privacyUrl} className={styles.privacyLink}>
                        Privacy Policy
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
