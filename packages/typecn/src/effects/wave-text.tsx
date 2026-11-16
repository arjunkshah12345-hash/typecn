"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useReducedMotion, useStyles, type ContinuousEffectProps } from "../core";

export interface WaveTextProps extends ContinuousEffectProps {
  /** Peak displacement in em. */
  amplitude?: number;
  /** Characters per full wave cycle. */
  wavelength?: number;
  /** Seconds for one oscillation at speed 1. */
  period?: number;
  /** Tilt letters along the wave slope, in degrees. */
  tilt?: number;
}

const css = `@keyframes typecn-wave{0%{transform:translateY(calc(var(--tc-a) * -1)) rotate(calc(var(--tc-r) * -1))}50%{transform:translateY(var(--tc-a)) rotate(var(--tc-r))}100%{transform:translateY(calc(var(--tc-a) * -1)) rotate(calc(var(--tc-r) * -1))}}`;

/** A travelling sine wave passes through the characters. Pure CSS animation, compositor-only, paused off-screen. */
export function WaveText(props: WaveTextProps) {
  const { text, className, style, as, amplitude = 0.18, wavelength = 10, period = 1.6, tilt = 6, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  useStyles("wave", css);
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
              ["--tc-a" as string]: `${amplitude}em`,
              ["--tc-r" as string]: `${tilt}deg`,
              animation: reduced ? "none" : `typecn-wave ${dur}s cubic-bezier(0.37,0,0.63,1) ${(-(c.index / wavelength) * dur).toFixed(3)}s infinite`,
              animationPlayState: active ? "running" : "paused",
              willChange: reduced ? undefined : "transform",
            }}
          >
            {c.char}
          </span>
        )}
      />
    </Root>
  );
}
