import { describe, expect, it } from "vitest";
import type { Exercise } from "../../types";
import { questionsForLevel } from "./levelQuestions";

const questions: Exercise[] = Array.from({ length: 24 }, (_, index) => ({
  id: `question-${index}`, lessonId: "sample", question: `Question ${index}`,
  options: ["A", "B"], answerIndex: 0, explanation: "Example",
}));

describe("level question pools", () => {
  it("keeps questions exclusive to a level and increases difficulty", () => {
    const seen = new Set<string>();
    let previousHardest = -1;
    for (let level = 1; level <= 10; level++) {
      const pool = questionsForLevel(questions, level);
      expect(pool.length).toBeGreaterThanOrEqual(2);
      const ranks = pool.map((question) => Number(question.id.split("-")[1]));
      expect(Math.min(...ranks)).toBeGreaterThan(previousHardest);
      previousHardest = Math.max(...ranks);
      for (const question of pool) { expect(seen.has(question.id)).toBe(false); seen.add(question.id); }
    }
    expect(seen.size).toBe(questions.length);
  });
});
