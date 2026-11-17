import Link from "next/link";
import { site } from "@/lib/site";
import { Wordmark } from "./wordmark";
import { DitherWordmark } from "./dither-wordmark";

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
    <footer className="px-2 pb-2 sm:px-3 sm:pb-3">
      <div className="overflow-hidden rounded-[28px] border border-line bg-panel sm:rounded-[36px]">
        <div className="grid gap-10 px-6 pt-12 pb-4 sm:px-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <Link href="/" className="text-[20px]" aria-label="typecn home">
              <Wordmark />
            </Link>
            <p className="mt-4 max-w-[30ch] text-[15px] leading-relaxed text-muted">Fifty ways for words to move. Free, open source, and yours to bend.</p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-[14px] sm:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="mb-3 text-[13px] text-faint">{c.title}</p>
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

        {/* ditherkit: Atkinson-dithered wordmark lit by a moving light */}
        <div className="px-4 pt-6 sm:px-8">
          <DitherWordmark className="h-[clamp(90px,19vw,300px)]" cell={5} />
        </div>

        <div className="flex flex-col gap-2 border-t border-line px-6 py-5 text-[12.5px] text-faint sm:flex-row sm:justify-between sm:px-10">
          <span>© {new Date().getFullYear()} typecn contributors · MIT License</span>
          <span>Wordmark dithered live with ditherkit&apos;s Atkinson kernel. Move your pointer over it.</span>
        </div>
      </div>
    </footer>
  );
}
