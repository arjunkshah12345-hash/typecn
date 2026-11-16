"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { useScrollProgress } from "typecn";
import { categories, type EffectMeta } from "@/registry/types";
import { defaultProps } from "@/registry/effects";
import { EffectRenderer, defaultTypography } from "./effect-renderer";

const tones = {
  ink: "bg-[#161512] text-paper",
  paper: "bg-paper text-ink",
  accent: "bg-accent text-[#120a06]",
  bone: "bg-bone text-ink",
} as const;

export function EffectCard({ meta, index }: { meta: EffectMeta; index: number }) {
  const [replay, setReplay] = useState(0);
  const [progress, setProgress] = useState(0.5);
  const cardRef = useRef<HTMLElement>(null);
  const tone = meta.card.tone ?? "ink";
  const cat = categories.find((c) => c.id === meta.category)!;
  const sticky = meta.slug === "sticky-typography";
  // Interactive previews sit above the card link so pointer/click effects work.
  const interactive = meta.kind === "pointer" || !!meta.hint;
  useScrollProgress(cardRef, setProgress, { enabled: sticky });

  const values = defaultProps(meta);
  const typography = { ...defaultTypography(meta), size: meta.card.size ?? 48 };
  const extra: Record<string, unknown> = {};
  if (meta.kind === "timed") extra.trigger = "inView";
  if (sticky) extra.progress = progress;
  if (meta.slug === "svg-path-text") extra.amplitude = 0.7;

  return (
    <article
      ref={cardRef}
      className={`group relative flex min-h-[340px] flex-col overflow-hidden ${tones[tone]} ${meta.card.span === 2 ? "md:col-span-2" : ""} transition-[transform] duration-700 ease-[var(--ease-out-expo)]`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <header className="relative z-10 flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="flex items-baseline gap-3 whitespace-nowrap">
          <span className="font-mono text-[11px] tabular-nums opacity-60">{String(meta.number).padStart(2, "0")}</span>
          <span className="label opacity-60">
            {cat.letter} · {cat.name.split(" ")[0]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {meta.hint && meta.card.span === 2 ? <span className="label hidden opacity-0 transition-opacity duration-500 group-hover:opacity-60 sm:inline">{meta.hint}</span> : null}
          <button
            type="button"
            onClick={() => setReplay((r) => r + 1)}
            className="relative z-20 grid size-8 place-items-center rounded-full opacity-60 transition hover:bg-current/10 hover:opacity-100 focus-visible:opacity-100"
            aria-label={`Replay ${meta.name}`}
            title="Replay"
          >
            <RotateCcw className="size-3.5 transition-transform duration-500 group-hover:-rotate-45" />
          </button>
        </div>
      </header>

      <div className={`relative flex flex-1 items-center px-4 sm:px-6 ${interactive ? "z-10" : ""} ${sticky ? "h-[260px]" : ""} ${meta.card.span === 2 ? "justify-start" : "justify-center text-center"}`}>
        <div className={`w-full ${sticky ? "h-[240px]" : ""} ${meta.slug === "text-trail" ? "self-stretch" : ""}`}>
          <EffectRenderer
            key={replay}
            meta={meta}
            values={values}
            typography={typography}
            replayKey={replay}
            extra={extra}
            text={meta.card.text}
            style={meta.slug === "text-trail" ? { minHeight: 220, width: "100%" } : undefined}
          />
        </div>
      </div>

      <footer className="relative z-10 mt-auto flex items-end justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0">
          <h3 className="font-serif text-[22px] leading-none tracking-[-0.02em]">{meta.name}</h3>
          <p className="mt-1.5 max-w-[34ch] text-[13px] leading-snug opacity-65">{meta.tagline}</p>
        </div>
        <span className="label flex shrink-0 translate-y-1 items-center gap-1 opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
          Open <ArrowUpRight className="size-3.5" />
        </span>
      </footer>

      <Link href={`/effects/${meta.slug}`} className="absolute inset-0 z-[5]" aria-label={`Open ${meta.name} in the playground`}>
        <span className="sr-only">Open {meta.name}</span>
      </Link>
      <span aria-hidden className="pointer-events-none absolute inset-0 z-[6] border border-current opacity-0 transition-opacity duration-500 group-hover:opacity-25" />
    </article>
  );
}
