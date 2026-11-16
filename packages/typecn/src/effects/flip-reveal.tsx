"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, unitStyle, useStagger, useTimed, type TimedEffectProps } from "../core";

export interface FlipRevealProps extends TimedEffectProps {
  /** Rotation axis. `x` flips like a departure board, `y` like a card. */
  axis?: "x" | "y";
  /** Perspective distance in px — lower is more dramatic. */
  perspective?: number;
}

/** Characters rotate through 3D space on their own hinge and land flat on the page. */
export function FlipReveal(props: FlipRevealProps) {
  const { text, className, style, as, axis = "x", perspective = 600 } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 1000, stagger: 45, easing: "back.out" });
  const rot = axis === "x" ? "rotateX" : "rotateY";
  useStagger(
    ref,
    () => [
      { transform: `${rot}(-100deg)`, opacity: 0 },
      { opacity: 1, offset: 0.25 },
      { transform: `${rot}(0deg)`, opacity: 1 },
    ],
    { ...t, onComplete: props.onComplete, deps: [text, axis] },
  );
  const hidden = hiddenUntil(t.run, t.reduced, { opacity: 0 });
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        wordStyle={{ perspective }}
        char={(c) => (
          <span
            data-tc-unit=""
            style={{ ...unitStyle, transformOrigin: axis === "x" ? "50% 100% -0.3em" : "0% 50%", backfaceVisibility: "hidden", ...hidden }}
          >
            {c.char}
          </span>
        )}
      />
    </Root>
  );
}
