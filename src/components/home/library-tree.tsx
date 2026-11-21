"use client";

import Link from "next/link";
import { useState } from "react";
import { effects, defaultProps } from "@/registry/effects";
import { categories, type CategoryId } from "@/registry/types";
import { EffectRenderer, defaultTypography } from "../effect-renderer";
import { SectionHead } from "./section-head";

/** A terminal-style file browser: bracket tabs, a box-drawn file tree, and a live preview of the hovered file. */
export function LibraryTree() {
  const [cat, setCat] = useState<CategoryId>(categories[0].id);
  const files = effects.filter((e) => e.category === cat);
  const [slug, setSlug] = useState(files[0].slug);
  const current = effects.find((e) => e.slug === slug) ?? files[0];
  const info = categories.find((c) => c.id === cat)!;

  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="tree-title">
      <SectionHead
        id="tree-title"
        n="03"
        kicker="The files"
        aside="Five families"
        title={
          <>
            One file <em>per</em> effect.
          </>
        }
      >
        <p className="max-w-[44ch]">
          Every effect is one file plus a shared <code className="font-mono text-[14px] text-fg">core.tsx</code>. The shadcn CLI copies both into your app, with no runtime package to keep in sync.
        </p>
      </SectionHead>

      <div className="border border-line">
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          <span className="font-mono text-[12px] text-faint">~/your-app/components/typecn</span>
          <span className="label hidden text-faint sm:inline">{info.letter} — {info.name}</span>
        </div>

        {/* bracket tabs */}
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-3 py-2.5 font-mono text-[13px]" role="tablist" aria-label="Effect families">
          {categories.map((c) => {
            const on = c.id === cat;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => {
                  setCat(c.id);
                  setSlug(effects.find((e) => e.category === c.id)!.slug);
                }}
                className={`shrink-0 px-2 py-1 whitespace-nowrap transition-colors ${on ? "text-accent" : "text-muted hover:text-fg"}`}
              >
                [{on ? "■" : " "}] {c.name.split(" ")[0].toLowerCase()}
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,420px)_1fr]">
          {/* tree */}
          <div className="border-b border-line p-4 font-mono text-[13px] leading-[1.9] sm:p-5 lg:border-r lg:border-b-0">
            <p className="text-faint">
              <span className="text-accent">$</span> tree {info.name.split(" ")[0].toLowerCase()}/
            </p>
            <p className="text-muted">.</p>
            <p className="whitespace-pre text-muted">
              ├── core.tsx <span className="text-faint">{"         "}# shared primitives</span>
            </p>
            <ul>
              {files.map((e, i) => {
                const last = i === files.length - 1;
                const on = e.slug === current.slug;
                return (
                  <li key={e.slug}>
                    <Link
                      href={`/effects/${e.slug}`}
                      onPointerEnter={() => setSlug(e.slug)}
                      onFocus={() => setSlug(e.slug)}
                      className={`flex items-center whitespace-pre transition-colors ${on ? "text-fg" : "text-muted hover:text-fg"}`}
                    >
                      <span className="text-faint">{last ? "└── " : "├── "}</span>
                      <span className={on ? "bg-accent px-1 text-accent-ink" : "px-1"}>{e.file}.tsx</span>
                      <span className="ml-auto pl-3 text-[11px] text-faint">{String(e.number).padStart(2, "0")}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-faint">
              {files.length + 1} files · {info.blurb ?? ""}
            </p>
          </div>

          {/* preview */}
          <div className="relative flex min-h-[360px] flex-col">
            <div className="flex items-center justify-between px-5 pt-4 text-[12.5px]">
              <span className="font-mono text-faint">
                preview <span className="text-muted">{current.file}.tsx</span>
              </span>
              <Link href={`/effects/${current.slug}`} className="ulink text-muted hover:text-fg">
                Open in playground →
              </Link>
            </div>
            <div className="flex flex-1 items-center justify-center px-6 py-10 text-center">
              <EffectRenderer
                key={current.slug}
                meta={current}
                values={defaultProps(current)}
                typography={{ ...defaultTypography(current), size: Math.min(80, (current.card.size ?? 48) * 1.35) }}
                text={current.card.text}
                extra={current.kind === "timed" ? { trigger: "inView", loop: true } : undefined}
                style={current.slug === "text-trail" ? { minHeight: 220, width: "100%" } : undefined}
              />
            </div>
            <p className="border-t border-line px-5 py-3 text-[13.5px] text-muted">
              <span className="italic-serif text-[17px] text-fg">{current.name}</span> — {current.tagline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
