import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import { exercises, lessons, subjects } from "./content";

describe("content integrity", () => {
  it("connects every exercise and lesson to valid content", () => {
    expect(subjects).toHaveLength(5);
    expect(new Set(lessons.map((l) => l.id)).size).toBe(lessons.length);
    expect(new Set(exercises.map((e) => e.id)).size).toBe(exercises.length);
    for (const subject of subjects)
      expect(
        lessons.filter((l) => l.subjectId === subject.id).length,
      ).toBeGreaterThanOrEqual(2);
    for (const lesson of lessons) {
      expect(subjects.some((s) => s.id === lesson.subjectId)).toBe(true);
      expect(lesson.sections.length).toBeGreaterThan(0);
      expect(exercises.some((e) => e.lessonId === lesson.id)).toBe(true);
    }
    for (const exercise of exercises) {
      expect(lessons.some((l) => l.id === exercise.lessonId)).toBe(true);
      expect(exercise.answerIndex).toBeGreaterThanOrEqual(0);
      expect(exercise.answerIndex).toBeLessThan(exercise.options.length);
      expect(new Set(exercise.options).size).toBe(exercise.options.length);
    }
  });
});
describe("learning journey", () => {
  it("navigates to a lesson, retries a mistake and saves a correct answer once", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      within(screen.getByRole("navigation", { name: "Fächer" })).getByRole(
        "button",
        { name: "Mathematik" },
      ),
    );
    await user.click(
      screen.getByRole("button", { name: /Stellenwerte entdecken/ }),
    );
    await user.click(
      screen.getByRole("button", { name: /Jetzt ausprobieren/ }),
    );
    expect(
      screen.getByRole("button", { name: /Antwort prüfen/ }),
    ).toBeDisabled();
    await user.click(screen.getByLabelText("70"));
    await user.click(screen.getByRole("button", { name: /Antwort prüfen/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Du lernst dazu");
    expect(JSON.parse(localStorage.getItem("six-completed")!)).toEqual([]);
    await user.click(
      screen.getByRole("button", { name: /Noch einmal probieren/ }),
    );
    await user.click(screen.getByLabelText("700"));
    await user.click(screen.getByRole("button", { name: /Antwort prüfen/ }));
    expect(screen.getByRole("status")).toHaveTextContent("Super gemacht");
    expect(JSON.parse(localStorage.getItem("six-completed")!)).toEqual([
      "mathematik-1-exercise",
    ]);
    expect(
      JSON.parse(localStorage.getItem("six-course-history")!).map(
        (attempt: { correct: boolean }) => attempt.correct,
      ),
    ).toEqual([false, true]);
    await user.click(screen.getByRole("button", { name: /Weiterlernen/ }));
    await user.click(
      screen.getByRole("button", { name: /Stellenwerte entdecken/ }),
    );
    await user.click(
      screen.getByRole("button", { name: /Jetzt ausprobieren/ }),
    );
    await user.click(screen.getByLabelText("700"));
    await user.click(screen.getByRole("button", { name: /Antwort prüfen/ }));
    expect(JSON.parse(localStorage.getItem("six-completed")!)).toHaveLength(1);
  });
  it("persists dark mode", async () => {
    render(<App />);
    await userEvent.click(
      screen.getByRole("button", { name: "Dunklen Modus aktivieren" }),
    );
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("six-theme")).toBe("true");
  });
  it("recovers from malformed stored progress", () => {
    localStorage.setItem("six-completed", "{broken");
    render(<App />);
    expect(screen.getByText("0 Lernsterne")).toBeInTheDocument();
  });
});

describe("text size preference", () => {
  it("offers exactly three sizes, enforces limits and restores the choice", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const smaller = screen.getByRole("button", { name: "Schrift verkleinern" });
    const larger = screen.getByRole("button", { name: "Schrift vergrößern" });
    expect(smaller).toBeDisabled();
    await user.click(larger);
    expect(document.documentElement.dataset.fontSize).toBe("1");
    expect(screen.getByText("Groß", { exact: true })).toBeInTheDocument();
    await user.click(larger);
    expect(larger).toBeDisabled();
    expect(document.documentElement.dataset.fontSize).toBe("2");
    expect(localStorage.getItem("six-font-size")).toBe("2");
    unmount();
    render(<App />);
    expect(screen.getByText("Sehr groß")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Schrift verkleinern" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Schrift verkleinern" }),
    );
    expect(
      screen.getByRole("button", { name: "Schrift verkleinern" }),
    ).toBeDisabled();
    expect(document.documentElement.dataset.fontSize).toBe("0");
  });
  it("uses the default for an invalid saved size", () => {
    localStorage.setItem("six-font-size", "99");
    render(<App />);
    expect(screen.getByText("Normal", { exact: true })).toBeInTheDocument();
  });
});

