"use client";

import { useState } from "react";
import { ScrambleText } from "typecn";
import { site } from "@/lib/site";
import { CodeBlock } from "./code-block";

const ways = [
  {
    id: "registry",
    label: "Registry",
    title: "Copy the source with the shadcn CLI",
    lang: "bash" as const,
    code: `npx shadcn@latest add ${site.url}/r/scramble-decode.json`,
    note: "Two files land in components/typecn — the shared core and the effect. You own the code.",
  },
  {
    id: "package",
    label: "Package",
    title: "Install the package (local build)",
    lang: "bash" as const,
    code: `cd typecn/packages/typecn && npm run build && npm pack\nnpm install ./typecn-${site.version}.tgz`,
    note: "Tree-shakeable ESM + CJS with full type declarations. Not on npm yet — build it from the repo.",
  },
  {
    id: "copy",
    label: "Copy",
    title: "Or paste two files",
    lang: "bash" as const,
    code: `components/typecn/core.tsx\ncomponents/typecn/effects/scramble-text.tsx`,
    note: "Every effect page shows its exact source. Zero dependencies beyond React 18+.",
  },
];

const usage = `import { ScrambleText } from "typecn";

export function Hero() {
  return (
    <ScrambleText
      as="h1"
      text="Make something beautiful."
      duration={1200}
      trigger="inView"
    />
  );
}`;

export function DevSection() {
  const [way, setWay] = useState(ways[0]);
  const [k, setK] = useState(0);
  return (
    <section className="container-x border-t border-line py-24 md:py-36" aria-labelledby="dev-title">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="label mb-6 text-accent">For developers</p>
          <h2 id="dev-title" className="font-serif text-[clamp(44px,6vw,88px)] leading-[0.95] tracking-[-0.035em] text-balance">
            Install. Import. <span className="italic">Ship.</span>
          </h2>
          <p className="mt-6 max-w-[42ch] text-[17px] leading-relaxed text-muted">
            Every effect is an independent, typed React component with the same props: <code className="font-mono text-[14px] text-fg">trigger</code>,{" "}
            <code className="font-mono text-[14px] text-fg">duration</code>, <code className="font-mono text-[14px] text-fg">easing</code>,{" "}
            <code className="font-mono text-[14px] text-fg">loop</code>. Accessible text, reduced-motion fallbacks and cleanup are built in.
          </p>
          <ul className="mt-10 divide-y divide-line border-y border-line">
            {[
              ["SSR-safe", "Renders on the server, animates on the client. No window access during render."],
              ["Accessible", "One readable text node for screen readers; split glyphs are aria-hidden."],
              ["Frugal", "Loops pause off-screen and in background tabs. No listeners left behind."],
            ].map(([t, d]) => (
              <li key={t} className="grid grid-cols-[120px_1fr] gap-4 py-4 text-[15px]">
                <span>{t}</span>
                <span className="text-muted">{d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="min-w-0 md:col-span-7">
          <button
            type="button"
            onClick={() => setK((v) => v + 1)}
            className="group mb-2 flex w-full items-center justify-between border border-line bg-ink-2 px-6 py-10 text-left text-paper"
            aria-label="Replay the ScrambleText example"
          >
            <ScrambleText
              key={k}
              text="Make something beautiful."
              duration={1200}
              trigger="inView"
              scrambleColor="#ff5a1f"
              style={{ fontFamily: "var(--font-mono)", fontSize: "clamp(22px, 3vw, 40px)", letterSpacing: "-0.03em" }}
            />
            <span className="label shrink-0 text-paper/50 transition-colors group-hover:text-paper">Replay ↻</span>
          </button>
          <CodeBlock code={usage} title="app/page.tsx" />
          <div className="mt-8">
            <div className="flex border-b border-line" role="tablist" aria-label="Installation method">
              {ways.map((w) => (
                <button
                  key={w.id}
                  role="tab"
                  type="button"
                  aria-selected={w.id === way.id}
                  onClick={() => setWay(w)}
                  className={`relative h-10 px-4 text-sm transition-colors ${w.id === way.id ? "text-fg" : "text-muted hover:text-fg"}`}
                >
                  {w.label}
                  {w.id === way.id ? <span className="absolute inset-x-3 -bottom-px h-px bg-accent" /> : null}
                </button>
              ))}
            </div>
            <p className="mt-4 mb-2 text-[15px]">{way.title}</p>
            <CodeBlock code={way.code} lang={way.lang} title="terminal" />
            <p className="mt-2 text-[13px] text-muted">{way.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
