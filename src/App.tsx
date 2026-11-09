import { LanguageProvider } from "./i18n/LanguageProvider";
import { FocusedTest } from "./features/tests/FocusedTest";
import { useState } from "react";
import type { Lesson, SubjectId, TestDefinition } from "./types";
import { subjects, tests } from "./content";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { OverviewPage } from "./features/overview/OverviewPage";
import { LessonPage } from "./features/learning/LessonPage";
import { ProgressPage } from "./features/progress/ProgressPage";
import { useLearningProgress } from "./hooks/useLearningProgress";
import { SubjectPage } from "./features/overview/SubjectPage";
import { TestPage } from "./features/tests/TestPage";
import { useTestProgress } from "./hooks/useTestProgress";
import { useCourseHistory } from "./hooks/useCourseHistory";
import "./App.css";

type Page =
  | { kind: "overview"; subjectId: SubjectId | null }
  | { kind: "lesson"; lesson: Lesson; subjectId: SubjectId | null }
  | { kind: "progress" }
  | { kind: "test"; test: TestDefinition; subjectId: SubjectId };

export default function App() {
  const [page, setPage] = useState<Page>({ kind: "overview", subjectId: null });
  const { completed, nextLesson, completeExercise } = useLearningProgress();
  const testProgress = useTestProgress();
  const { attempts, recordAttempt } = useCourseHistory();
  const subjectId = page.kind === "progress" ? null : page.subjectId;
  const currentSubject = subjects.find((subject) => subject.id === subjectId);
  const goHome = () => setPage({ kind: "overview", subjectId: null });
  const openSubject = (id: SubjectId) =>
    setPage({ kind: "overview", subjectId: id });
  const openLesson = (lesson: Lesson) =>
    setPage({ kind: "lesson", lesson, subjectId: lesson.subjectId });

  const activeSession = testProgress.active[0];
  const activeTest = tests.find((test) => test.id === activeSession?.testId);
  if (activeSession && activeTest) {
    return (
      <LanguageProvider english={activeTest.subjectId === "englisch"}>
        <FocusedTest
          key={activeSession.id}
          test={activeTest}
          session={activeSession}
          results={testProgress.results}
          onBack={() => openSubject(activeTest.subjectId)}
          onStart={testProgress.startTest}
          onAnswer={testProgress.answerQuestion}
          onSubmit={(id) => {
            testProgress.submitTest(id);
            setPage({
              kind: "test",
              test: activeTest,
              subjectId: activeTest.subjectId,
            });
          }}
          onCancel={(id) => {
            testProgress.cancelTest(id);
            openSubject(activeTest.subjectId);
          }}
        />
      </LanguageProvider>
    );
  }
  return (
    <LanguageProvider english={subjectId === "englisch"}>
      <div className="app-shell">
        <Sidebar
          subject={subjectId}
          showProgress={page.kind === "progress"}
          onHome={goHome}
          onProgress={() => setPage({ kind: "progress" })}
          onSubject={openSubject}
        />
        <div className="main-shell">
          <TopBar />
          <main>
            {page.kind === "progress" ? (
              <ProgressPage
                completed={completed}
                onSubject={openSubject}
                attempts={attempts}
                results={testProgress.results}
              />
            ) : page.kind === "test" ? (
              <TestPage
                test={page.test}
                session={testProgress.active.find(
                  (session) => session.testId === page.test.id,
                )}
                results={testProgress.results}
                onBack={() => openSubject(page.subjectId)}
                onStart={testProgress.startTest}
                onAnswer={testProgress.answerQuestion}
                onSubmit={testProgress.submitTest}
                onCancel={testProgress.cancelTest}
              />
            ) : page.kind === "lesson" ? (
              <LessonPage
                key={page.lesson.id}
                lesson={page.lesson}
                onBack={() => setPage({ kind: "overview", subjectId })}
                onComplete={completeExercise}
                onAttempt={recordAttempt}
              />
            ) : currentSubject ? (
              <SubjectPage
                key={currentSubject.id}
                subject={currentSubject}
                completed={completed}
                activeTests={testProgress.active}
                results={testProgress.results}
                onLesson={openLesson}
                onTest={(test) =>
                  setPage({ kind: "test", test, subjectId: currentSubject.id })
                }
              />
            ) : (
              <OverviewPage
                completed={completed}
                onStart={() => openLesson(nextLesson)}
                onSubject={openSubject}
              />
            )}
          </main>
        </div>
      </div>
    </LanguageProvider>
  );
}
