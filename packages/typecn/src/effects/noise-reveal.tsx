"use client";
import { useEffect, useRef } from "react";
import { Root, Words, after, makeNoise, useActive, useTextRaster, useTimed, type TimedEffectProps, useLatest } from "../core";

export interface NoiseRevealProps extends Omit<TimedEffectProps, "stagger" | "easing"> {
  /** Grain size in CSS px. */
  grain?: number;
  /** Noise scale — higher values make smaller, busier blotches. */
  scale?: number;
  /** Width of the speckled transition band (0–0.5). */
  edge?: number;
}

/**
 * Type materialises out of animated static. A moving noise field is thresholded
 * against the progress value; the band around the threshold dithers into grain.
 */
export function NoiseReveal(props: NoiseRevealProps) {
  const { text, className, style, as, grain = 3, scale = 0.035, edge = 0.14 } = props;
  const ref = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const t = useTimed(ref, props, { duration: 2200, stagger: 0, easing: "linear" });
  const active = useActive(ref);
  const { raster, version } = useTextRaster(ref, canvas, [text]);
  const done = useLatest(props.onComplete);

  useEffect(() => {
    const R = raster.current;
    if (!R || t.reduced) return;
    const { ctx, source, width, height } = R;
    ctx.clearRect(0, 0, width, height);
    if (t.run === 0) return;
    if (!active) {
      ctx.drawImage(source, 0, 0, width, height);
      return;
    }
    const g = Math.max(1, grain);
    const mw = Math.ceil(width / g);
    const mh = Math.ceil(height / g);
    const mask = document.createElement("canvas");
    mask.width = mw;
    mask.height = mh;
    const mctx = mask.getContext("2d")!;
    const img = mctx.createImageData(mw, mh);
    const N = makeNoise(9);
    let raf = 0;
    let cancel = () => {};
    const play = () => {
      const t0 = performance.now() + t.delay;
      const frame = (now: number) => {
        const p = Math.min(Math.max((now - t0) / t.duration, 0), 1);
        const tt = now / 1000;
        const lo = p * (1 + edge * 2) - edge * 2;
        for (let y = 0; y < mh; y++)
          for (let x = 0; x < mw; x++) {
            const n = N(x * g * scale, y * g * scale, tt * 0.6) * 0.7 + Math.random() * 0.3;
            let a = 0;
            if (n < lo) a = 255;
            else if (n < lo + edge * 2) a = Math.random() < 1 - (n - lo) / (edge * 2) ? 255 : 0;
            img.data[(y * mw + x) * 4 + 3] = a;
          }
        mctx.putImageData(img, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(source, 0, 0, width, height);
        ctx.globalCompositeOperation = "destination-in";
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(mask, 0, 0, mw * g, mh * g);
        ctx.globalCompositeOperation = "source-over";
        if (p < 1) raf = requestAnimationFrame(frame);
        else {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(source, 0, 0, width, height);
          done.current?.();
          if (t.loop) cancel = after(t.loopDelay ?? 1400, play);
        }
      };
      raf = requestAnimationFrame(frame);
    };
    play();
    return () => {
      cancelAnimationFrame(raf);
      cancel();
    };
  }, [version, t.run, t.reduced, t.duration, t.delay, t.loop, t.loopDelay, grain, scale, edge, active, raster, done]);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <span style={{ visibility: t.reduced ? "visible" : "hidden" }}>
        <Words text={text} />
      </span>
      <canvas ref={canvas} style={{ position: "absolute", pointerEvents: "none", display: t.reduced ? "none" : undefined }} />
    </Root>
  );
}
