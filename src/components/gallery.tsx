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
      <div className="sticky top-[76px] z-30 mb-5">
        <div className="flex flex-col gap-2 rounded-[22px] border border-line bg-glass p-1.5 shadow-[0_10px_40px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl xl:flex-row xl:items-center xl:rounded-full">
          <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto" role="tablist" aria-label="Filter by category">
            <FilterChip active={cat === "all"} onClick={() => setCat("all")} count={effects.length}>
              All
            </FilterChip>
            {categories.map((c) => (
              <FilterChip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)} count={counts[c.id]} title={c.name}>
                {c.name.split(" ")[0]}
              </FilterChip>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <label className="group relative flex h-9 flex-1 items-center gap-2 rounded-full border border-line bg-panel px-3 transition-colors focus-within:border-line-strong xl:w-64 xl:flex-none">
              <Search className="size-3.5 text-faint" aria-hidden />
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
                <kbd className="kbd hidden sm:inline-grid">/</kbd>
              )}
            </label>
            <label className="relative">
              <span className="sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortId)}
                className="h-9 cursor-pointer appearance-none rounded-full border border-line bg-panel pr-8 pl-3.5 text-sm outline-none focus-visible:border-line-strong"
              >
                {sorts.map((s) => (
                  <option key={s.id} value={s.id} className="bg-bg text-fg">
                    {s.label}
                  </option>
                ))}
              </select>
              <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-muted">
                ▾
              </span>
            </label>
          </div>
        </div>
      </div>

      <p className="label mb-4 px-1 text-faint" aria-live="polite">
        {list.length} {list.length === 1 ? "effect" : "effects"}
        {q ? ` matching “${query.trim()}”` : ""}
      </p>

      <LayoutGroup>
        <motion.div layout className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

function FilterChip({ active, onClick, count, children, title }: { active: boolean; onClick: () => void; count: number; children: React.ReactNode; title?: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      title={title}
      className={`relative flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm whitespace-nowrap transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`}
    >
      {active ? <motion.span layoutId="chip" className="absolute inset-0 rounded-full border border-line-strong bg-panel-2" transition={{ type: "spring", stiffness: 500, damping: 40 }} /> : null}
      <span className="relative">{children}</span>
      <span className="relative font-mono text-[10.5px] tabular-nums text-faint">{count}</span>
    </button>
  );
}

/** asciicn-style framed empty state. */
function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  const msg = `no type matches "${query.trim().slice(0, 24)}"`;
  const bar = "─".repeat(msg.length + 4);
  return (
    <div className="flex flex-col items-center gap-6 py-20 text-center">
      <pre aria-hidden className="ascii text-[13px] text-muted sm:text-[15px]">
        {`┌${bar}┐\n│  `}
        <span className="text-fg">{msg}</span>
        {`  │\n└${bar}┘`}
      </pre>
      <p className="sr-only">No type matches “{query.trim()}”.</p>
      <p className="max-w-md text-muted">Try a motion word — “scroll”, “pointer”, “variable”, “mask” — or browse every category.</p>
      <button type="button" className="btn" onClick={onReset}>
        Clear search <span className="btn-arrow">→</span>
      </button>
    </div>
  );
}
