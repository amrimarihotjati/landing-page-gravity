import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import styles from "./privacy.module.css";

export const revalidate = 0; // Force dynamic for now

export async function generateMetadata({ params }) {
  const { data: app } = await supabase
    .from('apps')
    .select('name')
    .eq('id', params.appId)
    .single();

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

export default async function PrivacyPolicyPage({ params }) {
  const { data: app } = await supabase
    .from('apps')
    .select('*')
    .eq('id', params.appId)
    .single();

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
