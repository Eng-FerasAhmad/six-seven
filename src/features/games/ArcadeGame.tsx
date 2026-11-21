import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import type { Exercise, SubjectId } from "../../types";
import { rememberQuestion } from "./questionOrder";
import { questionsForLevel, TOTAL_LEVELS } from "./levelQuestions";
import { renderScene } from "./renderScene";

type Mode = "drive" | "flight" | "space" | "sea";
type Obstacle = { x: number; y: number; size: number; kind: number };
type Pickup = { x: number; y: number; kind: number };
const BASE_WIDTH = 720,
  BASE_HEIGHT = 440;
const QUESTIONS_PER_LEVEL = 2;
function levelQuestions(questions: Exercise[], startLevel: number) {
  return Array.from({ length: TOTAL_LEVELS - startLevel + 1 }, (_, offset) =>
    questionsForLevel(questions, startLevel + offset).slice(
      0,
      QUESTIONS_PER_LEVEL,
    ),
  ).flat();
}
export function ArcadeGame({
  mode,
  questions,
  subjectId,
  onProgress,
  onLevelComplete,
  startLevel,
}: {
  mode: Mode;
  questions: Exercise[];
  subjectId: SubjectId;
  onProgress: (cleared: number, score: number) => void;
  onLevelComplete: (level: number, score: number) => void;
  startLevel: number;
}) {
  const [runQuestions, setRunQuestions] = useState(() =>
    levelQuestions(questions, startLevel),
  );
  const canvas = useRef<HTMLCanvasElement>(null);
  const [view, setView] = useState({ width: BASE_WIDTH, height: BASE_HEIGHT });
  const W = view.width,
    H = view.height;
  const dragging = useRef(false);
  const lastTap = useRef(0);
  const resumeTimeout = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (resumeTimeout.current !== null)
        window.clearTimeout(resumeTimeout.current);
    },
    [],
  );
  const touchBoostUntil = useRef(0);
  const keys = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    boost: false,
  });
  const state = useRef({
    x: W / 2,
    y: (H * 355) / BASE_HEIGHT,
    velocity: 0,
    velocityY: 0,
    lives: 3,
    points: 0,
    frame: 0,
    spawn: 0,
    pickups: [] as Pickup[],
    particles: [] as { x: number; y: number; life: number }[],
    energy: 0,
    combo: 0,
    obstacles: [] as Obstacle[],
    shield: 0,
    difficulty: 1,
    last: 0,
    streak: 0,
  });
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    function resize() {
      const width = expanded ? window.innerWidth : BASE_WIDTH;
      const height = expanded ? window.innerHeight : BASE_HEIGHT;
      setView((old) => {
        if (old.width === width && old.height === height) return old;
        const game = state.current;
        game.x = (game.x / old.width) * width;
        game.y = (game.y / old.height) * height;
        game.obstacles.forEach((item) => {
          item.x = (item.x / old.width) * width;
          item.y = (item.y / old.height) * height;
        });
        game.pickups.forEach((item) => {
          item.x = (item.x / old.width) * width;
          item.y = (item.y / old.height) * height;
        });
        return { width, height };
      });
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [expanded]);
  useEffect(() => {
    if (!expanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [expanded]);
  const [phase, setPhase] = useState<
    "ready" | "playing" | "question" | "over" | "complete" | "paused"
  >("ready");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [hud, setHud] = useState({
    lives: 3,
    points: 0,
    shield: 0,
    energy: 0,
    combo: 0,
  });
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState<number | null>(null);
  const question = runQuestions[questionIndex];
  const level = Math.min(
    TOTAL_LEVELS,
    startLevel + Math.floor(questionIndex / QUESTIONS_PER_LEVEL),
  );
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (ctx)
      renderScene(
        ctx,
        mode,
        0,
        state.current.x,
        state.current.y,
        [],
        0,
        [],
        [],
        false,
        0,
        1,
        W,
        H,
      );
  }, [mode, W, H]);
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (
        [
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "a",
          "d",
          "w",
          "s",
          "A",
          "D",
          "W",
          "S",
          " ",
        ].includes(event.key)
      )
        event.preventDefault();
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a")
        keys.current.left = true;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d")
        keys.current.right = true;
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w")
        keys.current.up = true;
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s")
        keys.current.down = true;
      if (event.key === " ") keys.current.boost = true;
      if (event.key.toLowerCase() === "p")
        setPhase((current) =>
          current === "playing"
            ? "paused"
            : current === "paused"
              ? "playing"
              : current,
        );
    };
    const up = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a")
        keys.current.left = false;
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "d")
        keys.current.right = false;
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w")
        keys.current.up = false;
      if (event.key === "ArrowDown" || event.key.toLowerCase() === "s")
        keys.current.down = false;
      if (event.key === " ") keys.current.boost = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  useEffect(() => {
    if (phase !== "playing") return;
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    let request = 0;
    const draw = (now: number) => {
      const s = state.current,
        dt = Math.min((now - (s.last || now)) / 16.67, 2);
      s.last = now;
      s.frame += dt;
      s.spawn += dt;
      s.difficulty = Math.min(5, s.difficulty + dt * 0.0009);
      const boosting =
        (keys.current.boost || now < touchBoostUntil.current) && s.energy > 0;
      if (boosting) {
        s.energy = Math.max(0, s.energy - 0.55 * dt);
        s.shield = Math.max(s.shield, 3);
      }
      s.velocity +=
        ((keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0)) *
        (boosting ? 1.45 : 1.05) *
        (1 + (s.difficulty - 1) * (mode === "drive" ? 0.22 : 0.08)) *
        dt;
      s.velocity *= Math.pow(mode === "sea" ? 0.89 : 0.86, dt);
      s.x += s.velocity * dt;
      if (mode === "sea") s.x += Math.sin(s.frame / 38) * 0.9 * dt;
      s.x =
        mode === "drive"
          ? Math.max(W * 0.27, Math.min(W * 0.73, s.x))
          : Math.max(45, Math.min(W - 45, s.x));
      if (mode !== "drive") {
        s.velocityY +=
          ((keys.current.down ? 1 : 0) - (keys.current.up ? 1 : 0)) * 1.05 * dt;
        s.velocityY *= Math.pow(0.86, dt);
        s.y = Math.max(65, Math.min(H - 65, s.y + s.velocityY * dt));
      }
      if (s.shield > 0) s.shield -= dt;
      if (s.spawn > Math.max(30, 78 / s.difficulty)) {
        s.spawn = 0;
        const obstacleX =
          mode === "drive"
            ? W * (0.28 + Math.random() * 0.44)
            : 55 + Math.random() * (W - 110);
        s.obstacles.push({
          x: obstacleX,
          y: -45,
          size: 25,
          kind: Math.floor(Math.random() * 3),
        });
        if (Math.random() > 0.2)
          s.pickups.push({
            x: Math.max(
              mode === "drive" ? W * 0.28 : 55,
              Math.min(
                mode === "drive" ? W * 0.72 : W - 55,
                obstacleX + (Math.random() > 0.5 ? 100 : -100),
              ),
            ),
            y: -65,
            kind: Math.random() < 0.16 ? 1 : Math.random() < 0.32 ? 2 : 0,
          });
      }
      for (const obstacle of s.obstacles) {
        obstacle.y +=
          (H / BASE_HEIGHT) *
          (3.2 + s.difficulty * 1.7 + (mode === "space" ? 1.2 : 0)) *
          (mode === "drive" && obstacle.kind === 0
            ? 0.75
            : mode === "space" && obstacle.kind === 2
              ? 1.25
              : 1) *
          dt;
        if (
          mode === "flight" ||
          (mode === "drive" && obstacle.kind === 1) ||
          (mode === "space" && obstacle.kind === 1)
        )
          obstacle.x += Math.sin((s.frame + obstacle.y) / 28) * 0.55 * dt;
        if (
          Math.abs(obstacle.x - s.x) <
            (mode === "drive" && obstacle.kind === 0 ? 36 : 29) &&
          Math.abs(obstacle.y - s.y) < (mode === "flight" ? 29 : 33)
        ) {
          obstacle.y = H + 100;
          if (s.shield <= 0) {
            s.lives--;
            s.combo = 0;
            s.shield = 80;
            s.particles.push(
              ...Array.from({ length: 12 }, () => ({
                x: s.x + (Math.random() - 0.5) * 65,
                y: s.y + (Math.random() - 0.5) * 65,
                life: 35,
              })),
            );
            setHud({
              lives: s.lives,
              points: Math.floor(s.points),
              shield: Math.ceil(s.shield / 60),
              energy: Math.floor(s.energy),
              combo: 0,
            });
            if (questionIndex < runQuestions.length)
              rememberQuestion(subjectId, runQuestions[questionIndex].id);
            setPhase(
              questionIndex < runQuestions.length ? "question" : "complete",
            );
            return;
          }
        }
      }
      s.obstacles = s.obstacles.filter((item) => item.y < H + 30);
      for (const pickup of s.pickups) {
        pickup.y += (H / BASE_HEIGHT) * (3.7 + s.difficulty) * dt;
        if (pickup.kind === 0)
          pickup.x += Math.sin((s.frame + pickup.y) / 35) * 0.45 * dt;
        if (Math.abs(pickup.x - s.x) < 29 && Math.abs(pickup.y - s.y) < 32) {
          pickup.y = H + 100;
          s.combo++;
          s.points += 10 * Math.min(5, s.combo);
          s.lives = Math.min(5, s.lives + (pickup.kind === 1 ? 2 : 1));
          if (pickup.kind === 1) s.points += 30;
          if (pickup.kind === 2) s.energy = Math.min(100, s.energy + 35);
          s.particles.push(
            ...Array.from({ length: 7 }, () => ({
              x: pickup.x + (Math.random() - 0.5) * 34,
              y: s.y + (Math.random() - 0.5) * 30,
              life: 25,
            })),
          );
        }
      }
      s.pickups = s.pickups.filter((item) => item.y < H + 30);
      s.particles.forEach((particle) => {
        particle.y -= 1.5 * dt;
        particle.life -= dt;
      });
      s.particles = s.particles.filter((particle) => particle.life > 0);
      s.points += dt * 0.1;
      setHud({
        lives: s.lives,
        points: Math.floor(s.points),
        shield: Math.ceil(s.shield / 60),
        energy: Math.floor(s.energy),
        combo: s.combo,
      });
      renderScene(
        ctx,
        mode,
        s.frame,
        s.x,
        s.y,
        s.obstacles,
        s.shield,
        s.pickups,
        s.particles,
        boosting,
        s.velocity,
        s.difficulty,
        W,
        H,
      );
      request = requestAnimationFrame(draw);
    };
    request = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(request);
  }, [phase, mode, questionIndex, runQuestions, subjectId, onProgress, W, H]);
  function steerFromPointer(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragging.current || phase !== "playing") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) * W) / bounds.width;
    const y = ((event.clientY - bounds.top) * H) / bounds.height;
    state.current.x =
      mode === "drive"
        ? Math.max(W * 0.27, Math.min(W * 0.73, x))
        : Math.max(45, Math.min(W - 45, x));
    if (mode !== "drive") state.current.y = Math.max(65, Math.min(H - 65, y));
    state.current.velocity = 0;
    state.current.velocityY = 0;
  }
  function reply(index: number) {
    if (resumeTimeout.current !== null) return;
    const s = state.current;
    if (index === question.answerIndex) {
      setAnswer(index);
      s.streak++;
      s.lives = Math.max(1, s.lives);
      s.shield = 600;
      s.energy = Math.min(100, s.energy + 40);
      s.points += 50 + Math.min(100, (s.streak - 1) * 25);
      if (s.streak % 3 === 0) s.lives = Math.min(5, s.lives + 1);
      setMessage(
        s.streak % 3 === 0
          ? "Correct! Extra heart, shield and boost earned."
          : "Correct! Shield and boost earned. Returning to the game…",
      );
      setHud({
        lives: s.lives,
        points: Math.floor(s.points),
        shield: Math.ceil(s.shield / 60),
        energy: Math.floor(s.energy),
        combo: s.combo,
      });
      resumeTimeout.current = window.setTimeout(() => {
        resumeTimeout.current = null;
        continueGame();
      }, 850);
    } else {
      setAnswer(index);
      s.streak = 0;
      s.difficulty = Math.min(5, s.difficulty + 0.3);
      setMessage("Not quite. Here comes a new question…");
      resumeTimeout.current = window.setTimeout(() => {
        resumeTimeout.current = null;
        onProgress(questionIndex + 1, Math.floor(s.points));
        setAnswer(null);
        setMessage("");
        setQuestionIndex((value) => value + 1);
        if (questionIndex + 1 >= runQuestions.length)
          setPhase(s.lives <= 0 ? "over" : "complete");
      }, 850);
    }
  }
  function continueGame() {
    onProgress(questionIndex + 1, Math.floor(state.current.points));
    if (
      (questionIndex + 1) % QUESTIONS_PER_LEVEL === 0 ||
      questionIndex + 1 === runQuestions.length
    )
      onLevelComplete(
        Math.min(
          TOTAL_LEVELS,
          startLevel + Math.floor(questionIndex / QUESTIONS_PER_LEVEL),
        ),
        Math.floor(state.current.points),
      );
    setAnswer(null);
    setMessage("");
    setQuestionIndex((value) => value + 1);
    state.current.difficulty = Math.min(5, state.current.difficulty + 0.15);
    state.current.last = 0;
    setPhase(
      questionIndex + 1 >= runQuestions.length
        ? "complete"
        : state.current.lives <= 0
          ? "over"
          : "playing",
    );
  }
  function restart() {
    setRunQuestions(levelQuestions(questions, startLevel));
    if (resumeTimeout.current !== null)
      window.clearTimeout(resumeTimeout.current);
    resumeTimeout.current = null;
    state.current = {
      x: W / 2,
      y: (H * 355) / BASE_HEIGHT,
      velocity: 0,
      velocityY: 0,
      lives: 3,
      points: 0,
      frame: 0,
      spawn: 0,
      pickups: [],
      particles: [],
      energy: 0,
      combo: 0,
      obstacles: [],
      shield: 0,
      difficulty: 1,
      last: 0,
      streak: 0,
    };
    setHud({ lives: 3, points: 0, shield: 0, energy: 0, combo: 0 });
    setQuestionIndex(0);
    setAnswer(null);
    setPhase("playing");
  }
  return (
    <div className={`arcade-game ${expanded ? "arcade-expanded" : ""}`}>
      <div className="race-hud">
        <span className="hud-life">
          <small>HEALTH</small>
          <b>
            {"♥".repeat(hud.lives)}
            {"♡".repeat(Math.max(0, 5 - hud.lives))}
          </b>
        </span>
        <span className="hud-score">
          <small>SCORE</small>
          <b>{hud.points.toLocaleString()}</b>
        </span>
        <span className="hud-combo">
          <small>COMBO</small>
          <b>×{Math.max(1, hud.combo)}</b>
        </span>
        <span className="hud-level">
          <small>LEVEL</small>
          <b>
            {level}/{TOTAL_LEVELS}
          </b>
        </span>
      </div>
      <div className="arcade-energy">
        <span>BOOST</span>
        <div>
          <i style={{ width: `${hud.energy}%` }} />
        </div>
        <strong>{hud.energy}%</strong>
        {hud.shield > 0 && (
          <span className="shield-indicator">🛡 {hud.shield}s</span>
        )}
      </div>
      <div className="arcade-progress">
        <span
          style={{
            width: `${Math.min(100, (questionIndex / runQuestions.length) * 100)}%`,
          }}
        />
      </div>
      <div className="arcade-progress-label">
        <span>
          {questionIndex} / {runQuestions.length} questions reached
        </span>
        <span>A collision starts the next challenge</span>
      </div>
      <div className={`race-stage race-stage-${mode}`}>
        <button
          className="arcade-expand"
          onClick={() => setExpanded((value) => !value)}
          aria-label={
            expanded
              ? "Exit expanded game view"
              : "Expand game to fill browser tab"
          }
          title={expanded ? "Exit expanded view" : "Fill browser tab"}
        >
          {expanded ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
        </button>
        <button
          className="arcade-pause"
          onClick={() =>
            setPhase((current) => (current === "playing" ? "paused" : current))
          }
          disabled={phase !== "playing"}
        >
          Ⅱ PAUSE
        </button>
        <canvas
          ref={canvas}
          width={W}
          height={H}
          onPointerDown={(event) => {
            dragging.current = true;
            const tapTime = performance.now();
            if (tapTime - lastTap.current < 320)
              touchBoostUntil.current = tapTime + 1300;
            lastTap.current = tapTime;
            event.currentTarget.setPointerCapture(event.pointerId);
            steerFromPointer(event);
          }}
          onPointerMove={steerFromPointer}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        />
        {phase !== "playing" && (
          <div className="race-overlay">
            {phase === "ready" ? (
              <div className="game-intro-panel">
                <span className="game-intro-kicker">
                  ARCADE MISSION · LEVEL{" "}
                  {startLevel.toString().padStart(2, "0")}
                </span>
                <h3>
                  {mode === "drive"
                    ? "🏎️ Road Run"
                    : mode === "flight"
                      ? "✈️ Sky Flight"
                      : mode === "space"
                        ? "🚀 Star Dash"
                        : "🐠 Deep Dive"}
                </h3>
                <p>
                  Steer by dragging on the game, or use arrow keys / W A S D
                  (car steers left/right). Collect hearts to restore health and
                  dodge{" "}
                  {mode === "drive"
                    ? "trucks, mouse cars and cat cars"
                    : mode === "flight"
                      ? "falling burgers, pizza and soda"
                      : mode === "sea"
                        ? "pufferfish, tropical fish and octopuses"
                        : "aliens"}
                  . Press Space or double tap to boost. A collision starts a
                  question.
                </p>
                <button onClick={() => setPhase("playing")}>
                  Start mission →
                </button>
              </div>
            ) : phase === "paused" ? (
              <>
                <h3>Paused</h3>
                <p>Take a breath. Your run is saved here.</p>
                <button
                  onClick={() => {
                    state.current.last = 0;
                    setPhase("playing");
                  }}
                >
                  Resume
                </button>
              </>
            ) : phase === "over" || phase === "complete" ? (
              <>
                <h3>
                  {phase === "complete"
                    ? "🏆 All questions reached!"
                    : "Game over"}
                </h3>
                <p>
                  You scored {hud.points} points and reached level {level}.
                </p>
                <button onClick={restart}>Play again</button>
              </>
            ) : (
              <div className="arcade-question">
                <span className="question-eyebrow">
                  LEVEL {level} · CHALLENGE {questionIndex + 1} /{" "}
                  {runQuestions.length}
                </span>
                <div className="arcade-reward">
                  🛡️ Correct: recover + shield + boost · Wrong: hazards speed up
                </div>
                <h3>{question.question}</h3>
                <div className="arcade-answers">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => reply(index)}
                      disabled={answer !== null}
                      className={
                        answer === index
                          ? index === question.answerIndex
                            ? "correct"
                            : "incorrect"
                          : ""
                      }
                    >
                      <span className="answer-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
                {answer !== null && (
                  <div
                    className={`arcade-answer-feedback ${answer === question.answerIndex ? "success" : "retry"}`}
                    role="status"
                  >
                    <strong>{message}</strong>
                    {answer === question.answerIndex && (
                      <p>{question.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
