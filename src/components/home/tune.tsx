"use client";

import { useMemo, useState } from "react";
import { highlight } from "sugar-high";
import { effectBySlug, defaultProps } from "@/registry/effects";
import { initialState, installCode, reactCode } from "@/lib/codegen";
import type { ControlValue } from "@/registry/types";
import { SectionHead } from "./section-head";
import { EffectRenderer } from "../effect-renderer";
import { Range } from "../playground/controls";
import { CopyButton } from "../copy-button";

const meta = effectBySlug["wave-text"];
const KEYS = ["amplitude", "wavelength", "period", "tilt"] as const;

/** Move a slider, watch its line of code change. */
export function Tune() {
  const [values, setValues] = useState<Record<string, ControlValue>>(() => ({ ...defaultProps(meta), amplitude: 0.26, tilt: 10 }));
  const [changed, setChanged] = useState<string | null>(null);

  const state = useMemo(() => {
    const s = initialState(meta);
    return { ...s, text: "Tune me", size: 120, font: "serif" as const, weight: 300, tracking: -0.04, leading: 1, values };
  }, [values]);
  const code = useMemo(() => reactCode(meta, state).trimEnd(), [state]);
  const rawLines = useMemo(() => code.split("\n"), [code]);
  const lines = useMemo(() => rawLines.map((l) => highlight(l) || " "), [rawLines]);
  const install = installCode(meta).registry;
  const controls = meta.controls.filter((c) => (KEYS as readonly string[]).includes(c.key));

  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="tune-title">
      <SectionHead
        id="tune-title"
        n="02"
        kicker="The playground"
        aside="Every effect has one"
        title={
          <>
            Move a slider, <em>watch</em> the code.
          </>
        }
      >
        <p className="max-w-[42ch]">Every control maps to one prop. Change it and the matching line lights up, ready to paste.</p>
      </SectionHead>

      <div className="grid border-t border-l border-line lg:grid-cols-[1.15fr_1fr]">
        {/* preview + controls */}
        <div className="flex min-w-0 flex-col border-r border-b border-line">
          <div
            className="relative grid min-h-[340px] flex-1 place-items-center overflow-hidden px-6 lg:min-h-[420px]"
            style={{ backgroundImage: "linear-gradient(var(--line) 1px, transparent 1px)", backgroundSize: "100% 48px" }}
          >
            <span className="label absolute top-4 left-5 text-faint">N° {String(meta.number).padStart(2, "0")} — {meta.name}</span>
            <EffectRenderer
              meta={meta}
              values={values}
              text="Tune me"
              typography={{ font: "serif", size: "clamp(64px, 8vw, 120px)", weight: 300, tracking: -0.04, leading: 1 }}
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
            />
          </div>
          <div className="grid gap-x-8 border-t border-line px-5 py-4 sm:grid-cols-2">
            {controls.map((c) =>
              c.type === "range" ? (
                <Range
                  key={c.key}
                  label={c.label}
                  value={values[c.key] as number}
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  unit={c.unit}
                  onChange={(v) => {
                    setValues((p) => ({ ...p, [c.key]: v }));
                    setChanged(c.key);
                  }}
                />
              ) : null,
            )}
          </div>
        </div>

        {/* code */}
        <div className="code flex min-w-0 flex-col border-r border-b border-line bg-[var(--code-bg)]">
          <div className="flex items-center justify-between border-b border-line py-2 pr-2 pl-5">
            <span className="font-mono text-[12px] text-faint">
              components/<span className="text-fg">Headline.tsx</span>
            </span>
            <CopyButton text={code + "\n"} />
          </div>
          <pre className="thin-scroll flex-1 overflow-auto py-4 font-mono text-[12.5px] leading-[1.75]">
            {lines.map((html, n) => {
              const hit = changed !== null && rawLines[n].includes(`${changed}=`);
              return (
                <div key={n} className={`relative flex pr-4 transition-colors duration-700 ${hit ? "bg-accent/10" : ""}`}>
                  {hit ? <span className="absolute inset-y-0 left-0 w-[2px] bg-accent" aria-hidden /> : null}
                  <span className="w-11 shrink-0 pr-4 text-right text-faint select-none">{n + 1}</span>
                  <code dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              );
            })}
          </pre>
          <div className="flex items-center gap-2 border-t border-line px-5 py-3 font-mono text-[12px] text-muted">
            <span className="text-accent">$</span>
            <span className="truncate">{install}</span>
            <CopyButton text={install} iconOnly label="Copy install command" className="ml-auto shrink-0" />
          </div>
        </div>
      </div>
    </section>
  );
}
