"use client";

import { useSyncExternalStore } from "react";

type Theme = "dark" | "light";

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(
    subscribe,
    () => (document.documentElement.dataset.theme as Theme) ?? "dark",
    () => "dark",
  );
  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => {
        document.documentElement.dataset.theme = next;
        try {
          localStorage.setItem("typecn-theme", next);
        } catch {}
      }}
      className="group relative grid size-9 place-items-center rounded-full text-muted transition-colors hover:text-fg"
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme (T)`}
    >
      <span className="relative block size-4 overflow-hidden rounded-full border border-current">
        <span
          className="absolute inset-y-0 left-1/2 w-1/2 bg-current transition-transform duration-700 ease-[var(--ease-out-expo)]"
          style={{ transform: theme === "dark" ? "translateX(0)" : "translateX(-100%)" }}
        />
      </span>
    </button>
  );
}

export const themeScript = `(function(){try{var t=localStorage.getItem("typecn-theme");if(t!=="light"&&t!=="dark"){t="dark"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="dark"}})();`;
