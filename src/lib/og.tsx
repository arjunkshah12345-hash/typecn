import fs from "node:fs";
import path from "node:path";

const dir = (pkg: string) => path.join(process.cwd(), "node_modules/@fontsource", pkg, "files");

export function ogFonts() {
  return [
    { name: "Fraunces", data: fs.readFileSync(path.join(dir("fraunces"), "fraunces-latin-300-normal.woff")), weight: 300 as const, style: "normal" as const },
    { name: "Fraunces", data: fs.readFileSync(path.join(dir("fraunces"), "fraunces-latin-600-normal.woff")), weight: 600 as const, style: "normal" as const },
    { name: "Bricolage", data: fs.readFileSync(path.join(dir("bricolage-grotesque"), "bricolage-grotesque-latin-400-normal.woff")), weight: 400 as const, style: "normal" as const },
  ];
}

export const ogSize = { width: 1200, height: 630 };

export function OgFrame({ kicker, title, sub, number }: { kicker: string; title: string; sub: string; number?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0f0e0c", color: "#efe9df", padding: "56px 64px", fontFamily: "Bricolage" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, color: "#9b9386", borderBottom: "1px solid rgba(239,233,223,0.15)", paddingBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "Fraunces", fontSize: 34, color: "#efe9df", fontWeight: 300 }}>
          typecn
          <div style={{ width: 9, height: 9, borderRadius: 9, background: "#ff5a1f", marginTop: 12 }} />
        </div>
        <div style={{ display: "flex" }}>{kicker}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {number ? <div style={{ fontSize: 26, color: "#ff5a1f", marginBottom: 8, display: "flex" }}>{`Nº ${number}`}</div> : null}
        <div style={{ fontFamily: "Fraunces", fontWeight: 300, fontSize: title.length > 18 ? 116 : 150, lineHeight: 0.9, letterSpacing: -5 }}>{title}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 26, color: "#9b9386" }}>
        <div style={{ maxWidth: 760, display: "flex" }}>{sub}</div>
        <div style={{ display: "flex", background: "#ff5a1f", color: "#120a06", padding: "10px 18px", fontSize: 22 }}>50 effects · MIT</div>
      </div>
    </div>
  );
}
