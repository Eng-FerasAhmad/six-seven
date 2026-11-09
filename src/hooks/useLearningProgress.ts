import { exercises, lessons } from "../content";
import { useStoredState } from "./useStoredState";
export function parseCompleted(value: unknown): string[] {
  return Array.isArray(value)
    ? [
        ...new Set(
          value.filter(
            (id): id is string =>
              typeof id === "string" &&
              exercises.some((exercise) => exercise.id === id),
          ),
        ),
      ]
    : [];
}
export function useLearningProgress() {
  const [completed, setCompleted] = useStoredState<string[]>(
    "six-completed",
    [],
    parseCompleted,
  );
  const nextLesson =
    lessons.find((lesson) =>
      exercises.some(
        (exercise) =>
          exercise.lessonId === lesson.id && !completed.includes(exercise.id),
      ),
    ) ?? lessons[0];
  function completeExercise(id: string) {
    if (exercises.some((exercise) => exercise.id === id)) {
      setCompleted((previous) =>
        previous.includes(id) ? previous : [...previous, id],
      );
    }
  }
  return { completed, nextLesson, completeExercise };
}
