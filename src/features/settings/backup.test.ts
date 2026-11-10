import { describe, expect, it } from "vitest";
import { createBackup, restoreBackup } from "./backup";
import { exercises, tests } from "../../content";
describe("progress backups", () => {
  it("exports progress and merges it without duplicate rewards or lost attempts", () => {
    const first = exercises[0];
    const second = exercises[1];
    const attempt = {
      id: "attempt-1",
      exerciseId: first.id,
      lessonId: first.lessonId,
      correct: true,
      answeredAt: Date.now(),
    };
    localStorage.setItem("six-completed", JSON.stringify([first.id]));
    localStorage.setItem("six-course-history", JSON.stringify([attempt]));
    const backup = createBackup();
    localStorage.setItem("six-completed", JSON.stringify([second.id]));
    restoreBackup(backup);
    restoreBackup(backup);
    expect(new Set(JSON.parse(localStorage.getItem("six-completed")!))).toEqual(
      new Set([first.id, second.id]),
    );
    expect(JSON.parse(localStorage.getItem("six-course-history")!)).toEqual([
      attempt,
    ]);
  });
  it("rejects invalid backups without changing progress", () => {
    localStorage.setItem("six-completed", JSON.stringify([exercises[0].id]));
    const before = createBackup();
    expect(() => restoreBackup('{"app":"another-app"}')).toThrow();
    expect(localStorage.getItem("six-completed")).toBe(
      JSON.stringify([exercises[0].id]),
    );
    const malformed = JSON.parse(before);
    malformed.progress["six-tests"] = { active: "broken" };
    expect(() => restoreBackup(JSON.stringify(malformed))).toThrow();
    expect(localStorage.getItem("six-completed")).toBe(
      JSON.stringify([exercises[0].id]),
    );
  });
  it("finalizes expired imported tests using their original deadline", () => {
    const test = tests[0];
    const session = {
      id: "imported-session",
      testId: test.id,
      startedAt: Date.now() - 10000,
      deadline: Date.now() - 5000,
      answers: {},
    };
    const backup = JSON.parse(createBackup());
    backup.progress["six-tests"] = { active: [session], results: [] };
    restoreBackup(JSON.stringify(backup));
    const result = JSON.parse(localStorage.getItem("six-tests")!);
    expect(result.active).toHaveLength(0);
    expect(result.results[0]).toMatchObject({
      id: "imported-session",
      timedOut: true,
      finishedAt: session.deadline,
      correct: 0,
    });
  });
});
