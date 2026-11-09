import { parseCompleted } from "../../hooks/useLearningProgress";
import { parseHistory } from "../../hooks/useCourseHistory";
import { expireSessions, parseTestProgress } from "../tests/testProgress";
const keys = ["six-completed", "six-course-history", "six-tests"] as const;
export function createBackup() {
  const progress = Object.fromEntries(
    keys.map((key) => [key, JSON.parse(localStorage.getItem(key) ?? "null")]),
  );
  return JSON.stringify(
    {
      app: "six-seeeven",
      version: 1,
      exportedAt: new Date().toISOString(),
      progress,
    },
    null,
    2,
  );
}
export function restoreBackup(text: string) {
  const backup = JSON.parse(text);
  if (
    !backup ||
    backup.app !== "six-seeeven" ||
    backup.version !== 1 ||
    !backup.progress ||
    typeof backup.progress !== "object"
  )
    throw new Error("Diese Datei ist keine gültige six seeeven Sicherung.");
  const imported = backup.progress;
  if (!keys.every((key) => Object.hasOwn(imported, key)))
    throw new Error("Die Sicherung ist unvollständig.");
  if (
    imported["six-completed"] !== null &&
    !Array.isArray(imported["six-completed"])
  )
    throw new Error("Ungültige Übungsdaten.");
  if (
    imported["six-course-history"] !== null &&
    !Array.isArray(imported["six-course-history"])
  )
    throw new Error("Ungültiger Kursverlauf.");
  if (
    imported["six-tests"] !== null &&
    (!Array.isArray(imported["six-tests"]?.active) ||
      !Array.isArray(imported["six-tests"]?.results))
  )
    throw new Error("Ungültige Testdaten.");
  const previous = new Map(keys.map((key) => [key, localStorage.getItem(key)]));
  const current = (key: (typeof keys)[number]) =>
    JSON.parse(previous.get(key) ?? "null");
  const completed = [
    ...new Set([
      ...parseCompleted(current("six-completed")),
      ...parseCompleted(imported["six-completed"]),
    ]),
  ];
  const attempts = [
    ...new Map(
      [
        ...parseHistory(imported["six-course-history"]),
        ...parseHistory(current("six-course-history")),
      ].map((attempt) => [attempt.id, attempt]),
    ).values(),
  ].sort((a, b) => a.answeredAt - b.answeredAt);
  const savedTests = parseTestProgress(current("six-tests"));
  const importedTests = parseTestProgress(imported["six-tests"]);
  const results = [
    ...new Map(
      [...importedTests.results, ...savedTests.results].map((result) => [
        result.id,
        result,
      ]),
    ).values(),
  ].sort((a, b) => a.finishedAt - b.finishedAt);
  const active = [
    ...new Map(
      [...importedTests.active, ...savedTests.active]
        .filter(
          (session) => !results.some((result) => result.id === session.id),
        )
        .map((session) => [session.testId, session]),
    ).values(),
  ];
  const tests = expireSessions({ active, results }, Date.now());
  const values = [completed, attempts, tests];
  try {
    keys.forEach((key, index) =>
      localStorage.setItem(key, JSON.stringify(values[index])),
    );
  } catch (error) {
    for (const [key, value] of previous) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
      } catch {
        /* Storage may be full or blocked. */
      }
    }
    throw error;
  }
}
