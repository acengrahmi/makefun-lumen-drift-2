// Lumen Drift II — the night garden itself, drawn fresh every frame so it
// lives: a haloed moon, drifting clouds, wandering fireflies, swaying pine
// silhouettes, glowing mushrooms and a shimmering pond, over the seeded
// stars, grass tufts and flowers. All scenery is seeded once, so every load
// (and every screenshot) agrees on where things stand; only the motion uses
// the world's clock.
import { ARENA, PALETTE } from './config.js';
import { makeRng, rngRange } from './random.js';

// Fixed scenery, seeded once so every load (and every screenshot) agrees.
const sceneryRng = makeRng(20261116);
const STARS = [];
for (let i = 0; i < 110; i += 1) {
  STARS.push({
    x: rngRange(sceneryRng, 0, ARENA.width),
    y: rngRange(sceneryRng, 0, ARENA.height),
    r: rngRange(sceneryRng, 0.8, 2.4),
    phase: rngRange(sceneryRng, 0, Math.PI * 2),
  });
}
const TUFTS = [];
for (let i = 0; i < 46; i += 1) {
  TUFTS.push({
    x: rngRange(sceneryRng, 20, ARENA.width - 20),
    y: rngRange(sceneryRng, 90, ARENA.height - 30),
    s: rngRange(sceneryRng, 0.7, 1.4),
  });
}
const FLOWERS = [];
const FLOWER_COLOURS = [PALETTE.flowerPink, PALETTE.flowerGold, PALETTE.flowerBlue];
for (let i = 0; i < 16; i += 1) {
  FLOWERS.push({
    x: rngRange(sceneryRng, 40, ARENA.width - 40),
    y: rngRange(sceneryRng, 110, ARENA.height - 40),
    colour: FLOWER_COLOURS[i % FLOWER_COLOURS.length],
    phase: rngRange(sceneryRng, 0, Math.PI * 2),
  });
}
const CLOUDS = [];
for (let i = 0; i < 5; i += 1) {
  CLOUDS.push({
    baseX: rngRange(sceneryRng, 0, ARENA.width),
    y: rngRange(sceneryRng, 40, 220),
    speed: rngRange(sceneryRng, 4, 9),
    scale: rngRange(sceneryRng, 0.8, 1.6),
  });
}
const FIREFLIES = [];
for (let i = 0; i < 26; i += 1) {
  FIREFLIES.push({
    baseX: rngRange(sceneryRng, 60, ARENA.width - 60),
    baseY: rngRange(sceneryRng, 90, ARENA.height - 90),
    ampX: rngRange(sceneryRng, 18, 55),
    ampY: rngRange(sceneryRng, 12, 34),
    speed: rngRange(sceneryRng, 0.3, 0.9),
    phase: rngRange(sceneryRng, 0, Math.PI * 2),
  });
}
const MUSHROOMS = [];
for (let i = 0; i < 8; i += 1) {
  MUSHROOMS.push({
    x: rngRange(sceneryRng, 60, ARENA.width - 60),
    y: rngRange(sceneryRng, ARENA.height - 120, ARENA.height - 40),
    s: rngRange(sceneryRng, 0.8, 1.5),
    colour: i % 2 === 0 ? '#7fd4ff' : '#ff7fb0',
    phase: rngRange(sceneryRng, 0, Math.PI * 2),
  });
}
const PINES = [];
for (let i = 0; i < 14; i += 1) {
  PINES.push({
    x: 30 + i * 92 + rngRange(sceneryRng, -18, 18),
    h: rngRange(sceneryRng, 46, 84),
    sway: rngRange(sceneryRng, 0, Math.PI * 2),
  });
}

