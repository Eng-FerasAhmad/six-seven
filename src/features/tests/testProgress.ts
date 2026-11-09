import { exercises, tests } from "../../content";
import type { TestResult, TestSession } from "../../types";
export interface TestProgress {
  active: TestSession[];
  results: TestResult[];
}
export const emptyTestProgress: TestProgress = { active: [], results: [] };
export function parseTestProgress(value: unknown): TestProgress {
  if (!value || typeof value !== "object") return emptyTestProgress;
  const candidate = value as Partial<TestProgress>;
  const validSession = (session: TestSession) => {
    if (
      !session ||
      typeof session.id !== "string" ||
      typeof session.testId !== "string"
    )
      return false;
    const test = tests.find((test) => test.id === session.testId);
    return (
      !!test &&
      Number.isFinite(session.startedAt) &&
      Number.isFinite(session.deadline) &&
      session.deadline > session.startedAt &&
      !!session.answers &&
      typeof session.answers === "object" &&
      Object.entries(session.answers).every(
        ([id, answer]) =>
          test.exerciseIds.includes(id) &&
          Number.isInteger(answer) &&
          answer >= 0 &&
          answer < (exercises.find((e) => e.id === id)?.options.length ?? 0),
      )
    );
  };
  return {
    active: Array.isArray(candidate.active)
      ? candidate.active.filter(validSession)
      : [],
    results: Array.isArray(candidate.results)
      ? candidate.results.filter(
          (result) =>
            validSession(result) &&
            Number.isFinite(result.finishedAt) &&
            Number.isInteger(result.correct) &&
            Number.isInteger(result.total) &&
            result.total > 0 &&
            result.correct >= 0 &&
            result.correct <= result.total &&
            typeof result.timedOut === "boolean",
        )
      : [],
  };
}
export function finishSession(
  state: TestProgress,
  sessionId: string,
  now: number,
): TestProgress {
  const session = state.active.find((item) => item.id === sessionId);
  if (!session) return state;
  const test = tests.find((test) => test.id === session.testId);
  if (!test) return state;
  const result: TestResult = {
    ...session,
    finishedAt: Math.min(now, session.deadline),
    timedOut: now >= session.deadline,
    total: test.exerciseIds.length,
    correct: test.exerciseIds.filter(
      (id) =>
        session.answers[id] ===
        exercises.find((exercise) => exercise.id === id)?.answerIndex,
    ).length,
  };
  return {
    active: state.active.filter((item) => item.id !== sessionId),
    results: [...state.results, result],
  };
}
export function expireSessions(state: TestProgress, now: number) {
  return state.active
    .filter((session) => session.deadline <= now)
    .reduce((next, session) => finishSession(next, session.id, now), state);
}
