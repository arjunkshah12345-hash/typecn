import { fonts, type Control, type ControlValue, type EffectMeta, type FontKey } from "@/registry/types";
import { site } from "./site";

export interface PlaygroundState {
  text: string;
  font: FontKey;
  size: number;
  weight: number;
  tracking: number;
  leading: number;
  color: string;
  bg: string;
  values: Record<string, ControlValue>;
}

export const DEFAULT_COLOR = "#171512";
export const DEFAULT_BG = "#f2eee6";

export function initialState(meta: EffectMeta): PlaygroundState {
  return {
    text: meta.text,
    font: meta.font,
    size: meta.size,
    weight: meta.weight,
    tracking: meta.tracking ?? 0,
    leading: meta.leading ?? 1.05,
    color: DEFAULT_COLOR,
    bg: DEFAULT_BG,
    values: Object.fromEntries(meta.controls.map((c) => [c.key, c.default])),
  };
}

const fontStack: Record<FontKey, string> = {
  serif: `"Fraunces", serif`,
  grotesk: `"Geist", sans-serif`,
  wide: `"Roboto Flex", sans-serif`,
  mono: `"Geist Mono", monospace`,
};

const googleCss: Record<FontKey, string> = {
  serif: "Fraunces:opsz,wght,SOFT,WONK@9..144,100..900,0..100,0..1",
  grotesk: "Geist:wght@100..900",
  wide: "Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000",
  mono: "Geist+Mono:wght@100..900",
};

function isDefaultForLib(c: Control, v: ControlValue) {
  if (c.type === "color") return false; // colours are always explicit in generated code
  const lib = c.libDefault ?? c.default;
  return v === lib;
}

