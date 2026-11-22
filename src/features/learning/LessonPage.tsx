import { PlaceValueLesson } from "./math/PlaceValueLesson";
import { Globe } from "./geography/Globe";
import { AdditionLesson } from "./math/AdditionLesson";
import { useLanguage } from "../../i18n/useLanguage";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { exercises } from "../../content";
import type { Lesson } from "../../types";
import { ExercisePanel } from "./ExercisePanel";
import skeletonImage from "../../content/natur-technik/Colorful Hand-Drawn Skeleton Diagram.png";
import spineImage from "../../content/natur-technik/Spinal Anatomy and Skeleton Study.png";
import skullImage from "../../content/natur-technik/Anatomical Skull Profile with Callouts.png";
const skeletonGroups = [
  {
    title: "Kopfskelett",
    image: skullImage,
    alt: "Schädel von der Seite",
    parts: [
      {
        name: "Schädel",
        consists: "Schädel",
        tasks: ["Schützt das Gehirn und die Sinnesorgane."],
      },
    ],
  },
  {
    title: "Rumpfskelett",
    image: spineImage,
    alt: "Wirbelsäule und Rumpfskelett",
    parts: [
      {
        name: "Wirbelsäule",
        consists:
          "7 Halswirbel, 12 Brustwirbel, 5 Lendenwirbel sowie Kreuzbein und Steißbein aus verwachsenen Wirbeln",
        tasks: [
          "Stützt den Körper, sorgt für Stabilität und ermöglicht einen aufrechten Gang.",
          "Schützt das Rückenmark, das mit dem Gehirn das zentrale Nervensystem bildet. ",
        ],
      },
      {
        name: "Brustkorb",
        consists: "Rippen und Brustbein",
        tasks: ["Schützt Herz und Lunge.", "Gibt dem Oberkörper Stabilität."],
      },
      {
        name: "Becken",
        consists: "Beckenknochen",
        tasks: [
          "Schützt Organe im Beckenraum, insbesondere die Geschlechtsorgane.",
          "Sorgt für Stabilität und hilft beim aufrechten Gang.",
        ],
      },
    ],
  },
  {
    title: "Schultergürtel",
    parts: [
      {
        name: "Schultergürtel",
        consists: "Schlüsselbein und Schulterblatt",
        tasks: [
          "Verbindet Arme und Rumpf.",
          "Ermöglicht die Beweglichkeit von Schulter und Arm.",
        ],
      },
    ],
  },
  {
    title: "Gliedmaßenskelett",
    image: skeletonImage,
    alt: "Ganzes Skelett mit Armen und Beinen",
    parts: [
      {
        name: "Arme und Hände",
        consists:
          "Schulterblatt, Oberarmknochen, Elle, Speiche, Handwurzelknochen, Mittelhandknochen und Fingerknochen",
        tasks: [
          "Ermöglichen Bewegungen von Arm und Hand.",
          "Der opponierbare Daumen ermöglicht den Pinzettengriff für kleine Gegenstände.",
        ],
      },
      {
        name: "Beine und Füße",
        consists:
          "Becken, Oberschenkelknochen, Schienbein, Wadenbein, Fußwurzelknochen, Mittelfußknochen und Zehenknochen",
        tasks: [
          "Tragen das Körpergewicht und ermöglichen die Fortbewegung.",
          "Arm und Bein haben einen ähnlichen Grundaufbau, aber unterschiedliche Aufgaben: Greifen mit dem Arm, Stehen und Gehen mit dem Bein.",
        ],
      },
    ],
  },
];
interface Props {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (id: string) => void;
  onAttempt: (id: string, correct: boolean) => void;
}
export function LessonPage({ lesson, onBack, onComplete, onAttempt }: Props) {
  const subjectColor = {
    mathematik: "blue",
    deutsch: "purple",
    englisch: "orange",
    "natur-technik": "green",
    geographie: "pink",
  }[lesson.subjectId];
  const { t } = useLanguage();
  const [practice, setPractice] = useState(false);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const courseExercises = exercises.filter(
    (exercise) =>
      exercise.lessonId === lesson.id &&
      !exercise.id.includes("-test-question-"),
  );
  const exercise = courseExercises[exerciseIndex % courseExercises.length];
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "instant" });
  }, [practice, exerciseIndex]);
  function continueLearning() {
    if (exerciseIndex < 9) setExerciseIndex((index) => index + 1);
    else {
      setPractice(false);
      setExerciseIndex(0);
    }
  }
  return (
    <div className={`lesson-page ${subjectColor}`}>
      <button className="back-link" onClick={onBack}>
        <ArrowLeft size={17} /> {t("Zurück zur Übersicht", "Back to overview")}
      </button>
      <h1>{lesson.title}</h1>
      {!practice && lesson.activity?.kind === "place-value" && (
        <PlaceValueLesson activity={lesson.activity} />
      )}
      {!practice && lesson.activity?.kind === "addition" && (
        <AdditionLesson activity={lesson.activity} />
      )}
      {!practice && lesson.id === "geographie-4" && <Globe />}
      <div
        className={
          lesson.activity && !practice ? "lesson-actions" : "learning-panel"
        }
      >
        {practice && exercise ? (
          <div
            className="course-quiz-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setPractice(false);
            }}
          >
            <div
              className="course-quiz-dialog"
              role="dialog"
              aria-modal="true"
              aria-label={t("Kurstest", "Course quiz")}
            >
              <button
                type="button"
                className="course-quiz-close"
                aria-label={t("Schließen", "Close")}
                onClick={() => setPractice(false)}
              >
                ×
              </button>
              <p className="course-quiz-progress">
                {t("Frage", "Question")} {exerciseIndex + 1} / 10
              </p>
              <ExercisePanel
                key={`${exercise.id}-${exerciseIndex}`}
                exercise={exercise}
                onReadLesson={() => setPractice(false)}
                onContinue={continueLearning}
                onComplete={onComplete}
                onAttempt={onAttempt}
              />
            </div>
          </div>
        ) : (
          <>
            {lesson.id !== "natur-technik-4" &&
              !lesson.activity &&
              lesson.sections.map((section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.text}</p>
                  {section.example && (
                    <div className="example">
                      <Sparkles size={22} />
                      <div>
                        <strong>{t("Zum Merken", "Remember")}</strong>
                        <p>{section.example}</p>
                      </div>
                    </div>
                  )}
                </section>
              ))}
            {lesson.id === "natur-technik-4" && (
              <div className="skeleton-guide">
                <h2>Entdecke das Skelett</h2>
                <p>
                  Dein Skelett stützt dich, schützt wichtige Organe und
                  ermöglicht zusammen mit Muskeln Bewegung. Es besteht aus
                  Kopf-, Rumpf- und Gliedmaßenskelett.
                </p>
                <h3>Wichtige Knochen</h3>
                <p>
                  Schädel · Schlüsselbein · Schulterblatt · Brustbein · Rippen ·
                  Wirbelsäule · Becken · Armknochen · Beinknochen
                </p>
                <div className="skeleton-parts">
                  {skeletonGroups.map((group) => (
                    <section key={group.title} className="skeleton-group">
                      <h3>{group.title}</h3>
                      <div className="skeleton-group-layout">
                        {group.image && (
                          <img src={group.image} alt={group.alt} />
                        )}
                        <div className="skeleton-part-grid">
                          {group.parts.map((part) => (
                            <div className="skeleton-part" key={part.name}>
                              <h4>{part.name}</h4>
                              <p>
                                <strong>Bestandteile:</strong> {part.consists}
                              </p>
                              <strong>Aufgaben:</strong>
                              <ul>
                                {part.tasks.map((task) => (
                                  <li key={task}>{task}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>
                  ))}
                </div>
                <div className="skeleton-tip">
                  <strong>Die Wirbelsäule genauer:</strong>
                  <ul>
                    <li>
                      7 Halswirbel, 12 Brustwirbel und 5 Lendenwirbel; Kreuzbein
                      und Steißbein bestehen aus verwachsenen Wirbeln.
                    </li>
                    <li>
                      Zwischen den beweglichen Wirbeln liegen 23 elastische
                      Bandscheiben aus Knorpel. Sie wirken als Stoßdämpfer.
                    </li>
                    <li>
                      Die doppelte S-Form macht die Wirbelsäule elastisch und
                      hilft, Stöße abzufedern.
                    </li>
                  </ul>
                </div>
                <div className="skeleton-tip">
                  <strong>So bleibt dein Rücken fit:</strong>
                  <ul>
                    <li>Bewege dich regelmäßig und sitze aufrecht.</li>
                    <li>
                      Packe die Schultasche nicht zu schwer und trage sie eng am
                      Rücken.
                    </li>
                    <li>Lass überflüssige Sachen zu Hause.</li>
                  </ul>
                </div>
                <div className="skeleton-tip">
                  <strong>Der Fuß:</strong>
                  <ul>
                    <li>
                      Das Längsgewölbe verläuft von den Zehen zur Ferse, das
                      Quergewölbe von innen nach außen.
                    </li>
                    <li>
                      Die Fußgewölbe verteilen Gewicht, federn Stöße ab und
                      helfen beim Gleichgewicht.
                    </li>
                    <li>
                      Dauerbelastung und ungeeignetes Schuhwerk können einen
                      Senkfuß oder Plattfuß begünstigen.
                    </li>
                  </ul>
                </div>
              </div>
            )}
            <button className="primary" onClick={() => setPractice(true)}>
              {t("Jetzt ausprobieren", "Try it now")} <ArrowRight size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
