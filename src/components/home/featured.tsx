import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { effectBySlug } from "@/registry/effects";
import { EffectCard } from "../effect-card";

/** dithercn-style "start from an example" bento of hand-picked live effects. */
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
      <div className="mb-10 grid gap-6 md:grid-cols-2 md:items-end">
        <h2 id="featured-title" className="display text-[clamp(44px,6.5vw,88px)]">
          Start from
          <br />
          an example.
        </h2>
        <div className="md:justify-self-end">
          <p className="max-w-[44ch] text-[17px] leading-relaxed text-muted">
            50 effects in five families, all running live below. Hover the interactive ones. Open any card to tune it and take the code.
          </p>
          <Link href="/effects" className="mt-4 inline-flex items-center gap-1.5 text-[15px] font-medium hover:text-accent">
            See all 50 in the catalogue <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
        {picks.map((p, i) => {
          const meta = effectBySlug[p.slug];
          return <EffectCard key={p.slug} meta={meta} index={i} size={p.size} className={`${p.span} ${p.tall ? "min-h-[400px] lg:min-h-[460px]" : "min-h-[340px]"}`} />;
        })}
      </div>
    </section>
  );
}
