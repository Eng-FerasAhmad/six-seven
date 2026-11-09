import { formatDateTime } from "../../utils/dates";
import { lessons, tests, subjects } from "../../content";
import type { CourseAttempt, TestResult } from "../../types";

interface Props {
  attempts: CourseAttempt[];
  results: TestResult[];
}
export function StudyHistory({ attempts, results }: Props) {
  return (
    <>
      <section className="subject-section">
        <h2>Deine Entwicklung mit Tests</h2>
        {results.length === 0 ? (
          <p className="empty-state">
            Noch kein Test abgeschlossen. Starte einen Wissenscheck in deinem
            Fach.
          </p>
        ) : (
          <div className="history-table">
            <table>
              <caption className="sr-only">
                Testergebnisse im Zeitverlauf
              </caption>
              <thead>
                <tr>
                  <th>Test & Datum</th>
                  <th>Ergebnis</th>
                  <th>Entwicklung</th>
                </tr>
              </thead>
              <tbody>
                {[...results].reverse().map((result) => {
                  const previous = results
                    .slice(0, results.indexOf(result))
                    .filter((item) => item.testId === result.testId)
                    .at(-1);
                  const percent = Math.round(
                    (result.correct / result.total) * 100,
                  );
                  const change = previous
                    ? percent -
                      Math.round((previous.correct / previous.total) * 100)
                    : null;
                  return (
                    <tr key={result.id}>
                      <td>
                        <strong>
                          {
                            tests.find((test) => test.id === result.testId)
                              ?.title
                          }
                        </strong>
                        <small>
                          {
                            subjects.find(
                              (subject) =>
                                subject.id ===
                                tests.find((test) => test.id === result.testId)
                                  ?.subjectId,
                            )?.name
                          }{" "}
                          · {formatDateTime(result.finishedAt)}
                          {result.timedOut ? " · Zeit abgelaufen" : ""}
                        </small>
                      </td>
                      <td>
                        {result.correct}/{result.total}
                        <small>{percent} %</small>
                      </td>
                      <td>
                        {change === null
                          ? "Erster Versuch"
                          : `${change > 0 ? "+" : ""}${change} Prozentpunkte`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="subject-section">
        <h2>Deine Entwicklung mit Kursen</h2>
        {attempts.length === 0 ? (
          <p className="empty-state">
            Sobald du eine Kursübung beantwortest, beginnt hier deine Lernreise.
          </p>
        ) : (
          <div className="lesson-list">
            {lessons.map((lesson) => {
              const history = attempts.filter(
                (attempt) => attempt.lessonId === lesson.id,
              );
              if (history.length === 0) return null;
              return (
                <article key={lesson.id} className="course-history">
                  <h3>{lesson.title}</h3>
                  <p>
                    {history.length} Antworten ·{" "}
                    {history.filter((attempt) => attempt.correct).length}{" "}
                    richtig
                  </p>
                  <p>
                    Erster Versuch:{" "}
                    {history[0].correct ? "richtig" : "noch nicht richtig"} →
                    Letzter Versuch:{" "}
                    {history.at(-1)!.correct ? "richtig" : "noch nicht richtig"}
                  </p>
                  <ol>
                    {history.map((attempt) => (
                      <li key={attempt.id}>
                        <time
                          dateTime={new Date(attempt.answeredAt).toISOString()}
                        >
                          {formatDateTime(attempt.answeredAt)}
                        </time>{" "}
                        ·{" "}
                        {attempt.correct
                          ? "Richtig beantwortet"
                          : "Weitergeübt"}
                      </li>
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
