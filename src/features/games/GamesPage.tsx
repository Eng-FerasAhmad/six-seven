import { useMemo, useState } from "react";
import { readStoredRaw, writeStoredRaw } from "../../utils/browserStorage";
import {
  ArrowLeft,
  Sparkles,
  CarFront,
  Plane,
  Rocket,
  Waves,
  Crosshair,
  Map,
} from "lucide-react";
import { exercises, lessons, subjects } from "../../content";
import vocabulary from "../../content/englisch/vocabulary.json";
import { useLanguage } from "../../i18n/useLanguage";
import type { Exercise, SubjectId } from "../../types";
import { ArcadeGame } from "./ArcadeGame";
import { SpaceDefense } from "./SpaceDefense";
import { TreasureMaze } from "./TreasureMaze";
import { extraQuestions, generatedArcadeQuestions } from "./extraQuestions";
import "./games.css";

type Mode = "drive" | "flight" | "space" | "sea" | "alien" | "maze";
type RecordEntry = { cleared: number; score: number; level?: number };
const storageKey = "six-seeeven-arcade-records";
const TOTAL_LEVELS = 10;
function LevelTrack({
  completed,
  t,
}: {
  completed: number;
  t: (de: string, en: string) => string;
}) {
  const done = Math.min(TOTAL_LEVELS, Math.max(0, completed));
  return (
    <div
      className="game-level-track"
      aria-label={t(
        `Level: ${done} von ${TOTAL_LEVELS} geschafft`,
        `Levels: ${done} of ${TOTAL_LEVELS} completed`,
      )}
    >
      <div className="game-level-track-header">
        <strong>{t("Deine Level", "Your levels")}</strong>
        <span>
          {done} / {TOTAL_LEVELS} {t("geschafft", "completed")}
        </span>
      </div>
      <div className="game-level-track-list">
        {Array.from({ length: TOTAL_LEVELS }, (_, index) => {
          const level = index + 1;
          const status =
            level <= done
              ? "completed"
              : level === done + 1
                ? "current"
                : "locked";
          return (
            <div
              key={level}
              className={`game-level-item ${status}`}
              title={
                status === "completed"
                  ? t("Geschafft", "Completed")
                  : status === "current"
                    ? t("Jetzt spielen", "Play now")
                    : t("Gesperrt", "Locked")
              }
            >
              <span>
                {status === "completed"
                  ? "✓"
                  : status === "locked"
                    ? "🔒"
                    : level}
              </span>
              <small>
                {t("Level", "Level")} {level}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}
function loadRecords(): Record<string, RecordEntry> {
  try {
    return JSON.parse(readStoredRaw(storageKey) || "{}");
  } catch {
    return {};
  }
}
const vocabularyEntries = vocabulary.flatMap((group) =>
  group.entries.map((entry) => ({ ...entry, topic: group.english })),
);
const rankedVocabulary = vocabularyEntries.slice().sort((a, b) => {
  const difficulty = (entry: typeof a) =>
    entry.english.split(/\s+/).length * 12 +
    entry.english.length +
    entry.german.length * 0.2;
  return difficulty(a) - difficulty(b);
});
const englishQuestions: Exercise[] = rankedVocabulary.map((entry, index) => {
  const close = vocabularyEntries.filter(
    (candidate) =>
      candidate.english !== entry.english && candidate.topic === entry.topic,
  );
  const distant = vocabularyEntries.filter(
    (candidate) =>
      candidate.english !== entry.english && candidate.topic !== entry.topic,
  );
  const pool =
    index < rankedVocabulary.length / 3
      ? distant
      : close.length >= 3
        ? close
        : distant;
  const distractors = pool
    .slice()
    .sort(
      (a, b) =>
        Math.abs(a.english.length - entry.english.length) -
        Math.abs(b.english.length - entry.english.length),
    )
    .slice(
      index < rankedVocabulary.length / 3 ? -3 : 0,
      index < rankedVocabulary.length / 3 ? undefined : 3,
    )
    .map((candidate) => candidate.english);
  const options = [entry.english, ...distractors];
  const answerIndex = index % options.length;
  [options[0], options[answerIndex]] = [options[answerIndex], options[0]];
  return {
    id: `vocab-${index}`,
    lessonId: "englisch-vocabulary",
    question: `What is "${entry.german}" in English?`,
    options,
    answerIndex,
    explanation: `${entry.german} = ${entry.english}`,
  };
});
function questionDifficulty(question: Exercise) {
  if (question.id.startsWith("arcade-deutsch-noun-"))
    return 100 + Number(question.id.split("-").at(-1));
  if (question.id.startsWith("arcade-deutsch-verb-"))
    return 120 + Number(question.id.split("-").at(-1));
  if (question.id.startsWith("arcade-math-add-"))
    return 100 + Number(question.id.split("-").at(-1));
  if (
    question.id.startsWith("arcade-deutsch-") ||
    question.id.startsWith("arcade-mathematik-")
  )
    return Number(question.id.split("-").at(-1)) * 10;
  const answer = question.options[question.answerIndex] ?? "";
  return (
    answer.split(/\s+/).length * 12 +
    answer.length +
    question.question.length * 0.15
  );
}
export function GamesPage() {
  const { t, subjectName } = useLanguage();
  const [subjectId, setSubjectId] = useState<SubjectId | null>(null);
  const [mode, setMode] = useState<Mode | null>(null);
  const [records, setRecords] = useState(loadRecords);
  function saveRecord(cleared: number, score: number) {
    if (!subjectId || !mode) return;
    const key = `${subjectId}-${mode}`;
    setRecords((current) => {
      const previous = current[key] || { cleared: 0, score: 0 };
      const next = {
        ...current,
        [key]: {
          ...previous,
          cleared: Math.max(previous.cleared, cleared),
          score: Math.max(previous.score, score),
        },
      };
      writeStoredRaw(storageKey, JSON.stringify(next));
      return next;
    });
  }
  function saveLevel(level: number, score: number) {
    if (!subjectId || !mode) return;
    const key = `${subjectId}-${mode}`;
    setRecords((current) => {
      const previous = current[key] || { cleared: 0, score: 0, level: 0 };
      const next = {
        ...current,
        [key]: {
          ...previous,
          level: Math.max(previous.level || 0, level),
          score: Math.max(previous.score, score),
        },
      };
      writeStoredRaw(storageKey, JSON.stringify(next));
      return next;
    });
  }
  const questions = useMemo(
    () =>
      (subjectId === "englisch"
        ? englishQuestions
        : subjectId
          ? lessons
              .filter((lesson) => lesson.subjectId === subjectId)
              .flatMap((lesson) =>
                exercises.filter(
                  (exercise) =>
                    exercise.lessonId === lesson.id &&
                    exercise.options.length >= 2 &&
                    exercise.options.length <= 4,
                ),
              )
              .concat(
                extraQuestions[subjectId] || [],
                generatedArcadeQuestions[subjectId] || [],
              )
          : []
      )
        .slice()
        .sort((a, b) =>
          subjectId === "englisch"
            ? 0
            : questionDifficulty(a) - questionDifficulty(b),
        )
        .filter(
          (question, index, all) =>
            all.findIndex(
              (candidate) => candidate.question === question.question,
            ) === index,
        ),
    [subjectId],
  );
  return (
    <section className="games-page">
      <div className="games-hero">
        <Sparkles size={32} />
        <div>
          <h1>{t("Lernabenteuer", "Learning arcade")}</h1>
          <p>
            {t(
              "Spiele, sammle Punkte und verdiene Power-ups mit Kursfragen.",
              "Play, score points, and earn power-ups with course questions.",
            )}
          </p>
        </div>
      </div>
      {!subjectId ? (
        <>
          <h2>{t("Wähle dein Fach", "Choose your subject")}</h2>
          <div className="games-subjects">
            {subjects.map((subject) => (
              <button key={subject.id} onClick={() => setSubjectId(subject.id)}>
                <span>🎮</span>
                <strong>{subjectName(subject.id, subject.name)}</strong>
                <small>{t("Spiele ansehen", "See games")} →</small>
              </button>
            ))}
          </div>
        </>
      ) : !mode ? (
        <>
          <button className="games-back" onClick={() => setSubjectId(null)}>
            <ArrowLeft size={18} /> {t("Fach wechseln", "Change subject")}
          </button>
          <h2>{t("Wähle dein Spiel", "Choose your game")}</h2>
          <div className="games-subjects games-list">
            {(
              [
                {
                  id: "drive",
                  icon: "🏎️",
                  de: "Straßenrennen",
                  en: "Road Run",
                  descriptionDe: "Verkehr ausweichen",
                  descriptionEn: "Dodge traffic",
                },
                {
                  id: "flight",
                  icon: "✈️",
                  de: "Himmelsflug",
                  en: "Sky Flight",
                  descriptionDe: "Wolken durchfliegen",
                  descriptionEn: "Fly through clouds",
                },
                {
                  id: "space",
                  icon: "🚀",
                  de: "Sternensprint",
                  en: "Star Dash",
                  descriptionDe: "Asteroiden ausweichen",
                  descriptionEn: "Dodge asteroids",
                },
                {
                  id: "sea",
                  icon: "🐠",
                  de: "Tiefseetauchgang",
                  en: "Deep Dive",
                  descriptionDe: "Riffe erkunden",
                  descriptionEn: "Explore the reef",
                },
                {
                  id: "alien",
                  icon: "👾",
                  de: "Alien-Verteidigung",
                  en: "Alien Defense",
                  descriptionDe: "Zielen, schießen, Wellen überleben",
                  descriptionEn: "Aim, shoot, survive waves",
                },
                {
                  id: "maze",
                  icon: "🗺️",
                  de: "Schatzlabyrinth",
                  en: "Treasure Maze",
                  descriptionDe: "Erkunde das Riff und finde Schätze",
                  descriptionEn: "Explore the reef and find treasure",
                },
              ] as const
            ).map((game) => {
              const record = records[`${subjectId}-${game.id}`];
              const totalLevels = TOTAL_LEVELS;
              return (
                <button
                  key={game.id}
                  className={`game-tile game-tile-${game.id}`}
                  onClick={() => setMode(game.id)}
                >
                  <div className="game-tile-art" aria-hidden="true">
                    <div className="game-tile-orbit" />
                    {game.id === "drive" ? (
                      <CarFront />
                    ) : game.id === "flight" ? (
                      <Plane />
                    ) : game.id === "space" ? (
                      <Rocket />
                    ) : game.id === "sea" ? (
                      <Waves />
                    ) : game.id === "alien" ? (
                      <Crosshair />
                    ) : (
                      <Map />
                    )}
                  </div>
                  <strong>{t(game.de, game.en)}</strong>
                  <small>{t(game.descriptionDe, game.descriptionEn)}</small>
                  <div className="game-card-progress">
                    <div>
                      <b>{record?.cleared || 0}</b> / {questions.length}{" "}
                      {t("Fragen erreicht", "questions reached")}
                    </div>
                    <div className="game-card-bar">
                      <i
                        style={{
                          width: `${questions.length ? ((record?.cleared || 0) / questions.length) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="game-level-record">
                      {t(
                        `Level geschafft: ${Math.min(totalLevels, record?.level || 0)} / ${totalLevels}`,
                        `Levels completed: ${Math.min(totalLevels, record?.level || 0)} / ${totalLevels}`,
                      )}
                    </div>
                    <em>
                      🏆 {record?.score || 0} {t("Bestpunkte", "best score")}
                    </em>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <button className="games-back" onClick={() => setMode(null)}>
            <ArrowLeft size={18} />{" "}
            {t("Anderes Spiel wählen", "Choose another game")}
          </button>
          <div className="games-card">
            <h2>
              {mode === "drive"
                ? t("Straßenrennen", "Road Run")
                : mode === "flight"
                  ? t("Himmelsflug", "Sky Flight")
                  : mode === "space"
                    ? t("Sternensprint", "Star Dash")
                    : mode === "sea"
                      ? t("Tiefseetauchgang", "Deep Dive")
                      : mode === "alien"
                        ? t("Alien-Verteidigung", "Alien Defense")
                        : t("Schatzlabyrinth", "Treasure Maze")}
            </h2>
            {questions.length ? (
              mode === "alien" ? (
                <SpaceDefense
                  key={`${subjectId}-${mode}`}
                  questions={questions}
                  subjectId={subjectId}
                  onProgress={saveRecord}
                  onLevelComplete={saveLevel}
                  startLevel={Math.min(
                    TOTAL_LEVELS,
                    (records[`${subjectId}-${mode}`]?.level || 0) + 1,
                  )}
                />
              ) : mode === "maze" ? (
                <TreasureMaze
                  key={`${subjectId}-${mode}`}
                  questions={questions}
                  subjectId={subjectId}
                  onProgress={saveRecord}
                  onLevelComplete={saveLevel}
                  startLevel={Math.min(
                    TOTAL_LEVELS,
                    (records[`${subjectId}-${mode}`]?.level || 0) + 1,
                  )}
                />
              ) : (
                <ArcadeGame
                  key={`${subjectId}-${mode}`}
                  mode={mode}
                  questions={questions}
                  subjectId={subjectId}
                  onProgress={saveRecord}
                  onLevelComplete={saveLevel}
                  startLevel={Math.min(
                    TOTAL_LEVELS,
                    (records[`${subjectId}-${mode}`]?.level || 0) + 1,
                  )}
                />
              )
            ) : (
              <p>
                {t(
                  "Für dieses Fach gibt es noch keine Herausforderungen.",
                  "There are no challenges for this subject yet.",
                )}
              </p>
            )}
            {questions.length > 0 && (
              <LevelTrack
                completed={records[`${subjectId}-${mode}`]?.level || 0}
                t={t}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}
