"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, unitStyle, useStagger, useTimed, type TimedEffectProps } from "../core";

export interface CharacterCascadeProps extends TimedEffectProps {
  /** Vertical travel in em. Negative values drop from above. */
  distance?: number;
  /** Starting rotation of each character in degrees. */
  rotate?: number;
}

/** Characters fall into place one after another, each with a small tilt that settles to zero. */
export function CharacterCascade(props: CharacterCascadeProps) {
  const { text, className, style, as, distance = 0.8, rotate = 7 } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 900, stagger: 28, easing: "expo.out" });
  useStagger(
    ref,
    () => [
      { transform: `translateY(${distance}em) rotate(${rotate}deg)`, opacity: 0 },
      { opacity: 1, offset: 0.35 },
      { transform: "translateY(0em) rotate(0deg)", opacity: 1 },
    ],
    { ...t, onComplete: props.onComplete, deps: [text, distance, rotate] },
  );
  const hidden = hiddenUntil(t.run, t.reduced, { opacity: 0 });
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        char={(c) => (
          <span data-tc-unit="" style={{ ...unitStyle, transformOrigin: "0% 100%", ...hidden }}>
            {c.char}
          </span>
        )}
      />
    </Root>
  );
}
