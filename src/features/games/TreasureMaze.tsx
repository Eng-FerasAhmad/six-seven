import { useEffect, useRef, useState } from "react";
import type { Exercise, SubjectId } from "../../types";
import { rememberQuestion } from "./questionOrder";
import { questionsForLevel } from "./levelQuestions";
import worldsUrl from "./assets/worlds.png";
import vehiclesUrl from "./assets/vehicles.png";
import fishUrl from "./assets/hazards.png";
import "./new-games.css";

type Props = {
  questions: Exercise[];
  subjectId: SubjectId;
  onProgress: (count: number, score: number) => void;
  onLevelComplete: (level: number, score: number) => void;
  startLevel: number;
};
type Point = { x: number; y: number };
type Pending = { point: Point; kind: "gate" | "treasure" };
type Enemy = {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  fireAt: number;
  hp: number;
  kind: number;
};
type Shot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: "player" | "enemy";
};
const COLS = 21,
  ROWS = 13,
  CELL = 36,
  W = COLS * CELL,
  H = ROWS * CELL,
  TOTAL_LEVELS = 10;
const directions: Point[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];
const worlds = new Image();
worlds.src = worldsUrl;
const vehicles = new Image();
vehicles.src = vehiclesUrl;
const fish = new Image();
fish.src = fishUrl;
const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y;
const key = (point: Point) => `${point.x},${point.y}`;
const center = (point: Point) => ({
  x: point.x * CELL + CELL / 2,
  y: point.y * CELL + CELL / 2,
});
function makeMaze(level = 1) {
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(1));
  const stack: Point[] = [{ x: 1, y: 1 }];
  grid[1][1] = 0;
  while (stack.length) {
    const current = stack[stack.length - 1];
    const choices = directions
      .map((direction) => ({
        x: current.x + direction.x * 2,
        y: current.y + direction.y * 2,
      }))
      .filter(
        (point) =>
          point.x > 0 &&
          point.x < COLS - 1 &&
          point.y > 0 &&
          point.y < ROWS - 1 &&
          grid[point.y][point.x],
      );
    if (!choices.length) {
      stack.pop();
      continue;
    }
    const next = choices[Math.floor(Math.random() * choices.length)];
    grid[(current.y + next.y) / 2][(current.x + next.x) / 2] = 0;
    grid[next.y][next.x] = 0;
    stack.push(next);
  }
  const start = { x: 1, y: 1 },
    queue = [start],
    distance = new Map([[key(start), 0]]),
    previous = new Map<string, Point>();
  for (let i = 0; i < queue.length; i++)
    for (const direction of directions) {
      const next = { x: queue[i].x + direction.x, y: queue[i].y + direction.y };
      if (
        next.x <= 0 ||
        next.x >= COLS - 1 ||
        next.y <= 0 ||
        next.y >= ROWS - 1 ||
        grid[next.y][next.x] ||
        distance.has(key(next))
      )
        continue;
      distance.set(key(next), (distance.get(key(queue[i])) || 0) + 1);
      previous.set(key(next), queue[i]);
      queue.push(next);
    }
  const exit = queue.reduce(
    (farthest, point) =>
      (distance.get(key(point)) || 0) > (distance.get(key(farthest)) || 0)
        ? point
        : farthest,
    start,
  );
  const path: Point[] = [];
  for (
    let cursor: Point | undefined = exit;
    cursor;
    cursor = previous.get(key(cursor))
  )
    path.unshift(cursor);
  const gateCount = 1;
  const gates = Array.from(
    { length: gateCount },
    (_, index) =>
      path[Math.floor((path.length * (index + 1)) / (gateCount + 1))],
  ).filter((point) => point && !same(point, start) && !same(point, exit));
  const pathKeys = new Set(path.map(key));
  const deadEnds = queue.filter(
    (point) =>
      !pathKeys.has(key(point)) &&
      directions.filter(
        (direction) => !grid[point.y + direction.y]?.[point.x + direction.x],
      ).length === 1,
  );
  const treasureCount = 1;
  let candidates =
    deadEnds.length >= treasureCount
      ? deadEnds
      : queue.filter((point) => !pathKeys.has(key(point)));
  if (candidates.length < treasureCount)
    candidates = queue.filter(
      (point) =>
        !same(point, start) &&
        !same(point, exit) &&
        !gates.some((gate) => same(gate, point)),
    );
  const treasures = Array.from(
    { length: treasureCount },
    (_, index) =>
      candidates[
        Math.floor(((index + 0.5) * candidates.length) / treasureCount)
      ],
  ).filter((point): point is Point => !!point);
  const occupied = new Set([
    key(start),
    key(exit),
    ...gates.map(key),
    ...treasures.map(key),
  ]);
  const spawnCells = queue.filter(
    (point) =>
      (distance.get(key(point)) || 0) > 12 && !occupied.has(key(point)),
  );
  const enemies: Enemy[] =
    level === 1
      ? []
      : Array.from({ length: Math.min(10, level + 1) }, (_, index) => {
          const point =
            spawnCells[
              Math.floor(
                ((index + 1) * spawnCells.length) /
                  (Math.min(10, level + 1) + 1),
              )
            ] || exit;
          const pixel = center(point);
          return {
            x: pixel.x,
            y: pixel.y,
            targetX: pixel.x,
            targetY: pixel.y,
            fireAt: 70 + index * 25,
            hp: level >= 7 ? 3 : level >= 3 ? 2 : 1,
            kind: index % 3,
          };
        });
  return {
    grid,
    player: start,
    visual: { ...center(start), angle: 0 },
    heading: 0,
    speed: 0,
    exit,
    gates,
    treasures,
    enemies,
    shots: [] as Shot[],
    frame: 0,
    fireAt: 0,
    invulnerable: 0,
    health: 3,
    level,
    score: 0,
    oxygen: Math.max(100, 180 - (level - 1) * 12),
  };
}
export function TreasureMaze({
  questions,
  subjectId,
  onProgress,
  onLevelComplete,
  startLevel,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef(makeMaze(startLevel));
  const [queue, setQueue] = useState(() =>
    questionsForLevel(questions, startLevel),
  );
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<
    "ready" | "playing" | "question" | "level" | "over" | "complete"
  >("ready");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [hud, setHud] = useState({
    score: 0,
    oxygen: Math.max(100, 180 - (startLevel - 1) * 12),
    found: 0,
    gates: 0,
    health: 3,
    level: startLevel,
    enemies: startLevel === 1 ? 0 : Math.min(10, startLevel + 1),
  });
  const [pending, setPending] = useState<Pending | null>(null);
  const touch = useRef<Point | null>(null);
  const held = useRef<[number, number] | null>(null);
  const interactionLock = useRef(false);
  const fireHeld = useRef(false);
  const question = queue[index];
  function updateHud() {
    const state = game.current;
    setHud({
      score: state.score,
      oxygen: state.oxygen,
      found: 1 - state.treasures.length,
      gates: 1 - state.gates.length,
      health: state.health,
      level: state.level,
      enemies: state.enemies.length,
    });
  }
  function startChallenge(point: Point, kind: Pending["kind"]) {
    const nextQuestion = question;
    if (!nextQuestion) {
      setPhase("over");
      return;
    }
    interactionLock.current = true;
    held.current = null;
    rememberQuestion(subjectId, nextQuestion.id);
    setPending({ point, kind });
    setPhase("question");
  }
  function move(dx: number, dy: number) {
    if (phase !== "playing" || interactionLock.current) return;
    const state = game.current;
    state.speed = Math.min(3.2, state.speed + 0.2);
    const next = {
      x: state.visual.x + dx * state.speed,
      y: state.visual.y + dy * state.speed,
    };
    const cellCenterX = Math.floor(state.visual.x / CELL) * CELL + CELL / 2;
    const cellCenterY = Math.floor(state.visual.y / CELL) * CELL + CELL / 2;
    if (dx && Math.abs(state.visual.y - cellCenterY) < 8)
      next.y += Math.max(-1.5, Math.min(1.5, cellCenterY - state.visual.y));
    if (dy && Math.abs(state.visual.x - cellCenterX) < 8)
      next.x += Math.max(-1.5, Math.min(1.5, cellCenterX - state.visual.x));
    const radius = 10;
    for (const cornerX of [next.x - radius, next.x + radius])
      for (const cornerY of [next.y - radius, next.y + radius]) {
        const cellX = Math.floor(cornerX / CELL),
          cellY = Math.floor(cornerY / CELL);
        if (
          cellX < 0 ||
          cellX >= COLS ||
          cellY < 0 ||
          cellY >= ROWS ||
          state.grid[cellY][cellX]
        )
          return;
        const gate = state.gates.find(
          (point) => point.x === cellX && point.y === cellY,
        );
        if (gate) {
          startChallenge(gate, "gate");
          return;
        }
      }
    state.visual.x = next.x;
    state.visual.y = next.y;
    state.heading =
      dx > 0 ? Math.PI / 2 : dx < 0 ? -Math.PI / 2 : dy > 0 ? Math.PI : 0;
    state.player = {
      x: Math.floor(next.x / CELL),
      y: Math.floor(next.y / CELL),
    };
    const treasure = state.treasures.find(
      (point) =>
        Math.hypot(center(point).x - next.x, center(point).y - next.y) < 12,
    );
    if (treasure) {
      startChallenge(treasure, "treasure");
      return;
    }
    if (
      Math.hypot(center(state.exit).x - next.x, center(state.exit).y - next.y) <
        12 &&
      !state.treasures.length &&
      !state.gates.length
    ) {
      interactionLock.current = true;
      state.score += 250;
      onProgress(index, state.score);
      onLevelComplete(state.level, state.score);
      updateHud();
      setPhase(state.level < TOTAL_LEVELS ? "level" : "complete");
    }
  }
  useEffect(() => {
    const direction: Record<string, [number, number]> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      w: [0, -1],
      s: [0, 1],
      a: [-1, 0],
      d: [1, 0],
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();
        fireHeld.current = true;
        return;
      }
      const step = direction[event.key] || direction[event.key.toLowerCase()];
      if (!step) return;
      event.preventDefault();
      held.current = step;
    };
    const releaseKey = (event: KeyboardEvent) => {
      if (event.code === "Space") fireHeld.current = false;
      if (direction[event.key] || direction[event.key.toLowerCase()]) {
        held.current = null;
        game.current.speed = 0;
      }
    };
    const timer = window.setInterval(() => {
      if (held.current && phase === "playing") move(...held.current);
    }, 16);
    window.addEventListener("keydown", handleKey);
    window.addEventListener("keyup", releaseKey);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("keyup", releaseKey);
    };
  });
  useEffect(() => {
    if (phase !== "playing") return;
    const timer = window.setInterval(() => {
      const state = game.current;
      state.oxygen = Math.max(0, state.oxygen - 1);
      updateHud();
      if (state.oxygen === 0) setPhase("over");
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);
  function updateCombat(state: ReturnType<typeof makeMaze>) {
    state.frame++;
    state.invulnerable = Math.max(0, state.invulnerable - 1);
    const open = (x: number, y: number) => {
      const cellX = Math.floor(x / CELL),
        cellY = Math.floor(y / CELL);
      return (
        cellX >= 0 &&
        cellX < COLS &&
        cellY >= 0 &&
        cellY < ROWS &&
        !state.grid[cellY][cellX] &&
        !state.gates.some((gate) => gate.x === cellX && gate.y === cellY)
      );
    };
    if (fireHeld.current && state.frame >= state.fireAt) {
      state.fireAt = state.frame + 15;
      state.shots.push({
        x: state.visual.x,
        y: state.visual.y,
        vx: Math.sin(state.visual.angle) * 6,
        vy: -Math.cos(state.visual.angle) * 6,
        owner: "player",
      });
    }
    for (const enemy of state.enemies) {
      const distance = Math.hypot(
        enemy.targetX - enemy.x,
        enemy.targetY - enemy.y,
      );
      if (distance < 2) {
        const nearby = directions
          .map((direction) => ({
            x: enemy.x + direction.x * CELL,
            y: enemy.y + direction.y * CELL,
          }))
          .filter((point) => open(point.x, point.y));
        if (nearby.length) {
          const target = nearby[Math.floor(Math.random() * nearby.length)];
          enemy.targetX = target.x;
          enemy.targetY = target.y;
        }
      } else {
        enemy.x +=
          ((enemy.targetX - enemy.x) / distance) *
          Math.min(1.4, 0.65 + state.level * 0.08);
        enemy.y +=
          ((enemy.targetY - enemy.y) / distance) *
          Math.min(1.4, 0.65 + state.level * 0.08);
      }
      if (
        state.frame >= enemy.fireAt &&
        Math.hypot(state.visual.x - enemy.x, state.visual.y - enemy.y) < 270
      ) {
        const dx = state.visual.x - enemy.x,
          dy = state.visual.y - enemy.y,
          length = Math.hypot(dx, dy) || 1;
        state.shots.push({
          x: enemy.x,
          y: enemy.y,
          vx: (dx / length) * (2 + state.level * 0.4),
          vy: (dy / length) * (2 + state.level * 0.4),
          owner: "enemy",
        });
        enemy.fireAt = state.frame + Math.max(55, 125 - state.level * 7);
      }
      if (
        Math.hypot(state.visual.x - enemy.x, state.visual.y - enemy.y) < 19 &&
        state.invulnerable === 0
      ) {
        state.health--;
        state.invulnerable = 70;
        updateHud();
      }
    }
    for (const shot of state.shots) {
      shot.x += shot.vx;
      shot.y += shot.vy;
      if (!open(shot.x, shot.y)) {
        shot.x = -100;
        continue;
      }
      if (
        shot.owner === "enemy" &&
        state.invulnerable === 0 &&
        Math.hypot(shot.x - state.visual.x, shot.y - state.visual.y) < 13
      ) {
        state.health--;
        state.invulnerable = 70;
        shot.x = -100;
        updateHud();
      }
      if (shot.owner === "player")
        for (const enemy of state.enemies)
          if (Math.hypot(shot.x - enemy.x, shot.y - enemy.y) < 17) {
            enemy.hp--;
            shot.x = -100;
            if (enemy.hp <= 0) {
              state.score += 75;
              updateHud();
            }
            break;
          }
    }
    state.enemies = state.enemies.filter((enemy) => enemy.hp > 0);
    state.shots = state.shots.filter(
      (shot) => shot.x >= 0 && shot.x < W && shot.y >= 0 && shot.y < H,
    );
    if (state.health <= 0) {
      interactionLock.current = true;
      fireHeld.current = false;
      setPhase("over");
    }
  }
  const updateCombatRef = useRef(updateCombat);
  updateCombatRef.current = updateCombat;
  useEffect(() => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx) return;
    let frame = 0,
      raf = 0;
    const draw = () => {
      const state = game.current;
      frame++;
      if (phaseRef.current === "playing" && state.level > 1)
        updateCombatRef.current(state);
      if (worlds.complete && worlds.naturalWidth)
        ctx.drawImage(worlds, 627, 627, 627, 627, 0, 0, W, H);
      else {
        ctx.fillStyle = "#075075";
        ctx.fillRect(0, 0, W, H);
      }
      ctx.fillStyle = "#063b61ad";
      ctx.fillRect(0, 0, W, H);
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++)
          if (state.grid[y][x]) {
            ctx.fillStyle = (x + y) % 3 ? "#1d777a" : "#17666f";
            ctx.beginPath();
            ctx.roundRect(x * CELL + 1, y * CELL + 1, CELL - 2, CELL - 2, 6);
            ctx.fill();
            ctx.strokeStyle = "#86d6ba66";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.fillStyle = "#99e7d044";
            ctx.beginPath();
            ctx.arc(x * CELL + 9, y * CELL + 9, 3, 0, Math.PI * 2);
            ctx.fill();
          }
      for (const gate of state.gates) {
        const point = center(gate);
        ctx.shadowColor = "#49e3ff";
        ctx.shadowBlur = 16;
        ctx.fillStyle = "#103f7a";
        ctx.beginPath();
        ctx.roundRect(point.x - 15, point.y - 15, 30, 30, 5);
        ctx.fill();
        ctx.strokeStyle = "#6beaff";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#d7faff";
        ctx.font = "20px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("◆", point.x, point.y + 7);
      }
      for (const treasure of state.treasures) {
        const point = center(treasure);
        ctx.shadowColor = "#ffe38c";
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#ffc852";
        ctx.beginPath();
        ctx.arc(
          point.x,
          point.y,
          10 + Math.sin(frame / 10) * 1.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff1bc";
        ctx.fillRect(point.x - 4, point.y - 3, 8, 6);
      }
      for (const enemy of state.enemies) {
        if (fish.complete && fish.naturalWidth)
          ctx.drawImage(
            fish,
            enemy.kind * 418,
            836,
            418,
            418,
            enemy.x - 16,
            enemy.y - 16,
            32,
            32,
          );
        else {
          ctx.fillStyle = "#e77cad";
          ctx.beginPath();
          ctx.arc(enemy.x, enemy.y, 13, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      for (const shot of state.shots) {
        ctx.shadowColor = shot.owner === "player" ? "#7df9ff" : "#ff839a";
        ctx.shadowBlur = 10;
        ctx.fillStyle = shot.owner === "player" ? "#b9fbff" : "#ff617b";
        ctx.beginPath();
        ctx.arc(
          shot.x,
          shot.y,
          shot.owner === "player" ? 4 : 5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      const exit = center(state.exit);
      ctx.strokeStyle =
        state.treasures.length || state.gates.length ? "#91aab5" : "#ffe68b";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(exit.x, exit.y, 13, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = "17px serif";
      ctx.textAlign = "center";
      ctx.fillText("⚓", exit.x, exit.y + 6);
      state.visual.angle +=
        Math.atan2(
          Math.sin(state.heading - state.visual.angle),
          Math.cos(state.heading - state.visual.angle),
        ) * 0.24;
      ctx.save();
      ctx.translate(state.visual.x, state.visual.y);
      ctx.rotate(state.visual.angle);
      ctx.shadowColor = "#72e8ff";
      ctx.shadowBlur = 12;
      if (
        vehicles.complete &&
        vehicles.naturalWidth &&
        (state.invulnerable === 0 ||
          Math.floor(state.invulnerable / 5) % 2 === 0)
      )
        ctx.drawImage(vehicles, 627, 627, 627, 627, -14, -16, 28, 32);
      else {
        ctx.fillStyle = "#f4c75b";
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      if (held.current && !interactionLock.current) {
        ctx.fillStyle = "#b2f4ff99";
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(
            state.visual.x + Math.sin(frame * 0.1 + i) * 7,
            state.visual.y + 12 + i * 4,
            2 + i,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  function nextLevel() {
    const previous = game.current;
    game.current = makeMaze(previous.level + 1);
    game.current.score = previous.score;
    game.current.health = Math.min(3, previous.health + 1);
    setQueue(questionsForLevel(questions, game.current.level));
    setIndex(0);
    interactionLock.current = false;
    held.current = null;
    fireHeld.current = false;
    updateHud();
    setPhase("playing");
  }
  function answer(choice: number) {
    if (!question || !pending) return;
    if (choice === question.answerIndex) {
      const state = game.current;
      if (pending.kind === "gate")
        state.gates = state.gates.filter((gate) => !same(gate, pending.point));
      else
        state.treasures = state.treasures.filter(
          (treasure) => !same(treasure, pending.point),
        );
      state.score += pending.kind === "gate" ? 125 : 100;
      state.oxygen = Math.min(
        Math.max(100, 180 - (state.level - 1) * 12),
        state.oxygen + 30,
      );
      onProgress(index + 1, state.score);
      setIndex((value) => value + 1);
      setPending(null);
      interactionLock.current = false;
      updateHud();
      setPhase("playing");
    } else {
      if (index + 1 >= queue.length) {
        setPending(null);
        setPhase("over");
      } else setIndex((value) => value + 1);
    }
  }
  function restart() {
    interactionLock.current = false;
    held.current = null;
    fireHeld.current = false;
    game.current = makeMaze(game.current.level);
    setQueue(questionsForLevel(questions, game.current.level));
    setIndex(0);
    setPending(null);
    updateHud();
    setPhase("playing");
  }
  return (
    <div className="pro-game maze-game">
      <div className="pro-hud">
        <span>
          LEVEL{" "}
          <b>
            {hud.level}/{TOTAL_LEVELS}
          </b>
        </span>
        <span>
          HULL <b>{"♥".repeat(hud.health)}</b>
        </span>
        <span>
          OXYGEN <b>{hud.oxygen}s</b>
        </span>
        <span>
          GATES <b>{hud.gates}/1</b>
        </span>
        <span>
          TREASURE <b>{hud.found}/1</b>
        </span>
        <span>
          SCORE <b>{hud.score}</b>
        </span>
      </div>
      <div className="pro-stage">
        <button
          type="button"
          className="pro-fullscreen"
          aria-label="Full screen game"
          onClick={(event) => {
            const stage = event.currentTarget.parentElement;
            if (document.fullscreenElement) void document.exitFullscreen();
            else void stage?.requestFullscreen();
          }}
        >
          ⛶
        </button>
        <canvas
          ref={canvas}
          width={W}
          height={H}
          onPointerDown={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            touch.current = {
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            if (!touch.current || !event.buttons) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            const dx = event.clientX - bounds.left - touch.current.x,
              dy = event.clientY - bounds.top - touch.current.y;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 14) {
              held.current = null;
              return;
            }
            held.current =
              Math.abs(dx) > Math.abs(dy)
                ? [dx > 0 ? 1 : -1, 0]
                : [0, dy > 0 ? 1 : -1];
          }}
          onPointerUp={() => {
            touch.current = null;
            held.current = null;
            game.current.speed = 0;
          }}
          onPointerCancel={() => {
            touch.current = null;
            held.current = null;
            game.current.speed = 0;
          }}
        />
        {phase !== "playing" && (
          <div className="pro-overlay">
            {phase === "ready" ? (
              <div className="pro-panel pro-intro-panel">
                <small>UNDERWATER EXPEDITION</small>
                <h3>Treasure Maze</h3>
                <p>
                  Explore the reef, unlock sealed passages with course
                  challenges, find treasures, and reach the exit before oxygen
                  runs out. Swipe or use arrow keys.
                </p>
                <button onClick={() => setPhase("playing")}>Dive in</button>
              </div>
            ) : phase === "level" ? (
              <div className="pro-panel">
                <small>DEEPER WATERS</small>
                <h3>Level {hud.level + 1}</h3>
                <p>
                  Patrolling fish now guard the maze and fire at your submarine.
                  Press Space to shoot back.
                </p>
                <button onClick={nextLevel}>Continue expedition</button>
              </div>
            ) : phase === "over" || phase === "complete" ? (
              <div className="pro-panel">
                <h3>
                  {phase === "complete"
                    ? "Treasure found!"
                    : "Expedition ended"}
                </h3>
                <p>Score {hud.score}</p>
                <button onClick={restart}>Dive again</button>
              </div>
            ) : (
              question && (
                <div className="pro-panel pro-question">
                  <small>
                    {pending?.kind === "gate"
                      ? "OPEN THE SEA GATE"
                      : "UNLOCK THE TREASURE"}{" "}
                    · {index + 1}/{queue.length}
                  </small>
                  <h3>{question.question}</h3>
                  <div>
                    {question.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => answer(optionIndex)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  <p>Correct opens the way. Wrong brings a new challenge.</p>
                </div>
              )
            )}
          </div>
        )}
      </div>
      <div className="pro-tip">
        Hold a direction to glide · Space fires in later levels · Each level
        adds more gates and enemies
      </div>
    </div>
  );
}
