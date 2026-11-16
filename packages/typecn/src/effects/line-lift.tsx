"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, useStagger, useTimed, type TimedEffectProps } from "../core";

export interface LineLiftProps extends TimedEffectProps {
  /** Starting rotation of each line in degrees — gives the lift a hinge. */
  tilt?: number;
}

/** Each line rises out of an invisible baseline mask, hinged slightly so it settles like a page turning flat. */
export function LineLift(props: LineLiftProps) {
  const { text, className, style, as, tilt = 3 } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 1200, stagger: 120, easing: "expo.out" });
  useStagger(
    ref,
    () => [
      { transform: `translateY(110%) rotate(${tilt}deg)` },
      { transform: "translateY(0%) rotate(0deg)" },
    ],
    { ...t, onComplete: props.onComplete, deps: [text, tilt] },
  );
  const hidden = hiddenUntil(t.run, t.reduced, { transform: "translateY(110%)" });
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        line={(l) => (
          <span style={{ display: "block", overflow: "hidden", paddingBottom: "0.08em", marginBottom: "-0.08em" }}>
            <span data-tc-unit="" style={{ display: "block", transformOrigin: "0% 0%", ...hidden }}>
              {l.children}
            </span>
          </span>
        )}
      />
    </Root>
  );
}
