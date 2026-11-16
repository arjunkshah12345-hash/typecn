"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { EffectMeta } from "@/registry/types";
import { cssCode, installCode, reactCode, type PlaygroundState } from "@/lib/codegen";
import { CodeBlock } from "../code-block";

interface RegistryFile {
  path: string;
  content: string;
}

const cache = new Map<string, Promise<RegistryFile[]>>();
export function loadSources(slug: string) {
  if (!cache.has(slug)) {
    cache.set(
      slug,
      fetch(`/r/${slug}.json`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((j: { files: RegistryFile[] }) => j.files)
        .catch(() => {
          cache.delete(slug);
          return [];
        }),
    );
  }
  return cache.get(slug)!;
}

const tabs = ["React", "CSS", "Install"] as const;
type Tab = (typeof tabs)[number];

export function CodePanel({ meta, state }: { meta: EffectMeta; state: PlaygroundState }) {
  const [tab, setTab] = useState<Tab>("React");
  const [view, setView] = useState<"usage" | "source" | "core">("usage");
  const [files, setFiles] = useState<RegistryFile[] | null>(null);

  useEffect(() => {
    let alive = true;
    loadSources(meta.slug).then((f) => alive && setFiles(f));
    return () => {
      alive = false;
    };
  }, [meta.slug]);

  const effectFile = files?.find((f) => f.path.includes("/effects/"));
  const coreFile = files?.find((f) => f.path.endsWith("core.tsx"));
  const install = installCode(meta);

  return (
    <section aria-label="Code" className="border-t border-line">
      <div className="flex items-center justify-between gap-4 border-b border-line">
        <div className="flex" role="tablist" aria-label="Code format">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`relative h-11 px-4 text-sm transition-colors ${tab === t ? "text-fg" : "text-muted hover:text-fg"}`}
            >
              {t}
              {tab === t ? <motion.span layoutId={`code-tab-${meta.slug}`} className="absolute inset-x-3 bottom-[-1px] h-px bg-accent" /> : null}
            </button>
          ))}
        </div>
        {tab === "React" ? (
          <div className="mr-2 flex border border-line" role="radiogroup" aria-label="React view">
            {(["usage", "source", "core"] as const).map((v) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={view === v}
                onClick={() => setView(v)}
                className={`label h-7 px-2.5 transition-colors ${view === v ? "bg-fg text-bg" : "text-muted hover:text-fg"}`}
              >
                {v === "usage" ? "Usage" : v === "source" ? `${meta.file}.tsx` : "core.tsx"}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="p-3 sm:p-4" role="tabpanel">
        {tab === "React" ? (
          view === "usage" ? (
            <CodeBlock code={reactCode(meta, state)} title="Headline.tsx · reflects your settings" maxHeight={420} />
          ) : (
            <CodeBlock
              code={(view === "source" ? effectFile?.content : coreFile?.content) ?? "// Loading source…"}
              title={view === "source" ? `components/typecn/effects/${meta.file}.tsx` : "components/typecn/core.tsx"}
              maxHeight={420}
            />
          )
        ) : null}
        {tab === "CSS" ? <CodeBlock code={cssCode(meta, state, effectFile?.content)} lang="css" title="styles.css" maxHeight={420} /> : null}
        {tab === "Install" ? (
          <div className="grid gap-3 lg:grid-cols-3">
            <div>
              <p className="label mb-2 text-muted">
                <span className="text-accent">01</span> shadcn registry — copies source into your app
              </p>
              <CodeBlock code={install.registry} lang="bash" title="terminal" />
              <p className="mt-2 text-[12px] leading-relaxed text-faint">
                Writes <code className="font-mono">core.tsx</code> and <code className="font-mono">effects/{meta.file}.tsx</code> into{" "}
                <code className="font-mono">components/typecn</code>. Then <code className="font-mono">import {"{"} {meta.component} {"}"} from &quot;@/components/typecn/effects/{meta.file}&quot;</code>.
              </p>
            </div>
            <div>
              <p className="label mb-2 text-muted">
                <span className="text-accent">02</span> Package — local build
              </p>
              <CodeBlock code={install.pkg} lang="bash" title="terminal" />
              <p className="mt-2 text-[12px] leading-relaxed text-faint">Not published to npm yet. The package builds ESM + CJS with type declarations.</p>
            </div>
            <div>
              <p className="label mb-2 text-muted">
                <span className="text-accent">03</span> Copy two files
              </p>
              <CodeBlock code={install.copy} lang="bash" title="file tree" />
              <p className="mt-2 text-[12px] leading-relaxed text-faint">
                Grab both from the React tab (<em>core.tsx</em> and <em>{meta.file}.tsx</em>). No dependencies beyond React 18+.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
