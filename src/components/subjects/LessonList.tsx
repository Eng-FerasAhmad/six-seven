import { formatDate } from "../../utils/dates";
import { ArrowRight, Check } from "lucide-react";
import { exercises, lessons } from "../../content";
import type { Lesson, Subject } from "../../types";
interface Props {
  subject: Subject;
  completed: string[];
  onLesson: (lesson: Lesson) => void;
}
export function LessonList({ subject, completed, onLesson }: Props) {
  return (
    <div className="lesson-list">
      {lessons
        .filter((lesson) => lesson.subjectId === subject.id)
        .map((lesson) => {
          const courseExercises = exercises.filter(
            (item) => item.lessonId === lesson.id,
          );
          const isCompleted =
            courseExercises.length > 0 &&
            courseExercises.every((exercise) =>
              completed.includes(exercise.id),
            );
          return (
            <button
              className="lesson-row"
              key={lesson.id}
              onClick={() => onLesson(lesson)}
            >
              <span className={`subject-icon ${subject.color}`}>
                {String(lesson.number).padStart(2, "0")}
              </span>
              <span>
                <strong>{lesson.title}</strong>
                <small>
                  <time dateTime={lesson.date}>{formatDate(lesson.date)}</time>{" "}
                  · {lesson.description}
                </small>
              </span>
              {isCompleted ? (
                <Check className="ink-green" />
              ) : (
                <ArrowRight size={20} />
              )}
            </button>
          );
        })}
    </div>
  );
}
