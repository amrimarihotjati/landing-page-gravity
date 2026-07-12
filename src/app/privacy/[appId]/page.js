import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { renderMarkdown } from "../../../lib/markdown";
import s from "../../page/[slug]/content.module.css";

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { appId } = await params;
  const { data: app } = await supabase
    .from("apps")
    .select("name")
    .eq("id", appId)
    .single();

  if (!app) return { title: "Not Found" };

  return {
    title: `Privacy Policy — ${app.name}`,
    description: `Kebijakan privasi untuk aplikasi ${app.name}.`,
  };
}

export default async function PrivacyPolicyPage({ params }) {
  const { appId } = await params;
  const { data: app } = await supabase
    .from("apps")
    .select("*")
    .eq("id", appId)
    .single();

  if (!app) notFound();

  return (
    <div className={s.pageWrapper}>
      {/* Blue header */}
      <header className={s.pageHeader}>
        <div className={s.headerDecor} />
        <div className={s.headerInner}>
          <Link href="/" className={s.backLink}>
            ← Kembali
          </Link>
          <h1 className={s.pageTitle}>Privacy Policy</h1>
          <p className={s.pageMeta}>{app.name}</p>
        </div>
      </header>

      {/* Content body */}
      <div className={s.pageBody}>
        <article className={s.article}>
          <div className={s.content}>
            {renderMarkdown(app.privacypolicy || "")}
          </div>
        </article>
      </div>

      {/* Mini footer */}
      <footer className={s.pageFooter}>
        © {new Date().getFullYear()} SpellApp. All rights reserved.
      </footer>
    </div>
  );
}
