"use client";
import { useEffect, useRef } from "react";
import { Root, Split, resolveEasing, safeEasing, seeded, useActive, useReducedMotion, type ContinuousEffectProps, type EasingName } from "../core";

export interface RollingCharactersProps extends ContinuousEffectProps {
  /** Glyphs that roll past. */
  glyphs?: string;
  /** How many glyphs pass before landing back on the letter. */
  steps?: number;
  /** Seconds per cycle at speed 1. */
  period?: number;
  /** Delay between neighbouring columns in seconds. */
  stagger?: number;
  easing?: EasingName | (string & {});
}

/**
 * Each character is a drum on a mechanical counter. Drums roll through a strip of
 * glyphs and land back on the original letter, column by column, forever.
 */
export function RollingCharacters(props: RollingCharactersProps) {
  const { text, className, style, as, glyphs = "0123456789", steps = 6, period = 3.2, stagger = 0.06, easing = "quart.inOut", paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused);
  const anims = useRef<Animation[]>([]);
  const pool = Array.from(glyphs || "0123456789");

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    const strips = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-strip]"));
    const dur = (period / Math.max(speed, 0.05)) * 1000;
    const ease = safeEasing(resolveEasing(easing));
    anims.current = strips.map((s, i) =>
      s.animate(
        [
          { transform: "translateY(0)", offset: 0 },
          { transform: "translateY(0)", offset: 0.35, easing: ease },
          { transform: `translateY(-${steps * 1.15}em)`, offset: 1 },
        ],
        { duration: dur, delay: i * stagger * 1000, iterations: Infinity },
      ),
    );
    return () => anims.current.forEach((a) => a.cancel());
  }, [text, glyphs, steps, period, stagger, easing, speed, reduced]);

  useEffect(() => {
    anims.current.forEach((a) => (active ? a.play() : a.pause()));
  }, [active, text, glyphs, steps, period, stagger, easing, speed, reduced]);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        char={(c) => {
          const r = seeded(c.index * 53 + 11);
          const strip = Array.from({ length: steps - 1 }, () => pool[Math.floor(r() * pool.length)]);
          return (
            <span style={{ display: "inline-block", height: "1.15em", lineHeight: "1.15em", overflow: "hidden", verticalAlign: "bottom" }}>
              <span data-tc-strip="" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                {[c.char, ...strip, c.char].map((g, k) => (
                  <span key={k} style={{ display: "block", height: "1.15em", whiteSpace: "pre" }}>
                    {g}
                  </span>
                ))}
              </span>
            </span>
          );
        }}
      />
    </Root>
  );
}
