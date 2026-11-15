// Lumen Drift II — the menu screens: the title with its three difficulty
// pills, the between-wave blessing cards above the dew shop, the pause
// screen, and the victory / game-over screens with their rank and stats.
// The in-play drawing lives in render.js; this file only owns the moments
// between the fighting.
import { ARENA, PALETTE, TOTAL_WAVES, SHOP, DIFFICULTY_ORDER, rankForScore } from './config.js';
import { cardRect, shopRect, nextWaveRect } from './world.js';
import { canAfford } from './economy.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, colour, align = 'center', weight = 'bold') {
  ctx.font = `${weight} ${size}px "Trebuchet MS", Verdana, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colour;
  ctx.fillText(str, x, y);
}

function textGlow(ctx, str, x, y, size, colour, glowColour, align = 'center') {
  ctx.save();
  ctx.shadowColor = glowColour;
  ctx.shadowBlur = 18;
  text(ctx, str, x, y, size, colour, align);
  ctx.restore();
}

function dim(ctx, alpha = 0.62) {
  ctx.fillStyle = `rgba(4, 6, 18, ${alpha})`;
  ctx.fillRect(0, 0, ARENA.width, ARENA.height);
}

// ---- title -----------------------------------------------------------------

export function difficultyPillRect(index) {
  const w = 200;
  const h = 56;
  const gap = 24;
  const total = w * 3 + gap * 2;
  const x0 = (ARENA.width - total) / 2;
  return { x: x0 + index * (w + gap), y: 430, width: w, height: h };
}

export function pickDifficultyAt(x, y) {
  for (let i = 0; i < DIFFICULTY_ORDER.length; i += 1) {
    const r = difficultyPillRect(i);
    if (x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height) return i;
  }
  return -1;
}

export function drawTitleScreen(ctx, world) {
  dim(ctx, 0.55);
  textGlow(ctx, 'LUMEN DRIFT II', 640, 138, 80, '#ffe98a', 'rgba(255, 207, 77, 0.6)');
  text(ctx, '— Dawn of the Ember Garden —', 640, 196, 26, PALETTE.dew);
  text(ctx, 'The night garden is overrun. You are the last lantern.', 640, 252, 21, PALETTE.text);
  text(ctx, 'Survive all 12 waves. Gather dew, spend it in the shop, burn three bosses.', 640, 282, 21, PALETTE.text);
  text(ctx, 'WASD / arrows — move      Mouse — aim      Hold click / Space — fire', 640, 330, 19, PALETTE.textDim);
  text(ctx, 'E — Nova bomb      P — pause      M — mute      1 / 2 / 3 — blessing      4–8 — shop', 640, 358, 19, PALETTE.textDim);
  text(ctx, 'CHOOSE YOUR NIGHT', 640, 408, 17, PALETTE.textDim);
  DIFFICULTY_ORDER.forEach((id, i) => {
    const diff = world.difficulty;
    const pill = difficultyPillRect(i);
    const selected = diff.id === id;
    ctx.save();
    ctx.fillStyle = selected ? 'rgba(255, 207, 77, 0.22)' : 'rgba(16, 22, 52, 0.85)';
    roundRect(ctx, pill.x, pill.y, pill.width, pill.height, 12);
    ctx.fill();
    ctx.strokeStyle = selected ? '#ffd166' : 'rgba(170, 180, 212, 0.5)';
    ctx.lineWidth = selected ? 3 : 2;
    roundRect(ctx, pill.x, pill.y, pill.width, pill.height, 12);
    ctx.stroke();
    const label = id.toUpperCase();
    text(ctx, label, pill.x + pill.width / 2, pill.y + 20, 20, selected ? '#ffd166' : PALETTE.text);
    const tag = { gentle: 'slow dawn · x0.8', brave: 'the true night · x1.0', heroic: 'no mercy · x1.5' }[id];
    text(ctx, tag, pill.x + pill.width / 2, pill.y + 42, 13, PALETTE.textDim);
    ctx.restore();
  });
  if (world.best > 0) text(ctx, `BEST SCORE  ${world.best}`, 640, 522, 22, '#ffd166');
  const pulse = 0.65 + 0.35 * Math.sin(world.time * 3.2);
  ctx.save();
  ctx.globalAlpha = pulse;
  textGlow(ctx, 'CLICK OR PRESS ENTER TO BEGIN', 640, 586, 30, '#ffffff', 'rgba(255, 233, 138, 0.6)');
  ctx.restore();
  text(ctx, '12 waves  ·  7 foes  ·  3 bosses  ·  12 blessings  ·  dew shop  ·  best score', 640, 640, 16, PALETTE.textDim);
}

// ---- between waves: blessings + dew shop ------------------------------------

function wrapBody(ctx, bodyText, maxLen) {
  const words = bodyText.split(' ');
  let line = '';
  const lines = [];
  words.forEach((word) => {
    if ((`${line} ${word}`).trim().length > maxLen) {
      lines.push(line.trim());
      line = word;
    } else {
      line = `${line} ${word}`;
    }
  });
  lines.push(line.trim());
  return lines;
}

export function drawUpgradeScreen(ctx, world) {
  dim(ctx, 0.66);
  textGlow(ctx, `WAVE ${world.wave} CLEAR!`, 640, 128, 46, '#ffd166', 'rgba(255, 209, 102, 0.5)');
  text(ctx, 'The garden breathes again — choose one blessing of light:', 640, 172, 21, PALETTE.text);
  text(ctx, `Score ${world.score}   •   Dew ◆ ${world.dew}   •   Next: wave ${world.wave + 1} of ${TOTAL_WAVES}`, 640, 210, 18, PALETTE.textDim);
  world.offered.forEach((choice, i) => {
    const r = cardRect(i);
    const picked = world.blessingPicked;
    ctx.save();
    if (picked) ctx.globalAlpha = 0.45;
    ctx.fillStyle = 'rgba(16, 22, 52, 0.92)';
    roundRect(ctx, r.x, r.y, r.width, r.height, 16);
    ctx.fill();
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 2;
    roundRect(ctx, r.x, r.y, r.width, r.height, 16);
    ctx.stroke();
    text(ctx, `[ ${i + 1} ]`, r.x + r.width / 2, r.y + 30, 17, PALETTE.textDim);
    textGlow(ctx, choice.title, r.x + r.width / 2, r.y + 74, 27, '#ffe98a', 'rgba(255, 207, 77, 0.4)');
    const lines = wrapBody(ctx, choice.body, 26);
    lines.forEach((ln, li) => text(ctx, ln, r.x + r.width / 2, r.y + 118 + li * 26, 18, PALETTE.text));
    text(ctx, picked ? 'chosen ✓' : 'click or press ' + (i + 1), r.x + r.width / 2, r.y + r.height - 24, 15, PALETTE.textDim);
    ctx.restore();
  });

  // The dew shop: five small stalls under the cards.
  text(ctx, `DEW SHOP — spend your dew, keep what is left for the next wave`, 640, 494, 17, PALETTE.dew);
  SHOP.forEach((item, i) => {
    const r = shopRect(i);
    const affordable = canAfford(world, item);
    const taken = world.shopTaken[item.id] ?? 0;
    const soldOut = taken >= item.stock;
    ctx.save();
    if (!affordable || soldOut) ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(12, 26, 48, 0.92)';
    roundRect(ctx, r.x, r.y, r.width, r.height, 12);
    ctx.fill();
    ctx.strokeStyle = PALETTE.shopEdge;
    ctx.lineWidth = 2;
    roundRect(ctx, r.x, r.y, r.width, r.height, 12);
    ctx.stroke();
    text(ctx, `[ ${i + 4} ]  ${item.title}`, r.x + r.width / 2, r.y + 18, 15, '#8ef7ff');
    const lines = wrapBody(ctx, item.body, 24);
    lines.forEach((ln, li) => text(ctx, ln, r.x + r.width / 2, r.y + 40 + li * 15, 12, PALETTE.text));
    text(ctx, soldOut ? 'SOLD OUT' : `◆ ${item.cost} dew`, r.x + r.width / 2, r.y + r.height - 14, 14, soldOut ? PALETTE.textDim : '#ffd166');
    ctx.restore();
  });

  // The way onward.
  const btn = nextWaveRect();
  const pulse = 0.7 + 0.3 * Math.sin(world.time * 3);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = 'rgba(255, 207, 77, 0.2)';
  roundRect(ctx, btn.x, btn.y, btn.width, btn.height, 14);
  ctx.fill();
  ctx.strokeStyle = '#ffd166';
  ctx.lineWidth = 2;
  roundRect(ctx, btn.x, btn.y, btn.width, btn.height, 14);
  ctx.stroke();
  text(ctx, 'NEXT WAVE  →', btn.x + btn.width / 2, btn.y + 26, 22, '#ffd166');
  ctx.restore();
  text(ctx, 'or press Enter', 640, 692, 14, PALETTE.textDim);
}

// ---- pause -------------------------------------------------------------------

export function drawPausedScreen(ctx) {
  dim(ctx, 0.66);
  textGlow(ctx, 'PAUSED', 640, 300, 64, '#ffe98a', 'rgba(255, 207, 77, 0.5)');
  text(ctx, 'The lantern waits. Press P to keep playing.', 640, 372, 21, PALETTE.text);
}

// ---- the end -----------------------------------------------------------------

export function drawEndScreen(ctx, world, won) {
  dim(ctx, 0.68);
  if (won) {
    textGlow(ctx, 'DAWN BREAKS!', 640, 148, 72, '#ffe98a', 'rgba(255, 207, 77, 0.6)');
    text(ctx, 'You kept the light through all 12 waves. The garden is safe.', 640, 212, 22, PALETTE.text);
    const rank = rankForScore(world.score);
    textGlow(ctx, `RANK ${rank}`, 640, 286, 52, rank === 'S' ? '#ffd166' : '#8ef7ff', 'rgba(255, 209, 102, 0.5)');
  } else {
    textGlow(ctx, 'THE LIGHT FADES', 640, 148, 68, '#ff8fa8', 'rgba(255, 93, 126, 0.5)');
    text(ctx, `The dark took the lantern on wave ${world.wave} of ${TOTAL_WAVES} (${world.difficulty.name}).`, 640, 212, 22, PALETTE.text);
  }
  const isBest = world.score >= world.best && world.score > 0;
  text(ctx, `SCORE  ${world.score}`, 640, won ? 348 : 306, 40, '#ffffff');
  text(ctx, isBest ? '★ NEW BEST SCORE ★' : `BEST  ${world.best}`, 640, won ? 392 : 352, 22, '#ffd166');
  const minutes = Math.floor(world.stats.timePlayed / 60);
  const seconds = Math.floor(world.stats.timePlayed % 60).toString().padStart(2, '0');
  const y0 = won ? 440 : 404;
  text(ctx, `Waves cleared ${world.stats.wavesCleared}   •   Foes burned ${world.kills}   •   Bosses slain ${world.stats.bossesSlain}`, 640, y0, 19, PALETTE.textDim);
  text(ctx, `Flawless waves ${world.stats.flawlessWaves}   •   Dew gathered ${world.stats.dewEarned}   •   Dew spent ${world.stats.dewSpent}`, 640, y0 + 30, 19, PALETTE.textDim);
  const acc = world.stats.shotsFired > 0
    ? Math.round((100 * world.stats.shotsHit) / world.stats.shotsFired)
    : 0;
  text(ctx, `Bolts fired ${world.stats.shotsFired}   •   Accuracy ${acc}%   •   Time ${minutes}:${seconds}`, 640, y0 + 60, 19, PALETTE.textDim);
  const pulse = 0.65 + 0.35 * Math.sin(world.time * 3.2);
  ctx.save();
  ctx.globalAlpha = pulse;
  textGlow(ctx, 'PRESS R OR CLICK TO PLAY AGAIN', 640, y0 + 126, 30, '#ffffff', 'rgba(255, 233, 138, 0.6)');
  ctx.restore();
}
