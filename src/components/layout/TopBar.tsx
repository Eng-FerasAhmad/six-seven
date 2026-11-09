import { useLanguage } from "../../i18n/useLanguage";
import { Moon, Sun } from "lucide-react";
import { fontSizes, usePreferences } from "../../hooks/usePreferences";
export function TopBar() {
  const { t } = useLanguage();
  const { fontSize, dark, decreaseFontSize, increaseFontSize, toggleTheme } =
    usePreferences();
  return (
    <header className="topbar">
      <div className="header-actions">
        <div
          className="font-size-control"
          role="group"
          aria-label={t("Schriftgröße", "Text size")}
        >
          <button
            type="button"
            aria-label={t("Schrift verkleinern", "Decrease text size")}
            disabled={fontSize === 0}
            onClick={decreaseFontSize}
          >
            A−
          </button>
          <span aria-live="polite" aria-atomic="true">
            {t(
              fontSizes[fontSize],
              ["Normal", "Large", "Extra large"][fontSize],
            )}
          </span>
          <button
            type="button"
            aria-label={t("Schrift vergrößern", "Increase text size")}
            disabled={fontSize === fontSizes.length - 1}
            onClick={increaseFontSize}
          >
            A+
          </button>
        </div>
        <span className="class-badge">{t("5. Klasse", "Grade 5")}</span>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={
            dark
              ? t("Hellen Modus aktivieren", "Switch to light mode")
              : t("Dunklen Modus aktivieren", "Switch to dark mode")
          }
        >
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  );
}
