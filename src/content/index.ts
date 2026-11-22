import subjectData from "./subjects.json";
import type { Subject, Lesson, Exercise, TestDefinition } from "../types";
import {
  grammarTest,
  grammarTestExercises,
  grammarTestLesson,
} from "./grammarTest";
export const subjects = subjectData as Subject[];
export const lessons = Object.values(
  import.meta.glob<Lesson>("./*/**/*-lesson.json", {
    eager: true,
    import: "default",
  }),
).concat(grammarTestLesson);
export const exercises = Object.values(
  import.meta.glob<Exercise[]>("./*/**/*-exercises.json", {
    eager: true,
    import: "default",
  }),
)
  .flat()
  .concat(grammarTestExercises);

export const tests = Object.values(
  import.meta.glob<TestDefinition>("./*/**/*-test.json", {
    eager: true,
    import: "default",
  }),
).concat(grammarTest);
