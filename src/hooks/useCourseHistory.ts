import { exercises } from "../content";
import type { CourseAttempt } from "../types";
import { useStoredState } from "./useStoredState";
export function parseHistory(value: unknown): CourseAttempt[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (attempt): attempt is CourseAttempt =>
      !!attempt &&
      typeof attempt.id === "string" &&
      typeof attempt.correct === "boolean" &&
      Number.isFinite(attempt.answeredAt) &&
      exercises.some(
        (exercise) =>
          exercise.id === attempt.exerciseId &&
          exercise.lessonId === attempt.lessonId,
      ),
  );
}
export function useCourseHistory() {
  const [attempts, setAttempts] = useStoredState<CourseAttempt[]>(
    "six-course-history",
    [],
    parseHistory,
  );
  function recordAttempt(exerciseId: string, correct: boolean) {
    const exercise = exercises.find((exercise) => exercise.id === exerciseId);
    if (!exercise) return;
    const attempt: CourseAttempt = {
      id: crypto.randomUUID(),
      lessonId: exercise.lessonId,
      exerciseId,
      correct,
      answeredAt: Date.now(),
    };
    setAttempts((previous) => [...previous, attempt]);
  }
  return { attempts, recordAttempt };
}
