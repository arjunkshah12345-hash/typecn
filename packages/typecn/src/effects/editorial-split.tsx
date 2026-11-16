"use client";
import { useRef } from "react";
import { Root, Split, hiddenUntil, safeEasing, useIsoLayoutEffect, useTimed, type TimedEffectProps, useLatest } from "../core";

export interface EditorialSplitProps extends TimedEffectProps {
  /** Colour of the seam rule. */
  ruleColor?: string;
  /** Horizontal travel of each panel, in em. */
  travel?: number;
  /** Small caption that appears in the seam while it is open. */
  kicker?: string;
}

/**
 * The headline is cut horizontally into two panels that arrive from opposite
 * sides. They pause slightly apart — a hairline rule and kicker visible in the
 * seam — then close into one solid line of type.
 */
export function EditorialSplit(props: EditorialSplitProps) {
  const { text, className, style, as, ruleColor = "#ff5a1f", travel = 2.5, kicker = "" } = props;
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 1800, stagger: 120, easing: "expo.inOut" });
  const { run, reduced, duration, delay, stagger, easing, loop, loopDelay = 1400 } = t;
  const done = useLatest(props.onComplete);

  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root || run === 0 || reduced) return;
    const [top, bottom] = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-panel]"));
    const rule = root.querySelector<HTMLElement>("[data-tc-rule]")!;
    const kick = root.querySelector<HTMLElement>("[data-tc-kicker]");
    const ease = safeEasing(easing);
    let anims: Animation[] = [];
    let timer: ReturnType<typeof setTimeout>;
    let cancelled = false;
    const play = () => {
      anims.forEach((a) => a.cancel());
      const o = { duration, delay, easing: ease, fill: "both" as const };
      anims = [
        top.animate(
          [
            { transform: `translate(${-travel}em, -0.18em)`, opacity: 0 },
            { transform: "translate(0em, -0.18em)", opacity: 1, offset: 0.55 },
            { transform: "translate(0em, -0.18em)", offset: 0.75 },
            { transform: "translate(0, 0)" },
          ],
          o,
        ),
        bottom.animate(
          [
            { transform: `translate(${travel}em, 0.18em)`, opacity: 0 },
            { transform: "translate(0em, 0.18em)", opacity: 1, offset: 0.55 },
            { transform: "translate(0em, 0.18em)", offset: 0.75 },
            { transform: "translate(0, 0)" },
          ],
          { ...o, delay: delay + stagger },
        ),
        rule.animate(
          [
            { transform: "scaleX(0)", opacity: 1 },
            { transform: "scaleX(1)", opacity: 1, offset: 0.6 },
            { transform: "scaleX(1)", opacity: 1, offset: 0.78 },
            { transform: "scaleX(1)", opacity: 0 },
          ],
          { ...o, delay: delay + stagger * 0.5 },
        ),
      ];
      if (kick)
        anims.push(
          kick.animate([{ opacity: 0 }, { opacity: 0, offset: 0.45 }, { opacity: 1, offset: 0.55 }, { opacity: 1, offset: 0.7 }, { opacity: 0, offset: 0.76 }, { opacity: 0 }], {
            duration,
            delay: delay + stagger,
            fill: "both",
          }),
        );
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
  }, [run, reduced, duration, delay, stagger, easing, loop, loopDelay, travel, text, kicker, done]);

  const hidden = hiddenUntil(run, reduced, { opacity: 0 });
  return (
    <Root as={as} text={text} className={className} style={{ overflow: "visible", ...style }} rootRef={ref}>
      <span style={{ visibility: "hidden", display: "block" }}>
        <Split text={text} />
      </span>
      <span data-tc-panel="" style={{ position: "absolute", inset: 0, clipPath: "inset(-20% -50% 50% -50%)", ...hidden }}>
        <Split text={text} />
      </span>
      <span data-tc-panel="" style={{ position: "absolute", inset: 0, clipPath: "inset(50% -50% -20% -50%)", ...hidden }}>
        <Split text={text} />
      </span>
      <span
        data-tc-rule=""
        style={{ position: "absolute", left: "-2%", right: "-2%", top: "50%", height: 1, background: ruleColor, transform: "scaleX(0)", transformOrigin: "0 50%" }}
      />
      {kicker ? (
        <span
          data-tc-kicker=""
          style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", fontSize: "max(10px, 0.09em)", letterSpacing: "0.2em", textTransform: "uppercase", opacity: 0, color: ruleColor, fontWeight: 500 }}
        >
          {kicker}
        </span>
      ) : null}
    </Root>
  );
}
