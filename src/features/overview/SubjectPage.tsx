import { useLanguage } from "../../i18n/useLanguage";
import { useState } from "react";
import { ArrowRight, BookOpen, Check, Clock3, Pencil, RotateCcw } from "lucide-react";
import { tests } from "../../content";
import vocabulary from "../../content/englisch/vocabulary.json";
import { useStoredState } from "../../hooks/useStoredState";
import type {
  Lesson,
  Subject,
  TestDefinition,
  TestResult,
  TestSession,
} from "../../types";
import { LessonList } from "../../components/subjects/LessonList";
import { VocabularyQuiz } from "./VocabularyQuiz";
interface Props {
  subject: Subject;
  completed: string[];
  activeTests: TestSession[];
  results: TestResult[];
  onLesson: (lesson: Lesson) => void;
  onTest: (test: TestDefinition) => void;
}
function StatusCheckbox({ label, kind, checked, onChange }: {
  label: string;
  kind: "known" | "learn";
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return <label className={`vocabulary-choice vocabulary-choice-${kind}`}>
    <input type="checkbox" aria-label={label} checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span aria-hidden="true">{kind === "known" ? <Check size={17} strokeWidth={3} /> : <BookOpen size={16} strokeWidth={2.5} />}</span>
  </label>;
}
export function SubjectPage({
  subject,
  completed,
  activeTests,
  results,
  onLesson,
  onTest,
}: Props) {
  const { t, subjectName } = useLanguage();
  const [section, setSection] = useState<"courses" | "vocabulary" | "tests">("courses");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [testCount, setTestCount] = useState(10);
  const [testWords, setTestWords] = useState<{ english: string; german: string }[] | null>(null);
  const [testRun, setTestRun] = useState(0);
  const [groups, setGroups] = useState(vocabulary);
  const [editing, setEditing] = useState<{ category: string; index: number; english: string; german: string } | null>(null);
  const [editError, setEditError] = useState("");
  const allVocabulary = groups.flatMap((item) => item.entries);
  const category = groups.find((item) => item.english === selectedCategory);
  const [wordStatus, setWordStatus] = useStoredState<Record<string, "known" | "learn">>(
    "english-vocabulary-status", {},
    (value) => value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).filter(([, status]) => status === "known" || status === "learn"))
      : {},
  );
  const wordKey = (categoryName: string, english: string) => `${categoryName}:${english}`;
  const setStatus = (key: string, status: "known" | "learn", checked: boolean) => {
    setWordStatus((previous) => {
      const next = { ...previous };
      if (checked) next[key] = status;
      else delete next[key];
      return next;
    });
  };
  const toLearn = groups.flatMap((item) => item.entries
    .filter(({ english }) => wordStatus[wordKey(item.english, english)] === "learn")
    .map((entry) => ({ ...entry, category: item })));
  const resetKnown = (categoryName: string, words: { english: string }[]) => {
    setWordStatus((previous) => {
      const next = { ...previous };
      words.forEach(({ english }) => {
        const key = wordKey(categoryName, english);
        if (next[key] === "known") delete next[key];
      });
      return next;
    });
  };
  const saveWord = async () => {
    if (!editing?.english.trim() || !editing.german.trim()) return;
    setEditError("");
    try {
      const response = await fetch("/api/vocabulary/edit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
      if (!response.ok) throw new Error(await response.text());
      const { entries } = await response.json() as { entries: typeof vocabulary[number]["entries"] };
      const oldEnglish = groups.find((item) => item.english === editing.category)?.entries[editing.index].english;
      setGroups((previous) => previous.map((item) => item.english === editing.category ? { ...item, entries } : item));
      if (oldEnglish && oldEnglish !== editing.english.trim()) {
        setWordStatus((previous) => {
          const next = { ...previous };
          const oldKey = wordKey(editing.category, oldEnglish);
          if (next[oldKey]) { next[wordKey(editing.category, editing.english.trim())] = next[oldKey]; delete next[oldKey]; }
          return next;
        });
      }
      setEditing(null);
    } catch { setEditError(t("Speichern fehlgeschlagen. Starte die App mit npm run dev oder npm run preview.", "Could not save. Run the app with npm run dev or npm run preview.")); }
  };
  return (
    <>
      <h1>{subjectName(subject.id, subject.name)}</h1>
      <p className="intro">{subject.subtitle}</p>
      <div
        className="subject-switch"
        role="group"
        aria-label={t("Bereich auswählen", "Choose section")}
      >
        <button
          type="button"
          aria-pressed={section === "courses"}
          onClick={() => setSection("courses")}
        >
          {t("Kurse", "Courses")}
        </button>
        {subject.id === "englisch" && (
          <button
            type="button"
            aria-pressed={section === "vocabulary"}
            onClick={() => setSection("vocabulary")}
          >
            {t("Vokabeln", "Vocabulary")}
          </button>
        )}
        <button
          type="button"
          aria-pressed={section === "tests"}
          onClick={() => setSection("tests")}
        >
          Tests
        </button>
      </div>
      {section === "courses" ? (
        <section className="subject-section" aria-labelledby="courses-heading">
          <h2 id="courses-heading">{t("Kurse", "Courses")}</h2>
          <p className="intro">
            {t(
              "Lies den Kurs und probiere danach die Übungen aus.",
              "Read the course, then try the exercises.",
            )}
          </p>
          <LessonList
            subject={subject}
            completed={completed}
            onLesson={onLesson}
          />
        </section>
      ) : section === "vocabulary" && subject.id === "englisch" ? (
        <section className="subject-section" aria-label={t("Vokabeln", "Vocabulary")}>
          {selectedCategory && <button type="button" className="vocabulary-back" onClick={() => setSelectedCategory(null)}>
            <span aria-hidden="true">←</span> {t("Alle Kategorien", "All categories")}
          </button>}
          {!selectedCategory && <h2>{t("Vokabeln", "Vocabulary")}</h2>}
          {selectedCategory === "need-to-learn" ? (
            <>
              <h2>{t("Muss ich noch lernen", "Need to learn")} ({toLearn.length})</h2>
              {toLearn.length ? (<>
                <table className="vocabulary-table vocabulary-review-table">
                  <thead><tr><th scope="col">English</th><th scope="col">Deutsch</th><th scope="col">{t("Kategorie", "Category")}</th><th scope="col">{t("Gelernt", "Known")}</th></tr></thead>
                  <tbody>{toLearn.map(({ english, german, category: item }) => (
                    <tr key={wordKey(item.english, english)}>
                      <td><span className="vocabulary-edit-cell">{english}<button type="button" aria-label={`${t("Bearbeiten", "Edit")} ${english}`} onClick={() => { setEditing({ category: item.english, index: item.entries.findIndex((entry) => entry.english === english), english, german }); setEditError(""); }}><Pencil size={14} /></button></span></td><td><span className="vocabulary-edit-cell">{german}<button type="button" aria-label={`${t("Bearbeiten", "Edit")} ${german}`} onClick={() => { setEditing({ category: item.english, index: item.entries.findIndex((entry) => entry.english === english), english, german }); setEditError(""); }}><Pencil size={14} /></button></span></td><td>{t(item.german, item.english)}</td>
                      <td><StatusCheckbox kind="known" label={`${english}: ${t("Gelernt", "Known")}`} checked={false} onChange={() => setStatus(wordKey(item.english, english), "known", true)} /></td>
                    </tr>
                  ))}</tbody>
                </table>
                <VocabularyQuiz key={`learn-${toLearn.map(({ category: item, english }) => wordKey(item.english, english)).join("|")}`} words={toLearn} title={t("Muss ich noch lernen", "Need to learn")} />
              </>) : <p>{t("Noch keine Vokabeln zum Lernen markiert.", "No words marked for learning yet.")}</p>}
            </>
          ) : category ? (
            <>
              <h2>{t(category.german, category.english)}</h2>
              <table className="vocabulary-table vocabulary-category-table">
                <thead><tr><th scope="col">English</th><th scope="col">Deutsch</th><th scope="col">{t("Gelernt", "Known")}</th><th scope="col">{t("Lernen", "Need to learn")}</th></tr></thead>
                <tbody>
                  {category.entries.map(({ english, german }, index) => (
                    <tr key={`${english}-${index}`}><td><span className="vocabulary-edit-cell">{english}<button type="button" aria-label={`${t("Bearbeiten", "Edit")} ${english}`} onClick={() => { setEditing({ category: category.english, index, english, german }); setEditError(""); }}><Pencil size={14} /></button></span></td><td><span className="vocabulary-edit-cell">{german}<button type="button" aria-label={`${t("Bearbeiten", "Edit")} ${german}`} onClick={() => { setEditing({ category: category.english, index, english, german }); setEditError(""); }}><Pencil size={14} /></button></span></td>
                      {(["known", "learn"] as const).map((status) => (
                        <td key={status}><StatusCheckbox
                          kind={status}
                          label={`${english}: ${status === "known" ? t("Gelernt", "Known") : t("Lernen", "Need to learn")}`}
                          checked={wordStatus[wordKey(category.english, english)] === status}
                          onChange={(checked) => setStatus(wordKey(category.english, english), status, checked)}
                        /></td>
                      ))}</tr>
                  ))}
                </tbody>
              </table>
              <VocabularyQuiz key={category.english} words={category.entries} title={t(category.german, category.english)} />
            </>
          ) : (
            <div className="lesson-list">
              <button type="button" className={`lesson-row vocabulary-need-to-learn${toLearn.length === 0 ? " vocabulary-nothing-to-learn" : ""}`} onClick={() => setSelectedCategory("need-to-learn")}>
                <span><strong>{toLearn.length === 0 ? t("Nichts zu lernen", "Nothing to learn") : t("Muss ich noch lernen", "Need to learn")}</strong><small>{toLearn.length} {t("Vokabeln", "words")}</small></span>
                <ArrowRight size={20} />
              </button>
              {groups.map((item) => (
                <div className="lesson-row vocabulary-category-card" key={item.english}>
                <button type="button" className="vocabulary-category-open" onClick={() => setSelectedCategory(item.english)}>
                  <span><strong>{t(item.german, item.english)}</strong><small>{item.entries.length} {t("Vokabeln", "words")}</small></span>
                </button>
                {item.entries.length > 0 && item.entries.every(({ english }) => wordStatus[wordKey(item.english, english)] === "known") && (
                  <span className="vocabulary-category-complete" role="img" aria-label={t("Alle Vokabeln gelernt", "All words known")}><Check size={20} strokeWidth={3} /></span>
                )}
                {item.entries.some(({ english }) => wordStatus[wordKey(item.english, english)] === "known") && (
                  <button type="button" className="vocabulary-category-reset" aria-label={`${t(item.german, item.english)}: ${t("Gelernt zurücksetzen", "Reset known words")}`} title={t("Gelernt zurücksetzen", "Reset known words")} onClick={() => resetKnown(item.english, item.entries)}>
                    <RotateCcw size={18} />
                  </button>
                )}
                <button type="button" className="vocabulary-category-arrow" aria-label={`${t(item.german, item.english)} ${t("öffnen", "open")}`} onClick={() => setSelectedCategory(item.english)}><ArrowRight size={20} /></button>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="subject-section" aria-labelledby="tests-heading">
          <h2 id="tests-heading">Tests</h2>
          <p className="intro">
            {t(
              "Zeig, was du gelernt hast. Deine Ergebnisse begleiten deine Lernreise.",
              "Show what you have learned. Your results help you see your progress.",
            )}
          </p>
          <div className="lesson-list">
            {subject.id === "englisch" && (
              <div className="vocabulary-test-builder">
                <h3>{t("Vokabeltest", "Vocabulary test")}</h3>
                <p>{t("Zufällige Vokabeln aus allen Kategorien.", "Random words from all categories.")}</p>
                <form onSubmit={(event) => {
                  event.preventDefault();
                  const count = Math.max(4, Math.min(allVocabulary.length, Math.floor(testCount || 4)));
                  setTestCount(count);
                  setTestWords([...allVocabulary].sort(() => Math.random() - 0.5).slice(0, count));
                  setTestRun((run) => run + 1);
                }}>
                  <label htmlFor="vocabulary-test-count">{t("Anzahl der Wörter", "Number of words")}</label>
                  <input id="vocabulary-test-count" type="number" min="4" max={allVocabulary.length} required value={testCount} onChange={(event) => setTestCount(Number(event.target.value))} />
                  <button type="submit">{t("Test erstellen", "Create test")}</button>
                </form>
                {testWords && <VocabularyQuiz key={testRun} words={testWords} title={t("Vokabeltest", "Vocabulary test")} />}
              </div>
            )}
            {tests
              .filter((test) => test.subjectId === subject.id)
              .map((test) => {
                const active = activeTests.some(
                  (session) => session.testId === test.id,
                );
                const history = results.filter(
                  (result) => result.testId === test.id,
                );
                const latest = history.at(-1);
                return (
                  <button
                    className="lesson-row"
                    key={test.id}
                    onClick={() => onTest(test)}
                  >
                    <span className={`subject-icon ${subject.color}`}>
                      <Clock3 size={22} />
                    </span>
                    <span>
                      <strong>{test.title}</strong>
                      <small>
                        {test.durationMinutes} {t("Min.", "min")} ·{" "}
                        {test.exerciseIds.length} {t("Fragen", "questions")}
                        {test.isSample
                          ? t(" · Beispieltest", " · Sample test")
                          : ""}
                      </small>
                      {(active || latest) && (
                        <small>
                          {active
                            ? t(
                                "Angefangen – Test fortsetzen",
                                "In progress – continue test",
                              )
                            : t(
                                `Letztes Ergebnis: ${latest!.correct} von ${latest!.total} · ${history.length} Versuche`,
                                `Last result: ${latest!.correct} out of ${latest!.total} · ${history.length} attempts`,
                              )}
                        </small>
                      )}
                    </span>
                    <ArrowRight size={20} />
                  </button>
                );
              })}
          </div>
        </section>
      )}
      {editing && <div className="vocabulary-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
        <div className="vocabulary-dialog" role="dialog" aria-modal="true" aria-labelledby="vocabulary-edit-title">
          <h2 id="vocabulary-edit-title">{t("Vokabel bearbeiten", "Edit word")}</h2>
          <form onSubmit={(event) => { event.preventDefault(); void saveWord(); }}>
            <label>English<input autoFocus required value={editing.english} onChange={(event) => setEditing({ ...editing, english: event.target.value })} /></label>
            <label>Deutsch<input required value={editing.german} onChange={(event) => setEditing({ ...editing, german: event.target.value })} /></label>
            {editError && <p role="alert">{editError}</p>}
            <div className="vocabulary-dialog-actions">
              <button type="button" onClick={() => setEditing(null)}>{t("Abbrechen", "Cancel")}</button>
              <button type="submit">{t("Speichern", "Save")}</button>
            </div>
          </form>
        </div>
      </div>}
    </>
  );
}
