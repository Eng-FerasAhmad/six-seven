import { useLanguage } from "../../i18n/useLanguage";
import { useState } from "react";
import { ArrowRight, Clock3 } from "lucide-react";
import { tests } from "../../content";
import type {
  Lesson,
  Subject,
  TestDefinition,
  TestResult,
  TestSession,
} from "../../types";
import { LessonList } from "../../components/subjects/LessonList";
interface Props {
  subject: Subject;
  completed: string[];
  activeTests: TestSession[];
  results: TestResult[];
  onLesson: (lesson: Lesson) => void;
  onTest: (test: TestDefinition) => void;
}
export function SubjectPage({
  subject,
  completed,
  activeTests,
  results,
  onLesson,
  onTest,
}: Props) {
  const { t, subjectName } = useLanguage();
  const [section, setSection] = useState<"courses" | "tests">("courses");
  return (
    <>
      <h1>{subjectName(subject.id, subject.name)}</h1>
      <p className="intro">{subject.subtitle}</p>
      <div
        className="subject-switch"
        role="group"
        aria-label={t("Kurse oder Tests auswählen", "Choose courses or tests")}
      >
        <button
          type="button"
          aria-pressed={section === "courses"}
          onClick={() => setSection("courses")}
        >
          {t("Kurse", "Courses")}
        </button>
        <button
          type="button"
          aria-pressed={section === "tests"}
          onClick={() => setSection("tests")}
        >
          Tests
        </button>
      </div>
      {section === "courses" ? (
        <section className="subject-section" aria-labelledby="courses-heading">
          <h2 id="courses-heading">{t("Kurse", "Courses")}</h2>
          <p className="intro">
            {t(
              "Lies den Kurs und probiere danach die Übungen aus.",
              "Read the course, then try the exercises.",
            )}
          </p>
          <LessonList
            subject={subject}
            completed={completed}
            onLesson={onLesson}
          />
        </section>
      ) : (
        <section className="subject-section" aria-labelledby="tests-heading">
          <h2 id="tests-heading">Tests</h2>
          <p className="intro">
            {t(
              "Zeig, was du gelernt hast. Deine Ergebnisse begleiten deine Lernreise.",
              "Show what you have learned. Your results help you see your progress.",
            )}
          </p>
          <div className="lesson-list">
            {tests
              .filter((test) => test.subjectId === subject.id)
              .map((test) => {
                const active = activeTests.some(
                  (session) => session.testId === test.id,
                );
                const history = results.filter(
                  (result) => result.testId === test.id,
                );
                const latest = history.at(-1);
                return (
                  <button
                    className="lesson-row"
                    key={test.id}
                    onClick={() => onTest(test)}
                  >
                    <span className={`subject-icon ${subject.color}`}>
                      <Clock3 size={22} />
                    </span>
                    <span>
                      <strong>{test.title}</strong>
                      <small>
                        {test.durationMinutes} {t("Min.", "min")} ·{" "}
                        {test.exerciseIds.length} {t("Fragen", "questions")}
                        {test.isSample
                          ? t(" · Beispieltest", " · Sample test")
                          : ""}
                      </small>
                      {(active || latest) && (
                        <small>
                          {active
                            ? t(
                                "Angefangen – Test fortsetzen",
                                "In progress – continue test",
                              )
                            : t(
                                `Letztes Ergebnis: ${latest!.correct} von ${latest!.total} · ${history.length} Versuche`,
                                `Last result: ${latest!.correct} out of ${latest!.total} · ${history.length} attempts`,
                              )}
                        </small>
                      )}
                    </span>
                    <ArrowRight size={20} />
                  </button>
                );
              })}
          </div>
        </section>
      )}
    </>
  );
}
