import { useLanguage } from "../../i18n/useLanguage";
import { House, Settings, Trophy, Gamepad2 } from "lucide-react";
import { subjects } from "../../content";
import { subjectIcons } from "../subjects/subjectIcons";
import type { SubjectId } from "../../types";
import logo from "../../../brand/logo.png";
interface Props {
  subject: SubjectId | null;
  showProgress: boolean;
  showGames: boolean;
  onGames: () => void;
  showSettings: boolean;
  onSettings: () => void;
  onHome: () => void;
  onProgress: () => void;
  onSubject: (id: SubjectId) => void;
}
export function Sidebar({
  subject,
  showProgress,
  showGames,
  onGames,
  showSettings,
  onSettings,
  onHome,
  onProgress,
  onSubject,
}: Props) {
  const { t, subjectName } = useLanguage();
  return (
    <aside className="sidebar">
      <button
        className="brand"
        onClick={onHome}
        aria-label={t("six seeeven Startseite", "six seeeven home")}
      >
        <img src={logo} alt="six seeeven" />
      </button>
      <nav aria-label={t("Hauptnavigation", "Main navigation")}>
        <button
          className={
            !showProgress && !showSettings && !showGames
              ? "nav-item active"
              : "nav-item"
          }
          onClick={onHome}
        >
          <House size={20} /> {t("Reber lernwelt", "My learning world")}
        </button>
        <button
          className={showProgress ? "nav-item active" : "nav-item"}
          onClick={onProgress}
        >
          <Trophy size={20} /> {t("Reber Erfolg", "My achievements")}{" "}
          <span className="tiny-star">✦</span>
        </button>
      </nav>
      <nav aria-label={t("Spiele", "Games")}>
        <button
          className={showGames ? "nav-item active" : "nav-item"}
          onClick={onGames}
        >
          <Gamepad2 size={20} /> {t("Lernspiele", "Learning games")}
        </button>
      </nav>
      <div className="nav-caption">{t("DEINE FÄCHER", "YOUR SUBJECTS")}</div>
      <nav aria-label={t("Fächer", "Subjects")}>
        {subjects.map((s) => {
          const Icon = subjectIcons[s.icon];
          return (
            <button
              key={s.id}
              className={`nav-item ${subject === s.id ? "selected" : ""}`}
              onClick={() => onSubject(s.id)}
            >
              <Icon size={19} className={`ink-${s.color}`} />
              {subjectName(s.id, s.name)}
            </button>
          );
        })}
      </nav>
      <nav
        className="sidebar-settings"
        aria-label={t("Einstellungen", "Settings")}
      >
        <button
          className={`nav-item ${showSettings ? "active" : ""}`}
          onClick={onSettings}
          aria-current={showSettings ? "page" : undefined}
        >
          <Settings size={20} />
          {t("Einstellungen", "Settings")}
        </button>
      </nav>
    </aside>
  );
}
