"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { effects } from "@/registry/effects";
import { categories, type CategoryId } from "@/registry/types";
import { EffectCard } from "./effect-card";

const sorts = [
  { id: "number", label: "Catalogue Nº" },
  { id: "name", label: "A — Z" },
  { id: "interactive", label: "Interactive first" },
  { id: "category", label: "By category" },
] as const;
type SortId = (typeof sorts)[number]["id"];

export function Gallery({ initialCategory }: { initialCategory?: CategoryId }) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<CategoryId | "all">(initialCategory ?? "all");
  const [sort, setSort] = useState<SortId>("number");
  const q = useDeferredValue(query.trim().toLowerCase());
  const input = useRef<HTMLInputElement>(null);

  // "/" focuses search, like every good catalogue.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/input|textarea|select/i.test(t.tagName)) {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const list = useMemo(() => {
    let l = effects.filter((e) => (cat === "all" ? true : e.category === cat));
    if (q) {
      l = l.filter((e) =>
        [e.name, e.tagline, e.description, e.category, e.component, ...(e.keywords ?? [])].join(" ").toLowerCase().includes(q),
      );
    }
    const s = [...l];
    if (sort === "name") s.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "interactive") s.sort((a, b) => Number(b.kind === "pointer" || b.kind === "scroll") - Number(a.kind === "pointer" || a.kind === "scroll") || a.number - b.number);
    if (sort === "category") s.sort((a, b) => a.category.localeCompare(b.category) || a.number - b.number);
    return s;
  }, [q, cat, sort]);

  const counts = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, effects.filter((e) => e.category === c.id).length])), []);

  return (
    <div>
      <div className="sticky top-[60px] z-30 -mx-[clamp(16px,3.2vw,48px)] mb-6 border-y border-line bg-bg/85 px-[clamp(16px,3.2vw,48px)] backdrop-blur-md">
        <div className="flex flex-col gap-3 py-3 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="no-scrollbar -mx-1 flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-1" role="tablist" aria-label="Filter by category">
            <FilterChip active={cat === "all"} onClick={() => setCat("all")} count={effects.length}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} count={counts[c.id]}>
                <span className="font-mono text-[10px] opacity-60">{c.letter}</span> {c.name}
              </FilterChip>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <label className="group relative flex h-9 flex-1 items-center gap-2 border-b border-line-strong px-1 focus-within:border-fg 2xl:w-60 2xl:flex-none">
              <Search className="size-3.5 text-muted" aria-hidden />
              <span className="sr-only">Search effects</span>
              <input
                ref={input}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 50 effects"
                className="h-full w-full bg-transparent text-sm outline-none placeholder:text-faint"
                type="search"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="text-muted hover:text-fg">
                  <X className="size-3.5" />
                </button>
              ) : (
                <kbd className="hidden rounded border border-line px-1.5 font-mono text-[10px] text-faint sm:inline">/</kbd>
              )}
            </label>
            <label className="relative">
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="h-9 cursor-pointer appearance-none border-b border-line-strong bg-transparent pr-6 pl-1 text-sm outline-none focus-visible:border-fg"
              >
                {sorts.map((s) => (
                  <option key={s.id} value={s.id} className="bg-bg text-fg">
                    {s.label}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-[10px] text-muted">
                ▾
              </span>
            </label>
          </div>
        </div>
      </div>

      <p className="label mb-4 text-muted" aria-live="polite">
        {list.length} {list.length === 1 ? "effect" : "effects"}
        {q ? ` matching “${query.trim()}”` : ""}
      </p>

      <LayoutGroup>
        <motion.div layout className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((e, i) => (
              <motion.div
                key={e.slug}
                layout="position"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`flex ${e.card.span === 2 ? "md:col-span-2" : ""}`}
              >
                <div className="flex w-full [&>article]:w-full">
                  <EffectCard meta={e} index={i} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {list.length === 0 ? <EmptyState query={query} onReset={() => { setQuery(""); setCat("all"); }} /> : null}
    </div>
  );
}

function FilterChip({ active, onClick, count, children }: { active: boolean; onClick: () => void; count: number; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative flex h-9 shrink-0 items-center gap-1.5 px-3 text-sm whitespace-nowrap transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`}
    >
      {children}
      <sup className="font-mono text-[9px] tabular-nums opacity-60">{count}</sup>
      {active ? <motion.span layoutId="chip" className="absolute inset-x-2 bottom-0 h-px bg-accent" transition={{ type: "spring", stiffness: 500, damping: 40 }} /> : null}
    </button>
  );
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-start gap-6 border-t border-line py-20">
      <p className="font-serif text-[clamp(48px,9vw,140px)] leading-[0.9] tracking-[-0.04em] text-balance">
        No type
        <br />
        <span className="italic text-muted">matches</span> <span className="text-accent">“{query.trim()}”</span>
      </p>
      <p className="max-w-md text-muted">Try a motion word — “scroll”, “pointer”, “variable”, “mask” — or browse every category.</p>
      <button type="button" className="btn" onClick={onReset}>
        Clear search <span className="btn-arrow">→</span>
      </button>
    </div>
  );
}
