"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, seeded, useStagger, useTimed, type TimedEffectProps } from "../core";

export interface InkSpreadProps extends TimedEffectProps {
  /** Number of ink drops per word. More drops = more organic edges. */
  drops?: number;
  /** Softness of the ink edge (0–1). */
  bleed?: number;
}

let registered = false;
function register() {
  if (registered || typeof CSS === "undefined" || !("registerProperty" in CSS)) return;
  registered = true;
  try {
    CSS.registerProperty({ name: "--tc-ink", syntax: "<number>", inherits: false, initialValue: "0" });
  } catch {
    /* already registered */
  }
}

/**
 * Each word is revealed by several ink drops landing at different points and
 * spreading until they merge — a mask built from animated radial gradients.
 */
export function InkSpread(props: InkSpreadProps) {
  const { text, className, style, as, drops = 4, bleed = 0.5 } = props;
  const ref = useRef<HTMLElement>(null);
  if (typeof window !== "undefined") register();
  const t = useTimed(ref, props, { duration: 1600, stagger: 160, easing: "circ.out" });
  useStagger(
    ref,
    () => [
      { "--tc-ink": 0, filter: "blur(3px)", opacity: 0.4 } as Keyframe,
      { "--tc-ink": 1, filter: "blur(0px)", opacity: 1 } as Keyframe,
    ],
    { ...t, onComplete: props.onComplete, deps: [text, drops, bleed] },
  );
  const hidden = hiddenUntil(t.run, t.reduced, { opacity: 0 });
  const soft = 4 + bleed * 22;
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        word={(w) => {
          const r = seeded(w.index * 977 + w.text.length * 31 + 5);
          const layers = Array.from({ length: drops }, (_, i) => {
            const x = 10 + r() * 80;
            const y = 25 + r() * 50;
            const size = (0.8 + r() * 0.9) * (i === 0 ? 1.4 : 1);
            const lag = r() * 0.35;
            const radius = `calc(max(0, var(--tc-ink) - ${lag.toFixed(2)}) * ${(180 * size).toFixed(0)}%)`;
            return `radial-gradient(circle at ${x.toFixed(0)}% ${y.toFixed(0)}%, #000 ${radius}, transparent calc(${radius} + ${soft}%))`;
          }).join(", ");
          return (
            <span
              data-tc-unit=""
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                WebkitMaskImage: layers,
                maskImage: layers,
                WebkitMaskRepeat: "no-repeat",
                ["--tc-ink" as string]: 1,
                ...hidden,
              }}
            >
              {w.text}
            </span>
          );
        }}
      />
    </Root>
  );
}
