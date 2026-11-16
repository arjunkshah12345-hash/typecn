"use client";
import { useRef } from "react";
import { Root, Split, seeded, unitStyle, useActive, useFrame, useReducedMotion, useUnits, type ContinuousEffectProps } from "../core";

export interface JitterProps extends ContinuousEffectProps {
  /** Maximum offset in em. */
  amount?: number;
  /** Maximum rotation in degrees. */
  rotation?: number;
  /** Redraws per second — low values feel like hand-drawn "boiling" animation. */
  fps?: number;
  /** Probability (0–1) a letter also drops ink weight for a frame. */
  flicker?: number;
}

/**
 * Letters boil like hand-inked animation cels: positions are re-rolled at a low
 * frame rate rather than tweened, so the motion reads as analogue, not digital.
 */
export function Jitter(props: JitterProps) {
  const { text, className, style, as, amount = 0.035, rotation = 3, fps = 10, flicker = 0.04, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const units = useUnits(ref, [text]);
  const frameRef = useRef(-1);

  useFrame(({ time }) => {
    const frame = Math.floor(time * fps);
    if (frame === frameRef.current) return;
    frameRef.current = frame;
    units.current.forEach((el, i) => {
      const r = seeded(frame * 131 + i * 977 + 1);
      const x = (r() * 2 - 1) * amount;
      const y = (r() * 2 - 1) * amount;
      const rot = (r() * 2 - 1) * rotation;
      el.style.transform = `translate(${x.toFixed(3)}em, ${y.toFixed(3)}em) rotate(${rot.toFixed(2)}deg)`;
      el.style.opacity = r() < flicker ? "0.55" : "1";
    });
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
    </Root>
  );
}
