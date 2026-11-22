import { grammarDetails } from "./grammarDetails";
import { grammarQuestions } from "./grammarQuiz";
import { useState } from "react";
import { ArrowRight, CircleCheck, CircleX } from "lucide-react";

const units = [
  [
    "Nouns in the singular and plural",
    "160",
    "A singular noun names one person or thing. A plural noun names more than one. Usually add -s: dog → dogs. The ending sounds [s], [z], or [ɪz]. Exceptions: family → families; mouse → mice.",
    "Plural of house?",
    "houses",
  ],
  [
    "Personal pronouns and forms of be",
    "161–162",
    "I am, you are, he/she/it is, we/you/they are. Short forms: I’m, you’re, he’s, she’s, it’s, we’re, they’re. Always capitalize I.",
    "Complete: She ___ eleven.",
    "is",
  ],
  [
    "Negative forms of be",
    "162",
    "Put not after be: I’m not, you aren’t, he/she/it isn’t, we/you/they aren’t. There is no amn’t.",
    "Complete: We ___ from London. (negative)",
    "aren't",
  ],
  [
    "Yes/No questions and short answers with be",
    "163",
    "Swap subject and be: Luke is from Greenwich → Is Luke from Greenwich? Answer: Yes, he is. / No, he isn’t.",
    "Question: Luke is from Greenwich.",
    "Is Luke from Greenwich?",
  ],
  [
    "Questions with question words",
    "164",
    "Who asks about a person; what about a thing; where about a place; when about a time. How old asks age. Short forms: where’s, who’s, what’s, how’s.",
    "Which word asks about a place?",
    "where",
  ],
  [
    "Possessive determiners",
    "165",
    "I → my; you → your; he → his; she → her; it → its; we → our; they → their. Put them before nouns. Your differs from you’re; its differs from it’s.",
    "Complete: She has a dog. It is ___ dog.",
    "her",
  ],
  [
    "There is and there are",
    "166",
    "Use there is for one thing and there are for more than one. Ask Is there...? or Are there...? Answer Yes, there is/are or No, there isn’t/aren’t.",
    "Complete: ___ two mice under the chair.",
    "There are",
  ],
  [
    "The indefinite article",
    "166–167",
    "Use a before a consonant sound and an before a vowel sound. Sound, rather than spelling, decides: a uniform; an uncle.",
    "Complete: ___ idea",
    "an",
  ],
  [
    "The definite article",
    "167",
    "Use the for something already known, in singular and plural. Pronounce it [ðə] before consonant sounds and [ði] before vowel sounds.",
    "Complete: ___ dog (definite article)",
    "the",
  ],
  [
    "Possession with have got",
    "167–168",
    "I/you/we/they have got; he/she/it has got. Short forms include I’ve got, you’ve got, he’s got, she’s got, we’ve got and they’ve got.",
    "Complete: She ___ two guinea pigs.",
    "has got",
  ],
  [
    "The negative form of have got",
    "168",
    "Put not between have or has and got: I/you/we/they haven’t got; he/she/it hasn’t got.",
    "Complete: Holly ___ her lucky charm.",
    "hasn't got",
  ],
] as const;

