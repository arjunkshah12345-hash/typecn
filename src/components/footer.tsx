import Link from "next/link";
import { site } from "@/lib/site";
import { Wordmark } from "./wordmark";

const cols: { title: string; links: [string, string][] }[] = [
  { title: "Library", links: [["Effects", "/effects"], ["Playground", "/playground"], ["Getting started", "/docs"], ["Installation", "/docs/installation"]] },
  { title: "Craft", links: [["Animation principles", "/docs/animation-principles"], ["Accessibility", "/docs/accessibility"], ["Performance", "/docs/performance"], ["Browser support", "/docs/browser-support"]] },
  { title: "Project", links: [["GitHub", site.repo], ["Contributing", "/docs/contributing"], ["License (MIT)", `${site.repo}/blob/main/LICENSE`]] },
  {
    title: "Built with",
    links: [
      ["dithercn", "https://dithercn.vercel.app"],
      ["gradients.sh", "https://gradients.sh"],
      ["ditherkit", "https://ditherkit.vercel.app"],
      ["asciicn (inspiration)", "https://asciicn.vercel.app"],
    ],
  },
];

export function Footer() {
  return (
    <footer className="container-x">
      <div className="grid gap-10 border-t border-line-strong pt-10 pb-8 lg:grid-cols-[1fr_2fr]">
        <p className="max-w-[30ch] text-[15px] leading-relaxed text-muted">Fifty ways for words to move. Free, open source, and yours to bend.</p>
        <div className="grid grid-cols-2 gap-8 text-[14px] sm:grid-cols-4">
          {cols.map((c) => (
            <div key={c.title}>
              <p className="label mb-3 text-faint">{c.title}</p>
              <ul className="space-y-2">
                {c.links.map(([l, h]) => (
                  <li key={l}>
                    {h.startsWith("http") ? (
                      <a href={h} target="_blank" rel="noreferrer" className="text-muted transition-colors hover:text-fg">
                        {l} <span className="text-faint">↗</span>
                      </a>
                    ) : (
                      <Link href={h} className="text-muted transition-colors hover:text-fg">
                        {l}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <Link href="/" aria-label="typecn home" className="block overflow-hidden border-t border-line pt-4 leading-none">
        <Wordmark className="text-[clamp(96px,24vw,400px)] tracking-[-0.05em]" />
      </Link>

      <div className="flex flex-col gap-2 border-t border-line py-5 text-[12.5px] text-faint sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} typecn contributors · MIT License</span>
        <span>Set in Fraunces and Geist.</span>
      </div>
    </footer>
  );
}
