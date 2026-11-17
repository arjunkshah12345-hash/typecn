"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BookOpen, CornerDownLeft, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { effects } from "@/registry/effects";
import { categories } from "@/registry/types";
import { docs } from "@/lib/docs";
import { setTheme } from "./theme-toggle";

interface Item {
  id: string;
  label: string;
  hint: string;
  href: string;
  group: string;
  keywords: string;
  icon: "effect" | "doc" | "page";
}

const items: Item[] = [
  { id: "p-effects", label: "Browse all effects", hint: "/effects", href: "/effects", group: "Pages", keywords: "gallery explore", icon: "page" },
  { id: "p-play", label: "Open the playground", hint: "/playground", href: "/playground", group: "Pages", keywords: "editor controls", icon: "page" },
  ...effects.map((e) => ({
    id: e.slug,
    label: e.name,
    hint: categories.find((c) => c.id === e.category)!.name.split(" ")[0],
    href: `/effects/${e.slug}`,
    group: "Effects",
    keywords: `${e.tagline} ${e.keywords?.join(" ") ?? ""} ${e.category}`.toLowerCase(),
    icon: "effect" as const,
  })),
  ...docs.map((d) => ({
    id: `d-${d.slug}`,
    label: d.title,
    hint: "Docs",
    href: d.slug ? `/docs/${d.slug}` : "/docs",
    group: "Docs",
    keywords: d.blurb.toLowerCase(),
    icon: "doc" as const,
  })),
];

const OPEN_EVENT = "typecn:command";
export const openCommandMenu = () => window.dispatchEvent(new Event(OPEN_EVENT));

function score(item: Item, q: string) {
  const l = item.label.toLowerCase();
  if (l.startsWith(q)) return 3;
  if (l.includes(q)) return 2;
  return item.keywords.includes(q) ? 1 : 0;
}

/** ⌘K palette: jump to any effect, page or guide. Also owns the global `T` theme shortcut. */
export function CommandMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items.filter((i) => i.group !== "Docs").slice(0, 14).concat(items.filter((i) => i.group === "Docs").slice(0, 4));
    return items
      .map((i) => [i, score(i, query)] as const)
      .filter(([, s]) => s > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([i]) => i)
      .slice(0, 24);
  }, [q]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest?.("input, textarea, select, [contenteditable]");
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (!typing && !e.metaKey && !e.ctrlKey && !e.altKey && e.key.toLowerCase() === "t" && !document.querySelector("[data-playground]")) {
        setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    requestAnimationFrame(() => input.current?.focus());
    return () => prev?.focus?.();
  }, [open]);

  useEffect(() => {
    list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = () => {
    setOpen(false);
    setQ("");
    setActive(0);
  };
  const go = (item: Item | undefined) => {
    if (!item) return;
    close();
    router.push(item.href);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-[3px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search typecn"
            className="w-full max-w-[580px] overflow-hidden rounded-2xl border border-line-strong bg-bg-2 shadow-[0_30px_120px_-20px_rgb(0_0_0/0.7)]"
            initial={{ y: -8, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 500, damping: 36 }}
            onKeyDown={(e) => {
              if (e.key === "Escape") close();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(results.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter") go(results[active]);
            }}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 text-faint" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                placeholder="Search 50 effects, pages and guides…"
                className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-faint"
                aria-label="Search"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-activedescendant={results[active] ? `cmd-${results[active].id}` : undefined}
              />
              <span className="kbd">esc</span>
            </div>
            <ul ref={list} id="command-list" role="listbox" className="thin-scroll max-h-[min(440px,60vh)] overflow-y-auto p-2">
              {results.length === 0 ? <li className="px-3 py-10 text-center text-sm text-muted">Nothing matches “{q}”.</li> : null}
              {results.map((item, i) => {
                const header = item.group !== results[i - 1]?.group ? item.group : null;
                const Icon = item.icon === "effect" ? Sparkles : item.icon === "doc" ? BookOpen : SlidersHorizontal;
                return (
                  <li key={item.id} role="presentation">
                    {header ? <p className="label px-3 pt-3 pb-1.5 text-faint">{header}</p> : null}
                    <button
                      type="button"
                      id={`cmd-${item.id}`}
                      role="option"
                      aria-selected={i === active}
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(item)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] transition-colors ${i === active ? "bg-panel-2 text-fg" : "text-muted"}`}
                    >
                      <Icon className={`size-4 ${i === active ? "text-accent" : "text-faint"}`} strokeWidth={1.75} />
                      <span className="flex-1 truncate">{item.label}</span>
                      <span className="label text-faint">{item.hint}</span>
                      {i === active ? <CornerDownLeft className="size-3.5 text-faint" /> : <ArrowRight className="size-3.5 opacity-0" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[12px] text-faint">
              <span className="flex items-center gap-1.5">
                <span className="kbd">↑</span>
                <span className="kbd">↓</span> move
              </span>
              <span className="flex items-center gap-1.5">
                <span className="kbd">↵</span> open
              </span>
              <span className="ml-auto flex items-center gap-1.5">
                <span className="kbd">T</span> theme
              </span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
