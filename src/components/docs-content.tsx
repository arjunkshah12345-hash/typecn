import Link from "next/link";
import { StaticCode } from "./static-code";
import { effects } from "@/registry/effects";
import { site } from "@/lib/site";

const P = ({ children }: { children: React.ReactNode }) => <p className="max-w-[64ch] text-[17px] leading-[1.7] text-muted [&_code]:font-mono [&_code]:text-[14px] [&_code]:text-fg">{children}</p>;
const H = ({ children }: { children: React.ReactNode }) => <h2 className="mt-14 mb-4 border-b border-line pb-3 font-serif text-[30px] leading-none tracking-[-0.02em]">{children}</h2>;
const L = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="max-w-[64ch] space-y-2 text-[16px] leading-relaxed text-muted [&_code]:font-mono [&_code]:text-[14px] [&_code]:text-fg">
    {items.map((x, i) => (
      <li key={i} className="grid grid-cols-[20px_1fr]">
        <span className="text-accent">—</span>
        <span>{x}</span>
      </li>
    ))}
  </ul>
);

export const docContent: Record<string, React.ReactNode> = {
  "": (
    <>
      <P>
        typecn is a collection of 50 kinetic typography components for React. Each effect is a single file built on a tiny shared core — text splitting with an
        accessible fallback, triggers, reduced-motion handling and lifecycle cleanup — so you can install the package or copy exactly the effect you need.
      </P>
      <H>Your first headline</H>
      <StaticCode
        code={`import { CharacterCascade } from "typecn";

export default function Page() {
  return (
    <CharacterCascade
      as="h1"
      text="Set in motion."
      trigger="inView"
      style={{ fontSize: 96, letterSpacing: "-0.03em" }}
    />
  );
}`}
      />
      <H>Three kinds of effect</H>
      <L
        items={[
          <>
            <b className="font-normal text-fg">Timed</b> — play once (or loop) when triggered: reveals, entrances, cinematic sequences. Props: <code>duration</code>, <code>delay</code>,{" "}
            <code>stagger</code>, <code>easing</code>, <code>loop</code>, <code>trigger</code>.
          </>,
          <>
            <b className="font-normal text-fg">Continuous</b> — run while visible: waves, marquees, glitches. Props: <code>speed</code>, <code>paused</code>.
          </>,
          <>
            <b className="font-normal text-fg">Driven</b> — respond to the pointer or scroll. Scroll effects also accept a <code>progress</code> prop so you can drive them yourself.
          </>,
        ]}
      />
      <H>Where next</H>
      <P>
        Browse the <Link href="/effects" className="ulink text-fg">collection</Link>, tune one in the <Link href="/playground" className="ulink text-fg">playground</Link> and copy the generated code, or read{" "}
        <Link href="/docs/installation" className="ulink text-fg">installation</Link>.
      </P>
    </>
  ),
  installation: (
    <>
      <H>A · shadcn registry (recommended)</H>
      <P>Every effect is published as a shadcn-compatible registry item. The CLI writes two files into your project — you own and can edit them.</P>
      <StaticCode lang="bash" code={`npx shadcn@latest add ${site.url}/r/scramble-decode.json`} />
      <P>
        Files land in <code>components/typecn/core.tsx</code> and <code>components/typecn/effects/scramble-text.tsx</code>. Import from there:
      </P>
      <StaticCode code={`import { ScrambleText } from "@/components/typecn/effects/scramble-text";`} />
      <H>B · Package (local build)</H>
      <P>
        The <code>typecn</code> package is ready for publishing (ESM + CJS, type declarations, <code>sideEffects: false</code>) but is <b className="font-normal text-fg">not on npm yet</b>. Build and install it from the repository:
      </P>
      <StaticCode
        lang="bash"
        code={`git clone ${site.repo}.git
cd typecn && npm install
npm run build:lib
cd packages/typecn && npm pack

# in your app
npm install /absolute/path/to/typecn/packages/typecn/typecn-${site.version}.tgz`}
      />
      <StaticCode code={`import { ScrambleText, WaveText, easings } from "typecn";`} />
      <H>C · Copy two files</H>
      <P>
        Each effect page shows its full source under React → Source, plus the shared <code>core.tsx</code>. Paste both, keeping the relative import <code>../core</code>. The only dependency is React 18+.
      </P>
      <H>Fonts</H>
      <P>
        Effects inherit whatever font you give them. Variable-axis effects (Breathing Type, Stretch Type, Proximity Weight, Variable Morph) need a variable font with the relevant axes. The site uses Fraunces, Bricolage Grotesque, Anybody and JetBrains Mono — all SIL Open Font License — and the CSS tab in the playground includes the matching Google Fonts import.
      </P>
    </>
  ),
  customization: (
    <>
      <H>Styling</H>
      <P>
        Every component accepts <code>className</code>, <code>style</code> and <code>as</code>. Typography belongs on the root — the effect splits whatever text it is given and inherits font, size, colour and spacing.
      </P>
      <StaticCode code={`<LineLift as="h2" className="font-serif text-7xl tracking-tight" text={"Every line\\nhas its own\\nentrance."} />`} />
      <H>Triggers</H>
      <L
        items={[
          <><code>{`trigger="mount"`}</code> (default) — plays after hydration.</>,
          <><code>{`trigger="inView"`}</code> — plays when 15% of the element is visible. Add <code>{`once={false}`}</code> to replay on every entry.</>,
          <><code>{`trigger="hover"`}</code> — plays on pointer enter and keyboard focus.</>,
          <><code>{`trigger="manual"`}</code> with <code>play</code> — plays whenever <code>play</code> becomes true.</>,
          <><code>replayKey</code> — change it to replay imperatively.</>,
        ]}
      />
      <H>Timing and easing</H>
      <P>
        <code>easing</code> takes a preset (<code>expo.out</code>, <code>quart.inOut</code>, <code>back.out</code>, <code>spring</code>, …) or any CSS easing. Springs are real damped-oscillator curves compiled to CSS <code>linear()</code>; build your own with <code>springEasing(stiffness, damping)</code>.
      </P>
      <StaticCode code={`import { WordStagger, springEasing } from "typecn";

<WordStagger text="Spring loaded" easing={springEasing(220, 12)} stagger={70} loop loopDelay={1200} />`} />
      <H>Callbacks</H>
      <P>
        <code>onComplete</code> fires after the last unit finishes — chain effects, reveal the next section, or start a sound. It is read through a ref, so inline functions never restart the animation.
      </P>
    </>
  ),
  "animation-principles": (
    <>
      <P>A few rules shape every effect in the collection. They are worth stealing.</P>
      <H>Ease out, almost always</H>
      <P>Entrances use long exponential ease-outs (<code>cubic-bezier(0.16, 1, 0.3, 1)</code>). Motion that starts fast and settles slowly reads as confident; the eye lands on the final state, which is the readable one.</P>
      <H>Stagger is rhythm, not decoration</H>
      <P>Character stagger sits around 25–50 ms, words 80–120 ms, lines 120–160 ms. Below ~20 ms a stagger reads as a smear; above ~60 ms per character, a headline starts to feel slow.</P>
      <H>Opacity arrives early</H>
      <P>In most reveals opacity reaches 1 at a third of the duration while transform continues. Type is legible sooner, and the remaining motion reads as weight settling rather than a fade.</P>
      <H>Physics where touch is involved</H>
      <P>Anything the pointer moves — Magnetic Letters, Cursor Repel, Elastic Distortion, Kinetic Underline — is a simulation (springs, particles, a wave equation), never a canned tween. It answers the hand at every moment.</P>
      <H>Low frame rates can be a style</H>
      <P>Jitter re-rolls positions at 10 fps on purpose; tweening it would make it look digital. Glitch Shift steps at 24 fps during bursts for the same reason.</P>
    </>
  ),
  performance: (
    <>
      <L
        items={[
          <>Transform and opacity first. Most effects animate only those, via the Web Animations API, which runs on the compositor.</>,
          <>No React renders per frame. rAF-based effects write styles straight to DOM nodes measured once (and re-measured on resize or font load).</>,
          <>Off-screen and background-tab work stops. Every loop is gated on an IntersectionObserver and <code>document.visibilityState</code>; CSS animations get <code>animation-play-state: paused</code>.</>,
          <>Everything cleans up: animations are cancelled, observers disconnected, rAF and timers cleared on unmount or prop change.</>,
          <>Canvas effects cache their rasterised text and settle to a single static draw when finished. Text Mask Video renders WebGL at half resolution.</>,
        ]}
      />
      <H>Costs to know about</H>
      <P>
        Variable-font axis animation (Breathing Type, Stretch Type, Proximity Weight, Variable Morph) and letter-spacing changes trigger text layout each frame. That is fine for a headline, not for a paragraph. SVG filters (Liquid Type) and large CSS blurs are the most expensive techniques here — use them for short display text.
      </P>
      <H>Bundle size</H>
      <P>The package is tree-shakeable (<code>sideEffects: false</code>, ESM). Import one effect and you ship that file plus the shared core. There are no runtime dependencies besides React.</P>
    </>
  ),
  accessibility: (
    <>
      <H>One readable text node</H>
      <P>
        Every effect renders the original string once in a visually hidden span, and marks the split, duplicated or canvas markup <code>aria-hidden</code>. Screen readers hear “Make something beautiful.”, not “M, a, k, e…”. Random glyphs from Scramble or Hover Shuffle never reach the accessibility tree.
      </P>
      <H>Reduced motion</H>
      <P>
        All effects read <code>prefers-reduced-motion</code> with <code>useReducedMotion()</code>. Reveals render their final state immediately; continuous and pointer effects render static text; scroll effects show a settled frame. Content is never hidden behind an animation.
      </P>
      <H>Semantics</H>
      <P>Pass <code>as=&quot;h1&quot;</code> (or any element) so animated headings are real headings. Hover triggers also fire on keyboard focus, and Directional Reveal reveals on focus from the left.</P>
      <H>Flashing</H>
      <P>Glitch Shift and Chromatic Split can produce rapid visual change. Keep burst frequency low and avoid full-screen sizes for sensitive audiences.</P>
    </>
  ),
  "browser-support": (
    <>
      <P>typecn targets evergreen browsers (Chrome/Edge 111+, Safari 16.4+, Firefox 115+). Techniques degrade instead of breaking:</P>
      <div className="thin-scroll mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-line-strong">
              {["Technique", "Used by", "Fallback"].map((h) => (
                <th key={h} className="label py-3 pr-4 font-normal text-faint">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-muted">
            {[
              ["CSS linear() easing", "Elastic Entrance, springs", "Overshooting cubic-bezier"],
              ["@property", "Ink Spread", "Soft fade without the spreading mask"],
              ["WebGL", "Text Mask Video", "Animated 2D canvas gradient"],
              ["SVG filters on HTML", "Liquid Type", "Unfiltered text"],
              ["Variable fonts", "Breathing, Stretch, Proximity, Variable Morph", "Static weight/width"],
              ["Intl.Segmenter", "All split effects (emoji/grapheme safety)", "Code-point splitting"],
              ["color-mix()", "3D Depth Type", "Layers use text colour"],
            ].map((r) => (
              <tr key={r[0]} className="border-b border-line">
                {r.map((c, i) => (
                  <td key={i} className={`py-3 pr-4 ${i === 0 ? "text-fg" : ""}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <H>Server rendering</H>
      <P>Components render plain markup on the server (no window access during render). Browser APIs are touched only inside effects, so they work with the Next.js App Router, Remix and Vite SSR.</P>
    </>
  ),
  contributing: (
    <>
      <P>New effects are welcome — if they have a genuinely new motion idea. An effect is three things:</P>
      <H>1 · Implementation</H>
      <P>
        Add <code>packages/typecn/src/effects/your-effect.tsx</code>. Render through <code>Root</code> + <code>Split</code> so accessibility comes for free, use <code>useTimed</code> + <code>useStagger</code> for triggered timelines or <code>useFrame</code> + <code>useActive</code> for loops, and respect <code>useReducedMotion()</code>. Export it from <code>src/index.ts</code>.
      </P>
      <StaticCode
        code={`export function MyEffect(props: TimedEffectProps) {
  const ref = useRef<HTMLElement>(null);
  const t = useTimed(ref, props, { duration: 900, stagger: 30, easing: "expo.out" });
  useStagger(ref, () => [{ opacity: 0 }, { opacity: 1 }], { ...t, deps: [props.text] });
  return (
    <Root as={props.as} text={props.text} rootRef={ref} style={props.style}>
      <Split text={props.text} char={(c) => <span data-tc-unit="" style={unitStyle}>{c.char}</span>} />
    </Root>
  );
}`}
      />
      <H>2 · Registry entry</H>
      <P>
        Add metadata to <code>src/registry/effects.ts</code>: name, category, copy, default text and font, and a control schema. Control keys must match prop names — the playground, code generator, URL sharing and API table are all derived from it.
      </P>
      <H>3 · Verify</H>
      <P>
        Run <code>npm run lint</code>, <code>npm run typecheck</code>, <code>npm run build</code> and <code>npm run test:e2e</code>. The end-to-end suite renders every registry effect, so a new entry is tested automatically.
      </P>
      <P>
        There are currently {effects.length} effects. Read the full guide in <a href={`${site.repo}/blob/main/CONTRIBUTING.md`} className="ulink text-fg">CONTRIBUTING.md</a>.
      </P>
    </>
  ),
};
