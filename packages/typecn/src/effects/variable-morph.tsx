"use client";
import { useRef } from "react";
import { Root, Split, unitStyle, useStagger, useTimed, type TimedEffectProps } from "../core";

export type AxisPose = Record<string, number>;

export interface VariableMorphProps extends TimedEffectProps {
  /** Poses to travel through. Keys are 4-letter axis tags (`wght`, `wdth`, `opsz`, `slnt`, `SOFT`, …). */
  poses?: AxisPose[];
}

const DEFAULT_POSES: AxisPose[] = [
  { wght: 100, wdth: 50 },
  { wght: 900, wdth: 150 },
  { wght: 300, wdth: 120 },
  { wght: 800, wdth: 60 },
  { wght: 400, wdth: 100 },
];

const fvs = (p: AxisPose) =>
  Object.entries(p)
    .map(([k, v]) => `"${k}" ${v}`)
    .join(", ");

/**
 * Letters travel through a sequence of variable-font poses — hairline condensed
 * to black extended and back — with each character a beat behind its neighbour.
 * Works with any variable font; axes the font lacks are ignored by the browser.
 */
export function VariableMorph(props: VariableMorphProps) {
  const { text, className, style, as, poses = DEFAULT_POSES } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, { ...props, loop: props.loop ?? true }, { duration: 4200, stagger: 60, easing: "sine.inOut" });
  const key = JSON.stringify(poses);
  useStagger(
    ref,
    () => poses.map((p) => ({ fontVariationSettings: fvs(p) })),
    { ...t, loopDelay: props.loopDelay ?? 0, onComplete: props.onComplete, deps: [text, key] },
  );
  const last = poses[poses.length - 1];
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split text={text} char={(c) => <span data-tc-unit="" style={{ ...unitStyle, fontVariationSettings: last ? fvs(last) : undefined }}>{c.char}</span>} />
    </Root>
  );
}
