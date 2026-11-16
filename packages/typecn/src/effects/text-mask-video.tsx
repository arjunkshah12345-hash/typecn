"use client";
import { useEffect, useRef } from "react";
import { Root, Words, useActive, useFrame, useReducedMotion, useTextRaster, type ContinuousEffectProps } from "../core";

export interface TextMaskVideoProps extends ContinuousEffectProps {
  /** Three colours blended by the flowing field. */
  colors?: [string, string, string];
  /** Scale of the flow pattern — higher is busier. */
  scale?: number;
}

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;
const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform float s;uniform vec3 c0;uniform vec3 c1;uniform vec3 c2;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r.y*s;
vec2 q=vec2(fbm(uv+t*.12),fbm(uv+vec2(5.2,1.3)-t*.1));
vec2 w=vec2(fbm(uv+4.*q+vec2(1.7,9.2)+t*.15),fbm(uv+4.*q+vec2(8.3,2.8)-t*.13));
float f=fbm(uv+4.*w);
vec3 col=mix(c0,c1,clamp(f*f*2.2,0.,1.));col=mix(col,c2,clamp(length(q)*.9-.2,0.,1.));
col+=.12*smoothstep(.55,.9,f);
gl_FragColor=vec4(col,1.);}`;

function hex(c: string): [number, number, number] {
  const m = c.replace("#", "");
  const v = m.length === 3 ? m.split("").map((x) => x + x).join("") : m;
  return [parseInt(v.slice(0, 2), 16) / 255, parseInt(v.slice(2, 4), 16) / 255, parseInt(v.slice(4, 6), 16) / 255];
}

/**
 * A live, procedurally generated moving texture — domain-warped noise rendered in
 * a WebGL fragment shader — shows only through the letterforms. Falls back to an
 * animated 2D gradient when WebGL is unavailable.
 */
export function TextMaskVideo(props: TextMaskVideoProps) {
  const { text, className, style, as, colors = ["#1a0f0a", "#ff5a1f", "#f4e9d8"], scale = 2.2, paused, speed = 1 } = props;
  const ref = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, paused);
  const { raster, version } = useTextRaster(ref, canvas, [text]);
  const gl = useRef<{ c: HTMLCanvasElement; g: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> } | null>(null);
  const colorKey = colors.join();

  useEffect(() => {
    const c = document.createElement("canvas");
    const g = c.getContext("webgl", { premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!g) return;
    const sh = (type: number, src: string) => {
      const s = g.createShader(type)!;
      g.shaderSource(s, src);
      g.compileShader(s);
      return s;
    };
    const prog = g.createProgram()!;
    g.attachShader(prog, sh(g.VERTEX_SHADER, VERT));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return;
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "p");
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const u = Object.fromEntries(["r", "t", "s", "c0", "c1", "c2"].map((k) => [k, g.getUniformLocation(prog, k)]));
    gl.current = { c, g, u };
    return () => {
      g.getExtension("WEBGL_lose_context")?.loseContext();
      gl.current = null;
    };
  }, []);

  const draw = (time: number) => {
    const R = raster.current;
    if (!R) return;
    const { ctx, source, width, height } = R;
    const G = gl.current;
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, width, height);
    if (G) {
      const w = Math.max(1, Math.round(width * 0.5));
      const h = Math.max(1, Math.round(height * 0.5));
      if (G.c.width !== w || G.c.height !== h) {
        G.c.width = w;
        G.c.height = h;
      }
      const { g, u } = G;
      g.viewport(0, 0, w, h);
      g.uniform2f(u.r, w, h);
      g.uniform1f(u.t, time);
      g.uniform1f(u.s, scale);
      g.uniform3fv(u.c0, hex(colors[0]));
      g.uniform3fv(u.c1, hex(colors[1]));
      g.uniform3fv(u.c2, hex(colors[2]));
      g.drawArrays(g.TRIANGLES, 0, 3);
      ctx.drawImage(G.c, 0, 0, width, height);
    } else {
      const gr = ctx.createLinearGradient((Math.sin(time * 0.3) * 0.5 + 0.5) * width, 0, width, height);
      gr.addColorStop(0, colors[1]);
      gr.addColorStop(0.5, colors[2]);
      gr.addColorStop(1, colors[0]);
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(source, 0, 0, width, height);
    ctx.globalCompositeOperation = "source-over";
  };

  useFrame(({ time }) => draw(time), active && !reduced && version > 0, speed);
  useEffect(() => {
    if (reduced || !active) draw(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, reduced, active, colorKey, scale]);

  return (
    <Root as={as} text={text} className={className} style={style} rootRef={ref}>
      <span style={{ visibility: "hidden" }}>
        <Words text={text} />
      </span>
      <canvas ref={canvas} style={{ position: "absolute", pointerEvents: "none" }} />
    </Root>
  );
}
