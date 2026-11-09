export type SubjectId =
  "mathematik" | "deutsch" | "englisch" | "natur-technik" | "geographie";
export interface PlaceValueActivity {
  kind: "place-value";
  title: string;
  instruction: string;
  initialNumber: number;
  challengeTitle: string;
  challenges: number[];
}
export interface AdditionActivity {
  kind: "addition";
  title: string;
  instruction: string;
  initialFirst: number;
  initialSecond: number;
  examples: { first: number; second: number }[];
}
export interface Lesson {
  activity?: PlaceValueActivity | AdditionActivity;
  number: number;
  date: string;
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  minutes: number;
  sections: { title: string; text: string; example?: string }[];
}
export interface Exercise {
  visual?: { kind: "place-value"; number: number; highlightPlace: number };
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}
export interface Subject {
  id: SubjectId;
  name: string;
  subtitle: string;
  color: string;
  icon: "Calculator" | "BookOpen" | "Languages" | "Sprout" | "Globe2";
}

export interface TestDefinition {
  isSample?: boolean;
  id: string;
  subjectId: SubjectId;
  title: string;
  description: string;
  durationMinutes: number;
  exerciseIds: string[];
}
export interface TestSession {
  id: string;
  testId: string;
  startedAt: number;
  deadline: number;
  answers: Record<string, number>;
}
export interface TestResult extends TestSession {
  finishedAt: number;
  correct: number;
  total: number;
  timedOut: boolean;
}
export interface CourseAttempt {
  id: string;
  lessonId: string;
  exerciseId: string;
  correct: boolean;
  answeredAt: number;
}
