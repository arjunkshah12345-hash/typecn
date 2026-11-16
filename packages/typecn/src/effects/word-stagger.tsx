"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, seeded, useStagger, useTimed, type TimedEffectProps } from "../core";

export interface WordStaggerProps extends TimedEffectProps {
  /** Where each word slides in from. */
  direction?: "left" | "right" | "up" | "down";
  /** Order in which words appear. */
  order?: "sequential" | "reverse" | "random";
  /** Starting skew in degrees, for an italic-to-roman settle. */
  skew?: number;
}

/** Whole words arrive in succession, sliding and un-skewing into their final position. */
export function WordStagger(props: WordStaggerProps) {
  const { text, className, style, as, direction = "up", order = "sequential", skew = -10 } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 1000, stagger: 90, easing: "expo.out" });
  const from =
    direction === "left" ? "translateX(-0.6em)" : direction === "right" ? "translateX(0.6em)" : direction === "down" ? "translateY(-0.5em)" : "translateY(0.5em)";
  useStagger(
    ref,
    () => [
      { transform: `${from} skewX(${skew}deg)`, opacity: 0 },
      { transform: "translate(0, 0) skewX(0deg)", opacity: 1 },
    ],
    {
      ...t,
      onComplete: props.onComplete,
      deps: [text, direction, skew],
      order: (n) => {
        const idx = Array.from({ length: n }, (_, i) => i);
        if (order === "reverse") return idx.map((i) => n - 1 - i);
        if (order === "random") {
          const r = seeded(n * 7919);
          const shuffled = [...idx].sort(() => r() - 0.5);
          const pos: number[] = [];
          shuffled.forEach((v, k) => (pos[v] = k));
          return pos;
        }
        return idx;
      },
    },
  );
  const hidden = hiddenUntil(t.run, t.reduced, { opacity: 0 });
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        word={(w) => (
          <span data-tc-unit="" style={{ display: "inline-block", whiteSpace: "nowrap", ...hidden }}>
            {w.text}
          </span>
        )}
      />
    </Root>
  );
}
