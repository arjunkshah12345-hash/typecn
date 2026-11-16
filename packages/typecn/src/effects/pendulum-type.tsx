"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useActive, useFrame, usePointer, useReducedMotion, useUnits, type ContinuousEffectProps } from "../core";

export interface PendulumTypeProps extends ContinuousEffectProps {
  /** Peak swing of the driving letter in degrees. */
  swing?: number;
  /** How tightly each letter follows its neighbour (0–1). Lower = longer delay. */
  coupling?: number;
  /** Pointer movement kicks the chain. */
  interactive?: boolean;
}

/**
 * Letters hang from their top edge like a chain of pendulums. The first is driven;
 * each subsequent letter is a damped spring chasing its neighbour, so motion
 * ripples down the word with natural delay. Pointer flicks add energy.
 */
export function PendulumType(props: PendulumTypeProps) {
  const { text, className, style, as, swing = 14, coupling = 0.16, interactive = true, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active && interactive);
  const units = useUnits(ref, [text]);
  const sim = useRef<{ a: number; v: number }[]>([]);

  useFrame(({ time }) => {
    const els = units.current;
    if (sim.current.length !== els.length) sim.current = els.map(() => ({ a: 0, v: 0 }));
    const p = pointer.current;
    const kick = interactive && p.inside ? p.vx * 0.12 : 0;
    els.forEach((el, i) => {
      const s = sim.current[i];
      const target = i === 0 ? Math.sin(time * 2.1) * swing : sim.current[i - 1].a;
      s.v += (target - s.a) * coupling + kick * 0.3;
      s.v *= 0.86;
      s.a += s.v;
      el.style.transform = `rotate(${s.a.toFixed(2)}deg)`;
    });
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={{ ...unitStyle, transformOrigin: "50% 0%" }}>{c.char}</span>} />
    </Root>
  );
}
