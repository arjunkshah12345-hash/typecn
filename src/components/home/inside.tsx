"use client";

import { useState } from "react";
import { ScrambleText } from "typecn";
import { site } from "@/lib/site";
import { CodeBlock } from "../code-block";
import { SectionHead } from "./section-head";

const usage = `import { ScrambleText } from "@/components/typecn/effects/scramble-text";

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

const ways = [
  { id: "registry", label: "shadcn", code: `npx shadcn@latest add ${site.url}/r/scramble-decode.json`, note: "Writes core.tsx and the effect into components/typecn. You own every line." },
  { id: "package", label: "package", code: `cd typecn/packages/typecn && npm run build && npm pack\nnpm install ./typecn-${site.version}.tgz`, note: "Tree-shakeable ESM + CJS with types. Not on npm yet — build it from the repo." },
  { id: "copy", label: "copy", code: `components/typecn/core.tsx\ncomponents/typecn/effects/scramble-text.tsx`, note: "Every effect page shows its exact source. Nothing beyond React 18+." },
];

const facts = [
  ["The components", "Fifty typed React components that share one API: trigger, duration, delay, stagger, easing, loop, replay. Timed effects run on the Web Animations API; continuous ones on a single rAF loop each."],
  ["Accessibility", "Screen readers get the sentence once, as plain text. The split letters are aria-hidden. Under reduced motion every effect settles on a readable still frame."],
  ["Performance", "Loops pause off-screen and in background tabs, write transforms straight to the DOM, and clean up every listener on unmount. Canvas and WebGL effects cap their frame rate."],
  ["The registry", "Each effect is a shadcn registry item. One command copies core.tsx and the effect file; there is no runtime package to keep in sync."],
];

/** "What's inside": a big two-column hairline list, then install + usage. */
export function Inside() {
  const [way, setWay] = useState(ways[0]);
  const [k, setK] = useState(0);
  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="inside-title">
      <SectionHead
        id="inside-title"
        n="04"
        kicker="What's inside"
        aside="MIT licensed"
        title={
          <>
            Source you <em>own</em>.
          </>
        }
      >
        <p className="max-w-[44ch]">Open-source kinetic type for React, shipped as files you copy into your repo, the shadcn way.</p>
      </SectionHead>

      <div className="grid gap-x-10 md:grid-cols-2">
        {facts.map(([t, d]) => (
          <div key={t} className="border-t border-line py-6">
            <h3 className="italic-serif text-[24px] leading-tight">{t}</h3>
            <p className="mt-2.5 text-[15.5px] leading-relaxed text-muted">{d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid min-w-0 border-t border-l border-line lg:grid-cols-2">
        <div className="flex min-w-0 flex-col border-r border-b border-line">
          <button
            type="button"
            onClick={() => setK((v) => v + 1)}
            className="group flex min-h-[150px] w-full items-center justify-between gap-4 border-b border-line px-6 py-8 text-left transition-colors hover:bg-bg-2"
            aria-label="Replay the ScrambleText example"
          >
            <ScrambleText
              key={k}
              text="Make something beautiful."
              duration={1200}
              trigger="inView"
              scrambleColor="var(--accent)"
              style={{ fontFamily: "var(--font-geist-mono)", fontSize: "clamp(20px, 2.6vw, 34px)", letterSpacing: "-0.03em" }}
            />
            <span className="chip shrink-0 transition-colors group-hover:text-fg">Replay ↻</span>
          </button>
          <div className="p-3">
            <CodeBlock code={usage} title="app/page.tsx" />
          </div>
        </div>
        <div className="flex min-w-0 flex-col border-r border-b border-line p-2">
          <div className="flex gap-1 p-1 font-mono text-[13px]" role="tablist" aria-label="Installation method">
            {ways.map((w) => (
              <button
                key={w.id}
                role="tab"
                type="button"
                aria-selected={w.id === way.id}
                onClick={() => setWay(w)}
                className={`rounded-full px-3 py-1.5 transition-colors ${w.id === way.id ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <div className="p-1">
            <CodeBlock code={way.code} lang="bash" title="terminal" />
          </div>
          <p className="px-3 pt-2 pb-3 text-[14px] text-muted">{way.note}</p>
          <ul className="mt-auto grid grid-cols-2 border-t border-line text-[13px]">
            {["SSR-safe", "Zero deps beyond React", "Typed props", "Reduced motion", "Pauses off-screen", "MIT licensed"].map((x) => (
              <li key={x} className="flex items-center gap-2 border-b border-line px-3 py-2.5 text-muted odd:border-r">
                <span className="font-mono text-accent">✓</span> {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
