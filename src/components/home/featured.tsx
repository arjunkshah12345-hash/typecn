import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { effectBySlug } from "@/registry/effects";
import { EffectCard } from "../effect-card";
import { SectionHead } from "./section-head";

/** A hand-picked spread of live effects, set on the catalogue's hairline grid. */
const picks: { slug: string; span: string; size?: number; tall?: boolean }[] = [
  { slug: "liquid-type", span: "lg:col-span-4", size: 96, tall: true },
  { slug: "magnetic-letters", span: "lg:col-span-2", size: 54, tall: true },
  { slug: "scramble-decode", span: "lg:col-span-2", size: 40 },
  { slug: "variable-morph", span: "lg:col-span-2", size: 58 },
  { slug: "glitch-shift", span: "lg:col-span-2", size: 52 },
  { slug: "text-mask-video", span: "lg:col-span-3", size: 88 },
  { slug: "cursor-repel", span: "lg:col-span-3", size: 60 },
  { slug: "ascii-transform", span: "lg:col-span-2", size: 40 },
  { slug: "chromatic-split", span: "lg:col-span-2", size: 56 },
  { slug: "wave-text", span: "lg:col-span-2", size: 48 },
];

export function Featured() {
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="featured-title">
      <SectionHead
        id="featured-title"
        n="01"
        kicker="From the catalogue"
        aside={`${picks.length} of 50`}
        title={
          <>
            A few <em>favourites</em>.
          </>
        }
      >
        <p className="max-w-[44ch]">Ten effects from five families, all running live. Hover the interactive ones, or open any entry to tune it and take the code.</p>
        <Link href="/effects" className="ulink mt-4 inline-flex items-center gap-1.5 text-[15px] text-fg">
          See all 50 <ArrowRight className="size-4" strokeWidth={1.75} />
        </Link>
      </SectionHead>
      <div className="grid grid-cols-1 border-t border-l border-line md:grid-cols-2 lg:grid-cols-6">
        {picks.map((p, i) => {
          const meta = effectBySlug[p.slug];
          return <EffectCard key={p.slug} meta={meta} index={i} size={p.size} className={`${p.span} ${p.tall ? "min-h-[400px] lg:min-h-[460px]" : "min-h-[340px]"}`} />;
        })}
      </div>
    </section>
  );
}
