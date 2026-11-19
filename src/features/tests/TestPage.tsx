import { DownloadTestPdf } from "./DownloadTestPdf";
import { useLanguage } from "../../i18n/useLanguage";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock3, Play } from "lucide-react";
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
  const [blanks, setBlanks] = useState<Record<string, string>>({});
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
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
  const wrongQuestions = latest
    ? questions.filter(
        (question) => latest.answers[question.id] !== question.answerIndex,
      )
    : [];
  const skeletonTest = test.id === "natur-technik-test-4";
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
            {skeletonTest && (
              <>
                <div className="test-section-title">
                  <h2>1. Fülle die Lücken</h2>
                  <p>Trage die passenden Namen in den Text ein.</p>
                </div>
                <div className="test-passage">
                  Das menschliche Skelett gibt dem Körper Halt. Zusammen mit den
                  Muskeln ermöglicht es Bewegung und schützt wichtige Organe. Es
                  besteht aus verschiedenen{" "}
                  <input
                    aria-label="Lücke 1: Bestandteile des Skeletts"
                    placeholder="1"
                    value={blanks[questions[0].id] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setBlanks((previous) => ({
                        ...previous,
                        [questions[0].id]: value,
                      }));
                      if (value.trim())
                        onAnswer(
                          session.id,
                          questions[0].id,
                          value.trim().toLocaleLowerCase("de") === "knochen"
                            ? 0
                            : 1,
                        );
                    }}
                  />
                  . Der{" "}
                  <input
                    aria-label="Lücke 2: Schutz des Gehirns"
                    placeholder="2"
                    value={blanks[questions[1].id] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setBlanks((previous) => ({
                        ...previous,
                        [questions[1].id]: value,
                      }));
                      if (value.trim())
                        onAnswer(
                          session.id,
                          questions[1].id,
                          value.trim().toLocaleLowerCase("de") === "schädel"
                            ? 0
                            : 1,
                        );
                    }}
                  />{" "}
                  schützt Gehirn und Sinnesorgane. Die{" "}
                  <input
                    aria-label="Lücke 3: Schutz des Rückenmarks"
                    placeholder="3"
                    value={blanks[questions[2].id] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setBlanks((previous) => ({
                        ...previous,
                        [questions[2].id]: value,
                      }));
                      if (value.trim())
                        onAnswer(
                          session.id,
                          questions[2].id,
                          value.trim().toLocaleLowerCase("de") === "wirbelsäule"
                            ? 0
                            : 1,
                        );
                    }}
                  />{" "}
                  schützt das Rückenmark. Rippen und Brustbein bilden den{" "}
                  <input
                    aria-label="Lücke 4: Rippen und Brustbein"
                    placeholder="4"
                    value={blanks[questions[3].id] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setBlanks((previous) => ({
                        ...previous,
                        [questions[3].id]: value,
                      }));
                      if (value.trim())
                        onAnswer(
                          session.id,
                          questions[3].id,
                          value.trim().toLocaleLowerCase("de") === "brustkorb"
                            ? 0
                            : 1,
                        );
                    }}
                  />
                  . Der Brustkorb schützt Herz und Lunge. Die Wirbelsäule hilft
                  uns, aufrecht zu stehen, und ihre Bandscheiben federn Stöße
                  ab. Schlüsselbein und Schulterblatt bilden den{" "}
                  <input
                    aria-label="Lücke 5: Schlüsselbein und Schulterblatt"
                    placeholder="5"
                    value={blanks[questions[4].id] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setBlanks((previous) => ({
                        ...previous,
                        [questions[4].id]: value,
                      }));
                      if (value.trim())
                        onAnswer(
                          session.id,
                          questions[4].id,
                          value.trim().toLocaleLowerCase("de") ===
                            "schultergürtel"
                            ? 0
                            : 1,
                        );
                    }}
                  />
                  . Arme und Hände helfen beim Greifen; Beine und Füße tragen
                  das Körpergewicht und ermöglichen das Gehen. Das Fußgewölbe
                  verteilt das Gewicht und federt Schritte ab.
                </div>
                <div className="test-section-title">
                  <h2>2. Verbinde Teil und Aufgabe</h2>
                  <p>
                    Klicke links auf einen Teil und rechts auf seine Aufgabe.
                  </p>
                </div>
                <div className="test-connect">
                  <div>
                    {questions.slice(5, 10).map((question) => (
                      <button
                        type="button"
                        key={question.id}
                        className={
                          selectedMatch === question.id ? "selected" : ""
                        }
                        onClick={() => setSelectedMatch(question.id)}
                      >
                        {question.question}
                        {session.answers[question.id] !== undefined ? " ✓" : ""}
                      </button>
                    ))}
                  </div>
                  <div>
                    {questions[5].options.map((option, index) => (
                      <button
                        type="button"
                        key={option}
                        onClick={() => {
                          if (selectedMatch) {
                            onAnswer(session.id, selectedMatch, index);
                            setSelectedMatch(null);
                          }
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {questions.map((question, index) =>
              skeletonTest && index < 10 ? null : (
                <div key={question.id}>
                  {skeletonTest && index === 10 && (
                    <div className="test-section-title">
                      <h2>3. Was sind die Aufgaben?</h2>
                      <p>Wähle die richtige Antwort.</p>
                    </div>
                  )}
                  {skeletonTest && index === 18 && (
                    <div className="test-section-title">
                      <h2>4. Richtig oder falsch?</h2>
                    </div>
                  )}
                  <fieldset
                    className="test-question"
                    disabled={remaining === 0}
                  >
                    <legend>
                      {index + 1}. {question.question}
                    </legend>
                    {skeletonTest && question.kind === "fill-blank" ? (
                      <input
                        className="test-select"
                        aria-label={`Lücke ${index + 1}`}
                        placeholder="Name eintragen"
                        value={
                          blanks[question.id] ??
                          question.options[session.answers[question.id]] ??
                          ""
                        }
                        onChange={(event) => {
                          const value = event.target.value;
                          setBlanks((previous) => ({
                            ...previous,
                            [question.id]: value,
                          }));
                          if (value.trim())
                            onAnswer(
                              session.id,
                              question.id,
                              value.trim().toLocaleLowerCase("de") ===
                                question.options[
                                  question.answerIndex
                                ].toLocaleLowerCase("de")
                                ? question.answerIndex
                                : 1,
                            );
                        }}
                        list={`words-${question.id}`}
                      />
                    ) : null}
                    {skeletonTest && question.kind === "fill-blank" && (
                      <datalist id={`words-${question.id}`}>
                        {question.options.map((option) => (
                          <option key={option} value={option} />
                        ))}
                      </datalist>
                    )}
                    {skeletonTest && question.kind === "matching" && (
                      <div className="test-match-row">
                        <span>{question.question}</span>
                        <select
                          aria-label={`Aufgabe für ${question.question}`}
                          className="test-select"
                          value={session.answers[question.id] ?? ""}
                          onChange={(event) =>
                            onAnswer(
                              session.id,
                              question.id,
                              Number(event.target.value),
                            )
                          }
                        >
                          <option value="" disabled>
                            Aufgabe auswählen
                          </option>
                          {question.options.map((option, answer) => (
                            <option key={option} value={answer}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {!skeletonTest && question.kind === "fill-blank" && (
                      <p className="test-kind-hint">
                        Wähle das passende Wort für die Lücke:
                      </p>
                    )}
                    {!skeletonTest && question.kind === "matching" && (
                      <p className="test-kind-hint">
                        Verbinde den genannten Teil mit seiner Aufgabe:
                      </p>
                    )}
                    {question.kind === "true-false" && (
                      <p className="test-kind-hint">
                        Ist die Aussage richtig oder falsch?
                      </p>
                    )}
                    {skeletonTest &&
                    (question.kind === "fill-blank" ||
                      question.kind === "matching") ? null : question.kind ===
                        "fill-blank" || question.kind === "matching" ? (
                      <select
                        className="test-select"
                        aria-label={
                          question.kind === "fill-blank"
                            ? "Wort für die Lücke"
                            : "Passende Aufgabe"
                        }
                        value={session.answers[question.id] ?? ""}
                        onChange={(event) =>
                          onAnswer(
                            session.id,
                            question.id,
                            Number(event.target.value),
                          )
                        }
                      >
                        <option value="" disabled>
                          Bitte auswählen
                        </option>
                        {question.options.map((option, answer) => (
                          <option key={option} value={answer}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      question.options.map((option, answer) => (
                        <label
                          className={`answer ${session.answers[question.id] === answer ? "chosen" : ""}`}
                          key={option}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            checked={session.answers[question.id] === answer}
                            onChange={() =>
                              onAnswer(session.id, question.id, answer)
                            }
                          />
                          {option}
                        </label>
                      ))
                    )}
                  </fieldset>
                </div>
              ),
            )}
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
          {latest ? (
            <div className="test-result-hero" role="status">
              {latest.total > 0 && latest.correct / latest.total > 0.9 && (
                <div
                  className="test-confetti test-confetti-page"
                  aria-hidden="true"
                >
                  {Array.from({ length: 24 }, (_, index) => (
                    <span
                      key={index}
                      style={
                        {
                          "--piece": index,
                          "--delay": `${(index % 6) * 0.12}s`,
                        } as React.CSSProperties
                      }
                    />
                  ))}
                </div>
              )}
              <div className="test-result-celebration">
                <div
                  className="test-result-ring"
                  style={
                    {
                      "--progress": `${Math.round((latest.correct / latest.total) * 100)}%`,
                    } as React.CSSProperties
                  }
                  aria-label={t(
                    `${latest.correct} von ${latest.total} richtig`,
                    `${latest.correct} out of ${latest.total} correct`,
                  )}
                >
                  <span>
                    <strong>
                      {Math.round((latest.correct / latest.total) * 100)}%
                    </strong>
                    <small>{t("richtig", "correct")}</small>
                  </span>
                </div>
              </div>
              <div className="test-result-copy">
                <span className="test-result-eyebrow">
                  {t("Dein Testergebnis", "Your test result")}
                </span>
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
                <p className="test-result-score">
                  {t(
                    `${latest.correct} von ${latest.total} richtig`,
                    `${latest.correct} out of ${latest.total} correct`,
                  )}
                </p>
                <p>
                  {latest.correct === latest.total
                    ? t(
                        "Super! Du hast alle Fragen richtig beantwortet.",
                        "Great work! You answered every question correctly.",
                      )
                    : latest.correct / latest.total >= 0.8
                      ? t(
                          "Stark gemacht! Schau dir die wenigen Fehler an und versuche es noch einmal.",
                          "Great job! Review the few mistakes and try again.",
                        )
                      : t(
                          "Gut geübt! Schau dir deine Fehler an und versuche es noch einmal.",
                          "Good practice! Review your mistakes and try again.",
                        )}
                </p>
              </div>
            </div>
          ) : null}
          <p className="test-result-meta">
            {t(
              `${test.durationMinutes} Minuten · ${questions.length} Fragen. Du kannst den Test später erneut versuchen.`,
              `${test.durationMinutes} minutes · ${questions.length} questions. You can try the test again later.`,
            )}
          </p>
          <div className="test-actions">
            <button className="primary" onClick={() => onStart(test.id)}>
              <Play size={18} />
              {latest
                ? t("Noch einmal starten", "Try again")
                : t("Test starten", "Start test")}
            </button>
            <DownloadTestPdf test={test} />
          </div>
          {latest && (
            <section className="test-review">
              <h2>
                {wrongQuestions.length
                  ? t(
                      "Diese Antworten waren falsch",
                      "These answers were incorrect",
                    )
                  : t(
                      "Alle Antworten waren richtig!",
                      "All answers were correct!",
                    )}
              </h2>
              {wrongQuestions.map((question) => (
                <article key={question.id}>
                  <h3>{question.question}</h3>
                  <p className="test-review-wrong">
                    <strong>{t("Deine Antwort:", "Your answer:")}</strong>{" "}
                    {question.options[latest.answers[question.id]] ??
                      t("Nicht beantwortet", "Not answered")}
                  </p>
                  <p className="test-review-correct">
                    <strong>{t("Richtige Antwort:", "Correct answer:")}</strong>{" "}
                    {question.options[question.answerIndex]}
                  </p>
                </article>
              ))}
            </section>
          )}
        </div>
      )}
    </>
  );
}
