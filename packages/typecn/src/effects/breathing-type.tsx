"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useReducedMotion, useStyles, type ContinuousEffectProps } from "../core";

export interface BreathingTypeProps extends ContinuousEffectProps {
  minWeight?: number;
  maxWeight?: number;
  /** font-stretch range in percent — requires a font with a `wdth` axis. */
  minWidth?: number;
  maxWidth?: number;
  /** Seconds per breath at speed 1. */
  period?: number;
  /** Phase offset between letters, in fractions of a breath. */
  spread?: number;
}

const css = `@keyframes typecn-breathe{0%,100%{font-weight:var(--tc-w0);font-stretch:var(--tc-s0)}50%{font-weight:var(--tc-w1);font-stretch:var(--tc-s1)}}`;

/** Variable-font weight and width inhale and exhale, letter by letter. Needs a variable font with `wght` (and ideally `wdth`). */
export function BreathingType(props: BreathingTypeProps) {
  const { text, className, style, as, minWeight = 200, maxWeight = 900, minWidth = 75, maxWidth = 125, period = 3.2, spread = 0.06, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  useStyles("breathe", css);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused);
  const dur = period / Math.max(speed, 0.05);
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        char={(c) => (
          <span
            style={{
              ...unitStyle,
              ["--tc-w0" as string]: minWeight,
              ["--tc-w1" as string]: maxWeight,
              ["--tc-s0" as string]: `${minWidth}%`,
              ["--tc-s1" as string]: `${maxWidth}%`,
              animation: reduced ? "none" : `typecn-breathe ${dur}s cubic-bezier(0.45,0,0.55,1) ${(-c.index * spread * dur).toFixed(3)}s infinite`,
              animationPlayState: active ? "running" : "paused",
            }}
          >
            {c.char}
          </span>
        )}
      />
    </Root>
  );
}
