import { useState } from "react";

type Word = { english: string; german: string };
type Direction = "english" | "german";

function makeQuestion(words: Word[], index: number, direction: Direction) {
  const answerSide = direction === "english" ? "german" : "english";
  const answer = words[index][answerSide];
  const alternatives = Array.from(
    new Set(words.map((word) => word[answerSide])),
  )
    .filter((value) => value !== answer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  return [answer, ...alternatives].sort(() => Math.random() - 0.5);
}

export function VocabularyQuiz({
  words,
  title,
}: {
  words: Word[];
  title: string;
}) {
  const [direction, setDirection] = useState<Direction>("english");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [options, setOptions] = useState<string[]>(() =>
    words.length ? makeQuestion(words, 0, "english") : [],
  );
  const [started, setStarted] = useState(false);
  const answerSide = direction === "english" ? "german" : "english";
  const canTest = new Set(words.map((word) => word[answerSide])).size >= 4;

  const start = (nextDirection: Direction) => {
    setDirection(nextDirection);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setOptions(words.length ? makeQuestion(words, 0, nextDirection) : []);
    setStarted(true);
  };
  const next = () => {
    const nextIndex = index + 1;
    setIndex(nextIndex);
    setSelected(null);
    if (nextIndex < words.length)
      setOptions(makeQuestion(words, nextIndex, direction));
  };

  return (
    <section className="vocabulary-quiz" aria-label={`${title} quiz`}>
      <h3>Test: {title}</h3>
      <div className="vocabulary-quiz-directions">
        <button
          type="button"
          aria-pressed={direction === "english"}
          onClick={() => start("english")}
        >
          English → Deutsch
        </button>
        <button
          type="button"
          aria-pressed={direction === "german"}
          onClick={() => start("german")}
        >
          Deutsch → English
        </button>
      </div>
      {!canTest ? (
        <p>
          Mark at least four words to start this test. / Markiere mindestens
          vier Wörter für diesen Test.
        </p>
      ) : !started ? (
        <button type="button" onClick={() => start(direction)}>
          Start test
        </button>
      ) : index >= words.length ? (
        <div>
          <p>
            Result / Ergebnis: {score} / {words.length}
          </p>
          <button type="button" onClick={() => start(direction)}>
            Try again / Nochmal
          </button>
        </div>
      ) : (
        <div>
          <p>
            {index + 1} / {words.length}
          </p>
          <h4>{words[index][direction]}</h4>
          <div className="vocabulary-quiz-options">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                disabled={selected !== null}
                className={
                  selected !== null
                    ? option === words[index][answerSide]
                      ? "correct"
                      : option === selected
                        ? "incorrect"
                        : ""
                    : ""
                }
                onClick={() => {
                  setSelected(option);
                  if (option === words[index][answerSide])
                    setScore((value) => value + 1);
                }}
              >
                {option}
              </button>
            ))}
          </div>
          {selected !== null && (
            <button type="button" onClick={next}>
              {index + 1 === words.length
                ? "Show result / Ergebnis"
                : "Next / Weiter"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
