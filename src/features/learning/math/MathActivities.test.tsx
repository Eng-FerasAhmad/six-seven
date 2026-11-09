import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { lessons } from "../../../content";
import { PlaceValueLesson } from "./PlaceValueLesson";
import { AdditionLesson } from "./AdditionLesson";

describe("interactive maths", () => {
  it("updates place values, handles zero and checks a number-building task", async () => {
    const activity = lessons.find(
      (lesson) => lesson.id === "mathematik-1",
    )!.activity!;
    if (activity.kind !== "place-value")
      throw new Error("Expected place-value activity");
    const user = userEvent.setup();
    render(<PlaceValueLesson activity={activity} />);
    expect(screen.getByLabelText("Deine Zahl")).toHaveTextContent("3.452");
    await user.click(screen.getByRole("button", { name: "Hunderter erhöhen" }));
    expect(screen.getByLabelText("Deine Zahl")).toHaveTextContent("3.552");
    expect(screen.getByText("5 Hunderter = 500")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Baue 4.020" }));
    expect(
      screen.getByRole("button", { name: "Hunderter verringern" }),
    ).toBeDisabled();
    await user.click(
      screen.getByRole("button", { name: "Hunderter: 0, Wert 0" }),
    );
    expect(
      screen.getByText(
        "An dieser Stelle steht eine 0. Sie hält den Platz frei.",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Zahl prüfen" }));
    expect(
      screen.getByRole("status", { name: "Rückmeldung" }),
    ).toHaveTextContent("Gesucht ist 4.020");
    for (let i = 0; i < 4; i++)
      await user.click(
        screen.getByRole("button", { name: "Tausender erhöhen" }),
      );
    for (let i = 0; i < 2; i++)
      await user.click(screen.getByRole("button", { name: "Zehner erhöhen" }));
    await user.click(screen.getByRole("button", { name: "Zahl prüfen" }));
    expect(
      screen.getByRole("status", { name: "Rückmeldung" }),
    ).toHaveTextContent("4.020 – richtig gebaut!");
    await user.click(screen.getByRole("button", { name: "Zahl zurücksetzen" }));
    expect(screen.getByLabelText("Deine Zahl")).toHaveTextContent("3.452");
    expect(
      screen.queryByRole("status", { name: "Rückmeldung" }),
    ).not.toBeInTheDocument();
  });
  it("keeps digits within zero to nine", async () => {
    const activity = lessons.find(
      (lesson) => lesson.id === "mathematik-1",
    )!.activity!;
    if (activity.kind !== "place-value")
      throw new Error("Expected place-value activity");
    const user = userEvent.setup();
    render(<PlaceValueLesson activity={activity} />);
    for (let i = 0; i < 7; i++)
      await user.click(screen.getByRole("button", { name: "Einer erhöhen" }));
    expect(
      screen.getByRole("button", { name: "Einer erhöhen" }),
    ).toBeDisabled();
    expect(screen.getByLabelText("Deine Zahl")).toHaveTextContent("3.459");
  });
  it("shows addition via tens and recalculates the number line", async () => {
    const activity = lessons.find(
      (lesson) => lesson.id === "mathematik-2",
    )!.activity!;
    if (activity.kind !== "addition")
      throw new Error("Expected addition activity");
    render(<AdditionLesson activity={activity} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "27 plus 13 ergibt 40. Erster Sprung 3, zweiter Sprung 10.",
    );
    fireEvent.change(screen.getByRole("slider", { name: /Erste Zahl/ }), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByRole("slider", { name: /Zweite Zahl/ }), {
      target: { value: "30" },
    });
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "50 plus 30 ergibt 80. Erster Sprung 0, zweiter Sprung 30.",
    );
    await userEvent.click(screen.getByRole("button", { name: "16 + 7" }));
    expect(screen.getByRole("img")).toHaveAccessibleName(
      "16 plus 7 ergibt 23. Erster Sprung 4, zweiter Sprung 3.",
    );
  });
});
