import subjectData from "./subjects.json";
import type { Subject, Lesson, Exercise, TestDefinition } from "../types";
export const subjects = subjectData as Subject[];
export const lessons = Object.values(
  import.meta.glob<Lesson>("./*/**/*-lesson.json", {
    eager: true,
    import: "default",
  }),
);
export const exercises = Object.values(
  import.meta.glob<Exercise[]>("./*/**/*-exercises.json", {
    eager: true,
    import: "default",
  }),
).flat();

export const tests = Object.values(
  import.meta.glob<TestDefinition>("./*/**/*-test.json", {
    eager: true,
    import: "default",
  }),
);