describe("page navigation", () => {
  it("opens every subject and returns home through the sidebar", async () => {
    const user = userEvent.setup();
    render(<App />);
    const navigation = within(
      screen.getByRole("navigation", { name: "Fächer" }),
    );
    for (const subject of subjects) {
      await user.click(navigation.getByRole("button", { name: subject.name }));
      expect(
        screen.getByRole("heading", {
          name: subject.id === "englisch" ? "English" : subject.name,
        }),
      ).toBeInTheDocument();
      const firstLesson = lessons.find(
        (lesson) => lesson.subjectId === subject.id,
      )!;
      await user.click(
        screen.getByRole("button", { name: new RegExp(firstLesson.title) }),
      );
      expect(
        screen.getByRole("heading", { name: firstLesson.title }),
      ).toBeInTheDocument();
      await user.click(
        screen.getByRole("button", {
          name:
            subject.id === "englisch"
              ? "Back to overview"
              : "Zurück zur Übersicht",
        }),
      );
      expect(
        screen.getByRole("heading", {
          name: subject.id === "englisch" ? "English" : subject.name,
        }),
      ).toBeInTheDocument();
      await user.click(
        screen.getByRole("button", { name: /six seeeven (Startseite|home)/ }),
      );
    }
    await user.click(screen.getByRole("button", { name: /Meine Erfolge/ }));
    expect(
      screen.getByRole("heading", { name: /Schau, was du schon kannst/ }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Mathematik.*Übungen geschafft/ }),
    );
    expect(
      screen.getByRole("heading", { name: "Mathematik" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "six seeeven Startseite" }),
    );
    expect(
      screen.getByRole("heading", { name: /Hey, schön/ }),
    ).toBeInTheDocument();
  });
});

describe("subject courses and tests", () => {
  it("shows dated courses, completes a test and displays its result history", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      within(screen.getByRole("navigation", { name: "Fächer" })).getByRole(
        "button",
        { name: "Mathematik" },
      ),
    );
    expect(screen.getByRole("heading", { name: "Kurse" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Tests" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("09.11.2026")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Tests" }));
    expect(
      screen.queryByRole("heading", { name: "Kurse" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Mein erster Wissenscheck/ }),
    );
    await user.click(screen.getByRole("button", { name: "Test starten" }));
    expect(screen.getByRole("timer")).toHaveTextContent("5:00");
    await user.click(screen.getByLabelText("700"));
    await user.click(screen.getByRole("button", { name: "Test abgeben" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 von 2 richtig · 50 %",
    );
    await user.click(screen.getByRole("button", { name: /Meine Erfolge/ }));
    expect(screen.getByRole("table")).toHaveTextContent("50 %");
    expect(screen.getByRole("table")).toHaveTextContent("Erster Versuch");
  });
});

afterEach(() => vi.restoreAllMocks());
describe("focused tests", () => {
  it("hides navigation, warns before leaving, confirms cancellation and removes the guard afterwards", async () => {
    const user = userEvent.setup();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<App />);
    await user.click(
      within(screen.getByRole("navigation", { name: "Fächer" })).getByRole(
        "button",
        { name: "Mathematik" },
      ),
    );
    await user.click(screen.getByRole("button", { name: "Tests" }));
    expect(
      screen.queryByRole("heading", { name: "Kurse" }),
    ).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Mein erster Wissenscheck/ }),
    );
    await user.click(screen.getByRole("button", { name: "Test starten" }));
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Zurück zum Fach" }),
    ).not.toBeInTheDocument();
    const activeWarning = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(activeWarning);
    expect(activeWarning.defaultPrevented).toBe(true);
    await user.click(screen.getByRole("button", { name: "Test abbrechen" }));
    expect(confirm).toHaveBeenCalled();
    expect(screen.getByRole("timer")).toBeInTheDocument();
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole("button", { name: "Test abbrechen" }));
    expect(
      screen.getByRole("heading", { name: "Mathematik" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Fächer" }),
    ).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("six-tests")!).active).toHaveLength(
      0,
    );
    expect(JSON.parse(localStorage.getItem("six-tests")!).results).toHaveLength(
      0,
    );
    const inactiveWarning = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(inactiveWarning);
    expect(inactiveWarning.defaultPrevented).toBe(false);
  });
});

describe("English subject language", () => {
  it("uses English for courses, feedback, fullscreen tests and results, then restores German", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      within(screen.getByRole("navigation", { name: "Fächer" })).getByRole(
        "button",
        { name: "Englisch" },
      ),
    );
    expect(document.documentElement.lang).toBe("en");
    expect(
      screen.getByRole("heading", { name: "English" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Courses" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Subjects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Increase text size" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Hello, new friends!/ }),
    );
    await user.click(screen.getByRole("button", { name: "Try it now" }));
    await user.click(screen.getByLabelText("My name is Tom."));
    await user.click(screen.getByRole("button", { name: "Check answer" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Great job! That is correct.",
    );
    await user.click(screen.getByRole("button", { name: "Keep learning" }));
    await user.click(screen.getByRole("button", { name: "Tests" }));
    await user.click(
      screen.getByRole("button", { name: /My first knowledge check/ }),
    );
    await user.click(screen.getByRole("button", { name: "Start test" }));
    expect(document.documentElement.lang).toBe("en");
    expect(
      screen.getByRole("button", { name: "Cancel test" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("timer", { name: "Time remaining" }),
    ).toBeInTheDocument();
    await user.click(screen.getByLabelText("My name is Tom."));
    await user.click(screen.getByLabelText("4"));
    await user.click(screen.getByRole("button", { name: "Submit test" }));
    expect(screen.getByRole("status")).toHaveTextContent("2 out of 2 correct");
    expect(
      screen.getByRole("heading", { name: "Your answers" }),
    ).toBeInTheDocument();
    await user.click(
      within(screen.getByRole("navigation", { name: "Subjects" })).getByRole(
        "button",
        { name: "Mathematics" },
      ),
    );
    expect(document.documentElement.lang).toBe("de");
    expect(
      screen.getByRole("heading", { name: "Mathematik" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Kurse" })).toBeInTheDocument();
  });
});
