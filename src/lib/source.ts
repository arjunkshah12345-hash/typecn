import "server-only";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.join(process.cwd(), "packages/typecn/src");

export function readCore() {
  return fs.readFileSync(path.join(ROOT, "core.tsx"), "utf8");
}

export function readEffect(file: string) {
  return fs.readFileSync(path.join(ROOT, "effects", `${file}.tsx`), "utf8");
}
