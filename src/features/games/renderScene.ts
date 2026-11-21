import vehicleAtlasUrl from "./assets/vehicles.png";
import worldAtlasUrl from "./assets/worlds.png";
import hazardAtlasUrl from "./assets/hazards.png";
import alienAtlasUrl from "./assets/aliens.png";
import heartAtlasUrl from "./assets/hearts.png";

type Mode = "drive" | "flight" | "space" | "sea";
type Point = { x: number; y: number };
type Hazard = Point & { kind?: number };
type HeartPickup = Point & { kind?: number };
type Particle = Point & { life: number };
const CELL = 627;
const vehicles = new Image();
vehicles.src = vehicleAtlasUrl;
const worlds = new Image();
worlds.src = worldAtlasUrl;
const hazards = new Image();
hazards.src = hazardAtlasUrl;
const aliens = new Image();
aliens.src = alienAtlasUrl;
const hearts = new Image();
hearts.src = heartAtlasUrl;
const quadrant: Record<Mode, [number, number]> = {
  drive: [0, 0],
  flight: [1, 0],
  space: [0, 1],
  sea: [1, 1],
};
function drawVehicle(
  ctx: CanvasRenderingContext2D,
  mode: Mode,
  x: number,
  y: number,
  tilt: number,
) {
  if (!vehicles.complete || !vehicles.naturalWidth) return;
  const [qx, qy] = quadrant[mode];
  const size =
    mode === "drive"
      ? [55, 82]
      : mode === "sea"
        ? [76, 92]
        : mode === "flight"
          ? [78, 76]
          : [96, 92];
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  ctx.shadowColor = "#07112b99";
  ctx.shadowBlur = 13;
  ctx.shadowOffsetY = 9;
  ctx.drawImage(
    vehicles,
    qx * CELL,
    qy * CELL,
    CELL,
    CELL,
    -size[0] / 2,
    -size[1] / 2,
    size[0],
    size[1],
  );
  ctx.restore();
}
function drawHazard(
  ctx: CanvasRenderingContext2D,
  mode: Mode,
  x: number,
  y: number,
  kind = 0,
) {
  if (mode === "space" && aliens.complete && aliens.naturalWidth) {
    const size = kind === 2 ? 64 : 70;
    ctx.save();
    ctx.shadowColor = kind === 1 ? "#a45bff" : "#5cf4bc";
    ctx.shadowBlur = 14;
    ctx.drawImage(
      aliens,
      kind * 724,
      0,
      724,
      724,
      x - size / 2,
      y - size / 2,
      size,
      size,
    );
    ctx.restore();
    return;
  }
  if (mode !== "space" && hazards.complete && hazards.naturalWidth) {
    const row = mode === "drive" ? 0 : mode === "flight" ? 1 : 2;
    const size =
      mode === "drive" ? (kind === 0 ? 72 : 62) : mode === "flight" ? 58 : 67;
    ctx.save();
    ctx.shadowColor = "#07112b88";
    ctx.shadowBlur = 11;
    ctx.shadowOffsetY = 7;
    ctx.drawImage(
      hazards,
      kind * 418,
      row * 418,
      418,
      418,
      x - size / 2,
      y - size / 2,
      size,
      size,
    );
    ctx.restore();
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.shadowColor = "#09132677";
  ctx.shadowBlur = 11;
  ctx.shadowOffsetY = 6;
  if (mode === "drive") {
    ctx.fillStyle = "#e4564b";
    ctx.beginPath();
    ctx.roundRect(-23, -31, 46, 65, 9);
    ctx.fill();
    ctx.fillStyle = "#8ac5dc";
    ctx.beginPath();
    ctx.roundRect(-17, -14, 34, 20, 5);
    ctx.fill();
    ctx.fillStyle = "#1d2538";
    ctx.fillRect(-29, -18, 7, 15);
    ctx.fillRect(22, -18, 7, 15);
    ctx.fillRect(-29, 18, 7, 15);
    ctx.fillRect(22, 18, 7, 15);
    ctx.fillStyle = "#ffc97e";
    ctx.fillRect(-18, -28, 9, 5);
    ctx.fillRect(9, -28, 9, 5);
  } else if (mode === "space") {
    const rock = ctx.createRadialGradient(-9, -10, 2, 0, 0, 31);
    rock.addColorStop(0, "#d8a68e");
    rock.addColorStop(1, "#62465e");
    ctx.fillStyle = rock;
    ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const angle = (i * Math.PI * 2) / 9,
        r = 23 + (i % 3) * 3;
      ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#4d3c54";
    ctx.beginPath();
    ctx.arc(-7, 7, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (mode === "sea") {
    ctx.fillStyle = "#f36c78";
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(12, -7);
    ctx.lineTo(30, 0);
    ctx.lineTo(12, 8);
    ctx.lineTo(0, 31);
    ctx.lineTo(-12, 8);
    ctx.lineTo(-30, 0);
    ctx.lineTo(-12, -7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#ffb7a0";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.lineTo(18, 0);
    ctx.moveTo(0, -19);
    ctx.lineTo(0, 20);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#34466f";
    ctx.beginPath();
    ctx.ellipse(0, 0, 35, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#b5c5db";
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(i * 15, -10, 11, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
function drawElectricShield(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  frame: number,
) {
  ctx.save();
  const pulse = 1 + Math.sin(frame * 0.13) * 0.025;
  const r = radius * pulse;
  const glow = ctx.createRadialGradient(x, y, r * 0.55, x, y, r + 16);
  glow.addColorStop(0, "#68e8ff00");
  glow.addColorStop(0.72, "#68e8ff12");
  glow.addColorStop(1, "#60dfff00");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, r + 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowColor = "#2de5ff";
  ctx.shadowBlur = 18;
  ctx.strokeStyle = "#77f1ff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "#d5fbff";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(x, y, r - 4, 0, Math.PI * 2);
  ctx.stroke();
  for (let arc = 0; arc < 5; arc++) {
    const start = frame * 0.025 + (arc * Math.PI * 2) / 5;
    ctx.strokeStyle = arc % 2 ? "#66cfff" : "#dcffff";
    ctx.lineWidth = arc % 2 ? 2.4 : 3.1;
    ctx.shadowColor = "#52e8ff";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let point = 0; point <= 8; point++) {
      const angle = start + point * 0.055;
      const jag = Math.sin(frame * 0.21 + arc * 9 + point * 4) * 3;
      const px = x + Math.cos(angle) * (r + jag);
      const py = y + Math.sin(angle) * (r + jag);
      if (point === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    const sparkAngle = start + 0.44;
    ctx.fillStyle = "#e8ffff";
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(sparkAngle) * (r + 4),
      y + Math.sin(sparkAngle) * (r + 4),
      2.2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}
export function renderScene(
  ctx: CanvasRenderingContext2D,
  mode: Mode,
  frame: number,
  x: number,
  y: number,
  obstacles: Hazard[],
  shield: number,
  pickups: HeartPickup[] = [],
  particles: Particle[] = [],
  boosting = false,
  velocity = 0,
  difficulty = 1,
  W = 720,
  H = 440,
) {
  const [qx, qy] = quadrant[mode];
  if (worlds.complete && worlds.naturalWidth) {
    if (mode === "drive") {
      const offset = (frame * (4.8 + difficulty * 2.2)) % H;
      ctx.drawImage(
        worlds,
        qx * CELL,
        qy * CELL,
        CELL,
        CELL,
        0,
        offset - H,
        W,
        H,
      );
      ctx.drawImage(worlds, qx * CELL, qy * CELL, CELL, CELL, 0, offset, W, H);
    } else ctx.drawImage(worlds, qx * CELL, qy * CELL, CELL, CELL, 0, 0, W, H);
  } else {
    ctx.fillStyle =
      mode === "space"
        ? "#151539"
        : mode === "sea"
          ? "#12617f"
          : mode === "drive"
            ? "#394b42"
            : "#348fd2";
    ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = mode === "drive" ? "#ffffff30" : "#ffffff25";
  for (let i = 0; i < 12; i++) {
    const sx = 70 + ((i * 157) % 580),
      sy = ((i * 89 + frame * (mode === "space" ? 9 : 6)) % 520) - 40;
    ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1, 15 + (i % 4) * 9);
  }
  for (const pickup of pickups) {
    ctx.save();
    ctx.translate(pickup.x, pickup.y);
    const pulse = 1 + Math.sin(frame / 10 + pickup.x) * 0.06;
    ctx.scale(pulse, pulse);
    if (hearts.complete && hearts.naturalWidth) {
      const kind = pickup.kind ?? 0;
      const size = kind === 1 ? 53 : 48;
      ctx.shadowColor =
        kind === 2 ? "#37dfff" : kind === 1 ? "#ffdc64" : "#ff668c";
      ctx.shadowBlur = 15;
      ctx.drawImage(
        hearts,
        kind * 724,
        0,
        724,
        724,
        -size / 2,
        -size / 2,
        size,
        size,
      );
    } else {
      ctx.fillStyle = "#ff587b";
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.bezierCurveTo(-25, -1, -20, -18, -8, -17);
      ctx.bezierCurveTo(-2, -17, 0, -12, 0, -9);
      ctx.bezierCurveTo(0, -12, 2, -17, 8, -17);
      ctx.bezierCurveTo(20, -18, 25, -1, 0, 14);
      ctx.fill();
    }
    ctx.restore();
  }
  for (const obstacle of obstacles)
    drawHazard(ctx, mode, obstacle.x, obstacle.y, obstacle.kind);
  if (shield <= 0 || Math.floor(shield / 5) % 2 === 0)
    drawVehicle(
      ctx,
      mode,
      x,
      y,
      Math.max(-0.12, Math.min(0.12, velocity / 75)),
    );
  if (boosting) {
    const flame = ctx.createLinearGradient(x, 390, x, 435);
    flame.addColorStop(0, "#fff2a5");
    flame.addColorStop(0.5, "#ffae45");
    flame.addColorStop(1, "#ff5c4666");
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(x - 11, y + 35);
    ctx.lineTo(x, y + 65 + Math.sin(frame) * 10);
    ctx.lineTo(x + 11, y + 35);
    ctx.fill();
  }
  if (shield > 80)
    drawElectricShield(
      ctx,
      x,
      y,
      mode === "drive" ? 45 : mode === "flight" ? 46 : 53,
      frame,
    );
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, particle.life / 35);
    ctx.fillStyle = "#ffe28a";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const vignette = ctx.createLinearGradient(0, 0, 0, H);
  vignette.addColorStop(0, "#07111c55");
  vignette.addColorStop(0.22, "#07111c00");
  vignette.addColorStop(0.85, "#07111c00");
  vignette.addColorStop(1, "#07111c55");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
}
