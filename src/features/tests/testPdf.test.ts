import { describe, expect, it } from "vitest";
import { exercises, subjects, tests } from "../../content";
import { createTestPdf, testPdfFilename } from "./testPdf";
describe("downloadable tests", () => {
  it("creates a valid A4 PDF for every subject without explanations or saved answers", () => {
    for (const test of tests) {
      const subject = subjects.find(
        (subject) => subject.id === test.subjectId,
      )!;
      const questions = test.exerciseIds.map((id) => ({
        ...exercises.find((exercise) => exercise.id === id)!,
        explanation: "SECRET_SOLUTION",
      }));
      const pdf = createTestPdf({ test, subjectName: subject.name, questions });
      const output = pdf.output();
      expect(output.startsWith("%PDF-")).toBe(true);
      expect(pdf.internal.pageSize.getWidth()).toBeCloseTo(210, 0);
      expect(pdf.internal.pageSize.getHeight()).toBeCloseTo(297, 0);
      expect(output).not.toContain("SECRET_SOLUTION");
      expect(output).toContain(
        test.subjectId === "englisch" ? "Name:" : "Datum:",
      );
      expect(testPdfFilename(test)).toBe(`six-seeeven-${test.id}.pdf`);
    }
  });
  it("paginates long tests and keeps later questions in the PDF", () => {
    const test = tests[0];
    const questions = Array.from({ length: 35 }, (_, index) => ({
      ...exercises[0],
      id: `q-${index}`,
      question: `Question ${index + 1}: ${"Read this sentence carefully. ".repeat(12)}`,
      options: [
        "First choice",
        "Second choice",
        "Third choice",
        "Fourth choice",
      ],
    }));
    const pdf = createTestPdf({ test, subjectName: "Deutsch", questions });
    expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
    expect(pdf.output()).toContain("Question 35:");
  });
});
