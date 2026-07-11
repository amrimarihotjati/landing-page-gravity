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

  return (
    <div className={s.pageContainer}>
      <Link href="/" className={s.backLink}>
        ← Kembali ke Beranda
      </Link>

      <article className={s.article}>
        <div className={s.content}>{renderMarkdown(page.content || "")}</div>
      </article>
    </div>
  );
}
