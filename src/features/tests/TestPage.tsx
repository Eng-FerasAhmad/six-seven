import { useLanguage } from "../../i18n/useLanguage";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock3 } from "lucide-react";
import { exercises } from "../../content";
import type { TestDefinition, TestResult, TestSession } from "../../types";
interface Props {
  test: TestDefinition;
  session?: TestSession;
  results: TestResult[];
  onBack: () => void;
  onStart: (id: string) => void;
  onAnswer: (sessionId: string, exerciseId: string, answer: number) => void;
  onSubmit: (sessionId: string) => void;
  onCancel: (sessionId: string) => void;
}
export function TestPage({
  test,
  session,
  results,
  onBack,
  onStart,
  onAnswer,
  onSubmit,
  onCancel,
}: Props) {
  const { t } = useLanguage();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [session]);
  const remaining = session
    ? Math.max(
        0,
        Math.ceil((session.deadline - Math.max(now, session.startedAt)) / 1000),
      )
    : 0;
  const history = results.filter((result) => result.testId === test.id);
  const latest = history.at(-1);
  const questions = test.exerciseIds.map((id) =>
    exercises.find((exercise) => exercise.id === id)!,
  );
  return (
    <>
      {session ? (
        <button
          className="cancel-test"
          onClick={() => {
            if (
              window.confirm(
                t(
                  "Möchtest du den Test wirklich abbrechen? Die Antworten dieses Versuchs werden verworfen. Bisherige Ergebnisse bleiben gespeichert.",
                  "Are you sure you want to cancel the test? Answers from this attempt will be discarded. Previous results will be kept.",
                ),
              )
            )
              onCancel(session.id);
          }}
        >
          {t("Test abbrechen", "Cancel test")}
        </button>
      ) : (
        <button className="back-link" onClick={onBack}>
          <ArrowLeft size={17} /> {t("Zurück zum Fach", "Back to subject")}
        </button>
      )}
      <h1>{test.title}</h1>
      {session ? (
        <>
          <div
            className="test-timer"
            role="timer"
            aria-label={t("Verbleibende Zeit", "Time remaining")}
          >
            <Clock3 size={20} /> {Math.floor(remaining / 60)}:
            {String(remaining % 60).padStart(2, "0")}{" "}
            <span>
              {t(
                `noch Zeit · ${Object.keys(session.answers).length} von ${questions.length} beantwortet`,
                `remaining · ${Object.keys(session.answers).length} of ${questions.length} answered`,
              )}
            </span>
          </div>
          <p className="intro">
            {t(
              "Deine Antworten werden gespeichert. Die Zeit läuft auch weiter, wenn du den Test verlässt.",
              "Your answers are saved. The timer keeps running if you leave the test.",
            )}
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit(session.id);
            }}
          >
            {questions.map((question, index) => (
              <fieldset
                className="test-question"
                key={question.id}
                disabled={remaining === 0}
              >
                <legend>
                  {index + 1}. {question.question}
                </legend>
                {question.options.map((option, answer) => (
                  <label
                    className={`answer ${session.answers[question.id] === answer ? "chosen" : ""}`}
                    key={option}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      checked={session.answers[question.id] === answer}
                      onChange={() => onAnswer(session.id, question.id, answer)}
                    />
                    {option}
                  </label>
                ))}
              </fieldset>
            ))}
            <p className="intro">
              {t(
                "Unbeantwortete Fragen zählen als falsch. Nach dem Abgeben siehst du die Lösungen.",
                "Unanswered questions count as incorrect. You can see the solutions after submitting.",
              )}
            </p>
            <button className="primary" type="submit">
              {t("Test abgeben", "Submit test")}
            </button>
          </form>
        </>
      ) : (
        <div className="learning-panel">
          {latest && (
            <div role="status">
              <h2>
                {latest.timedOut
                  ? t(
                      "Die Zeit ist um – dein Ergebnis ist gespeichert.",
                      "Time is up – your result has been saved.",
                    )
                  : t(
                      "Geschafft! Dein Ergebnis ist da.",
                      "Well done! Here is your result.",
                    )}
              </h2>
              <p>
                <strong>
                  {t(
                    `${latest.correct} von ${latest.total} richtig`,
                    `${latest.correct} out of ${latest.total} correct`,
                  )}{" "}
                  · {Math.round((latest.correct / latest.total) * 100)} %
                </strong>
              </p>
            </div>
          )}
          <p>
            {t(
              `${test.durationMinutes} Minuten · ${questions.length} Fragen. Du kannst den Test später erneut versuchen.`,
              `${test.durationMinutes} minutes · ${questions.length} questions. You can try the test again later.`,
            )}
          </p>
          <button className="primary" onClick={() => onStart(test.id)}>
            {latest
              ? t("Noch einmal starten", "Try again")
              : t("Test starten", "Start test")}
          </button>
          {latest && (
            <section className="test-review">
              <h2>{t("Deine Antworten", "Your answers")}</h2>
              {questions.map((question) => (
                <article key={question.id}>
                  <h3>{question.question}</h3>
                  <p>
                    {t("Deine Antwort:", "Your answer:")}{" "}
                    {question.options[latest.answers[question.id]] ??
                      t("Nicht beantwortet", "Not answered")}
                  </p>
                  <p>
                    {t("Richtig:", "Correct:")}{" "}
                    {question.options[question.answerIndex]}
                  </p>
                  <p>{question.explanation}</p>
                </article>
              ))}
            </section>
          )}
        </div>
      )}
    </>
  );
}
