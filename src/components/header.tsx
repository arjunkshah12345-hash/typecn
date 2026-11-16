"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { site } from "@/lib/site";
import { Wordmark } from "./wordmark";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { href: "/effects", label: "Explore", match: (p: string) => p === "/effects" || p.startsWith("/effects/") },
  { href: "/playground", label: "Playground", match: (p: string) => p.startsWith("/playground") },
  { href: "/docs", label: "Documentation", match: (p: string) => p.startsWith("/docs") },
];

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.7 5.38-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Close the mobile menu on navigation and on Escape.
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
      <a href="#main" className="sr-only z-[80] bg-accent px-3 py-2 text-ink focus:not-sr-only focus:fixed focus:top-2 focus:left-2">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 h-[60px] border-b transition-[background-color,border-color] duration-500 ${
          scrolled || open ? "border-line bg-bg/80 backdrop-blur-md" : "border-transparent"
        }`}
      >
        <div className="container-x flex h-full items-center justify-between gap-6">
          <Link href="/" className="relative z-10 text-[26px]" aria-label="typecn home">
            <Wordmark />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {nav.map((n) => {
              const active = n.match(pathname);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative px-3 py-2 text-[14px] transition-colors ${active ? "text-fg" : "text-muted hover:text-fg"}`}
                >
                  <span className="relative inline-block overflow-hidden align-top">
                    <span className="block transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-full">{n.label}</span>
                    <span aria-hidden className="absolute inset-0 block translate-y-full font-serif italic transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0">
                      {n.label}
                    </span>
                  </span>
                  {active ? <motion.span layoutId="nav-dot" className="absolute -bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="relative z-10 flex items-center gap-1">
            <span className="label mr-2 hidden items-center gap-2 text-muted lg:flex">
              <span className="size-1.5 rounded-full bg-accent" /> v{site.version} · 50 effects
            </span>
            <a href={site.repo} target="_blank" rel="noreferrer" className="grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-fg" aria-label="typecn on GitHub">
              <GithubIcon className="size-[17px]" />
            </a>
            <ThemeToggle />
            <button
              type="button"
              className="ml-1 grid size-9 place-items-center md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-px w-5 bg-fg transition-all duration-500 ease-[var(--ease-out-expo)] ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-px w-5 bg-fg transition-all duration-500 ease-[var(--ease-out-expo)] ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-between bg-bg px-5 pt-24 pb-8 md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.87, 0, 0.13, 1] }}
          >
            <nav aria-label="Mobile">
              <ul className="space-y-1">
                {[{ href: "/", label: "Home", match: (p: string) => p === "/" }, ...nav].map((n, i) => (
                  <li key={n.href} className="overflow-hidden">
                    <motion.div initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.25 + i * 0.06, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                      <Link href={n.href} className="flex items-baseline gap-4 py-1 font-serif text-[52px] leading-[1.02] tracking-[-0.03em]">
                        <span className="font-mono text-xs text-muted">0{i + 1}</span>
                        <span className={n.match(pathname) ? "italic text-accent" : ""}>{n.label}</span>
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex items-end justify-between border-t border-line pt-5 text-sm text-muted">
              <span>50 effects · MIT</span>
              <a href={site.repo} className="ulink text-fg">
                GitHub ↗
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
