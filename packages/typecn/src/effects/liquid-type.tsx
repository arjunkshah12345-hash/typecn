"use client";
import { useId, useRef } from "react";
import { Root, Split, useActive, useFrame, usePointer, useReducedMotion, type ContinuousEffectProps } from "../core";

export interface LiquidTypeProps extends ContinuousEffectProps {
  /** Displacement strength in px. */
  intensity?: number;
  /** Turbulence frequency — lower values make broader, slower waves. */
  frequency?: number;
  /** Pointer proximity amplifies the distortion. */
  interactive?: boolean;
}

/**
 * Letterforms are pushed through a flowing turbulence field (SVG feTurbulence +
 * feDisplacementMap). The field drifts over time and swells under the pointer.
 */
export function LiquidType(props: LiquidTypeProps) {
  const { text, className, style, as, intensity = 18, frequency = 0.012, interactive = true, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const turb = useRef<SVGFETurbulenceElement>(null);
  const disp = useRef<SVGFEDisplacementMapElement>(null);
  const id = `tc-liquid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active && interactive);
  const boost = useRef(0);

  useFrame(({ time }) => {
    const p = pointer.current;
    boost.current += ((interactive && p.inside ? 1 : 0) - boost.current) * 0.06;
    // Two slow, out-of-phase oscillations on the base frequency make the field churn.
    const fx = frequency * (1 + Math.sin(time * 0.6) * 0.35 + Math.sin(time * 1.7) * 0.08);
    const fy = frequency * 2.2 * (1 + Math.cos(time * 0.47) * 0.35);
    turb.current?.setAttribute("baseFrequency", `${fx.toFixed(5)} ${fy.toFixed(5)}`);
    const s = intensity * (0.75 + Math.sin(time * 0.9) * 0.25) * (1 + boost.current * 1.4);
    disp.current?.setAttribute("scale", s.toFixed(2));
  }, active, speed);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <filter id={id} x="-20%" y="-30%" width="140%" height="160%" colorInterpolationFilters="sRGB">
          <feTurbulence ref={turb} type="fractalNoise" baseFrequency={`${frequency} ${frequency * 2.2}`} numOctaves={2} seed={3} result="noise" />
                    <feDisplacementMap ref={disp} in="SourceGraphic" in2="noise" scale={reduced ? 0 : intensity} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>
      <span style={{ display: "inline-block", filter: reduced ? undefined : `url(#${id})`, padding: "0.1em 0.15em", margin: "-0.1em -0.15em" }}>
        <Split text={text} />
      </span>
    </Root>
  );
}
