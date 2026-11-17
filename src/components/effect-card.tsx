"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { useScrollProgress } from "typecn";
import { categories, type EffectMeta } from "@/registry/types";
import { defaultProps } from "@/registry/effects";
import { EffectRenderer, defaultTypography } from "./effect-renderer";

/** A live effect in a rounded catalogue card with a name/category footer bar (dithercn-style). */
export function EffectCard({ meta, index, size, className = "" }: { meta: EffectMeta; index: number; size?: number; className?: string }) {
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
      className={`group relative flex min-h-[320px] flex-col overflow-hidden rounded-[22px] border border-line bg-panel transition-[border-color,transform] duration-500 ease-[var(--ease-out-expo)] hover:border-line-strong ${wide && !className ? "md:col-span-2" : ""} ${className}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,color-mix(in_oklch,var(--fg)_4%,transparent),transparent_60%)]" aria-hidden />
      <header className="relative z-20 flex items-center justify-between gap-3 p-3.5">
        <span className="font-mono text-[11px] tabular-nums text-faint">{String(meta.number).padStart(2, "0")}</span>
        <div className="flex items-center gap-1">
          {meta.hint && wide ? <span className="chip opacity-0 transition-opacity duration-300 group-hover:opacity-100">{meta.hint}</span> : null}
          <button
            type="button"
            onClick={() => setReplay((r) => r + 1)}
            className="grid size-7 place-items-center rounded-full border border-transparent text-faint opacity-0 transition hover:border-line hover:bg-panel-2 hover:text-fg focus-visible:opacity-100 group-hover:opacity-100"
            aria-label={`Replay ${meta.name}`}
            title="Replay"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </header>

      <div className={`relative flex flex-1 items-center px-5 sm:px-7 ${interactive ? "z-10" : ""} ${sticky ? "h-[240px]" : ""} ${wide ? "justify-start" : "justify-center text-center"}`}>
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

      <footer className="relative z-20 mt-4 flex items-center justify-between gap-4 border-t border-line bg-bg/40 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-medium tracking-[-0.01em]">{meta.name}</h3>
          <p className="truncate text-[12.5px] text-faint">{meta.tagline}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-[12.5px] text-muted">
          <span className="transition-opacity duration-300 group-hover:opacity-0">{cat.name.split(" ")[0]}</span>
          <ArrowUpRight className="absolute right-4 size-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </span>
      </footer>

      <Link href={`/effects/${meta.slug}`} className="absolute inset-0 z-[5] rounded-[22px]" aria-label={`Open ${meta.name} in the playground`}>
        <span className="sr-only">Open {meta.name}</span>
      </Link>
    </article>
  );
}