function drawMoon(ctx, world) {
  const mx = 1090;
  const my = 104;
  const halo = ctx.createRadialGradient(mx, my, 30, mx, my, 150);
  halo.addColorStop(0, 'rgba(255, 244, 200, 0.28)');
  halo.addColorStop(1, 'rgba(255, 244, 200, 0)');
  ctx.fillStyle = halo;
  ctx.fillRect(mx - 150, my - 150, 300, 300);
  ctx.save();
  ctx.shadowColor = '#fff4c8';
  ctx.shadowBlur = 26;
  ctx.fillStyle = '#fdf3c4';
  ctx.beginPath();
  ctx.arc(mx, my, 44, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Craters, quiet and pale.
  ctx.fillStyle = 'rgba(214, 196, 140, 0.55)';
  ctx.beginPath();
  ctx.arc(mx - 14, my - 8, 8, 0, Math.PI * 2);
  ctx.arc(mx + 12, my + 12, 6, 0, Math.PI * 2);
  ctx.arc(mx + 16, my - 16, 4.5, 0, Math.PI * 2);
  ctx.fill();
}

function drawClouds(ctx, world) {
  ctx.save();
  ctx.fillStyle = 'rgba(190, 205, 255, 0.07)';
  CLOUDS.forEach((cloud) => {
    const x = ((cloud.baseX + world.time * cloud.speed) % (ARENA.width + 320)) - 160;
    const y = cloud.y;
    const s = cloud.scale;
    ctx.beginPath();
    ctx.ellipse(x, y, 74 * s, 16 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 42 * s, y + 6, 52 * s, 13 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(x - 46 * s, y + 7, 46 * s, 12 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawFireflies(ctx, world) {
  FIREFLIES.forEach((fly) => {
    const x = fly.baseX + Math.sin(world.time * fly.speed + fly.phase) * fly.ampX;
    const y = fly.baseY + Math.cos(world.time * fly.speed * 0.8 + fly.phase) * fly.ampY;
    const glow = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(world.time * 2.2 + fly.phase * 3));
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.shadowColor = '#ffe98a';
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffe98a';
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawPines(ctx, world) {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 14, 34, 0.85)';
  PINES.forEach((pine) => {
    const sway = Math.sin(world.time * 0.5 + pine.sway) * 2;
    const x = pine.x + sway;
    const base = ARENA.height - 6;
    const h = pine.h;
    ctx.beginPath();
    ctx.moveTo(x - 20, base);
    ctx.lineTo(x, base - h);
    ctx.lineTo(x + 20, base);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 14, base - h * 0.45);
    ctx.lineTo(x, base - h * 1.15);
    ctx.lineTo(x + 14, base - h * 0.45);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

function drawPond(ctx, world) {
  const px = 150;
  const py = 636;
  ctx.save();
  const water = ctx.createRadialGradient(px, py, 8, px, py, 120);
  water.addColorStop(0, 'rgba(90, 140, 220, 0.35)');
  water.addColorStop(1, 'rgba(90, 140, 220, 0.05)');
  ctx.fillStyle = water;
  ctx.beginPath();
  ctx.ellipse(px, py, 118, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  // Shimmer arcs that breathe with the clock.
  ctx.strokeStyle = 'rgba(180, 220, 255, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i += 1) {
    const w = 40 + i * 28 + Math.sin(world.time * 1.3 + i * 2) * 6;
    ctx.beginPath();
    ctx.ellipse(px, py, w, 10 + i * 5, 0, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
  }
  ctx.restore();
}

function drawMushrooms(ctx, world) {
  MUSHROOMS.forEach((m) => {
    const glow = 0.5 + 0.4 * Math.sin(world.time * 1.8 + m.phase);
    ctx.save();
    ctx.globalAlpha = glow;
    ctx.shadowColor = m.colour;
    ctx.shadowBlur = 14;
    ctx.fillStyle = m.colour;
    ctx.beginPath();
    ctx.arc(m.x, m.y - 6 * m.s, 7 * m.s, Math.PI, 0);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#e8ecff';
    ctx.fillRect(m.x - 1.6 * m.s, m.y - 6 * m.s, 3.2 * m.s, 8 * m.s);
    ctx.restore();
  });
}

export function drawBackground(ctx, world) {
  const grad = ctx.createLinearGradient(0, 0, 0, ARENA.height);
  grad.addColorStop(0, PALETTE.skyTop);
  grad.addColorStop(1, PALETTE.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);

  // A soft pool of light in the middle of the garden.
  const pool = ctx.createRadialGradient(640, 360, 60, 640, 360, 620);
  pool.addColorStop(0, 'rgba(60, 90, 160, 0.35)');
  pool.addColorStop(1, 'rgba(60, 90, 160, 0)');
  ctx.fillStyle = pool;
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);

  drawMoon(ctx, world);
  drawClouds(ctx, world);

  // Twinkling stars.
  STARS.forEach((star) => {
    const twinkle = 0.45 + 0.35 * Math.sin(world.time * 1.6 + star.phase);
    ctx.globalAlpha = twinkle;
    ctx.fillStyle = '#cfe0ff';
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  drawFireflies(ctx, world);
  drawPond(ctx, world);

  // Grass tufts and glowing flowers along the garden floor.
  ctx.strokeStyle = PALETTE.grassLight;
  ctx.lineWidth = 2;
  TUFTS.forEach((tuft) => {
    const sway = Math.sin(world.time * 0.9 + tuft.x * 0.05) * 1.5;
    ctx.beginPath();
    ctx.moveTo(tuft.x - 6 * tuft.s, tuft.y);
    ctx.quadraticCurveTo(tuft.x - 3 * tuft.s + sway, tuft.y - 12 * tuft.s, tuft.x + sway, tuft.y - 8 * tuft.s);
    ctx.moveTo(tuft.x + 6 * tuft.s, tuft.y);
    ctx.quadraticCurveTo(tuft.x + 3 * tuft.s + sway, tuft.y - 12 * tuft.s, tuft.x + sway, tuft.y - 8 * tuft.s);
    ctx.stroke();
  });
  FLOWERS.forEach((flower) => {
    const glow = 0.6 + 0.4 * Math.sin(world.time * 2 + flower.phase);
    ctx.globalAlpha = glow;
    ctx.fillStyle = flower.colour;
    for (let p = 0; p < 5; p += 1) {
      const angle = (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(flower.x + Math.cos(angle) * 5, flower.y + Math.sin(angle) * 5, 3.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#fff8d0';
    ctx.beginPath();
    ctx.arc(flower.x, flower.y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  drawMushrooms(ctx, world);
  drawPines(ctx, world);

  // Arena edge: a low stone border the wisp cannot cross.
  ctx.strokeStyle = 'rgba(160, 180, 230, 0.28)';
  ctx.lineWidth = 3;
  ctx.strokeRect(ARENA.margin, ARENA.margin, ARENA.width - ARENA.margin * 2, ARENA.height - ARENA.margin * 2);

  // Vignette so the centre reads first.
  const vig = ctx.createRadialGradient(640, 360, 300, 640, 360, 760);
  vig.addColorStop(0, 'rgba(4, 6, 18, 0)');
  vig.addColorStop(1, 'rgba(4, 6, 18, 0.55)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
}