export const g1Questions = [
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
  {
    prompt: "What is the plural of mouse?",
    options: ["mouses", "mice", "mouse"],
    answer: "mice",
  },
  {
    prompt: "Which word is singular?",
    options: ["doors", "boys", "photo"],
    answer: "photo",
  },
  {
    prompt: "Which word is plural?",
    options: ["bed", "trees", "park"],
    answer: "trees",
  },
  {
    prompt: "How does the plural ending sound in parks?",
    options: ["[s]", "[z]", "[ɪz]"],
    answer: "[s]",
  },
  {
    prompt: "How does the plural ending sound in boys?",
    options: ["[s]", "[z]", "[ɪz]"],
    answer: "[z]",
  },
  {
    prompt: "How does the plural ending sound in fridges?",
    options: ["[s]", "[z]", "[ɪz]"],
    answer: "[ɪz]",
  },
  {
    prompt: "What is the plural of hobby?",
    options: ["hobbys", "hobbies", "hobbyes"],
    answer: "hobbies",
  },
];
export function GrammarQuiz({
  title,
  questions,
  onClose,
}: {
  title: string;
  questions: { prompt: string; options: readonly string[]; answer: string }[];
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const finished = step === questions.length;
  const question = questions[step];
  const typed = step % 2 === 1;
  const normalize = (text: string) =>
    text
      .trim()
      .toLowerCase()
      .replace(/[’]/g, "'")
      .replace(/[.!?]$/, "")
      .replace(/\s+/g, " ");
  const right = !finished && normalize(value) === normalize(question.answer);
  const check = () => {
    if (!value.trim()) return;
    if (right) setScore(score + 1);
    setChecked(true);
  };
  const next = () => {
    setStep(step + 1);
    setValue("");
    setChecked(false);
  };
  return (
    <div
      className="grammar-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="grammar-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="grammar-quiz-title"
      >
        <div className="grammar-dialog-header">
          <h2 id="grammar-quiz-title">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close test">
            ×
          </button>
        </div>
        {finished ? (
          <div className="grammar-quiz-finish" role="status">
            <div
              className="grammar-result-score"
              style={
                {
                  "--score": `${(score / questions.length) * 100}%`,
                } as React.CSSProperties
              }
            >
              <strong>{score}</strong>
              <span>of {questions.length}</span>
            </div>
            <div className="grammar-result-copy">
              <h3>Test complete!</h3>
              <p>
                You answered {score} of {questions.length} questions correctly.
              </p>
              <button type="button" onClick={onClose}>
                Back to grammar
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="grammar-quiz-progress">
              Question {step + 1} of {questions.length} ·{" "}
              {typed ? "Write your answer" : "Choose an answer"}
            </p>
            <div className="grammar-quiz-track">
              <span style={{ width: `${(step / questions.length) * 100}%` }} />
            </div>
            <h3 className="grammar-quiz-question">{question.prompt}</h3>
            {typed ? (
              <input
                className="grammar-quiz-input"
                value={value}
                disabled={checked}
                onChange={(event) => setValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !checked) check();
                }}
                placeholder="Type your answer"
                aria-label="Your answer"
                autoFocus
              />
            ) : (
              <div className="grammar-quiz-choices">
                {question.options.map((option) => (
                  <label
                    key={option}
                    className={`grammar-quiz-choice${value === option ? " selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`question-${step}`}
                      value={option}
                      checked={value === option}
                      disabled={checked}
                      onChange={() => setValue(option)}
                    />
                    <span className="grammar-radio" aria-hidden="true" />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
            {checked && (
              <div
                className={`grammar-feedback ${right ? "correct" : "incorrect"}`}
                role="status"
              >
                {right ? (
                  <>
                    <CircleCheck size={20} aria-hidden="true" /> Correct!
                  </>
                ) : (
                  <>
                    <CircleX size={20} aria-hidden="true" /> Not quite. Correct
                    answer: {question.answer}
                  </>
                )}
              </div>
            )}
            <div className="grammar-quiz-actions">
              {checked ? (
                <button type="button" onClick={next}>
                  {step === questions.length - 1
                    ? "See results"
                    : "Next question →"}
                </button>
              ) : (
                <button type="button" onClick={check} disabled={!value.trim()}>
                  Check answer
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function G1Lesson() {
  const [open, setOpen] = useState(false);
  return (
    <div className="grammar-g1">
      <div className="grammar-function">
        <span className="grammar-kicker">FUNCTION</span>
        <div>
          <p>
            Use the <strong>singular</strong> for one person or thing:{" "}
            <em>a boy, a photo.</em>
          </p>
          <p>
            Use the <strong>plural</strong> for more than one:{" "}
            <em>two boys, three doors.</em>
          </p>
        </div>
      </div>
      <div className="grammar-rule">
        <span className="grammar-kicker">RULE</span>
        <div>
          <p>
            For most English nouns, add <strong>-s</strong> to form the plural:{" "}
            <em>a dog → two dogs.</em>
          </p>
          <p>
            The sound of the ending depends on the final sound of the singular
            noun:
          </p>
        </div>
      </div>
      <div className="grammar-sound-grid">
        <div>
          <h4>[s]</h4>
          <p>After voiceless consonants</p>
          <ul>
            <li>park → parks</li>
            <li>flat → flats</li>
            <li>biscuit → biscuits</li>
          </ul>
        </div>
        <div>
          <h4>[z]</h4>
          <p>After voiced consonants and vowels</p>
          <ul>
            <li>boy → boys</li>
            <li>bed → beds</li>
            <li>tree → trees</li>
          </ul>
        </div>
        <div>
          <h4>[ɪz]</h4>
          <p>After sibilant sounds</p>
          <ul>
            <li>house → houses</li>
            <li>sentence → sentences</li>
            <li>fridge → fridges</li>
          </ul>
        </div>
      </div>
      <div className="grammar-exception">
        <strong>Watch out:</strong> Some plurals change their spelling: family →
        families, hobby → hobbies. An irregular plural is mouse → mice.
      </div>
      <button
        type="button"
        className="grammar-test-open"
        onClick={() => {
          setOpen(true);
        }}
      >
        Start G1 test · 10 questions
      </button>
      {open && (
        <GrammarQuiz
          title="G1 · Singular and plural test"
          questions={g1Questions}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function GrammarLesson({ index }: { index: number }) {
  const [open, setOpen] = useState(false);
  const questions = grammarQuestions[index];
  const [, , note] = units[index];
  const details = grammarDetails[index];
  return (
    <div className="grammar-g1">
      <div className="grammar-function">
        <span className="grammar-kicker">FUNCTION</span>
        <div>
          <p>{details.function}</p>
        </div>
      </div>
      <div className="grammar-rule">
        <span className="grammar-kicker">RULE</span>
        <div>
          <p>{note}</p>
        </div>
      </div>
      <div className="grammar-sound-grid">
        {details.columns.map((column) => (
          <div key={column.heading}>
            <h4>{column.heading}</h4>
            <ul>
              {column.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="grammar-exception">
        <strong>Remember: </strong>
        {details.tip}
      </div>
      <button
        type="button"
        className="grammar-test-open"
        onClick={() => {
          setOpen(true);
        }}
      >
        Start G{index + 1} test · 10 questions
      </button>
      {open && (
        <GrammarQuiz
          title={`G${index + 1} · ${units[index][0]} test`}
          questions={questions}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

export function GrammarPage() {
  const [selected, setSelected] = useState<number | null>(null);
  return (
    <section className="subject-section" aria-label={"Grammar"}>
      {selected === null ? (
        <>
          <h2>English Grammar</h2>
          <div className="lesson-list">
            {units.map(([title, page], i) => (
              <button
                className="lesson-row"
                key={title}
                onClick={() => setSelected(i)}
              >
                <span className="subject-icon orange">G{i + 1}</span>
                <span>
                  <strong>{title}</strong>
                  <small>Grammar · {page}</small>
                </span>
                <ArrowRight size={20} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <article>
          <button
            className="vocabulary-back"
            type="button"
            onClick={() => setSelected(null)}
          >
            ← All grammar topics
          </button>
          <h2>G{selected + 1}</h2>
          <p className="intro">{units[selected][0]}</p>
          {selected === 0 ? (
            <G1Lesson />
          ) : (
            <GrammarLesson key={selected} index={selected} />
          )}
        </article>
      )}
    </section>
  );
}
