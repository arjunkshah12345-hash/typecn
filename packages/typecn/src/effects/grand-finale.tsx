"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, seeded, springEasing, safeEasing, unitStyle, useIsoLayoutEffect, useTimed, type TimedEffectProps, useLatest } from "../core";

export interface GrandFinaleProps extends Omit<TimedEffectProps, "easing" | "duration"> {
  /** Accent colour used for the rule, ghosts and weight flare. */
  accent?: string;
  /** Overall tempo multiplier. 1 ≈ 5.5 seconds. */
  tempo?: number;
  /** Lightest and heaviest weights of the variable-font sweep. */
  minWeight?: number;
  maxWeight?: number;
}

/**
 * Five acts on one timeline:
 * 1. characters rise from behind a baseline mask,
 * 2. a variable-weight sweep surges across the line,
 * 3. a glitch burst tears the type into chromatic slices,
 * 4. the letters burst apart and spring back together,
 * 5. a rule draws beneath the settled headline.
 */
export function GrandFinale(props: GrandFinaleProps) {
  const { text, className, style, as, accent = "#ff5a1f", tempo = 1, minWeight = 200, maxWeight = 900 } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 0, stagger: 32, easing: "linear" });
  const { run, reduced, delay, stagger, loop } = t;
  const loopDelay = t.loopDelay ?? 1800;
  const done = useLatest(props.onComplete);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || run === 0 || reduced) return;
    const chars = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-unit]"));
    const ghostsA = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-ga]"));
    const ghostsB = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-gb]"));
    const rule = root.querySelector<HTMLElement>("[data-tc-rule]")!;
    const T = (ms: number) => ms / Math.max(tempo, 0.1);
    const spring = safeEasing(springEasing(160, 12));
    let anims: Animation[] = [];
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const play = () => {
      anims.forEach((a) => a.cancel());
      anims = [];
      const r = seeded(chars.length * 3 + 1);
      const n = chars.length;
      // Act 1 — rise
      const a1 = T(900);
      const s = T(stagger);
      chars.forEach((el, i) => {
        anims.push(
          // The clip travels with the transform so the glyph appears to rise from a fixed baseline.
          el.animate(
            [
              { transform: "translateY(105%)", clipPath: "inset(-20% -20% 105% -20%)" },
              { transform: "translateY(0%)", clipPath: "inset(-20% -20% -20% -20%)" },
            ],
            {
            duration: a1,
            delay: delay + i * s,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "backwards",
          },
          ),
        );
      });
      const act2 = delay + a1 + n * s * 0.6;
      // Act 2 — weight surge
      chars.forEach((el, i) => {
        anims.push(
          el.animate(
            [
              { fontWeight: minWeight + (maxWeight - minWeight) * 0.35, color: "inherit" },
              { fontWeight: maxWeight, color: accent, offset: 0.4 },
              { fontWeight: minWeight, offset: 0.7 },
              { fontWeight: minWeight + (maxWeight - minWeight) * 0.35, color: "inherit" },
            ],
            { duration: T(1100), delay: act2 + i * s * 0.8, easing: "cubic-bezier(0.37, 0, 0.63, 1)" },
          ),
        );
      });
      const act3 = act2 + T(1100) + n * s * 0.5;
      // Act 3 — glitch burst on ghosts + slice jolts
      const burst = T(520);
      const steps = 8;
      [ghostsA, ghostsB].forEach((set, gi) =>
        set.forEach((g) => {
          const frames: Keyframe[] = Array.from({ length: steps + 1 }, (_, k) => {
            const on = k > 0 && k < steps;
            const top = r() * 80;
            return {
              opacity: on ? 0.9 : 0,
              transform: `translateX(${on ? (gi ? 1 : -1) * (0.04 + r() * 0.1) : 0}em)`,
              clipPath: on ? `inset(${top.toFixed(0)}% 0 ${(100 - top - 10 - r() * 30).toFixed(0)}% 0)` : "inset(0 0 100% 0)",
              easing: "steps(1, end)",
            };
          });
          anims.push(g.animate(frames, { duration: burst, delay: act3 }));
        }),
      );
      chars.forEach((el) => {
        anims.push(
          el.animate(
            [
              { transform: "skewX(0deg)" },
              { transform: `skewX(${(r() * 30 - 15).toFixed(0)}deg) translateX(${(r() * 0.1 - 0.05).toFixed(2)}em)`, offset: 0.3 },
              { transform: "skewX(0deg)", offset: 0.6 },
              { transform: `translateX(${(r() * 0.08 - 0.04).toFixed(2)}em)`, offset: 0.8 },
              { transform: "none" },
            ],
            { duration: burst, delay: act3, easing: "steps(1, end)", composite: "add" },
          ),
        );
      });
      const act4 = act3 + burst + T(150);
      // Act 4 — burst apart and spring back
      chars.forEach((el, i) => {
        const dx = (i - (n - 1) / 2) * 0.025 + (r() - 0.5) * 0.14;
        const dy = (r() - 0.5) * 0.45;
        const out = `translate(${dx.toFixed(2)}em, ${dy.toFixed(2)}em) rotate(${(r() * 36 - 18).toFixed(0)}deg)`;
        // One animation per glyph: burst out, hold for its stagger, spring home.
        const outMs = T(260);
        const holdMs = Math.abs(i - n / 2) * s * 0.4;
        const backMs = T(1100);
        const total = outMs + holdMs + backMs;
        anims.push(
          el.animate(
            [
              { transform: "translate(0,0) rotate(0deg)", offset: 0, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
              { transform: out, offset: outMs / total },
              { transform: out, offset: (outMs + holdMs) / total, easing: spring },
              { transform: "translate(0,0) rotate(0deg)", offset: 1 },
            ],
            { duration: total, delay: act4, composite: "add" },
          ),
        );
      });
      const act5 = act4 + T(900);
      // Act 5 — rule
      anims.push(rule.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], { duration: T(900), delay: act5, easing: "cubic-bezier(0.87, 0, 0.13, 1)", fill: "both" }));
      Promise.all(anims.map((a) => a.finished))
        .then(() => {
          if (cancelled) return;
          done.current?.();
          if (loop) timer = setTimeout(play, loopDelay);
        })
        .catch(() => {});
    };
    play();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      anims.forEach((a) => a.cancel());
    };
  }, [run, reduced, delay, stagger, loop, loopDelay, tempo, accent, minWeight, maxWeight, text, done]);

  const hidden = hiddenUntil(run, reduced, { transform: "translateY(105%)", clipPath: "inset(-20% -20% 105% -20%)" });
  const base = minWeight + (maxWeight - minWeight) * 0.35;
  return (
    <Root as={as} text={text} className={className} style={{ fontWeight: base, ...style }} rootRef={ref}>
      <Split
        text={text}
        line={(l) => (
          <span style={{ display: "block", position: "relative" }}>
            <span style={{ display: "block" }}>{l.children}</span>
            <span data-tc-ga="" style={{ position: "absolute", inset: 0, color: accent, opacity: 0, pointerEvents: "none" }}>
              {l.text}
            </span>
            <span data-tc-gb="" style={{ position: "absolute", inset: 0, color: "#00d1ff", opacity: 0, pointerEvents: "none" }}>
              {l.text}
            </span>
          </span>
        )}
        char={(c) => <span data-tc-unit="" style={{ ...unitStyle, ...hidden }}>{c.char}</span>}
      />
      <span
        data-tc-rule=""
        style={{ display: "block", height: "0.04em", minHeight: 2, marginTop: "0.12em", background: accent, transform: reduced ? "none" : "scaleX(0)", transformOrigin: "0 50%" }}
      />
    </Root>
  );
}
