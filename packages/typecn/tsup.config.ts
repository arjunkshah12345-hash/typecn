import { defineConfig } from "tsup";

export default defineConfig({
  // One entry per effect keeps output modular: importing one effect pulls in that file + core only.
  entry: ["src/index.ts", "src/core.tsx", "src/effects/*.tsx"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: false,
  splitting: true,
  target: "es2020",
  external: ["react", "react-dom", "react/jsx-runtime"],
});
