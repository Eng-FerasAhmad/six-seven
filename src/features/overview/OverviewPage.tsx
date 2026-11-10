import type { SubjectId } from "../../types";
import { SubjectGrid } from "../../components/subjects/SubjectGrid";
import { WelcomeHero } from "./WelcomeHero";
import { LearningStats } from "./LearningStats";
interface Props {
  completed: string[];
  onStart: () => void;
  onSubject: (id: SubjectId) => void;
}
export function OverviewPage({ completed, onStart, onSubject }: Props) {
  return (
    <>
      <div className="heading-row">
        <h1 className="welcome-title">
          Hey, schön, dass du da bist! <span>👋</span>
        </h1>
      </div>
      <WelcomeHero onStart={onStart} />
      <LearningStats completedCount={completed.length} />
      <section>
        <div className="section-heading">
          <h2>Worauf hast du heute Lust?</h2>
        </div>
        <SubjectGrid onSubject={onSubject} />
      </section>
    </>
  );
}
