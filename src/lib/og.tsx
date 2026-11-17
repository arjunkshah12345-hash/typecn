import fs from "node:fs";
import path from "node:path";

const file = (pkg: string, f: string) => fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource", pkg, "files", f));

export function ogFonts() {
  return [
    { name: "Geist", data: file("geist-sans", "geist-sans-latin-400-normal.woff"), weight: 400 as const, style: "normal" as const },
    { name: "Geist", data: file("geist-sans", "geist-sans-latin-600-normal.woff"), weight: 600 as const, style: "normal" as const },
    { name: "GeistMono", data: file("geist-mono", "geist-mono-latin-400-normal.woff"), weight: 400 as const, style: "normal" as const },
  ];
}

export const ogSize = { width: 1200, height: 630 };

const ACCENT = "#ff5b24";
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** A dithered glow rising from the bottom edge, as absolutely-positioned cells (satori has no canvas). */
function DitherGlow() {
  const cell = 10;
  const cols = 1200 / cell;
  const rows = 24;
  const dots: React.ReactNode[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const nx = (x / cols - 0.5) * 2;
      const d = y / (rows - 1);
      const tone = Math.max(0, Math.min(1, d * 1.35 - nx * nx * 0.75 - 0.2));
      if (tone * 16 > BAYER[(y % 4) * 4 + (x % 4)] + 0.5) {
        dots.push(<div key={`${x}-${y}`} style={{ position: "absolute", left: x * cell + 2, top: 630 - (rows - y) * cell + 2, width: cell - 4, height: cell - 4, background: ACCENT, opacity: 0.35 + tone * 0.65 }} />);
      }
    }
  }
  return <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex" }}>{dots}</div>;
}

function Mark() {
  const on = "1010010110100101";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", width: 30, height: 30, gap: 2 }}>
      {on.split("").map((b, i) => (
        <div key={i} style={{ width: 6, height: 6, background: b === "1" ? ACCENT : "rgba(255,255,255,0.15)" }} />
      ))}
    </div>
  );
}

export function OgFrame({ kicker, title, sub, number }: { kicker: string; title: string; sub: string; number?: string }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", background: "#050506", color: "#f4f4f5", fontFamily: "Geist" }}>
      <DitherGlow />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1200, height: 630, display: "flex", flexDirection: "column", padding: "56px 64px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 32, fontWeight: 600, letterSpacing: -1.2 }}>
          <Mark />
          typecn
        </div>
        <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 20, color: "#9f9fa9", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 999, padding: "8px 18px" }}>{kicker}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 70 }}>
        {number ? <div style={{ display: "flex", fontFamily: "GeistMono", fontSize: 24, color: ACCENT, marginBottom: 14 }}>{`Nº ${number}`}</div> : null}
        <div style={{ display: "flex", fontWeight: 600, fontSize: title.length > 18 ? 104 : 132, lineHeight: 0.95, letterSpacing: title.length > 18 ? -5 : -6.5 }}>{title}</div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 28, color: "#9f9fa9", maxWidth: 820 }}>{sub}</div>
      </div>
      </div>
    </div>
  );
}
