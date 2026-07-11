import Link from "next/link";
import { supabase } from "../lib/supabase";
import s from "./page.module.css";

export const revalidate = 0;

export const metadata = {
  title: "Amri Marihotjati — Android Developer",
  description:
    "Jelajahi koleksi aplikasi Android berkualitas tinggi karya Amri Marihotjati.",
};

/* ----------------------------------------------------------------
   Helper: determine the correct privacy URL for an app
   ---------------------------------------------------------------- */
function getPrivacyUrl(app) {
  const custom = app.customprivacylink?.trim();
  return custom || `/privacy/${app.id}`;
}

function isExternal(url) {
  return url.startsWith("http");
}

/* ----------------------------------------------------------------
   Page Component (Server Component — no event handlers here!)
   ---------------------------------------------------------------- */
export default async function Home() {
  const { data: appsData } = await supabase
    .from("apps")
    .select("*")
    .order("created_at", { ascending: true });

  const apps = appsData || [];

  return (
    <div className={s.wrapper}>
      {/* ── Navbar ── */}
      <nav className={s.navbar}>
        <div className={`${s.container} ${s.navInner}`}>
          <Link href="/" className={s.logo}>
            <span>Amri</span>Dev
          </Link>
          <ul className={s.navLinks}>
            <li>
              <a href="#apps" className={s.navLink}>
                Aplikasi
              </a>
            </li>
            <li>
              <Link href="/admin" className={s.navLink}>
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className={s.hero}>
          <div className={`${s.container} ${s.heroInner}`}>
            <div className={s.heroText}>
              <h1 className={s.heroTitle}>
                Solusi Digital{" "}
                <span className={s.heroHighlight}>Terbaik</span> Untuk Anda
              </h1>
              <p className={s.heroSubtitle}>
                Kami membangun aplikasi yang memberikan solusi nyata untuk
                kebutuhan harian Anda — modern, aman, dan mudah digunakan.
              </p>
              <a href="#apps" className={s.heroBtn}>
                Jelajahi Aplikasi ↓
              </a>
            </div>

            <div className={s.heroImageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-mockup.jpg"
                alt="App Showcase"
                className={s.heroImage}
              />
            </div>
          </div>

          {/* Wave transition */}
          <div className={s.wave}>
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,119.26,200,107.57,241.69,100.52,283.47,81.43,321.39,56.44Z"
                className={s.waveFill}
              />
            </svg>
          </div>
        </section>

        {/* ── Apps Section ── */}
        <section id="apps" className={s.appsSection}>
          <div className={s.container}>
            <h2 className={s.sectionTitle}>Ekosistem Aplikasi Kami</h2>
            <p className={s.sectionSubtitle}>
              Berbagai pilihan aplikasi untuk menunjang aktivitas harian Anda
            </p>

            <div className={s.grid}>
              {apps.map((app) => {
                const privacyUrl = getPrivacyUrl(app);
                const external = isExternal(privacyUrl);

                return (
                  <article key={app.id} className={s.card}>
                    <div className={s.cardHeader}>
                      <div className={s.cardIcon}>
                        {app.icon && app.icon.startsWith("http") ? (
                          <img
                            src={app.icon}
                            alt={app.name}
                            className={s.cardIconImg}
                          />
                        ) : (
                          <span>{app.icon || "📱"}</span>
                        )}
                      </div>
                      <h3 className={s.cardName}>{app.name}</h3>
                    </div>

                    <p className={s.cardDesc}>{app.description}</p>

                    {app.screenshots?.length > 0 && (
                      <div className={s.screenshots}>
                        {app.screenshots.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt={`${app.name} screenshot ${i + 1}`}
                            className={s.screenshotImg}
                          />
                        ))}
                      </div>
                    )}

                    <div className={s.cardActions}>
                      {app.playstorelink && (
                        <a
                          href={app.playstorelink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={s.btnPlayStore}
                        >
                          Google Play
                        </a>
                      )}

                      {external ? (
                        <a
                          href={privacyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={s.linkPrivacy}
                        >
                          Privacy Policy ↗
                        </a>
                      ) : (
                        <Link href={privacyUrl} className={s.linkPrivacy}>
                          Privacy Policy
                        </Link>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={`${s.container} ${s.footerInner}`}>
          <span className={s.footerBrand}>AmriDev</span>
          <span className={s.footerCopy}>
            © {new Date().getFullYear()} Amri Marihotjati. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
