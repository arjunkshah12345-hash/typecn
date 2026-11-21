"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { effectBySlug, defaultProps } from "@/registry/effects";
import { useReducedMotion } from "typecn";
import { installCode } from "@/lib/codegen";
import { EffectRenderer, defaultTypography } from "./effect-renderer";
import { CopyButton } from "./copy-button";

/** The headline is re-set by a different real effect every few seconds. */
const sequence: { slug: string; ms: number; props?: Record<string, unknown>; hint?: string }[] = [
  { slug: "character-cascade", ms: 4200, props: { loop: false, duration: 1100, stagger: 32, distance: 0.6, rotate: 4 } },
  { slug: "blur-resolve", ms: 4000, props: { loop: false, stagger: 26, duration: 1200 } },
  { slug: "proximity-weight", ms: 7000, props: { minWeight: 200, maxWeight: 800, radius: 320 }, hint: "Move your pointer across the line" },
  { slug: "line-lift", ms: 4000, props: { loop: false } },
  { slug: "word-stagger", ms: 4000, props: { loop: false } },
  { slug: "cursor-repel", ms: 7000, props: { radius: 140, force: 1.4 }, hint: "Push through the letters" },
];

const HEADLINE = "Type, set\nin motion.";

export function Hero() {
  const [i, setI] = useState(0);
  const [cycle, setCycle] = useState(0);
  const reduced = useReducedMotion();
  const step = sequence[i];
  const meta = effectBySlug[step.slug];
  const install = installCode(effectBySlug["character-cascade"]).registry;

  useEffect(() => {
    if (reduced) return;
    const t = setTimeout(() => setI((v) => (v + 1) % sequence.length), step.ms);
    return () => clearTimeout(t);
  }, [i, cycle, step.ms, reduced]);

  const go = (k: number) => {
    setI(k);
    setCycle((c) => c + 1);
  };

  return (
    <section className="container-x pt-[108px] sm:pt-[124px]" aria-labelledby="hero-title">
      {/* running head */}
      <div className="label flex items-center justify-between gap-4 border-b border-line-strong pb-3 text-muted">
        <span>N° 001 — A specimen of moving type</span>
        <span className="hidden sm:inline">50 effects · React · MIT</span>
      </div>

      <h1 id="hero-title" className="sr-only">
        typecn — Type that moves. 50 open-source text animations for React.
      </h1>

      <div className="relative flex items-center py-[clamp(36px,6vw,88px)]" style={{ minHeight: "calc(2 * 0.92 * clamp(68px, 12.4vw, 212px) + 2 * clamp(36px, 6vw, 88px))" }}>
        <EffectRenderer
          key={`${step.slug}-${cycle}-${i}`}
          meta={meta}
          text={HEADLINE}
          values={defaultProps(meta)}
          typography={{ ...defaultTypography(meta), font: "serif", size: "clamp(68px, 12.4vw, 212px)", weight: 300, tracking: -0.045, leading: 0.92 }}
          style={{ display: "block", width: "100%", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
          extra={{ as: "p", ...step.props }}
        />
      </div>

      <div className="grid gap-8 border-t border-line-strong pt-6 pb-16 md:grid-cols-12 md:gap-6">
        <p className="max-w-[36ch] text-[clamp(17px,1.45vw,20px)] leading-[1.5] text-pretty md:col-span-5">
          Fifty text animations for React. Tune one in the playground, then install it as source you own.
        </p>

        {/* now set in */}
        <div className="md:col-span-3">
          <p className="label mb-2 text-faint">Now set in</p>
          <div className="h-[30px]">
            <AnimatePresence mode="wait">
              <motion.div key={step.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                <Link href={`/effects/${meta.slug}`} className="italic-serif text-[24px] leading-none hover:text-accent" aria-live="polite">
                  {meta.name}
                </Link>
                <span className="ml-2 font-mono text-[11px] text-faint">N° {String(meta.number).padStart(2, "0")}</span>
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="mt-1 h-[18px] text-[12.5px] text-accent">{step.hint ?? ""}</p>
          <ol className="mt-3 flex gap-1.5" aria-label="Hero sequence">
            {sequence.map((s, k) => (
              <li key={s.slug} className="flex-1">
                <button type="button" onClick={() => go(k)} className="group block w-full py-2" aria-label={`Play ${effectBySlug[s.slug].name}`} aria-current={k === i ? "true" : undefined}>
                  <span className="relative block h-px w-full overflow-hidden bg-line-strong">
                    {k === i ? (
                      <motion.span
                        key={`${i}-${cycle}`}
                        className="absolute inset-0 origin-left bg-fg"
                        initial={{ scaleX: reduced ? 1 : 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: reduced ? 0 : s.ms / 1000, ease: "linear" }}
                      />
                    ) : k < i ? (
                      <span className="absolute inset-0 bg-fg/60" />
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3 md:col-span-4 md:items-end">
          <div className="flex flex-wrap gap-2">
            <Link href="/effects" className="btn btn-accent">
              Browse effects <ArrowRight className="btn-arrow size-4" strokeWidth={1.75} />
            </Link>
            <Link href="/playground" className="btn">
              Open playground
            </Link>
          </div>
          <div className="flex max-w-full items-center gap-2 font-mono text-[12px] text-muted">
            <span className="text-faint">$</span>
            <span className="truncate">npx shadcn add …/r/character-cascade.json</span>
            <CopyButton text={install} label="Copy install command" iconOnly className="!h-7 !w-7 shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
