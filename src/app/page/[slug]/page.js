import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { renderMarkdown } from "../../../lib/markdown";
import s from "./content.module.css";

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { data: page } = await supabase
    .from("pages")
    .select("title")
    .eq("slug", slug)
    .single();

  if (!page) return { title: "Halaman Tidak Ditemukan" };

  return {
    title: page.title,
    description: `Halaman ${page.title}`,
  };
}

export default async function CMSPage({ params }) {
  const { slug } = await params;
  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!page) notFound();

  const dateStr = page.created_at
    ? new Date(page.created_at).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className={s.pageWrapper}>
      {/* Blue header */}
      <header className={s.pageHeader}>
        <div className={s.headerDecor} />
        <div className={s.headerInner}>
          <Link href="/" className={s.backLink}>
            ← Kembali
          </Link>
          <h1 className={s.pageTitle}>{page.title}</h1>
          {dateStr && <p className={s.pageMeta}>Diperbarui: {dateStr}</p>}
        </div>
      </header>

      {/* Content body */}
      <div className={s.pageBody}>
        <article className={s.article}>
          <div className={s.content}>{renderMarkdown(page.content || "")}</div>
        </article>
      </div>

      {/* Mini footer */}
      <footer className={s.pageFooter}>
        © {new Date().getFullYear()} SpellApp. All rights reserved.
      </footer>
    </div>
  );
}
