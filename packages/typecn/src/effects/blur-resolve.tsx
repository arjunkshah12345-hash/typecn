"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, seeded, unitStyle, useStagger, useTimed, type TimedEffectProps } from "../core";

export interface BlurResolveProps extends TimedEffectProps {
  /** Starting blur radius in px. */
  blur?: number;
  /** Where focus begins. */
  from?: "start" | "center" | "random";
}

/** Out-of-focus letterforms pull into focus, as if a lens were racking onto the page. */
export function BlurResolve(props: BlurResolveProps) {
  const { text, className, style, as, blur = 14, from = "center" } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 1400, stagger: 30, easing: "power.out" });
  useStagger(
    ref,
    () => [
      { filter: `blur(${blur}px)`, opacity: 0, transform: "scale(1.25)" },
      { filter: "blur(0px)", opacity: 1, transform: "scale(1)" },
    ],
    {
      ...t,
      onComplete: props.onComplete,
      deps: [text, blur, from],
      order: (n) => {
        if (from === "center") return Array.from({ length: n }, (_, i) => Math.abs(i - (n - 1) / 2));
        if (from === "random") {
          const r = seeded(n + 31);
          return Array.from({ length: n }, () => Math.floor(r() * n * 0.6));
        }
        return Array.from({ length: n }, (_, i) => i);
      },
    },
  );
  const hidden = hiddenUntil(t.run, t.reduced, { opacity: 0 });
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={{ ...unitStyle, ...hidden }}>{c.char}</span>} />
    </Root>
  );
}
