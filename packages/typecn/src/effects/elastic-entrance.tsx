"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, springEasing, unitStyle, useStagger, useTimed, type TimedEffectProps } from "../core";

export interface ElasticEntranceProps extends Omit<TimedEffectProps, "easing"> {
  /** Spring stiffness — higher snaps faster. */
  stiffness?: number;
  /** Spring damping — lower wobbles longer. */
  damping?: number;
  /** Starting squash: letters begin tall and thin, then spring to shape. */
  squash?: number;
}

/** Letters drop in tall and narrow, then spring to their natural shape with a physically modelled overshoot. */
export function ElasticEntrance(props: ElasticEntranceProps) {
  const { text, className, style, as, stiffness = 180, damping = 11, squash = 0.6 } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, { ...props, easing: springEasing(stiffness, damping) }, { duration: 1300, stagger: 50, easing: "spring" });
  useStagger(
    ref,
    () => [
      { transform: `translateY(-0.9em) scale(${1 - squash * 0.6}, ${1 + squash})`, opacity: 0 },
      { opacity: 1, offset: 0.1 },
      { transform: "translateY(0em) scale(1, 1)", opacity: 1 },
    ],
    { ...t, onComplete: props.onComplete, deps: [text, squash] },
  );
  const hidden = hiddenUntil(t.run, t.reduced, { opacity: 0 });
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={{ ...unitStyle, transformOrigin: "50% 100%", ...hidden }}>{c.char}</span>} />
    </Root>
  );
}
