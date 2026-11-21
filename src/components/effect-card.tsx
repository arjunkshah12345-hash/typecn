"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { useScrollProgress } from "typecn";
import { categories, type EffectMeta } from "@/registry/types";
import { defaultProps } from "@/registry/effects";
import { EffectRenderer, defaultTypography } from "./effect-renderer";

/** A live effect on a specimen plate: catalogue number, the effect, and its name set in italic. */
export function EffectCard({ meta, size, className = "" }: { meta: EffectMeta; index?: number; size?: number; className?: string }) {
  const [replay, setReplay] = useState(0);
  const [progress, setProgress] = useState(0.5);
  const cardRef = useRef<HTMLElement>(null);
  const cat = categories.find((c) => c.id === meta.category)!;
  const sticky = meta.slug === "sticky-typography";
  const interactive = meta.kind === "pointer" || !!meta.hint;
  const wide = meta.card.span === 2;
  useScrollProgress(cardRef, setProgress, { enabled: sticky });

  const values = defaultProps(meta);
  const typography = { ...defaultTypography(meta), size: size ?? meta.card.size ?? 48 };
  const extra: Record<string, unknown> = {};
  if (meta.kind === "timed") extra.trigger = "inView";
  if (sticky) extra.progress = progress;
  if (meta.slug === "svg-path-text") extra.amplitude = 0.7;

  return (
    <article
      ref={cardRef}
      className={`group relative flex min-h-[340px] flex-col overflow-hidden border-r border-b border-line bg-bg transition-colors duration-500 hover:bg-bg-2 ${wide && !className ? "md:col-span-2" : ""} ${className}`}
    >
      <header className="relative z-20 flex items-center justify-between gap-3 px-5 pt-4">
        <span className="font-mono text-[11px] tracking-[0.06em] tabular-nums text-faint">N° {String(meta.number).padStart(2, "0")}</span>
        <div className="flex items-center gap-2">
          {meta.hint ? <span className="label text-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100">{meta.hint}</span> : null}
          <button
            type="button"
            onClick={() => setReplay((r) => r + 1)}
            className="grid size-7 place-items-center rounded-full text-faint opacity-0 transition hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
            aria-label={`Replay ${meta.name}`}
            title="Replay"
          >
            <RotateCcw className="size-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </header>

      <div className={`relative flex flex-1 items-center px-6 py-8 sm:px-8 ${interactive ? "z-10" : ""} ${sticky ? "h-[240px]" : ""} ${wide ? "justify-start" : "justify-center text-center"}`}>
        <div className={`w-full ${sticky ? "h-[220px]" : ""} ${meta.slug === "text-trail" ? "self-stretch" : ""}`}>
          <EffectRenderer
            key={replay}
            meta={meta}
            values={values}
            typography={typography}
            replayKey={replay}
            extra={extra}
            text={meta.card.text}
            style={meta.slug === "text-trail" ? { minHeight: 200, width: "100%" } : undefined}
          />
        </div>
      </div>

      <footer className="relative z-20 flex items-end justify-between gap-4 px-5 pb-4">
        <div className="min-w-0">
          <h3 className="italic-serif truncate text-[21px] leading-tight">{meta.name}</h3>
          <p className="truncate text-[12.5px] text-muted">{meta.tagline}</p>
        </div>
        <span className="relative flex shrink-0 items-center pb-0.5">
          <span className="label text-faint transition-opacity duration-300 group-hover:opacity-0">{cat.name.split(" ")[0]}</span>
          <ArrowUpRight className="absolute right-0 size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" strokeWidth={1.5} />
        </span>
      </footer>

      <Link href={`/effects/${meta.slug}`} className="absolute inset-0 z-[5]" aria-label={`Open ${meta.name} in the playground`}>
        <span className="sr-only">Open {meta.name}</span>
      </Link>
    </article>
  );
}
