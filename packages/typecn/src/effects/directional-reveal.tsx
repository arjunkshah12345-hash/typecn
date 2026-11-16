"use client";
import { useEffect, useRef } from "react";
import { Root, Split, resolveEasing, safeEasing, useReducedMotion, type EasingName, type TextEffectProps } from "../core";

export interface DirectionalRevealProps extends TextEffectProps {
  /** Colour of the revealed layer. */
  revealColor?: string;
  /** Duration per character in ms. */
  duration?: number;
  /** Max delay spread across the text in ms. */
  spread?: number;
  easing?: EasingName | (string & {});
  /** Cycle through directions automatically when not hovered (ms, 0 = off). */
  autoplay?: number;
}

type Side = "top" | "right" | "bottom" | "left";
const vec: Record<Side, [number, number]> = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] };

/**
 * A second layer of type floods in from whichever edge the pointer entered, and
 * drains out through whichever edge it leaves — each character staggered by its
 * distance from that edge.
 */
export function DirectionalReveal(props: DirectionalRevealProps) {
  const { text, className, style, as, revealColor = "#ff5a1f", duration = 520, spread = 360, easing = "expo.out", autoplay = 2600 } = props;
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const root = ref.current;
    if (!root || reduced) return;
    const overlays = Array.from(root.querySelectorAll<HTMLElement>("[data-tc-over]"));
    const ease = safeEasing(resolveEasing(easing));
    let anims: Animation[] = [];
    let shown = false;
    const side = (e: PointerEvent): Side => {
      const r = root.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      return Math.abs(x) * r.width > Math.abs(y) * r.height ? (x > 0 ? "right" : "left") : y > 0 ? "bottom" : "top";
    };
    const run = (s: Side, enter: boolean) => {
      shown = enter;
      const r = root.getBoundingClientRect();
      const [vx, vy] = vec[s];
      anims.forEach((a) => a.commitStyles?.());
      anims.forEach((a) => a.cancel());
      anims = overlays.map((el) => {
        const b = el.parentElement!.getBoundingClientRect();
        const cx = (b.left + b.width / 2 - r.left) / r.width;
        const cy = (b.top + b.height / 2 - r.top) / r.height;
        const fromEdge = vx > 0 ? 1 - cx : vx < 0 ? cx : vy > 0 ? 1 - cy : cy;
        const off = `translate(${vx * 105}%, ${vy * 105}%)`;
        return el.animate(enter ? [{ transform: off }, { transform: "translate(0,0)" }] : [{ transform: "translate(0,0)" }, { transform: off }], {
          duration,
          delay: fromEdge * spread,
          easing: ease,
          fill: "both",
        });
      });
    };
    const onEnter = (e: PointerEvent) => run(side(e), true);
    const onLeave = (e: PointerEvent) => run(side(e), false);
    const onFocus = () => run("left", true);
    const onBlur = () => run("right", false);
    root.addEventListener("pointerenter", onEnter);
    root.addEventListener("pointerleave", onLeave);
    root.addEventListener("focusin", onFocus);
    root.addEventListener("focusout", onBlur);
    const sides: Side[] = ["left", "top", "right", "bottom"];
    let k = 0;
    const auto = autoplay > 0 ? setInterval(() => {
      if (root.matches(":hover")) return;
      run(sides[k % 4], !shown);
      if (!shown) k++;
    }, autoplay) : undefined;
    return () => {
      clearInterval(auto);
      anims.forEach((a) => a.cancel());
      root.removeEventListener("pointerenter", onEnter);
      root.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("focusin", onFocus);
      root.removeEventListener("focusout", onBlur);
    };
  }, [text, duration, spread, easing, autoplay, reduced]);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <Split
        text={text}
        char={(c) => (
          <span style={{ position: "relative", display: "inline-block", overflow: "hidden", verticalAlign: "top", whiteSpace: "pre" }}>
            <span>{c.char}</span>
            <span data-tc-over="" style={{ position: "absolute", inset: 0, color: revealColor, transform: "translate(-105%, 0)", fontStyle: "italic" }}>
              {c.char}
            </span>
          </span>
        )}
      />
    </Root>
  );
}
