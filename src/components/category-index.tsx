import Link from "next/link";
import { effects } from "@/registry/effects";
import { categories } from "@/registry/types";

/** Editorial table of contents. Server component — zero JS. */
export function CategoryIndex() {
  return (
    <section className="container-x py-24 md:py-32" aria-labelledby="index-title">
      <div className="mb-12 grid gap-6 md:grid-cols-12">
        <p className="label text-accent md:col-span-3">Contents</p>
        <h2 id="index-title" className="font-serif text-[clamp(36px,4.6vw,68px)] leading-[0.98] tracking-[-0.03em] md:col-span-9 text-balance">
          Five families of motion, fifty distinct behaviours. <span className="italic text-muted">No two share a trick.</span>
        </h2>
      </div>
      <ol className="border-t border-line">
        {categories.map((c) => {
          const list = effects.filter((e) => e.category === c.id);
          return (
            <li key={c.id} className="border-b border-line">
              <Link href={`/effects?category=${c.id}`} className="group grid items-baseline gap-x-6 gap-y-2 py-6 md:grid-cols-12 md:py-8">
                <span className="font-mono text-xs text-muted md:col-span-1">{c.letter}</span>
                <span className="font-serif text-[clamp(30px,4vw,56px)] leading-none tracking-[-0.03em] transition-[font-variation-settings,color] duration-700 group-hover:text-accent md:col-span-5" style={{ fontVariationSettings: '"wght" 380' }}>
                  <span className="inline-block transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3 group-hover:italic">{c.name}</span>
                </span>
                <span className="text-[14px] leading-relaxed text-muted md:col-span-5">
                  {c.blurb} <span className="text-faint">{list.map((e) => e.name).join(" · ")}</span>
                </span>
                <span className="font-mono text-xs text-muted tabular-nums md:col-span-1 md:text-right">
                  {String(list[0].number).padStart(2, "0")}–{String(list[list.length - 1].number).padStart(2, "0")}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
