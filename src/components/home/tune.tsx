"use client";

import { useMemo, useRef, useState } from "react";
import { highlight } from "sugar-high";
import { effectBySlug, defaultProps } from "@/registry/effects";
import { initialState, installCode, reactCode } from "@/lib/codegen";
import type { ControlValue } from "@/registry/types";
import { GrainGradient } from "@/components/gradients/grain-gradient";
import { EffectRenderer } from "../effect-renderer";
import { Range } from "../playground/controls";
import { CopyButton } from "../copy-button";

const meta = effectBySlug["wave-text"];
const KEYS = ["amplitude", "wavelength", "period", "tilt"] as const;

/** gradients.sh-style "move a slider, watch its line change" demo. */
export function Tune() {
  const [values, setValues] = useState<Record<string, ControlValue>>(() => ({ ...defaultProps(meta), amplitude: 0.26, tilt: 10 }));
  const [changed, setChanged] = useState<string | null>(null);
  const flash = useRef(0);

  const state = useMemo(() => {
    const s = initialState(meta);
    return { ...s, text: "Tune me", size: 96, font: "grotesk" as const, weight: 700, tracking: -0.04, leading: 1, color: "#ffffff", values };
  }, [values]);
  const code = useMemo(() => reactCode(meta, state).trimEnd(), [state]);
  const lines = useMemo(() => code.split("\n").map((l) => highlight(l) || " "), [code]);
  const controls = meta.controls.filter((c) => (KEYS as readonly string[]).includes(c.key));

  return (
    <section className="container-x py-20 sm:py-28" aria-labelledby="tune-title">
      <div className="mx-auto mb-12 max-w-[820px] text-center">
        <p className="label mb-4 text-accent">The playground</p>
        <h2 id="tune-title" className="display text-[clamp(40px,5.5vw,72px)]">
          Move a slider.
          <br />
          <span className="text-muted">Watch its line change.</span>
        </h2>
      </div>

      <div className="grid gap-2 rounded-[28px] border border-line bg-panel p-2 lg:grid-cols-[1.15fr_1fr]">
        {/* preview over a gradients.sh grain gradient */}
        <div className="relative isolate min-h-[420px] overflow-hidden rounded-[22px] lg:min-h-[520px]">
          <GrainGradient
            aria-hidden
            className="!absolute inset-0 -z-10"
            colors={["#ff5b24", "#8f9bff", "#1b1b3a", "#ffb38a"]}
            background="#0b0b12"
            speed={0.5}
            grain={0.45}
            blur={0.55}
            warp={0.35}
          />
          <div className="absolute inset-0 grid place-items-center px-6 pb-48 text-white sm:pr-[310px] sm:pb-0">
            <EffectRenderer
              meta={meta}
              values={values}
              text="Tune me"
              typography={{ font: "grotesk", size: "clamp(56px, 7vw, 96px)", weight: 700, tracking: -0.04, leading: 1, color: "#fff" }}
            />
          </div>
          <div className="absolute right-3 bottom-3 left-3 rounded-2xl border border-white/10 bg-black/55 p-4 text-white backdrop-blur-xl sm:left-auto sm:w-[290px] sm:top-3 sm:bottom-auto">
            <p className="mb-1 text-[13px] font-medium">{meta.name}</p>
            <div className="[&_.text-muted]:text-white/60 [&_.text-fg]:text-white">
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
                      flash.current++;
                    }}
                  />
                ) : null,
              )}
            </div>
          </div>
        </div>

        {/* code */}
        <div className="code flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-line bg-[var(--code-bg)]">
          <div className="flex items-center justify-between border-b border-line py-2 pr-2 pl-4">
            <span className="font-mono text-[12px] text-faint">
              components/<span className="text-fg">Headline.tsx</span>
            </span>
            <CopyButton text={code + "\n"} />
          </div>
          <pre className="thin-scroll flex-1 overflow-auto py-4 font-mono text-[12.5px] leading-[1.75]">
            {lines.map((html, n) => {
              const hit = changed !== null && code.split("\n")[n].includes(`${changed}=`);
              return (
                <div key={n} className={`relative flex pr-4 transition-colors duration-700 ${hit ? "bg-accent/10" : ""}`}>
                  {hit ? <span className="absolute inset-y-0 left-0 w-[2px] bg-accent" aria-hidden /> : null}
                  <span className="w-11 shrink-0 pr-4 text-right text-faint select-none">{n + 1}</span>
                  <code dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              );
            })}
          </pre>
          <div className="border-t border-line px-4 py-3">
            <div className="flex items-center gap-2 font-mono text-[12px] text-muted">
              <span className="text-accent">$</span>
              <span className="truncate">{installCode(meta).registry}</span>
              <CopyButton text={installCode(meta).registry} iconOnly label="Copy install command" className="ml-auto shrink-0" />
            </div>
            <p className="mt-1.5 text-[12.5px] text-faint">Every effect has this playground — with font, colour, timing and its own controls.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
