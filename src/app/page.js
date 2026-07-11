import Link from "next/link";
import { supabase } from "../lib/supabase";
import styles from "./page.module.css";

export const revalidate = 0;

export const metadata = {
  title: "Premium Android Apps",
  description: "Discover our premium ecosystem of Android applications.",
};

export default async function Home() {
  const { data: appsData } = await supabase
    .from('apps')
    .select('*')
    .order('created_at', { ascending: true });

  const apps = appsData || [];

  return (
    <div className="animate-fade-in">
      <div className={styles.bgGlow}></div>
      <div className={styles.bgGlow2}></div>
      
      <main>
        {/* Hero Section */}
        <section className={`container ${styles.hero}`}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>Next-Gen Ecosystem</div>
            <h1 className={styles.title}>
              Solusi Digital <span>Terbaik</span> Untuk Anda
            </h1>
            <p className={styles.subtitle}>
              Jelajahi karya inovatif kami yang dirancang dengan estetika premium, 
              keamanan tingkat tinggi, dan pengalaman pengguna yang luar biasa. 
              Tingkatkan produktivitas harian Anda sekarang.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="#apps" className="btn">Jelajahi Aplikasi</a>
            </div>
          </div>
          
          <div className={styles.heroImageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/hero-mockup.jpg" 
              alt="Premium App Showcase" 
              className={styles.heroImage} 
            />
          </div>
        </section>

        {/* Apps Listing Section */}
        <section id="apps" className={styles.appsSection}>
          <div className={styles.sectionHeader}>
            <h2>Ekosistem Premium</h2>
            <p>Aplikasi pilihan untuk menunjang aktivitas Anda</p>
          </div>
          <div className={styles.grid}>
            {apps.map((app) => {
              // Menentukan URL Privacy Policy (Custom atau Bawaan)
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
                      Download di Google Play
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
