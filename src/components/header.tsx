"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search } from "lucide-react";
import { site } from "@/lib/site";
import { Wordmark } from "./wordmark";
import { ThemeToggle } from "./theme-toggle";
import { CommandMenu, openCommandMenu } from "./command-menu";

const nav = [
  { href: "/effects", label: "Effects", match: (p: string) => p === "/effects" || p.startsWith("/effects/") },
  { href: "/playground", label: "Playground", match: (p: string) => p.startsWith("/playground") },
  { href: "/docs", label: "Docs", match: (p: string) => p.startsWith("/docs") },
];

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/** Floating pill navigation (dithercn-style) with a ⌘K search trigger. */
export function Header() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a href="#main" className="sr-only z-[80] rounded-full bg-accent px-3 py-2 text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
        <div
          className={`pointer-events-auto mx-auto flex h-[52px] max-w-[880px] items-center gap-2 rounded-full border pr-1.5 pl-4 transition-[background-color,border-color,box-shadow] duration-500 ${
            scrolled || open
              ? "border-line-strong bg-glass shadow-[0_10px_40px_-12px_rgb(0_0_0/0.45)] backdrop-blur-xl"
              : "border-line bg-glass/60 backdrop-blur-md"
          }`}
        >
          <Link href="/" className="relative z-10 mr-2 text-[17px]" aria-label="typecn home">
            <Wordmark />
          </Link>

          <nav className="hidden items-center md:flex" aria-label="Primary">
            {nav.map((n) => {
              const active = n.match(pathname);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-3 py-1.5 text-[14px] transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`}
                >
                  {active ? <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-panel-2" transition={{ type: "spring", stiffness: 500, damping: 40 }} /> : null}
                  <span className="relative">{n.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={openCommandMenu}
              className="flex h-9 items-center gap-2 rounded-full border border-line bg-panel pr-1.5 pl-3 text-[13.5px] text-muted transition-colors hover:border-line-strong hover:text-fg"
              aria-label="Search effects (⌘K)"
            >
              <Search className="size-3.5" strokeWidth={2} />
              <span className="hidden sm:inline">Search</span>
              <span className="hidden items-center gap-0.5 sm:flex">
                <span className="kbd">⌘</span>
                <span className="kbd">K</span>
              </span>
            </button>
            <a
              href={site.repo}
              target="_blank"
              rel="noreferrer"
              className="hidden h-9 items-center gap-1.5 rounded-full px-2.5 text-[13px] text-muted transition-colors hover:text-fg sm:flex"
              aria-label="typecn on GitHub"
            >
              <GithubIcon className="size-[16px]" />
            </a>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <button
              type="button"
              className="grid size-9 place-items-center rounded-full md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-2.5 w-4">
                <span className={`absolute left-0 h-[1.5px] w-4 rounded bg-fg transition-all duration-300 ${open ? "top-[4px] rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[1.5px] w-4 rounded bg-fg transition-all duration-300 ${open ? "top-[4px] -rotate-45" : "top-[9px]"}`} />
              </span>
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              id="mobile-menu"
              className="pointer-events-auto mx-auto mt-2 max-w-[880px] overflow-hidden rounded-3xl border border-line-strong bg-bg-2 p-2 shadow-2xl md:hidden"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 480, damping: 36 }}
            >
              <nav aria-label="Mobile">
                <ul>
                  {[{ href: "/", label: "Home", match: (p: string) => p === "/" }, ...nav].map((n, i) => (
                    <motion.li key={n.href} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                      <Link
                        href={n.href}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-[22px] tracking-[-0.03em] ${n.match(pathname) ? "bg-panel-2 text-fg" : "text-muted"}`}
                      >
                        {n.label}
                        <span className="label text-faint">0{i + 1}</span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </nav>
              <div className="mt-2 flex items-center justify-between border-t border-line px-3 pt-3 pb-1">
                <a href={site.repo} className="flex items-center gap-2 text-sm text-muted">
                  <GithubIcon className="size-4" /> GitHub
                </a>
                <ThemeToggle />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>
      <CommandMenu />
    </>
  );
}
