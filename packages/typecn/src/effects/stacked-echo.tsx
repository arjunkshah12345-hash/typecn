"use client";
import { useEffect, useRef } from "react";
import { Root, Split, resolveEasing, safeEasing, useActive, useReducedMotion, type EasingName, type TextEffectProps } from "../core";

export interface StackedEchoProps extends TextEffectProps {
  /** Number of echo layers behind the solid one. */
  layers?: number;
  /** Distance the stack travels, in em. */
  offset?: number;
  /** Delay between echo layers, in ms. */
  echoDelay?: number;
  /** One full there-and-back cycle, in ms. */
  duration?: number;
  /** Direction the stack fans out. */
  direction?: "up" | "down" | "diagonal";
  /** Draw echoes as outlines instead of tints. */
  outline?: boolean;
  easing?: EasingName | (string & {});
  paused?: boolean;
}

/**
 * A solid line of type with outlined echoes stacked behind it. The stack fans out
 * and collapses on a loop, every echo trailing the one in front by a fixed delay.
 */
export function StackedEcho(props: StackedEchoProps) {
  const { text, className, style, as, layers = 5, offset = 0.35, echoDelay = 70, duration = 2600, direction = "up", outline = true, easing = "quart.inOut", paused } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const anims = useRef<Animation[]>([]);

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-echo]"));
    const ease = safeEasing(resolveEasing(easing));
    const [vx, vy] = direction === "down" ? [0, 1] : direction === "diagonal" ? [0.7, -0.7] : [0, -1];
    anims.current = els.map((el, i) => {
      const k = i + 1;
      const to = `translate(${(vx * offset * k).toFixed(3)}em, ${(vy * offset * k).toFixed(3)}em)`;
      return el.animate(
        [
          { transform: "translate(0,0)", offset: 0 },
          { transform: to, offset: 0.4, easing: ease },
          { transform: to, offset: 0.6, easing: ease },
          { transform: "translate(0,0)", offset: 1 },
        ],
        { duration, delay: k * echoDelay, iterations: Infinity, easing: ease },
      );
    });
    return () => anims.current.forEach((a) => a.cancel());
  }, [text, layers, offset, echoDelay, duration, direction, easing, reduced]);

  useEffect(() => {
    anims.current.forEach((a) => (active ? a.play() : a.pause()));
  }, [active, text, layers, offset, echoDelay, duration, direction, easing, reduced]);

  return (
    <Root as={as} text={text} className={className} style={{ isolation: "isolate", ...style }} rootRef={ref}>
      {Array.from({ length: layers }, (_, i) => (
        <span
          key={i}
          data-tc-echo=""
          style={{
            position: "absolute",
            inset: 0,
            zIndex: -1 - i,
            WebkitTextFillColor: outline ? "transparent" : undefined,
            WebkitTextStroke: outline ? "max(1px, 0.012em) currentColor" : undefined,
            opacity: outline ? 1 - i / (layers + 1) : 0.6 - (i / layers) * 0.5,
          }}
        >
          <Split text={text} />
        </span>
      ))}
      <span style={{ position: "relative", display: "block" }}>
        <Split text={text} />
      </span>
    </Root>
  );
}