function jsxValue(v: ControlValue) {
  if (typeof v === "string") return /["\\\n]/.test(v) ? `{${JSON.stringify(v)}}` : `"${v}"`;
  if (typeof v === "boolean") return v ? "" : "={false}";
  return `{${v}}`;
}

function tsValue(v: ControlValue | Record<string, unknown>) {
  return typeof v === "string" ? JSON.stringify(v) : String(v);
}

/** Typography as a React style object (only what applies to the effect). */
function styleEntries(meta: EffectMeta, s: PlaygroundState): [string, string | number][] {
  const hide = new Set(meta.hide ?? []);
  const out: [string, string | number][] = [
    ["fontFamily", fontStack[s.font]],
    ["fontSize", s.size],
  ];
  if (!hide.has("fontWeight")) out.push(["fontWeight", s.weight]);
  if (!hide.has("letterSpacing") && s.tracking !== 0) out.push(["letterSpacing", `${s.tracking}em`]);
  out.push(["lineHeight", s.leading]);
  if (!hide.has("color")) out.push(["color", s.color]);
  return out;
}

export function reactCode(meta: EffectMeta, s: PlaygroundState) {
  const lines: string[] = [];
  const textVal = s.text.includes("\n") || s.text.includes('"') ? `{${JSON.stringify(s.text)}}` : `"${s.text}"`;
  lines.push(`text=${textVal}`);
  for (const [k, v] of Object.entries(meta.fixed ?? {})) lines.push(`${k}=${jsxValue(v)}`);
  for (const c of meta.controls) {
    const v = s.values[c.key];
    if (v === undefined || isDefaultForLib(c, v)) continue;
    const val = jsxValue(v);
    lines.push(typeof v === "boolean" && v ? c.key : `${c.key}${val.startsWith("=") ? val : `=${val}`}`);
  }
  const style = styleEntries(meta, s)
    .map(([k, v]) => `        ${k}: ${tsValue(v)},`)
    .join("\n");
  return `import { ${meta.component} } from "typecn";

export function Headline() {
  return (
    <${meta.component}
${lines.map((l) => `      ${l}`).join("\n")}
      style={{
${style}
      }}
    />
  );
}
`;
}

/** Extracts the stylesheet an effect injects at runtime, if any. */
export function extractEffectCss(source: string | undefined) {
  if (!source) return null;
  const m = source.match(/const css = `([\s\S]*?)`;/);
  return m ? m[1] : null;
}

function prettyCss(css: string) {
  let out = "";
  let depth = 0;
  const pad = () => "  ".repeat(depth);
  for (const ch of css.replace(/\s+/g, " ")) {
    if (ch === "{") {
      depth++;
      out = out.trimEnd() + " {\n" + pad();
    } else if (ch === "}") {
      depth = Math.max(0, depth - 1);
      out = out.trimEnd() + "\n" + pad() + "}\n" + pad();
    } else if (ch === ";") {
      out += ";\n" + pad();
    } else if (ch === " " && /\n\s*$/.test(out)) {
      continue;
    } else out += ch;
  }
  return out.replace(/\n\s*\n/g, "\n").trim();
}

export function cssCode(meta: EffectMeta, s: PlaygroundState, source?: string) {
  const hide = new Set(meta.hide ?? []);
  const decl = [
    `font-family: ${fontStack[s.font]};`,
    `font-size: ${s.size}px;`,
    hide.has("fontWeight") ? null : `font-weight: ${s.weight};`,
    hide.has("letterSpacing") ? null : `letter-spacing: ${s.tracking}em;`,
    `line-height: ${s.leading};`,
    hide.has("color") ? null : `color: ${s.color};`,
  ]
    .filter(Boolean)
    .map((d) => `  ${d}`)
    .join("\n");
  const effectCss = extractEffectCss(source);
  return `/* 1. Load the variable font (or self-host it) */
@import url("https://fonts.googleapis.com/css2?family=${googleCss[s.font]}&display=swap");

/* 2. Typography — pass className="headline" instead of the style prop */
.headline {
${decl}
}

/* 3. Background used in the preview */
.stage {
  background: ${s.bg};
}
${
  effectCss
    ? `
/* 4. Keyframes ${meta.component} injects at runtime (id="typecn-…").
      Include them yourself if your CSP blocks runtime <style> tags. */
${prettyCss(effectCss)}
`
    : `
/* ${meta.component} animates with the Web Animations API${meta.kind === "timed" ? "" : " / requestAnimationFrame"} and inline
   transforms, so it needs no stylesheet of its own. Reduced motion is
   detected with matchMedia("(prefers-reduced-motion: reduce)"). */
`
}`;
}

export function installCode(meta: EffectMeta) {
  return {
    registry: `npx shadcn@latest add ${site.url}/r/${meta.slug}.json`,
    pkg: `# typecn is not yet published to npm — build and install it locally:
git clone ${site.repo}.git
cd typecn/packages/typecn
npm install && npm run build && npm pack

# then, in your app:
npm install /path/to/typecn/packages/typecn/typecn-${site.version}.tgz`,
    copy: `components/typecn/core.tsx            ← shared primitives (one file)
components/typecn/effects/${meta.file}.tsx`,
  };
}

/* ------------------------------ URL state ------------------------------ */

export function encodeState(meta: EffectMeta, s: PlaygroundState) {
  const d = initialState(meta);
  const p = new URLSearchParams();
  if (s.text !== d.text) p.set("text", s.text);
  if (s.font !== d.font) p.set("font", s.font);
  if (s.size !== d.size) p.set("size", String(s.size));
  if (s.weight !== d.weight) p.set("weight", String(s.weight));
  if (s.tracking !== d.tracking) p.set("tracking", String(s.tracking));
  if (s.leading !== d.leading) p.set("leading", String(s.leading));
  if (s.color !== d.color) p.set("color", s.color);
  if (s.bg !== d.bg) p.set("bg", s.bg);
  for (const c of meta.controls) {
    const v = s.values[c.key];
    if (v !== c.default) p.set(`p.${c.key}`, String(v));
  }
  return p;
}

export function decodeState(meta: EffectMeta, p: URLSearchParams): PlaygroundState {
  const s = initialState(meta);
  const num = (k: string, f: number) => {
    const v = p.get(k);
    const n = v === null ? NaN : Number(v);
    return Number.isFinite(n) ? n : f;
  };
  const text = p.get("text");
  if (text !== null) s.text = text.slice(0, 400);
  const font = p.get("font");
  if (font && font in fonts) s.font = font as FontKey;
  s.size = Math.min(400, Math.max(8, num("size", s.size)));
  s.weight = Math.min(900, Math.max(100, num("weight", s.weight)));
  s.tracking = num("tracking", s.tracking);
  s.leading = num("leading", s.leading);
  const hex = /^#[0-9a-fA-F]{3,8}$/;
  if (hex.test(p.get("color") ?? "")) s.color = p.get("color")!;
  if (hex.test(p.get("bg") ?? "")) s.bg = p.get("bg")!;
  for (const c of meta.controls) {
    const raw = p.get(`p.${c.key}`);
    if (raw === null) continue;
    if (c.type === "range") {
      const n = Number(raw);
      if (Number.isFinite(n)) s.values[c.key] = Math.min(c.max, Math.max(c.min, n));
    } else if (c.type === "toggle") s.values[c.key] = raw === "true";
    else if (c.type === "select") {
      if (c.options.includes(raw)) s.values[c.key] = raw;
    } else if (c.type === "color") {
      if (hex.test(raw)) s.values[c.key] = raw;
    } else s.values[c.key] = raw.slice(0, 200);
  }
  return s;
}
