"use client";
import { useRef } from "react";
import { Root, Split, useActive, useFrame, useReducedMotion, useUnits, type ContinuousEffectProps } from "../core";

export interface FloatingLinesProps extends ContinuousEffectProps {
  /** Maximum drift in em. */
  drift?: number;
  /** Maximum rotation in degrees. */
  sway?: number;
}

/**
 * Each line floats on its own current: three incommensurate sine waves per line
 * mean the composition never visibly repeats.
 */
export function FloatingLines(props: FloatingLinesProps) {
  const { text, className, style, as, drift = 0.22, sway = 1.4, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const lines = useUnits(ref, [text]);

  useFrame(({ time }) => {
    lines.current.forEach((el, i) => {
      const p = i * 1.7;
      const x = (Math.sin(time * 0.53 + p) * 0.6 + Math.sin(time * 0.31 + p * 2.3) * 0.4) * drift;
      const y = (Math.sin(time * 0.71 + p * 1.3) * 0.5 + Math.cos(time * 0.43 + p) * 0.5) * drift * 0.6;
      const r = Math.sin(time * 0.37 + p * 0.7) * sway;
      el.style.transform = `translate3d(${x.toFixed(3)}em, ${y.toFixed(3)}em, 0) rotate(${r.toFixed(3)}deg)`;
    });
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        line={(l) => (
          <span data-tc-unit="" style={{ display: "block", willChange: "transform" }}>
            {l.children}
          </span>
        )}
      />
    </Root>
  );
}
