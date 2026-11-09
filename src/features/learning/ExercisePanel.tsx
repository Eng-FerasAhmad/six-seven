import { PlaceValueQuestion } from "./math/PlaceValueQuestion";
import { useLanguage } from "../../i18n/useLanguage";
import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { Exercise } from "../../types";
interface Props {
  exercise: Exercise;
  onReadLesson: () => void;
  onContinue: () => void;
  onComplete: (id: string) => void;
  onAttempt: (id: string, correct: boolean) => void;
}
export function ExercisePanel({
  exercise,
  onReadLesson,
  onContinue,
  onComplete,
  onAttempt,
}: Props) {
  const { t } = useLanguage();
  const [answer, setAnswer] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  return (
    <>
      <h2>{exercise.question}</h2>
      {exercise.visual && <PlaceValueQuestion visual={exercise.visual} />}
      <fieldset disabled={checked}>
        <legend className="sr-only">
          {t("Wähle deine Antwort", "Choose your answer")}
        </legend>
        {exercise.options.map((option, index) => (
          <label
            key={option}
            className={`answer ${answer === index ? "chosen" : ""} ${checked && index === exercise.answerIndex ? "correct" : ""}`}
          >
            <input
              type="radio"
              name="answer"
              checked={answer === index}
              onChange={() => setAnswer(index)}
            />
            {option}
            {checked && index === exercise.answerIndex && <Check size={20} />}
          </label>
        ))}
      </fieldset>
      {checked ? (
        <div role="status" className="feedback">
          <h3>
            {answer === exercise.answerIndex
              ? t(
                  "🎉 Super gemacht! Das stimmt.",
                  "🎉 Great job! That is correct.",
                )
              : t(
                  "🌱 Du lernst dazu! Schau mal:",
                  "🌱 You are learning! Take a look:",
                )}
          </h3>
          <p>{exercise.explanation}</p>
          <button
            className="primary"
            onClick={() => {
              if (answer !== exercise.answerIndex) {
                setChecked(false);
                setAnswer(null);
              } else {
                onContinue();
              }
            }}
          >
            {answer === exercise.answerIndex
              ? t("Weiterlernen", "Keep learning")
              : t("Noch einmal probieren", "Try again")}
            <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <button
          className="primary"
          disabled={answer === null}
          onClick={() => {
            setChecked(true);
            onAttempt(exercise.id, answer === exercise.answerIndex);
            if (answer === exercise.answerIndex) onComplete(exercise.id);
          }}
        >
          {t("Antwort prüfen", "Check answer")} <Check size={18} />
        </button>
      )}
      <button className="back-link" onClick={onReadLesson}>
        {t("Lektion noch mal lesen", "Read the lesson again")}
      </button>
    </>
  );
}
