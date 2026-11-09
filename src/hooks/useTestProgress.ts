import { useEffect } from "react";
import { tests, exercises } from "../content";
import {
  emptyTestProgress,
  expireSessions,
  finishSession,
  parseTestProgress,
} from "../features/tests/testProgress";
import { useStoredState } from "./useStoredState";
export function useTestProgress() {
  const [progress, setProgress] = useStoredState(
    "six-tests",
    emptyTestProgress,
    (value) => expireSessions(parseTestProgress(value), Date.now()),
  );
  useEffect(() => {
    const timer = window.setInterval(
      () => setProgress((previous) => expireSessions(previous, Date.now())),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [setProgress]);
  function startTest(testId: string) {
    const test = tests.find((test) => test.id === testId);
    if (!test) return;
    const now = Date.now();
    setProgress((previous) => {
      const current = expireSessions(previous, now);
      if (current.active.some((session) => session.testId === testId))
        return current;
      return {
        ...current,
        active: [
          ...current.active,
          {
            id: crypto.randomUUID(),
            testId,
            startedAt: now,
            deadline: now + test.durationMinutes * 60_000,
            answers: {},
          },
        ],
      };
    });
  }
  function answerQuestion(
    sessionId: string,
    exerciseId: string,
    answer: number,
  ) {
    setProgress((previous) => {
      const current = expireSessions(previous, Date.now());
      return {
        ...current,
        active: current.active.map((session) => {
          const test = tests.find((test) => test.id === session.testId);
          const exercise = exercises.find(
            (exercise) => exercise.id === exerciseId,
          );
          if (
            session.id !== sessionId ||
            !test?.exerciseIds.includes(exerciseId) ||
            !exercise ||
            !Number.isInteger(answer) ||
            answer < 0 ||
            answer >= exercise.options.length
          )
            return session;
          return {
            ...session,
            answers: { ...session.answers, [exerciseId]: answer },
          };
        }),
      };
    });
  }
  return {
    ...progress,
    startTest,
    answerQuestion,
    cancelTest: (id: string) =>
      setProgress((previous) => {
        const current = expireSessions(previous, Date.now());
        return {
          ...current,
          active: current.active.filter((session) => session.id !== id),
        };
      }),
    submitTest: (id: string) =>
      setProgress((previous) => finishSession(previous, id, Date.now())),
  };
}
