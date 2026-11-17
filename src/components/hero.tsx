"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, MousePointer2 } from "lucide-react";
import { effectBySlug, defaultProps } from "@/registry/effects";
import { useReducedMotion } from "typecn";
import { Horizon } from "@/components/dithercn/horizon";
import { Starfield } from "@/components/dithercn/starfield";
import { installCode } from "@/lib/codegen";
import { EffectRenderer, defaultTypography } from "./effect-renderer";
import { CopyButton } from "./copy-button";

/** The headline cycles through real registry effects. */
const sequence: { slug: string; ms: number; props?: Record<string, unknown>; hint?: string }[] = [
  { slug: "scramble-decode", ms: 4200, props: { loop: false, duration: 900, stagger: 40 } },
  { slug: "proximity-weight", ms: 6500, props: { minWeight: 160, maxWeight: 900, radius: 300 }, hint: "Move your pointer over the headline" },
  { slug: "blur-resolve", ms: 3800, props: { loop: false, from: "random", stagger: 22 } },
  { slug: "cursor-repel", ms: 6500, props: { radius: 150, force: 2 }, hint: "Push through the letters" },
  { slug: "elastic-entrance", ms: 3800, props: { loop: false } },
  { slug: "grand-finale", ms: 7000, props: { loop: false, stagger: 34 } },
  { slug: "character-cascade", ms: 3600, props: { loop: false } },
];

const HEADLINE = "Type that\nmoves.";

export function Hero() {
  const [i, setI] = useState(0);
  const [cycle, setCycle] = useState(0);
  const reduced = useReducedMotion();
  const step = sequence[i];
  const meta = effectBySlug[step.slug];
  const install = installCode(effectBySlug["scramble-decode"]).registry;

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
    <section className="px-2 pt-2 sm:px-3 sm:pt-3" aria-labelledby="hero-title">
      <div className="relative isolate flex min-h-[min(860px,100svh)] flex-col items-center overflow-hidden rounded-[28px] border border-line bg-bg px-4 pt-[120px] pb-10 sm:rounded-[36px]">
        {/* dithercn backgrounds: a slow starfield and a dithered planet horizon */}
        <Starfield aria-hidden className="!absolute inset-0 -z-20 opacity-70" density={0.7} drift={0.6} nebula={0.25} palette={["--dither-paper", "--dither-color-grey"]} />
        <Horizon aria-hidden className="!absolute inset-x-0 bottom-0 -z-10 h-[48%]" horizon={0.34} curve={0.55} glow={0.9} aurora={0.7} stars={0} cell={3} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[30%] bg-gradient-to-t from-bg/90 to-transparent" />

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link href="/effects" className="chip transition-colors hover:text-fg">
            <span className="rounded-full bg-accent/15 px-1.5 text-[11px] font-medium text-accent">New</span>
            50 effects · shadcn registry · MIT
            <ArrowRight className="size-3" />
          </Link>
        </motion.div>

        <h1 id="hero-title" className="sr-only">
          typecn — Type that moves. 50 open-source text animations for React.
        </h1>
        <div className="relative mt-8 flex w-full max-w-[1100px] items-center justify-center text-center" style={{ minHeight: "calc(2 * 0.95 * clamp(56px, 10.5vw, 150px) + 0.25em)" }}>
          <EffectRenderer
            key={`${step.slug}-${cycle}-${i}`}
            meta={meta}
            text={HEADLINE}
            values={defaultProps(meta)}
            typography={{ ...defaultTypography(meta), font: "grotesk", size: "clamp(56px, 10.5vw, 150px)", weight: 600, tracking: -0.055, leading: 0.95 }}
            style={{ display: "block", fontFamily: "var(--font-geist)", textAlign: "center", width: "100%" }}
            extra={{ as: "p", ...step.props }}
          />
        </div>

        <p className="mt-7 max-w-[34ch] text-center text-[clamp(16px,1.5vw,19px)] leading-[1.5] text-balance text-muted">
          50 open-source text animations for React. Tune one in the playground, then install it as code you own.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          <Link href="/effects" className="btn btn-accent">
            Browse effects <ArrowRight className="btn-arrow size-4" />
          </Link>
          <Link href="/playground" className="btn">
            Open playground
          </Link>
        </div>

        <div className="mt-6 flex max-w-full items-center gap-2 rounded-full border border-line bg-glass py-1 pr-1 pl-4 font-mono text-[12.5px] text-muted backdrop-blur">
          <span className="text-accent">$</span>
          <span className="truncate">npx shadcn add …/r/scramble-decode.json</span>
          <CopyButton text={install} label="Copy install command" iconOnly className="!h-7 !w-7 shrink-0 rounded-full hover:bg-panel-2" />
        </div>

        {/* now playing */}
        <div className="mt-auto w-full max-w-[640px] pt-14">
          <div className="flex items-center justify-between gap-3 px-1 pb-2 text-[12.5px]">
            <span className="flex items-center gap-2 text-muted">
              <span className="dot-live" aria-hidden /> Now playing
            </span>
            <AnimatePresence mode="wait">
              <motion.span key={step.slug} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                {step.hint ? (
                  <span className="flex items-center gap-1.5 text-accent">
                    <MousePointer2 className="size-3" /> {step.hint}
                  </span>
                ) : (
                  <Link href={`/effects/${meta.slug}`} className="text-fg hover:underline" aria-live="polite">
                    {meta.name} <span className="text-faint">· Nº {String(meta.number).padStart(2, "0")}</span>
                  </Link>
                )}
              </motion.span>
            </AnimatePresence>
          </div>
          <ol className="grid grid-cols-7 gap-1.5" aria-label="Hero sequence">
            {sequence.map((s, k) => (
              <li key={s.slug}>
                <button type="button" onClick={() => go(k)} className="group block w-full py-1.5" aria-label={`Play ${effectBySlug[s.slug].name}`} aria-current={k === i ? "true" : undefined}>
                  <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-line-strong transition-colors group-hover:bg-faint">
                    {k === i ? (
                      <motion.span
                        key={`${i}-${cycle}`}
                        className="absolute inset-0 origin-left rounded-full bg-accent"
                        initial={{ scaleX: reduced ? 1 : 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: reduced ? 0 : s.ms / 1000, ease: "linear" }}
                      />
                    ) : k < i ? (
                      <span className="absolute inset-0 rounded-full bg-fg/50" />
                    ) : null}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* stat strip (hmm.css) */}
      <dl className="mx-auto flex max-w-[900px] flex-wrap items-center justify-center gap-x-9 gap-y-3 px-4 py-7 text-[14px]">
        {[
          ["Effects", "50"],
          ["Dependencies", "react only"],
          ["Reduced motion", "built in"],
          ["Screen readers", "one clean line"],
          ["License", "MIT"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline gap-2">
            <dt className="text-fg">{k}</dt>
            <dd className="font-mono text-[12px] text-faint">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
