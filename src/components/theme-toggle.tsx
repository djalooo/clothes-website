import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, persistTheme, resolveTheme, type Theme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n-context";

const THEME_CHANGE_EVENT = "openstore:theme-change";

export function ThemeToggle({
  className = "",
  showLabel = false,
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { t } = useI18n();
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const syncTheme = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        (event.detail === "light" || event.detail === "dark")
      ) {
        setTheme(event.detail);
      }
    };
    window.addEventListener(THEME_CHANGE_EVENT, syncTheme);
    const current = resolveTheme();
    applyTheme(current);
    setTheme(current);
    setMounted(true);
    return () => window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    persistTheme(next);
    setTheme(next);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: next }));
  };

  const label = t(theme === "dark" ? "theme.switchToLight" : "theme.switchToDark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`inline-flex size-10 items-center justify-center rounded-full border border-outline text-on-surface transition-colors duration-150 ease-out-soft hover:bg-surface-mid ${className}`}
    >
      {/* Both glyphs are decorative: the button's accessible name carries the
          meaning, and a screen reader announcing "sun" or "moon" on top of it
          is noise. */}
      {mounted && theme === "dark" ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
      {showLabel && <span>{t("nav.theme")}</span>}
    </button>
  );
}
