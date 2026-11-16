# Contributing to typecn

Thanks for helping words move. The bar for a new effect is a **genuinely new motion idea** — not a parameter variation of an existing one.

## Setup

```bash
npm install
npm run dev
```

## Adding an effect

1. **Implement** `packages/typecn/src/effects/<name>.tsx`.
   - Render through `Root` (gives one accessible text node) and `Split` (word-safe wrapping, explicit `\n` line breaks).
   - Triggered timelines: `useTimed` + `useStagger` (WAAPI), render the initial state with `hiddenUntil` so nothing flashes.
   - Continuous/pointer: `useActive` (pauses off-screen / hidden tab) + `useFrame` + `usePointer`; write styles directly to DOM nodes from `useUnitLayout`/`useUnits` — never set React state per frame.
   - Respect `useReducedMotion()` — render the final readable state.
   - Clean up every animation, observer, timer and listener.
2. **Export** it from `packages/typecn/src/index.ts`.
3. **Register** it in `src/registry/effects.ts`: copy, default text/font, card tone/size and a control schema. Control `key`s must equal prop names; set `libDefault` when the playground starts from a different value than the component default.
4. **Verify**

```bash
npm run lint && npm run typecheck && npm run build && npm run test:e2e
```

## Style

- TypeScript strict, no `any` in the library.
- No runtime dependencies in `packages/typecn` besides React.
- Keep effects to one file; shared logic belongs in `core.tsx` only if two or more effects need it.
