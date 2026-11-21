"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

export function setTheme(next: Theme) {
  const el = document.documentElement;
  el.dataset.theme = next;
  // The dithercn and gradients.sh engines watch `class` for theme changes.
  el.classList.toggle("dark", next === "dark");
  el.classList.toggle("light", next === "light");
  try {
    localStorage.setItem("typecn-theme", next);
  } catch {}
}

export function useTheme() {
  return useSyncExternalStore<Theme>(
    subscribe,
    () => (document.documentElement.dataset.theme as Theme) ?? "light",
    () => "light",
  );
}

/** Segmented sun/moon switch. */
export function ThemeToggle() {
  const theme = useTheme();
  return (
    <div className="flex items-center rounded-full border border-line-strong p-0.5" role="group" aria-label="Theme">
      {(["light", "dark"] as const).map((t) => {
        const Icon = t === "light" ? Sun : Moon;
        const on = theme === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            aria-pressed={on}
            aria-label={`${t === "light" ? "Light" : "Dark"} theme`}
            title={`${t === "light" ? "Light" : "Dark"} theme (T)`}
            className={`grid size-6 place-items-center rounded-full transition-colors ${on ? "bg-fg text-bg" : "text-faint hover:text-fg"}`}
          >
            <Icon className="size-3.5" strokeWidth={1.75} />
          </button>
        );
      })}
    </div>
  );
}

export const themeScript = `(function(){var d=document.documentElement,t="light";try{t=localStorage.getItem("typecn-theme");if(t!=="light"&&t!=="dark"){t="light"}}catch(e){}d.dataset.theme=t;d.classList.add(t)})();`;
