import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronRight, House, Trophy, X } from "lucide-react";
import { useLanguage } from "../../i18n/useLanguage";
import { subjects } from "../../content";
import { subjectIcons } from "../subjects/subjectIcons";
import type { SubjectId } from "../../types";
interface Props {
  subject: SubjectId | null;
  showProgress: boolean;
  onHome: () => void;
  onProgress: () => void;
  onSubject: (id: SubjectId) => void;
}
export function MobileNavigation({
  subject,
  showProgress,
  onHome,
  onProgress,
  onSubject,
}: Props) {
  const { t, subjectName } = useLanguage();
  const dialog = useRef<HTMLDialogElement>(null);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [expanded]);
  function close() {
    dialog.current?.close();
    setExpanded(false);
  }
  function open() {
    dialog.current?.showModal();
    setExpanded(true);
  }
  return (
    <>
      <nav
        className="mobile-navigation"
        aria-label={t("Hauptnavigation", "Main navigation")}
      >
        <button
          aria-current={!subject && !showProgress ? "page" : undefined}
          onClick={onHome}
        >
          <House size={22} />
          <span>{t("Reber lernwelt", "My learning world")}</span>
        </button>
        <button
          aria-current={subject ? "page" : undefined}
          aria-haspopup="dialog"
          aria-expanded={expanded}
          onClick={open}
        >
          <BookOpen size={22} />
          <span>{t("Fächer", "Subjects")}</span>
        </button>
        <button
          aria-current={showProgress ? "page" : undefined}
          onClick={onProgress}
        >
          <Trophy size={22} />
          <span>{t("Reber Erfolg", "My achievements")}</span>
        </button>
      </nav>
      <dialog
        className="subject-sheet"
        ref={dialog}
        aria-labelledby="subject-sheet-title"
        onClose={() => setExpanded(false)}
        onCancel={() => setExpanded(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="sheet-content">
          <div className="sheet-handle" aria-hidden="true" />
          <div className="sheet-heading">
            <h2 id="subject-sheet-title">
              {t("Deine Fächer", "Your subjects")}
            </h2>
            <button
              className="sheet-close"
              onClick={close}
              aria-label={t("Fächerauswahl schließen", "Close subjects")}
            >
              <X size={22} />
            </button>
          </div>
          <nav aria-label={t("Fächer", "Subjects")}>
            {subjects.map((item) => {
              const Icon = subjectIcons[item.icon];
              return (
                <button
                  key={item.id}
                  aria-current={subject === item.id ? "page" : undefined}
                  onClick={() => {
                    close();
                    onSubject(item.id);
                  }}
                >
                  <span className={`subject-icon ${item.color}`}>
                    <Icon size={24} />
                  </span>
                  <span>{subjectName(item.id, item.name)}</span>
                  <ChevronRight size={18} />
                </button>
              );
            })}
          </nav>
        </div>
      </dialog>
    </>
  );
}
