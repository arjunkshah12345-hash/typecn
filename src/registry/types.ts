export type CategoryId = "reveal" | "kinetic" | "distortion" | "interactive" | "cinematic";

export interface Category {
  id: CategoryId;
  letter: string;
  name: string;
  blurb: string;
}

export const categories: Category[] = [
  { id: "reveal", letter: "A", name: "Reveals & entrances", blurb: "How words arrive. Sequenced, masked, typed, decoded." },
  { id: "kinetic", letter: "B", name: "Kinetic & continuous", blurb: "Type that never quite sits still." },
  { id: "distortion", letter: "C", name: "Distortion & experiment", blurb: "Letterforms bent, sliced, sampled and rasterised." },
  { id: "interactive", letter: "D", name: "Scroll & interactive", blurb: "Driven by your scroll wheel and pointer." },
  { id: "cinematic", letter: "E", name: "Cinematic & editorial", blurb: "Sequences with a sense of occasion." },
];

export type FontKey = "serif" | "grotesk" | "wide" | "mono";

export const fonts: Record<FontKey, { label: string; css: string; family: string; note: string }> = {
  serif: { label: "Fraunces", css: "var(--font-serif)", family: "Fraunces", note: "Variable serif · wght, opsz, SOFT, WONK" },
  grotesk: { label: "Geist", css: "var(--font-grotesk)", family: "Geist", note: "Variable grotesque · wght 100–900" },
  wide: { label: "Roboto Flex", css: "var(--font-wide)", family: "Roboto Flex", note: "Variable sans · wght 100–1000, wdth 25–151, opsz" },
  mono: { label: "Geist Mono", css: "var(--font-code)", family: "Geist Mono", note: "Variable monospace · wght 100–900" },
};

interface ControlBase {
  key: string;
  label: string;
  /** Short help text. */
  hint?: string;
  group?: "timing" | "effect";
}

export type Control =
  | (ControlBase & { type: "range"; min: number; max: number; step: number; unit?: string; default: number; libDefault?: number })
  | (ControlBase & { type: "select"; options: readonly string[]; default: string; libDefault?: string })
  | (ControlBase & { type: "toggle"; default: boolean; libDefault?: boolean })
  | (ControlBase & { type: "color"; default: string; libDefault?: string })
  | (ControlBase & { type: "text"; default: string; libDefault?: string });

export type ControlValue = number | string | boolean;

export type Kind = "timed" | "continuous" | "scroll" | "pointer";

export interface EffectMeta {
  slug: string;
  number: number;
  name: string;
  /** Named export from the `typecn` package. */
  component: string;
  /** File name (without extension) under packages/typecn/src/effects. */
  file: string;
  category: CategoryId;
  tagline: string;
  description: string;
  kind: Kind;
  /** Short instruction shown on cards and stages, e.g. "Move your pointer". */
  hint?: string;
  text: string;
  font: FontKey;
  weight: number;
  /** Playground font size in px. */
  size: number;
  tracking?: number;
  leading?: number;
  /** Typography controls that do not apply. */
  hide?: Array<"fontWeight" | "letterSpacing" | "lineHeight" | "color">;
  controls: Control[];
  /** Fixed props always passed (not user-editable), e.g. `as`. */
  fixed?: Record<string, ControlValue>;
  notes: { trigger: string; a11y: string; perf: string };
  card: { span?: 1 | 2; tone?: "ink" | "paper" | "accent" | "bone"; size?: number; text?: string };
  keywords?: string[];
}
