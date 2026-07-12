import Link from "next/link";
import { supabase } from "../lib/supabase";
import ScreenshotGallery from "../components/ScreenshotGallery";
import s from "./page.module.css";

export const revalidate = 0;

export const metadata = {
  title: "SpellApp — Crafting Powerful Mobile Experiences",
  description:
    "SpellApp membangun aplikasi Android berkualitas tinggi untuk kebutuhan harian Anda.",
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
   Page Component (Server Component — no event handlers!)
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
            <span className={s.logoIcon}>✦</span> SpellApp
          </Link>
          <ul className={s.navLinks}>
            <li>
              <a href="#apps" className={s.navLink}>
                Aplikasi
              </a>
            </li>
            <li>
              <a href="#about" className={s.navLink}>
                Tentang
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className={s.hero}>
          {/* Decorative floating shapes */}
          <div className={s.heroDecor1} />
          <div className={s.heroDecor2} />

          <div className={`${s.container} ${s.heroInner}`}>
            <div className={s.heroText}>
              <span className={s.heroBadge}>🚀 Inovasi Digital Terdepan</span>
              <h1 className={s.heroTitle}>
                Kami Membangun Aplikasi yang{" "}
                <span className={s.heroHighlight}>Mengubah</span> Cara Anda
                Beraktivitas
              </h1>
              <p className={s.heroSubtitle}>
                SpellApp menghadirkan solusi mobile yang modern, aman, dan
                intuitif — dirancang untuk meningkatkan produktivitas dan
                kenyamanan Anda setiap hari.
              </p>
              <div className={s.heroCtas}>
                <a href="#apps" className={s.heroBtn}>
                  Jelajahi Produk
                </a>
                <a href="#about" className={s.heroBtnOutline}>
                  Pelajari Lebih Lanjut
                </a>
              </div>
            </div>

            <div className={s.heroImageWrapper}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-mockup.jpg"
                alt="SpellApp Showcase"
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

        {/* ── Stats Bar ── */}
        <section className={s.statsBar}>
          <div className={`${s.container} ${s.statsInner}`}>
            <div className={s.statItem}>
              <span className={s.statNumber}>10K+</span>
              <span className={s.statLabel}>Download</span>
            </div>
            <div className={s.statDivider} />
            <div className={s.statItem}>
              <span className={s.statNumber}>4.8★</span>
              <span className={s.statLabel}>Rating</span>
            </div>
            <div className={s.statDivider} />
            <div className={s.statItem}>
              <span className={s.statNumber}>99.9%</span>
              <span className={s.statLabel}>Uptime</span>
            </div>
          </div>
        </section>

        {/* ── Apps Section ── */}
        <section id="apps" className={s.appsSection}>
          <div className={s.container}>
            <span className={s.sectionBadge}>Produk Kami</span>
            <h2 className={s.sectionTitle}>Ekosistem Aplikasi Premium</h2>
            <p className={s.sectionSubtitle}>
              Setiap aplikasi dirancang dengan standar industri tertinggi untuk
              memberikan pengalaman terbaik bagi pengguna
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
                      <div>
                        <h3 className={s.cardName}>{app.name}</h3>
                        <span className={s.cardTag}>Android App</span>
                      </div>
                    </div>

                    <p className={s.cardDesc}>{app.description}</p>

                    {app.screenshots?.length > 0 && (
                      <ScreenshotGallery
                        screenshots={app.screenshots}
                        appName={app.name}
                      />
                    )}

                    <div className={s.cardActions}>
                      {app.playstorelink && (
                        <a
                          href={app.playstorelink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={s.btnPlayStore}
                        >
                          ▶ Google Play
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

        {/* ── About Section ── */}
        <section id="about" className={s.aboutSection}>
          <div className={`${s.container} ${s.aboutInner}`}>
            <div className={s.aboutText}>
              <span className={s.sectionBadge}>Tentang Kami</span>
              <h2 className={s.aboutTitle}>
                Kami Percaya Teknologi Harus Mudah Diakses Semua Orang
              </h2>
              <p className={s.aboutDesc}>
                SpellApp lahir dari semangat untuk menciptakan aplikasi mobile
                yang tidak hanya fungsional, tetapi juga indah dan menyenangkan
                untuk digunakan. Kami berkomitmen pada keamanan data pengguna,
                performa optimal, dan desain yang intuitif.
              </p>
            </div>
            <div className={s.aboutFeatures}>
              <div className={s.featureItem}>
                <div className={s.featureIcon}>🔒</div>
                <h4 className={s.featureName}>Keamanan Tinggi</h4>
                <p className={s.featureDesc}>
                  Enkripsi end-to-end dan perlindungan data pengguna sesuai
                  standar industri
                </p>
              </div>
              <div className={s.featureItem}>
                <div className={s.featureIcon}>⚡</div>
                <h4 className={s.featureName}>Performa Optimal</h4>
                <p className={s.featureDesc}>
                  Arsitektur ringan yang berjalan mulus di berbagai perangkat
                  Android
                </p>
              </div>
              <div className={s.featureItem}>
                <div className={s.featureIcon}>🎨</div>
                <h4 className={s.featureName}>Desain Modern</h4>
                <p className={s.featureDesc}>
                  Antarmuka intuitif mengikuti Material Design guidelines terbaru
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className={s.footer}>
        <div className={`${s.container} ${s.footerInner}`}>
          <span className={s.footerBrand}>✦ SpellApp</span>
          <span className={s.footerCopy}>
            © {new Date().getFullYear()} SpellApp. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
