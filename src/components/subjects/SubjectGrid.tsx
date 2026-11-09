import { ArrowRight } from "lucide-react";
import { lessons, subjects } from "../../content";
import type { SubjectId } from "../../types";
import { subjectIcons } from "./subjectIcons";
export function SubjectGrid({
  onSubject,
}: {
  onSubject: (id: SubjectId) => void;
}) {
  return (
    <div className="subject-grid">
      {subjects.map((s) => {
        const Icon = subjectIcons[s.icon];
        const count = lessons.filter((l) => l.subjectId === s.id).length;
        return (
          <button
            key={s.id}
            className={`subject-card ${s.color}`}
            onClick={() => onSubject(s.id)}
          >
            <div className="card-top">
              <span className={`subject-icon ${s.color}`}>
                <Icon size={25} strokeWidth={1.8} />
              </span>
              <span className="card-arrow">
                <ArrowRight size={18} />
              </span>
            </div>
            <h3>{s.name}</h3>
            <p>{s.subtitle}</p>
            <div className="card-bottom">
              <span>{count} Themen zum Entdecken</span>
              <span className="card-dots">•••</span>
            </div>
          </button>
        );
      })}
      <div className="curiosity-card">
        <span>💡</span>
        <h3>Wusstest du schon?</h3>
        <p>
          Dein Gehirn liebt Pausen. Nach einer kleinen Auszeit lernst du oft
          noch besser!
        </p>
        <span className="handwritten">Also: kurz strecken! ↗</span>
      </div>
    </div>
  );
}
