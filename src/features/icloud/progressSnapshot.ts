import { parseCompleted } from "../../hooks/useLearningProgress";
import { parseHistory } from "../../hooks/useCourseHistory";
import { readStoredRaw, writeStoredRaw } from "../../utils/browserStorage";
import { parseTestProgress } from "../tests/testProgress";
import type { CourseAttempt, TestResult } from "../../types";
import type { ProgressSnapshot } from "./types";
export const progressKeys = [
  "six-completed",
  "six-course-history",
  "six-tests",
] as const;
export const emptySnapshot: ProgressSnapshot = {
  version: 1,
  completed: [],
  attempts: [],
  results: [],
};
function read(key: string): unknown {
  try {
    return JSON.parse(readStoredRaw(key) ?? "null");
  } catch {
    return null;
  }
}
export function readProgressSnapshot(): ProgressSnapshot {
  return normalizeSnapshot({
    version: 1,
    completed: parseCompleted(read("six-completed")),
    attempts: parseHistory(read("six-course-history")),
    results: parseTestProgress(read("six-tests")).results,
  });
}
function mergeHistory<T extends CourseAttempt | TestResult>(
  first: T[],
  second: T[],
): T[] {
  const timestamp = (value: T) =>
    "answeredAt" in value ? value.answeredAt : value.finishedAt;
  const compare = (a: T, b: T) =>
    timestamp(a) - timestamp(b) ||
    JSON.stringify(a).localeCompare(JSON.stringify(b));
  const records = new Map<string, T>();
  for (const value of [...first, ...second]) {
    const previous = records.get(value.id);
    if (!previous || compare(value, previous) > 0) records.set(value.id, value);
  }
  return [...records.values()].sort(
    (a, b) => timestamp(a) - timestamp(b) || a.id.localeCompare(b.id),
  );
}
export function mergeSnapshots(
  first: ProgressSnapshot,
  second: ProgressSnapshot,
): ProgressSnapshot {
  return {
    version: 1,
    completed: [...new Set([...first.completed, ...second.completed])].sort(),
    attempts: mergeHistory(first.attempts, second.attempts),
    results: mergeHistory(first.results, second.results),
  };
}
function normalizeSnapshot(value: ProgressSnapshot) {
  return mergeSnapshots(emptySnapshot, value);
}
export function parseSnapshot(payload: string): ProgressSnapshot {
  const value: unknown = JSON.parse(payload);
  if (!value || typeof value !== "object")
    throw new Error("Ungültige iCloud-Daten. Lokale Daten bleiben erhalten.");
  const candidate = value as Partial<ProgressSnapshot>;
  if (
    candidate.version !== 1 ||
    !Array.isArray(candidate.completed) ||
    !Array.isArray(candidate.attempts) ||
    !Array.isArray(candidate.results)
  )
    throw new Error(
      "Die iCloud-Daten haben ein unbekanntes Format. Bitte aktualisiere die App.",
    );
  const completed = parseCompleted(candidate.completed);
  const attempts = parseHistory(candidate.attempts);
  const results = parseTestProgress({
    active: [],
    results: candidate.results,
  }).results;
  if (
    completed.length !== new Set(candidate.completed).size ||
    attempts.length !== candidate.attempts.length ||
    results.length !== candidate.results.length
  )
    throw new Error(
      "Die iCloud-Daten passen nicht zu diesen Kursen. Lokale Daten bleiben erhalten.",
    );
  return normalizeSnapshot({ version: 1, completed, attempts, results });
}
export function applyProgressSnapshot(snapshot: ProgressSnapshot) {
  const merged = mergeSnapshots(snapshot, readProgressSnapshot());
  const tests = parseTestProgress(read("six-tests"));
  const resultIds = new Set(merged.results.map((result) => result.id));
  writeStoredRaw("six-completed", JSON.stringify(merged.completed));
  writeStoredRaw("six-course-history", JSON.stringify(merged.attempts));
  writeStoredRaw(
    "six-tests",
    JSON.stringify({
      active: tests.active.filter((session) => !resultIds.has(session.id)),
      results: merged.results,
    }),
  );
}
