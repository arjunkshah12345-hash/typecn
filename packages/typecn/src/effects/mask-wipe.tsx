"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, safeEasing, useIsoLayoutEffect, useTimed, type TimedEffectProps, useLatest } from "../core";

export interface MaskWipeProps extends TimedEffectProps {
  /** Colour of the wiping bar. Defaults to the current text colour. */
  barColor?: string;
  /** Direction of the wipe. */
  direction?: "left" | "right";
}

/**
 * Each line is covered by a solid bar that sweeps across, then retracts to reveal the
 * type underneath. Two-phase motion: cover, then uncover.
 */
export function MaskWipe(props: MaskWipeProps) {
  const { text, className, style, as, barColor = "currentColor", direction = "left" } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 1100, stagger: 140, easing: "quart.inOut" });
  const { run, reduced, duration, delay, stagger, easing, loop, loopDelay = 900 } = t;
  const done = useLatest(props.onComplete);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || run === 0 || reduced) return;
    const lines = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-line]"));
    const ease = safeEasing(easing);
    const a = direction === "left" ? "0%" : "100%";
    const b = direction === "left" ? "100%" : "0%";
    let anims: Animation[] = [];
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const play = () => {
      anims.forEach((x) => x.cancel());
      anims = [];
      lines.forEach((line, i) => {
        const bar = line.querySelector<HTMLElement>("[data-tc-bar]")!;
        const ink = line.querySelector<HTMLElement>("[data-tc-ink]")!;
        const d = delay + i * stagger;
        anims.push(
          bar.animate(
            [
              { transform: "scaleX(0)", transformOrigin: `${a} 50%` },
              { transform: "scaleX(1)", transformOrigin: `${a} 50%`, offset: 0.5 },
              { transform: "scaleX(1)", transformOrigin: `${b} 50%`, offset: 0.5001 },
              { transform: "scaleX(0)", transformOrigin: `${b} 50%` },
            ],
            { duration, delay: d, easing: ease, fill: "both" },
          ),
          ink.animate([{ opacity: 0 }, { opacity: 0, offset: 0.5 }, { opacity: 1, offset: 0.5001 }, { opacity: 1 }], {
            duration,
            delay: d,
            fill: "both",
          }),
        );
      });
      Promise.all(anims.map((x) => x.finished))
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
      anims.forEach((x) => x.cancel());
    };
  }, [run, reduced, duration, delay, stagger, easing, loop, loopDelay, direction, text, done]);

  const hidden = hiddenUntil(run, reduced, { opacity: 0 });
  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        line={(l) => (
          <span data-tc-line="" style={{ display: "block" }}>
            <span style={{ position: "relative", display: "inline-block" }}>
              <span data-tc-ink="" style={{ display: "inline-block", ...hidden }}>
                {l.children}
              </span>
              <span
                data-tc-bar=""
                style={{ position: "absolute", inset: "0.08em -0.04em", background: barColor, transform: "scaleX(0)", pointerEvents: "none" }}
              />
            </span>
          </span>
        )}
      />
    </Root>
  );
}
