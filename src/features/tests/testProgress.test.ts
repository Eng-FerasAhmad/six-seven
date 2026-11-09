import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { exercises, lessons, tests } from "../../content";
import { useTestProgress } from "../../hooks/useTestProgress";
import { emptyTestProgress, parseTestProgress } from "./testProgress";

afterEach(() => vi.useRealTimers());
const test = tests.find((test) => test.subjectId === "mathematik")!;
const firstQuestion = exercises.find(
  (exercise) => exercise.id === test.exerciseIds[0],
)!;

describe("test content", () => {
  it("has valid subject, timing and question references for every test", () => {
    expect(new Set(tests.map((test) => test.id)).size).toBe(tests.length);
    for (const test of tests) {
      expect(test.durationMinutes).toBeGreaterThan(0);
      expect(test.exerciseIds.length).toBeGreaterThan(0);
      expect(new Set(test.exerciseIds).size).toBe(test.exerciseIds.length);
      for (const id of test.exerciseIds) {
        const exercise = exercises.find((exercise) => exercise.id === id);
        expect(exercise).toBeDefined();
        expect(
          lessons.find((lesson) => lesson.id === exercise?.lessonId)?.subjectId,
        ).toBe(test.subjectId);
      }
    }
  });
  it("discards malformed saved sessions and results", () => {
    expect(
      parseTestProgress({ active: [null, {}], results: [null, {}] }),
    ).toEqual(emptyTestProgress);
  });
});
describe("timed tests", () => {
  it("restores answers and the original deadline after reload", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-09T12:00:00Z"));
    const initial = renderHook(useTestProgress);
    act(() => initial.result.current.startTest(test.id));
    const session = initial.result.current.active[0];
    act(() =>
      initial.result.current.answerQuestion(
        session.id,
        firstQuestion.id,
        firstQuestion.answerIndex,
      ),
    );
    initial.unmount();
    vi.setSystemTime(Date.now() + 60_000);
    const restored = renderHook(useTestProgress);
    expect(restored.result.current.active[0].deadline).toBe(session.deadline);
    expect(restored.result.current.active[0].answers[firstQuestion.id]).toBe(
      firstQuestion.answerIndex,
    );
    act(() => restored.result.current.startTest(test.id));
    expect(restored.result.current.active).toHaveLength(1);
  });
  it("automatically submits once at the deadline and rejects late answers", () => {
    vi.useFakeTimers();
    const { result } = renderHook(useTestProgress);
    act(() => result.current.startTest(test.id));
    const session = result.current.active[0];
    act(() =>
      result.current.answerQuestion(
        session.id,
        firstQuestion.id,
        firstQuestion.answerIndex,
      ),
    );
    act(() => vi.advanceTimersByTime(test.durationMinutes * 60_000));
    expect(result.current.active).toHaveLength(0);
    expect(result.current.results[0]).toMatchObject({
      correct: 1,
      total: test.exerciseIds.length,
      timedOut: true,
      finishedAt: session.deadline,
    });
    act(() =>
      result.current.answerQuestion(session.id, test.exerciseIds[1], 0),
    );
    act(() => result.current.submitTest(session.id));
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.results).toHaveLength(1);
    expect(
      result.current.results[0].answers[test.exerciseIds[1]],
    ).toBeUndefined();
  });
  it("finishes an expired test when the application is reopened", () => {
    vi.useFakeTimers();
    const initial = renderHook(useTestProgress);
    act(() => initial.result.current.startTest(test.id));
    const deadline = initial.result.current.active[0].deadline;
    initial.unmount();
    vi.setSystemTime(deadline + 60_000);
    const restored = renderHook(useTestProgress);
    expect(restored.result.current.active).toHaveLength(0);
    expect(restored.result.current.results[0]).toMatchObject({
      correct: 0,
      timedOut: true,
      finishedAt: deadline,
    });
  });
  it("keeps separate scored attempts when a test is repeated", () => {
    const { result } = renderHook(useTestProgress);
    act(() => result.current.startTest(test.id));
    act(() => result.current.submitTest(result.current.active[0].id));
    act(() => result.current.startTest(test.id));
    const session = result.current.active[0];
    for (const id of test.exerciseIds) {
      act(() =>
        result.current.answerQuestion(
          session.id,
          id,
          exercises.find((exercise) => exercise.id === id)!.answerIndex,
        ),
      );
    }
    act(() => result.current.submitTest(session.id));
    expect(result.current.results).toHaveLength(2);
    expect(result.current.results[0].correct).toBe(0);
    expect(result.current.results[1].correct).toBe(test.exerciseIds.length);
    expect(JSON.parse(localStorage.getItem("six-tests")!).results).toHaveLength(
      2,
    );
  });
});

describe("test cancellation", () => {
  it("discards only the current session and keeps previous results", () => {
    const { result } = renderHook(useTestProgress);
    act(() => result.current.startTest(test.id));
    act(() => result.current.submitTest(result.current.active[0].id));
    act(() => result.current.startTest(test.id));
    const sessionId = result.current.active[0].id;
    act(() => result.current.cancelTest(sessionId));
    expect(result.current.active).toHaveLength(0);
    expect(result.current.results).toHaveLength(1);
    act(() => result.current.submitTest(sessionId));
    expect(result.current.results).toHaveLength(1);
  });
});
