import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { docs } from "@/lib/docs";
import { docContent } from "@/components/docs-content";

export const dynamicParams = false;

export function generateStaticParams() {
  return docs.map((d) => ({ slug: d.slug ? [d.slug] : [] }));
}

function find(slug?: string[]) {
  const key = slug?.join("/") ?? "";
  return docs.find((d) => d.slug === key);
}

export async function generateMetadata({ params }: { params: Promise<{ slug?: string[] }> }): Promise<Metadata> {
  const d = find((await params).slug);
  if (!d) return {};
  return { title: `${d.title} — Docs`, description: d.blurb, alternates: { canonical: `/docs${d.slug ? `/${d.slug}` : ""}` } };
}

export default async function DocPage({ params }: { params: Promise<{ slug?: string[] }> }) {
  const d = find((await params).slug);
  if (!d) notFound();
  const i = docs.indexOf(d);
  const next = docs[i + 1];
  return (
    <div className="container-x grid gap-12 pt-[110px] pb-24 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <nav aria-label="Documentation" className="sticky top-24">
          <p className="label mb-4 text-faint">Documentation</p>
          <ol className="space-y-1">
            {docs.map((x, k) => {
              const active = x.slug === d.slug;
              return (
                <li key={x.slug}>
                  <Link
                    href={`/docs${x.slug ? `/${x.slug}` : ""}`}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-baseline gap-3 py-1 text-[15px] transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`}
                  >
                    <span className={`font-mono text-[10px] ${active ? "text-accent" : "text-faint"}`}>{String(k + 1).padStart(2, "0")}</span>
                    <span className={active ? "font-serif text-[17px] italic" : ""}>{x.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <Link href="/effects" className="label ulink mt-8 inline-block text-muted hover:text-fg">
            Effect reference (50) →
          </Link>
        </nav>
      </aside>
      <article className="lg:col-span-8">
        <p className="label mb-4 text-accent">Docs · {String(i + 1).padStart(2, "0")}</p>
        <h1 className="mb-6 font-serif text-[clamp(48px,7vw,104px)] leading-[0.9] tracking-[-0.045em]">{d.title}</h1>
        <p className="mb-10 max-w-[50ch] font-serif text-[22px] leading-snug italic text-muted">{d.blurb}</p>
        <div className="space-y-5">{docContent[d.slug]}</div>
        {next ? (
          <Link href={`/docs/${next.slug}`} className="group mt-20 block border-t border-line pt-6">
            <span className="label text-muted">Next</span>
            <span className="mt-1 block font-serif text-[40px] leading-none tracking-[-0.03em] transition-all group-hover:italic">{next.title} →</span>
          </Link>
        ) : null}
      </article>
    </div>
  );
}
