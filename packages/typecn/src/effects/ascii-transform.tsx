"use client";
import { useRef } from "react";
import { Root, Words, makeNoise, useActive, useFrame, usePointer, useReducedMotion, useTextRaster, type ContinuousEffectProps } from "../core";

export interface AsciiTransformProps extends ContinuousEffectProps {
  /** Glyph ramp from light to dense. */
  ramp?: string;
  /** Cell size in CSS px. Smaller = finer detail. */
  cell?: number;
  /** Seconds for a full crisp → ASCII → crisp cycle. */
  period?: number;
  /** Let the pointer drive the conversion line. */
  interactive?: boolean;
}

/**
 * A scan line converts the type into a live ASCII rendering. Each cell samples the
 * letter coverage beneath it and picks a glyph from the density ramp; a slow noise
 * field makes the glyphs shimmer. Move the pointer to drag the conversion line.
 */
export function AsciiTransform(props: AsciiTransformProps) {
  const { text, className, style, as, ramp = " .:-=+*#%@", cell = 7, period = 6, interactive = true, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused || reduced);
  const pointer = usePointer(ref, active && interactive);
  const { raster, version } = useTextRaster(ref, canvas, [text, cell]);
  const grid = useRef<{ v: number; cols: number; rows: number; cov: Float32Array } | null>(null);
  const noise = useRef(makeNoise(5));
  const sweep = useRef(0);

  useFrame(({ time }) => {
    const R = raster.current;
    if (!R) return;
    const { ctx, source, width, height, dpr } = R;
    if (!grid.current || grid.current.v !== version) {
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / (cell * 1.6));
      const data = source.getContext("2d")!.getImageData(0, 0, source.width, source.height).data;
      const cov = new Float32Array(cols * rows);
      const ch = cell * 1.6;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          let sum = 0;
          let n = 0;
          for (let sy = 0; sy < 3; sy++)
            for (let sx = 0; sx < 3; sx++) {
              const px = Math.floor((c * cell + (sx + 0.5) * (cell / 3)) * dpr);
              const py = Math.floor((r * ch + (sy + 0.5) * (ch / 3)) * dpr);
              if (px < source.width && py < source.height) {
                sum += data[(py * source.width + px) * 4 + 3] / 255;
                n++;
              }
            }
          cov[r * cols + c] = n ? sum / n : 0;
        }
      grid.current = { v: version, cols, rows, cov };
    }
    const g = grid.current;
    const p = pointer.current;
    const auto = (Math.sin((time / period) * Math.PI * 2 - Math.PI / 2) + 1) / 2;
    const target = interactive && p.inside ? (p.x + R.pad) / width : auto * 1.2 - 0.1;
    sweep.current += (target - sweep.current) * 0.12;
    const sx = Math.max(0, Math.min(1, sweep.current)) * width;

    ctx.clearRect(0, 0, width, height);
    // crisp text right of the line
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx, 0, width - sx, height);
    ctx.clip();
    ctx.drawImage(source, 0, 0, width, height);
    ctx.restore();
    // ascii left of the line
    ctx.fillStyle = R.color;
    ctx.font = `${Math.round(cell * 1.55)}px ui-monospace, SFMono-Regular, Menlo, monospace`;
    ctx.textBaseline = "top";
    const chH = cell * 1.6;
    const maxC = Math.min(g.cols, Math.ceil(sx / cell));
    const N = noise.current;
    for (let r = 0; r < g.rows; r++)
      for (let c = 0; c < maxC; c++) {
        const v = g.cov[r * g.cols + c];
        if (v < 0.04) continue;
        const shimmer = N(c * 0.25, r * 0.4, time * 0.8) * 0.5 - 0.15;
        const k = Math.max(0, Math.min(ramp.length - 1, Math.round((v + shimmer * v) * (ramp.length - 1))));
        ctx.fillText(ramp[k], c * cell, r * chH);
      }
    // scan line
    if (sx > 1 && sx < width - 1) {
      ctx.globalAlpha = 0.5;
      ctx.fillRect(sx, R.pad * 0.5, 1, height - R.pad);
      ctx.globalAlpha = 1;
    }
  }, active && version > 0, speed);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <span style={{ visibility: reduced ? "visible" : "hidden" }}>
        <Words text={text} />
      </span>
      <canvas ref={canvas} style={{ position: "absolute", pointerEvents: "none", display: reduced ? "none" : undefined }} />
    </Root>
  );
}
