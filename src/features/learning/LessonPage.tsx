import { PlaceValueLesson } from "./math/PlaceValueLesson";
import { AdditionLesson } from "./math/AdditionLesson";
import { useLanguage } from "../../i18n/useLanguage";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { exercises } from "../../content";
import type { Lesson } from "../../types";
import { ExercisePanel } from "./ExercisePanel";
interface Props {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (id: string) => void;
  onAttempt: (id: string, correct: boolean) => void;
}
export function LessonPage({ lesson, onBack, onComplete, onAttempt }: Props) {
  const { t } = useLanguage();
  const [practice, setPractice] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const courseExercises = exercises.filter(
    (exercise) => exercise.lessonId === lesson.id,
  );
  const exercise = courseExercises[exerciseIndex];
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "instant" });
  }, [practice, exerciseIndex]);
  function continueLearning() {
    if (exerciseIndex < courseExercises.length - 1)
      setExerciseIndex((index) => index + 1);
    else onBack();
  }
  return (
    <>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> {t("Zurück zur Übersicht", "Back to overview")}
      </button>
      <h1>{lesson.title}</h1>
      {!practice && lesson.activity?.kind === "place-value" && (
        <PlaceValueLesson activity={lesson.activity} />
      )}
      {!practice && lesson.activity?.kind === "addition" && (
        <AdditionLesson activity={lesson.activity} />
      )}
      <div
        className={
          lesson.activity && !practice ? "lesson-actions" : "learning-panel"
        }
      >
        {practice && exercise ? (
          <ExercisePanel
            key={exercise.id}
            exercise={exercise}
            onReadLesson={() => setPractice(false)}
            onContinue={continueLearning}
            onComplete={onComplete}
            onAttempt={onAttempt}
          />
        ) : (
          <>
            {!lesson.activity &&
              lesson.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                  {section.example && (
                    <div className="example">
                      <Sparkles size={22} />
                      <div>
                        <strong>{t("Zum Merken", "Remember")}</strong>
                        <p>{section.example}</p>
                      </div>
                    </div>
                  )}
                </section>
              ))}
            <button className="primary" onClick={() => setPractice(true)}>
              {t("Jetzt ausprobieren", "Try it now")} <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>
    </>
  );
}
