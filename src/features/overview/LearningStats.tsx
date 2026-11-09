import { BookOpen, Star, Sprout } from "lucide-react";
export function LearningStats({ completedCount }: { completedCount: number }) {
  return (
    <div className="stats">
      <div>
        <span className="stat-icon lavender">
          <BookOpen size={20} />
        </span>
        <span>
          <strong>5 Fächer</strong>
          <small>Eine Welt voller Wissen</small>
        </span>
      </div>
      <div>
        <span className="stat-icon peach">
          <Star size={20} />
        </span>
        <span>
          <strong>{completedCount * 10} Lernsterne</strong>
          <small>Jeder Versuch bringt dich weiter</small>
        </span>
      </div>
      <div>
        <span className="stat-icon mint">
          <Sprout size={20} />
        </span>
        <span>
          <strong>Alles in deinem Tempo</strong>
          <small>Du bestimmst, wann’s losgeht</small>
        </span>
      </div>
    </div>
  );
}
