import { useEffect, useRef, useState } from "react";
import type { Exercise, SubjectId } from "../../types";
import { rememberQuestion } from "./questionOrder";
import { questionsForLevel, TOTAL_LEVELS } from "./levelQuestions";
import worldAtlas from "./assets/worlds.png";
import vehiclesAtlas from "./assets/vehicles.png";
import alienAtlas from "./assets/aliens.png";
import "./new-games.css";

type Props = { questions: Exercise[]; subjectId: SubjectId; onProgress: (count: number, score: number) => void; onLevelComplete: (level: number, score: number) => void; startLevel: number };
type Enemy = { x: number; y: number; kind: number; phase: number; fireAt: number; hp: number };
type Shot = { x: number; y: number; vx: number; vy: number };
type Boss = { x: number; y: number; hp: number; maxHp: number; fireAt: number; phase: number };
type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string };
const W = 720, H = 440;
const load = (url: string) => { const image = new Image(); image.src = url; return image; };
const world = load(worldAtlas), ships = load(vehiclesAtlas), aliens = load(alienAtlas);
const isBossLevel = (level: number) => level >= 4 && level % 3 === 1;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
function sprite(ctx: CanvasRenderingContext2D, atlas: HTMLImageElement, sx: number, sy: number, sw: number, sh: number, x: number, y: number, w: number, h: number) {
  if (atlas.complete && atlas.naturalWidth) ctx.drawImage(atlas, sx, sy, sw, sh, x - w / 2, y - h / 2, w, h);
}
function createGame(level: number) {
  return { level, x: W / 2, y: H - 70, vx: 0, vy: 0, score: 0, health: 3, kills: 0, frame: 0, spawn: 0, fire: 0, shield: 0, invulnerable: 0, enemies: [] as Enemy[], shots: [] as Shot[], enemyShots: [] as Shot[], sparks: [] as Spark[], boss: isBossLevel(level) ? { x: W / 2, y: -90, hp: 12 + level * 3, maxHp: 12 + level * 3, fireAt: 90, phase: 0 } as Boss : null as Boss | null, last: 0 };
}
export function SpaceDefense({ questions, subjectId, onProgress, onLevelComplete, startLevel }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const game = useRef(createGame(startLevel));
  const input = useRef({ left: false, right: false, up: false, down: false, firing: false, target: null as { x: number; y: number } | null });
  const [queue, setQueue] = useState(() => questionsForLevel(questions, startLevel));
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<"ready" | "playing" | "question" | "over" | "complete">("ready");
  const [hud, setHud] = useState({ level: startLevel, score: 0, health: 3, kills: 0, bossHp: 0, bossMax: 0 });
  const [feedback, setFeedback] = useState("");
  const [challengeReason, setChallengeReason] = useState<"hit" | "level">("level");
  const question = queue[questionIndex];
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "a", "d", "w", "s"].includes(event.key.toLowerCase()) || event.key.startsWith("Arrow")) event.preventDefault();
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") input.current.left = true;
      if (key === "arrowright" || key === "d") input.current.right = true;
      if (key === "arrowup" || key === "w") input.current.up = true;
      if (key === "arrowdown" || key === "s") input.current.down = true;
      if (event.code === "Space") input.current.firing = true;
    };
    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "arrowleft" || key === "a") input.current.left = false;
      if (key === "arrowright" || key === "d") input.current.right = false;
      if (key === "arrowup" || key === "w") input.current.up = false;
      if (key === "arrowdown" || key === "s") input.current.down = false;
      if (event.code === "Space") input.current.firing = false;
    };
    window.addEventListener("keydown", down); window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, []);
  useEffect(() => {
    if (phase !== "playing") return;
    const ctx = canvas.current?.getContext("2d"); if (!ctx) return;
    let raf = 0;
    const burst = (x: number, y: number, color: string, count: number) => {
      for (let i = 0; i < count; i++) { const angle = Math.random() * Math.PI * 2, speed = 1 + Math.random() * 3; game.current.sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 28 + Math.random() * 18, color }); }
    };
    const damage = () => { const s = game.current; if (s.shield > 0 || s.invulnerable > 0) return; s.health--; s.invulnerable = 85; burst(s.x, s.y, "#ff8da1", 14); };
    const draw = (now: number) => {
      const s = game.current, dt = Math.min((now - (s.last || now)) / 16.67, 2); s.last = now; s.frame += dt; s.spawn += dt; s.fire += dt; s.shield = Math.max(0, s.shield - dt); s.invulnerable = Math.max(0, s.invulnerable - dt);
      const keys = input.current;
      if (keys.target) { s.vx += (keys.target.x - s.x) * .05 * dt; s.vy += (keys.target.y - s.y) * .05 * dt; }
      else { s.vx += ((keys.right ? 1 : 0) - (keys.left ? 1 : 0)) * .85 * dt; s.vy += ((keys.down ? 1 : 0) - (keys.up ? 1 : 0)) * .85 * dt; }
      s.vx *= Math.pow(.83, dt); s.vy *= Math.pow(.83, dt); s.x = clamp(s.x + s.vx * dt, 44, W - 44); s.y = clamp(s.y + s.vy * dt, H * .38, H - 47);
      if (keys.firing && s.fire >= 8) { s.fire = 0; s.shots.push({ x: s.x - 18, y: s.y - 22, vx: -.25, vy: -11 }, { x: s.x + 18, y: s.y - 22, vx: .25, vy: -11 }); }
      if (s.spawn > Math.max(25, 68 - s.level * 4) && s.kills < 8) { s.spawn = 0; s.enemies.push({ x: 55 + Math.random() * (W - 110), y: -35, kind: Math.floor(Math.random() * 3), phase: Math.random() * 7, fireAt: s.frame + 50 + Math.random() * 55, hp: s.level >= 7 ? 2 : 1 }); }
      if (s.boss) {
        const boss = s.boss; boss.phase += dt; boss.y += (95 - boss.y) * .025 * dt; boss.x = W / 2 + Math.sin(boss.phase / 34) * 185;
        if (s.frame >= boss.fireAt && boss.y > 65) { boss.fireAt = s.frame + Math.max(27, 55 - s.level * 2); const dx = s.x - boss.x, dy = s.y - boss.y, angle = Math.atan2(dy, dx); for (const spread of [-.4, 0, .4]) s.enemyShots.push({ x: boss.x, y: boss.y + 55, vx: Math.cos(angle + spread) * (3.2 + s.level * .2), vy: Math.sin(angle + spread) * (3.2 + s.level * .2) }); }
      }
      for (const enemy of s.enemies) {
        enemy.y += (1.8 + s.level * .27) * dt; enemy.x += Math.sin(s.frame / 23 + enemy.phase) * .95 * dt;
        if (s.level >= 2 && s.frame >= enemy.fireAt && enemy.y < H - 110) { enemy.fireAt = s.frame + Math.max(50, 115 - s.level * 6); const dx = s.x - enemy.x, dy = s.y - enemy.y, length = Math.hypot(dx, dy) || 1; s.enemyShots.push({ x: enemy.x, y: enemy.y + 20, vx: dx / length * (2.6 + s.level * .18), vy: dy / length * (2.6 + s.level * .18) }); }
        if (Math.hypot(enemy.x - s.x, enemy.y - s.y) < 38) { enemy.hp = 0; damage(); burst(enemy.x, enemy.y, "#ffbc70", 10); }
        if (enemy.y > H + 35) { enemy.hp = 0; damage(); }
      }
      for (const shot of s.shots) {
        shot.x += shot.vx * dt; shot.y += shot.vy * dt;
        for (const enemy of s.enemies) if (enemy.hp > 0 && Math.hypot(shot.x - enemy.x, shot.y - enemy.y) < 27) { enemy.hp--; shot.y = -100; if (enemy.hp === 0) { s.kills++; s.score += 30; burst(enemy.x, enemy.y, "#a7ffad", 9); } break; }
        if (s.boss && Math.abs(shot.x - s.boss.x) < 70 && Math.abs(shot.y - s.boss.y) < 60) { s.boss.hp--; shot.y = -100; burst(shot.x, s.boss.y, "#e69dff", 3); if (s.boss.hp <= 0) { s.score += 500; burst(s.boss.x, s.boss.y, "#ffb1e8", 48); s.boss = null; } }
      }
      let projectileHit = false;
      for (const shot of s.enemyShots) { shot.x += shot.vx * dt; shot.y += shot.vy * dt; if (s.shield <= 0 && Math.hypot(shot.x - s.x, shot.y - s.y) < 23) { shot.y = H + 100; projectileHit = true; burst(s.x, s.y, "#ff8da1", 16); break; } }
      s.shots = s.shots.filter((shot) => shot.y > -30); s.enemyShots = s.enemyShots.filter((shot) => shot.y < H + 30 && shot.x > -20 && shot.x < W + 20);
      s.enemies = s.enemies.filter((enemy) => enemy.hp > 0 && enemy.y < H + 35);
      for (const spark of s.sparks) { spark.x += spark.vx * dt; spark.y += spark.vy * dt; spark.life -= dt; } s.sparks = s.sparks.filter((spark) => spark.life > 0);
      setHud({ level: s.level, score: s.score, health: s.health, kills: s.kills, bossHp: s.boss?.hp || 0, bossMax: s.boss?.maxHp || 0 });
      if (s.health <= 0) { onProgress(questionIndex, s.score); setPhase("over"); return; }
      if (projectileHit) { if (!queue[questionIndex]) { setPhase("over"); return; } s.enemyShots = []; input.current.firing = false; input.current.target = null; rememberQuestion(subjectId, queue[questionIndex].id); setChallengeReason("hit"); setPhase("question"); return; }
      if (s.kills >= 8 && !s.boss) { onLevelComplete(s.level, s.score); if (s.level === TOTAL_LEVELS) { setPhase("complete"); return; } if (!queue[questionIndex]) { setPhase("over"); return; } rememberQuestion(subjectId, queue[questionIndex].id); setChallengeReason("level"); setPhase("question"); return; }
      ctx.fillStyle = "#07132e"; ctx.fillRect(0, 0, W, H);
      if (world.complete && world.naturalWidth) { ctx.globalAlpha = .62; ctx.drawImage(world, 0, 627, 627, 627, 0, 0, W, H); ctx.globalAlpha = 1; }
      const glow = ctx.createRadialGradient(W / 2, H * .35, 20, W / 2, H * .35, 420); glow.addColorStop(0, "#2b3d85aa"); glow.addColorStop(1, "#06102a00"); ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 85; i++) { const x = (i * 193) % W, y = (i * 79 + s.frame * (1.2 + i % 4)) % H; ctx.fillStyle = i % 7 === 0 ? "#b6eaff" : "#8ea9ec88"; ctx.fillRect(x, y, i % 7 === 0 ? 2.5 : 1.3, i % 7 === 0 ? 7 : 2); }
      ctx.strokeStyle = "#75a6e522"; ctx.lineWidth = 1; for (let x = 0; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (const shot of s.shots) { ctx.shadowColor = "#62f8ff"; ctx.shadowBlur = 18; ctx.fillStyle = "#c9fdff"; ctx.fillRect(shot.x - 3, shot.y - 15, 6, 22); } ctx.shadowBlur = 0;
      for (const shot of s.enemyShots) { ctx.shadowColor = "#ff658d"; ctx.shadowBlur = 16; ctx.fillStyle = "#ff8ca5"; ctx.beginPath(); ctx.arc(shot.x, shot.y, 5, 0, Math.PI * 2); ctx.fill(); } ctx.shadowBlur = 0;
      for (const enemy of s.enemies) sprite(ctx, aliens, enemy.kind * 724, 0, 724, 724, enemy.x, enemy.y, 58, 58);
      if (s.boss) { ctx.shadowColor = "#e75dff"; ctx.shadowBlur = 35; sprite(ctx, aliens, 724, 0, 724, 724, s.boss.x, s.boss.y, 170, 170); ctx.shadowBlur = 0; }
      ctx.save(); ctx.translate(s.x, s.y); ctx.rotate(clamp(s.vx * .018, -.16, .16));
      ctx.fillStyle = "#47e6ff88"; ctx.shadowColor = "#2eeaff"; ctx.shadowBlur = 25; const flame = 18 + Math.sin(s.frame * .7) * 7; for (const engine of [-17, 17]) { ctx.beginPath(); ctx.ellipse(engine, 34 + flame / 2, 7, flame, 0, 0, Math.PI * 2); ctx.fill(); } ctx.shadowBlur = 0;
      if (s.invulnerable === 0 || Math.floor(s.invulnerable / 5) % 2 === 0) sprite(ctx, ships, 0, 627, 627, 627, 0, 0, 82, 86);
      ctx.restore();
      if (s.shield > 0) { ctx.strokeStyle = "#6cf7ff"; ctx.shadowColor = "#52ebff"; ctx.shadowBlur = 18; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(s.x, s.y, 48, 0, Math.PI * 2); ctx.stroke(); ctx.shadowBlur = 0; }
      for (const spark of s.sparks) { ctx.globalAlpha = Math.min(1, spark.life / 25); ctx.fillStyle = spark.color; ctx.fillRect(spark.x, spark.y, 3, 3); } ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw); return () => cancelAnimationFrame(raf);
  }, [phase, questionIndex, queue, subjectId, onProgress, onLevelComplete]);
  function answer(choice: number) {
    if (!question || feedback) return;
    const s = game.current;
    if (choice === question.answerIndex) {
      s.score += 100; s.shield = 160; s.health = Math.min(3, s.health + 1); onProgress(questionIndex + 1, s.score);
      setFeedback("Correct! Hull restored and shield charged.");
      window.setTimeout(() => {
        if (challengeReason === "hit") { s.last = 0; setQuestionIndex((value) => value + 1); }
        else { const next = s.level + 1; const carry = { score: s.score, health: s.health }; game.current = createGame(next); game.current.score = carry.score; game.current.health = carry.health; game.current.shield = 160; setQueue(questionsForLevel(questions, next)); setQuestionIndex(0); }
        setFeedback(""); setPhase("playing");
      }, 700);
    } else {
      setFeedback("New question incoming…");
      window.setTimeout(() => { setFeedback(""); if (questionIndex + 1 >= queue.length) { setPhase("over"); return; } setQuestionIndex((value) => value + 1); }, 650);
    }
  }
  function restart() { game.current = createGame(game.current.level); setQueue(questionsForLevel(questions, game.current.level)); setQuestionIndex(0); setFeedback(""); setChallengeReason("level"); setHud({ level: game.current.level, score: 0, health: 3, kills: 0, bossHp: game.current.boss?.hp || 0, bossMax: game.current.boss?.maxHp || 0 }); setPhase("playing"); }
  function point(event: React.PointerEvent<HTMLCanvasElement>) { const bounds = event.currentTarget.getBoundingClientRect(); return { x: (event.clientX - bounds.left) * W / bounds.width, y: (event.clientY - bounds.top) * H / bounds.height }; }
  return <div className="pro-game alien-defense"><div className="pro-hud"><span>HULL <b>{"♥".repeat(Math.max(0, hud.health))}{"♡".repeat(Math.max(0, 3 - hud.health))}</b></span><span>LEVEL <b>{hud.level}/{TOTAL_LEVELS}</b></span><span>ALIENS <b>{hud.kills}/8</b></span><span>SCORE <b>{hud.score}</b></span></div>{hud.bossMax > 0 && <div className="alien-boss-health"><span>BOSS INTEGRITY</span><div><i style={{ width: `${Math.max(0, hud.bossHp / hud.bossMax * 100)}%` }} /></div><strong>{hud.bossHp}/{hud.bossMax}</strong></div>}<div className="pro-stage"><canvas ref={canvas} width={W} height={H} onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); input.current.target = point(event); input.current.firing = true; }} onPointerMove={(event) => { if (event.buttons) input.current.target = point(event); }} onPointerUp={() => { input.current.target = null; input.current.firing = false; }} onPointerCancel={() => { input.current.target = null; input.current.firing = false; }} />{phase !== "playing" && <div className="pro-overlay">{phase === "ready" ? <div className="pro-panel"><small>STAR DEFENSE · LEVEL {startLevel}</small><h3>Alien Defense</h3><p>Fly with arrow keys or W A S D. Press Space to fire. On touch, drag your ship to move and shoot. Aliens fire back from level 2; bosses arrive at levels 4, 7 and 10.</p><button onClick={() => setPhase("playing")}>Launch mission</button></div> : phase === "over" || phase === "complete" ? <div className="pro-panel"><h3>{phase === "complete" ? "All 10 levels complete!" : "Mission ended"}</h3><p>Level {hud.level} · Score {hud.score}</p><button onClick={restart}>Try level {hud.level} again</button></div> : question && <div className="pro-panel pro-question"><small>{challengeReason === "hit" ? `SHIP HIT · LEVEL ${hud.level} · ANSWER TO CONTINUE` : `LEVEL ${hud.level} CLEARED · POWER-UP CHALLENGE`}</small><h3>{question.question}</h3><div>{question.options.map((option, index) => <button key={index} onClick={() => answer(index)} disabled={!!feedback}>{option}</button>)}</div>{feedback && <p role="status">{feedback}</p>}</div>}</div>}</div><div className="pro-tip">Fly with arrows or W A S D · Space fires · Drag to steer and shoot on touch</div></div>;
}
