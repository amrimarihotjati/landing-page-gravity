import Link from "next/link";
import { notFound } from "next/navigation";
import appsData from "../../../data/apps.json";
import styles from "./privacy.module.css";

// Fungsi untuk Cloudflare Pages (Static Export) agar menghasilkan semua route saat build time
export function generateStaticParams() {
  return appsData.map((app) => ({
    appId: app.id,
  }));
}

export function generateMetadata({ params }) {
  const app = appsData.find((a) => a.id === params.appId);
  if (!app) return { title: "Not Found" };
  
  return {
    title: `Privacy Policy - ${app.name}`,
    description: `Kebijakan privasi untuk aplikasi ${app.name}.`,
  };
}

// Parser Markdown sederhana untuk Privacy Policy
function renderMarkdown(text) {
  const blocks = text.trim().split(/\n\n+/);
  return blocks.map((block, index) => {
    if (block.startsWith("# ")) {
      return <h1 key={index}>{block.replace("# ", "")}</h1>;
    } else if (block.startsWith("## ")) {
      return <h2 key={index}>{block.replace("## ", "")}</h2>;
    } else {
      return <p key={index}>{block}</p>;
    }
  });
}

export default function PrivacyPolicyPage({ params }) {
  const app = appsData.find((a) => a.id === params.appId);

  if (!app) {
    notFound();
  }

  return (
    <div className={styles.privacyContainer + " animate-fade-in"}>
      <Link href="/" className={styles.backLink}>
        ← Kembali ke Beranda
      </Link>
      
      <div className={styles.card}>
        <div className={styles.content}>
          {renderMarkdown(app.privacyPolicy)}
        </div>
      </div>
    </div>
  );
}
