"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, seeded, useStagger, useTimed, type TimedEffectProps } from "../core";

export interface SliceShiftProps extends TimedEffectProps {
  /** Number of horizontal slices. */
  slices?: number;
  /** Maximum horizontal offset in em. */
  offset?: number;
}

/**
 * The text is cut into horizontal bands. Each band slides in from its own offset
 * and they lock together into a single clean line — like a misregistered print
 * being pulled into alignment.
 */
export function SliceShift(props: SliceShiftProps) {
  const { text, className, style, as, slices = 6, offset = 0.9 } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 1300, stagger: 70, easing: "expo.inOut" });
  const r = seeded(slices * 101);
  const dirs = Array.from({ length: slices }, (_, i) => (i % 2 ? 1 : -1) * (0.4 + r() * 0.6));
  useStagger(
    ref,
    (i) => [
      { transform: `translateX(${(dirs[i] * offset).toFixed(3)}em)`, opacity: 0 },
      { opacity: 1, offset: 0.2 },
      { transform: "translateX(0em)", opacity: 1 },
    ],
    { ...t, onComplete: props.onComplete, deps: [text, slices, offset] },
  );
  const hidden = hiddenUntil(t.run, t.reduced, { opacity: 0 });
  const h = 100 / slices;
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <span style={{ visibility: "hidden", display: "block" }}>
        <Split text={text} />
      </span>
      {Array.from({ length: slices }, (_, i) => (
        <span
          key={i}
          data-tc-unit=""
          style={{
            position: "absolute",
            inset: 0,
            clipPath: `inset(${(i * h).toFixed(3)}% -50% ${(100 - (i + 1) * h - 0.2).toFixed(3)}% -50%)`,
            ...hidden,
          }}
        >
          <Split text={text} />
        </span>
      ))}
    </Root>
  );
}
