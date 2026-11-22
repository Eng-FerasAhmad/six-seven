import type { Exercise, Lesson, TestDefinition } from "../types";
import { grammarQuestions } from "../features/overview/grammarQuiz";

const firstTopic = [
  {
    prompt: "What is the plural of dog?",
    options: ["dogs", "doges", "dogies"],
    answer: "dogs",
  },
  {
    prompt: "What is the plural of house?",
    options: ["houses", "housies", "house"],
    answer: "houses",
  },
  {
    prompt: "What is the plural of family?",
    options: ["familys", "families", "familyes"],
    answer: "families",
  },
];

export const grammarTestExercises: Exercise[] = [
  firstTopic,
  ...grammarQuestions.slice(1),
]
  .flatMap((group) => group.slice(0, 3))
  .map((question, index) => ({
    id: `englisch-grammar-test-${index + 1}`,
    lessonId: "englisch-grammar",
    question: question.prompt,
    options: [...question.options],
    answerIndex: question.options.indexOf(question.answer),
    explanation: `Correct answer: ${question.answer}`,
  }));

export const grammarTest: TestDefinition = {
  id: "englisch-grammar-test",
  subjectId: "englisch",
  title: "Complete grammar test",
  description: "33 questions across all grammar topics.",
  durationMinutes: 45,
  exerciseIds: grammarTestExercises.map((question) => question.id),
};

export const grammarTestLesson: Lesson = {
  id: "englisch-grammar",
  subjectId: "englisch",
  number: 0,
  date: "2026-11-22",
  title: "English Grammar",
  description: "Grammar test questions",
  minutes: 45,
  sections: [
    {
      title: "Grammar",
      text: "Review the grammar topics before starting the complete test.",
    },
  ],
};
