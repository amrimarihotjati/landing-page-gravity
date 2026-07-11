import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import styles from "../../privacy/[appId]/privacy.module.css";

export const revalidate = 0; // Force dynamic for now

export async function generateMetadata({ params }) {
  const { data: page } = await supabase
    .from('pages')
    .select('title')
    .eq('slug', params.slug)
    .single();

  if (!page) return { title: "Not Found" };
  
  return {
    title: page.title,
    description: `Halaman ${page.title}`,
  };
}

// Parser Markdown sederhana
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

export default async function CMSPage({ params }) {
  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (!page) {
    notFound();
  }

  return (
    <div className={styles.privacyContainer + " animate-fade-in"}>
      <Link href="/" className={styles.backLink}>
        ← Kembali ke Beranda
      </Link>
      
      <div className={styles.card}>
        <div className={styles.content}>
          {renderMarkdown(page.content || '')}
        </div>
      </div>
    </div>
  );
}
