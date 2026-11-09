import { ArrowRight } from "lucide-react";
export function WelcomeHero({ onStart }: { onStart: () => void }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <h2>
          In dir steckt so
          <br />
          viel <span>mehr.</span>
        </h2>
        <button onClick={onStart}>
          Los geht’s <ArrowRight size={18} />
        </button>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orbit orbit-one" />
        <div className="orbit orbit-two" />
        <span className="art-star star-one">✦</span>
        <span className="art-star star-two">✧</span>
        <span className="art-dot" />
        <div className="float-badge badge-top">✦ Aha-Moment!</div>
        <div className="big-number">67</div>
        <div className="float-badge badge-bottom">🚀 Du kannst das!</div>
        <span className="art-star star-three">✦</span>
      </div>
    </section>
  );
}
