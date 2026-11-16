"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { effectBySlug, defaultProps } from "@/registry/effects";
import { useReducedMotion } from "typecn";
import { EffectRenderer, defaultTypography } from "./effect-renderer";

/** The hero cycles through real registry effects on the same headline. */
const sequence: { slug: string; ms: number; props?: Record<string, unknown>; hint?: string }[] = [
  { slug: "grand-finale", ms: 7200, props: { loop: false, stagger: 38 } },
  { slug: "scramble-decode", ms: 4600, props: { loop: false, duration: 900, stagger: 45 } },
  { slug: "proximity-weight", ms: 7000, props: { minWeight: 120, maxWeight: 900, radius: 340 }, hint: "Move your pointer over the headline" },
  { slug: "blur-resolve", ms: 4200, props: { loop: false, from: "random", stagger: 22 } },
  { slug: "variable-morph", ms: 6200, props: { loop: false, duration: 3800, stagger: 40, poses: [{ wght: 100, SOFT: 100, WONK: 0 }, { wght: 900, SOFT: 0, WONK: 1 }, { wght: 250, SOFT: 50, WONK: 1 }, { wght: 400, SOFT: 100, WONK: 0 }] } },
  { slug: "cursor-repel", ms: 7000, props: { radius: 170, force: 2 }, hint: "Push through the letters" },
  { slug: "elastic-entrance", ms: 4200, props: { loop: false } },
];

const HEADLINE = "Words should\nmove.";

export function Hero() {
  const [i, setI] = useState(0);
  const [cycle, setCycle] = useState(0);
  const reduced = useReducedMotion();
  const step = sequence[i];
  const meta = effectBySlug[step.slug];

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
    <section className="relative flex min-h-[100svh] flex-col pt-[60px]" aria-labelledby="hero-title">
      <div className="container-x flex items-center justify-between border-b border-line py-3">
        <span className="label text-muted">Nº 001 — An open-source kinetic typography library</span>
        <span className="label hidden text-muted sm:inline">50 effects · 5 categories · React · MIT</span>
      </div>

      <div className="container-x relative flex flex-1 flex-col justify-center py-10">
        <h1 id="hero-title" className="sr-only">
          typecn — Words should move. 50 open-source text animations for React.
        </h1>
        <div className="relative" style={{ minHeight: "calc(2 * 0.92 * clamp(60px, 13.2vw, 236px) + 0.4em)" }}>
          <EffectRenderer
            key={`${step.slug}-${cycle}-${i}`}
            meta={meta}
            text={HEADLINE}
            values={defaultProps(meta)}
            typography={{ ...defaultTypography(meta), font: "serif", size: "clamp(60px, 13.2vw, 236px)", weight: 400, tracking: -0.045, leading: 0.92 }}
            style={{ display: "block" }}
            extra={{ as: "p", ...step.props }}
          />
        </div>
      </div>

      <div className="container-x grid gap-8 pb-8 md:grid-cols-12 md:items-end">
        <div className="md:col-span-5">
          <p className="max-w-[30ch] text-[clamp(18px,1.6vw,22px)] leading-[1.35] text-balance">
            50 open-source text animations. <span className="text-muted">Find one. Make it yours. Ship it.</span>
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href="/effects" className="btn btn-accent">
              Explore effects <span className="btn-arrow">→</span>
            </Link>
            <Link href="/playground" className="btn">
              Open playground <span className="btn-arrow">→</span>
            </Link>
          </div>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <div className="flex items-center justify-between gap-4 border-b border-line pb-2">
            <span className="label flex items-center gap-2 text-muted">
              <span className="dot-live" aria-hidden /> Now playing
            </span>
            <Link href={`/effects/${meta.slug}`} className="label ulink text-fg" aria-live="polite">
              Nº {String(meta.number).padStart(2, "0")} — {meta.name} ↗
            </Link>
          </div>
          <ol className="mt-2 grid grid-cols-7 gap-1" aria-label="Hero sequence">
            {sequence.map((s, k) => (
              <li key={s.slug}>
                <button
                  type="button"
                  onClick={() => go(k)}
                  className="group block w-full py-2 text-left"
                  aria-label={`Play ${effectBySlug[s.slug].name}`}
                  aria-current={k === i ? "true" : undefined}
                >
                  <span className="relative block h-px w-full overflow-hidden bg-line-strong">
                    {k === i ? (
                      <motion.span
                        key={`${i}-${cycle}`}
                        className="absolute inset-0 origin-left bg-accent"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: reduced ? 1 : 1 }}
                        transition={{ duration: reduced ? 0 : s.ms / 1000, ease: "linear" }}
                      />
                    ) : k < i ? (
                      <span className="absolute inset-0 bg-fg/60" />
                    ) : null}
                  </span>
                  <span className={`mt-2 hidden truncate text-[11px] transition-colors sm:block ${k === i ? "text-fg" : "text-faint group-hover:text-muted"}`}>
                    {effectBySlug[s.slug].name}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="label mt-3 flex h-4 items-center gap-2 text-muted">
            {step.hint ? (
              <motion.span key={step.hint} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 text-accent">
                <span aria-hidden>↖</span> {step.hint}
              </motion.span>
            ) : (
              <span>Every frame above is a real component from the library.</span>
            )}
          </p>
        </div>
      </div>

      <div className="container-x flex items-center justify-between border-t border-line py-3">
        <span className="label flex items-center gap-3 text-muted">
          <span aria-hidden className="relative block h-5 w-px overflow-hidden bg-line">
            <span className="motion-safe-only absolute inset-0 bg-fg" style={{ animation: "scroll-cue 2.2s cubic-bezier(0.76,0,0.24,1) infinite" }} />
          </span>
          Scroll the collection
        </span>
        <span className="label text-muted">typecn@{"0.1.0"}</span>
      </div>
    </section>
  );
}
