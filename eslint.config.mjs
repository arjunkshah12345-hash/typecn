import next from "eslint-config-next";

const config = [
  { ignores: [".next/**", "node_modules/**", "packages/typecn/dist/**", "playwright-report/**", "test-results/**", "next-env.d.ts", "out/**",
    // Vendored third-party registry code (dithercn, gradients.sh, ditherkit) is kept as shipped.
    "src/lib/dither/**", "src/lib/gradient-engine/**", "src/lib/ditherkit/**", "src/components/dithercn/**", "src/components/gradients/**"] },
  ...next,
  {
    // The library is deliberately imperative: effects drive DOM nodes, canvases and
    // simulation state through refs every frame, and triggers translate external
    // events (IntersectionObserver, pointer, timers) into state. The React Compiler
    // purity rules flag those patterns as false positives.
    files: ["packages/typecn/src/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
];

export default config;
