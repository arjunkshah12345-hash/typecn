import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { effects, effectBySlug } from "@/registry/effects";
import { categories } from "@/registry/types";
import { Playground } from "@/components/playground/playground";
import { ApiTable } from "@/components/api-table";
import { StaticCode } from "@/components/static-code";
import { initialState, installCode, reactCode } from "@/lib/codegen";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return effects.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const e = effectBySlug[slug];
  if (!e) return {};
  const title = `${e.name} — React text animation`;
  const description = `${e.tagline} ${e.description}`.slice(0, 300);
  return {
    title,
    description,
    alternates: { canonical: `/effects/${e.slug}` },
    keywords: [e.name, e.component, "react text animation", "typography", ...(e.keywords ?? [])],
    openGraph: { title: `${e.name} · typecn`, description: e.tagline, url: `/effects/${e.slug}`, type: "article" },
    twitter: { card: "summary_large_image", title: `${e.name} · typecn`, description: e.tagline },
  };
}

export default async function EffectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const meta = effectBySlug[slug];
  if (!meta) notFound();
  const cat = categories.find((c) => c.id === meta.category)!;
  const i = effects.indexOf(meta);
  const prev = effects[(i - 1 + effects.length) % effects.length];
  const next = effects[(i + 1) % effects.length];
  const install = installCode(meta);
  const usage = reactCode(meta, initialState(meta));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: `${meta.name} — React text animation`,
    description: meta.description,
    about: "Kinetic typography",
    url: `${site.url}/effects/${meta.slug}`,
    isPartOf: { "@type": "SoftwareSourceCode", name: "typecn", codeRepository: site.repo },
    proficiencyLevel: "Beginner",
  };

  return (
    <article className="pt-[60px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="container-x grid gap-6 border-b border-line py-8 md:grid-cols-12 md:items-end md:py-12">
        <div className="md:col-span-8">
          <nav aria-label="Breadcrumb" className="label mb-5 flex flex-wrap gap-2 text-muted">
            <Link href="/effects" className="ulink hover:text-fg">
              Explore
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/effects?category=${cat.id}`} className="ulink hover:text-fg">
              {cat.letter} · {cat.name}
            </Link>
          </nav>
          <h1 className="flex items-baseline gap-4 font-serif text-[clamp(48px,7.5vw,120px)] leading-[0.88] tracking-[-0.045em]">
            <span className="font-mono text-[13px] tracking-normal text-accent">{String(meta.number).padStart(2, "0")}</span>
            {meta.name}
          </h1>
        </div>
        <div className="md:col-span-4">
          <p className="font-serif text-[22px] leading-tight italic">{meta.tagline}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{meta.description}</p>
        </div>
      </header>

      <Playground slug={meta.slug} mode="effect" />

      <div className="container-x grid gap-16 py-20 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <nav aria-label="On this page" className="label sticky top-24 hidden flex-col gap-2 text-muted lg:flex">
            {["About", "Installation", "Usage", "API reference", "Triggers", "Accessibility", "Performance"].map((h) => (
              <a key={h} href={`#${h.toLowerCase().replace(/ /g, "-")}`} className="ulink self-start hover:text-fg">
                {h}
              </a>
            ))}
          </nav>
        </aside>
        <div className="space-y-16 lg:col-span-9">
          <DocSection id="about" title="About">
            <p className="max-w-[62ch] text-[17px] leading-relaxed text-muted">{meta.description}</p>
            <dl className="mt-6 grid grid-cols-2 gap-px border border-line bg-line text-[14px] sm:grid-cols-4">
              {[
                ["Component", meta.component],
                ["Category", cat.name],
                ["Behaviour", meta.kind === "timed" ? "Triggered timeline" : meta.kind === "continuous" ? "Continuous loop" : meta.kind === "scroll" ? "Scroll-driven" : "Pointer-driven"],
                ["Dependencies", "React only"],
              ].map(([k, v]) => (
                <div key={k} className="bg-bg p-4">
                  <dt className="label mb-1 text-faint">{k}</dt>
                  <dd className="font-mono text-[13px]">{v}</dd>
                </div>
              ))}
            </dl>
          </DocSection>

          <DocSection id="installation" title="Installation">
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-[15px]">
                  <span className="label mr-2 text-accent">A</span>With the shadcn CLI — copies the source into <code className="font-mono text-[13px]">components/typecn</code>:
                </p>
                <StaticCode code={install.registry} lang="bash" />
              </div>
              <div>
                <p className="mb-2 text-[15px]">
                  <span className="label mr-2 text-accent">B</span>As a package, built locally (not yet on npm):
                </p>
                <StaticCode code={install.pkg} lang="bash" />
              </div>
              <div>
                <p className="text-[15px] text-muted">
                  <span className="label mr-2 text-accent">C</span>Or copy <code className="font-mono text-[13px] text-fg">core.tsx</code> and <code className="font-mono text-[13px] text-fg">effects/{meta.file}.tsx</code> from the React → Source tab above.
                </p>
              </div>
            </div>
          </DocSection>

          <DocSection id="usage" title="Usage">
            <StaticCode code={usage} lang="tsx" />
            <p className="mt-3 text-[14px] text-muted">Using the copied source? Import from <code className="font-mono text-[13px]">@/components/typecn/effects/{meta.file}</code> instead.</p>
          </DocSection>

          <DocSection id="api-reference" title="API reference">
            <ApiTable meta={meta} />
          </DocSection>

          <DocSection id="triggers" title="Triggers">
            <p className="max-w-[62ch] text-[16px] leading-relaxed text-muted">{meta.notes.trigger}</p>
          </DocSection>
          <DocSection id="accessibility" title="Accessibility">
            <p className="max-w-[62ch] text-[16px] leading-relaxed text-muted">
              {meta.notes.a11y} Respects <code className="font-mono text-[13px]">prefers-reduced-motion</code>: the final, readable state renders without motion.
            </p>
          </DocSection>
          <DocSection id="performance" title="Performance">
            <p className="max-w-[62ch] text-[16px] leading-relaxed text-muted">{meta.notes.perf}</p>
          </DocSection>
        </div>
      </div>

      <nav aria-label="More effects" className="grid border-t border-line md:grid-cols-2">
        {[
          { e: prev, dir: "Previous" },
          { e: next, dir: "Next" },
        ].map(({ e, dir }) => (
          <Link key={dir} href={`/effects/${e.slug}`} className={`group container-x block py-12 transition-colors hover:bg-bg-2 ${dir === "Next" ? "md:border-l md:border-line md:text-right" : ""}`}>
            <span className="label text-muted">
              {dir} · Nº {String(e.number).padStart(2, "0")}
            </span>
            <span className="mt-2 block font-serif text-[clamp(32px,4vw,56px)] leading-none tracking-[-0.03em] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:italic">
              {e.name}
            </span>
          </Link>
        ))}
      </nav>
    </article>
  );
}

function DocSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-5 flex items-baseline gap-3 border-b border-line pb-3 font-serif text-[30px] leading-none tracking-[-0.02em]">{title}</h2>
      {children}
    </section>
  );
}
