import { BookOpen, ChevronRight, Star, Trophy } from "lucide-react";
import { exercises, lessons, subjects } from "../../content";
import { subjectIcons } from "../../components/subjects/subjectIcons";
import type { SubjectId } from "../../types";
interface Props {
  completed: string[];
  onSubject: (id: SubjectId) => void;
}
export function ProgressPage({ completed, onSubject }: Props) {
  return (
    <div className="progress-page">
      <div className="eyebrow">JEDER SCHRITT ZÄHLT</div>
      <h1>
        Schau, was du schon kannst! <span>🌟</span>
      </h1>
      <div className="stats progress-stats">
        <div>
          <Trophy />
          <strong>{completed.length}</strong>
          <span>Geschaffte Übungen</span>
        </div>
        <div>
          <Star />
          <strong>{completed.length * 10}</strong>
          <span>Gesammelte Lernsterne</span>
        </div>
        <div>
          <BookOpen />
          <strong>
            {Math.round((completed.length / exercises.length) * 100)} %
          </strong>
          <span>Deiner Lernreise</span>
        </div>
      </div>
      <section
        className="lesson-list progress-subjects"
        aria-label="Fortschritt nach Fach"
      >
        {subjects.map((s) => {
          const Icon = subjectIcons[s.icon];
          const total = exercises.filter((e) =>
            lessons.some((l) => l.subjectId === s.id && l.id === e.lessonId),
          );
          const count = total.filter((e) => completed.includes(e.id)).length;
          return (
            <button
              key={s.id}
              className="lesson-row"
              onClick={() => onSubject(s.id)}
            >
              <span className={`subject-icon ${s.color}`}>
                <Icon size={25} strokeWidth={1.8} />
              </span>
              <span className="progress-subject-copy">
                <strong>{s.name}</strong>
                <small>
                  {count} von {total.length} Übungen geschafft
                </small>
              </span>
              <progress value={count} max={total.length} />
              <ChevronRight />
            </button>
          );
        })}
      </section>
    </div>
  );
}
