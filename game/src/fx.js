// Lumen Drift II — the small feedback effects every system shares: bursts
// of particles, expanding rings, floating score text and the big wave
// banners. Rendering only reads these lists; the simulation only writes them.
export function addText(world, x, y, text, colour, size = 18) {
  world.texts.push({ x, y, life: 1.1, maxLife: 1.1, text, colour, size });
}

export function burst(world, x, y, colour, count, speed = 180, size = 4) {
  for (let i = 0; i < count; i += 1) {
    const angle = world.rng() * Math.PI * 2;
    const v = speed * (0.4 + world.rng() * 0.8);
    world.particles.push({
      x, y,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      life: 0.45 + world.rng() * 0.35,
      maxLife: 0.8,
      size: size * (0.6 + world.rng() * 0.8),
      colour,
    });
  }
}

export function ring(world, x, y, colour, maxRadius) {
  world.particles.push({
    x, y, vx: 0, vy: 0, life: 0.5, maxLife: 0.5,
    size: 6, colour, ring: true, ringMax: maxRadius,
  });
}

export function announce(world, text, sub = '') {
  world.banner = { text, sub, timer: 2.4, maxTimer: 2.4 };
}

// The combo multiplier the HUD shows: +25% per chained kill, capped.
export function comboMultiplier(world) {
  const chained = world.combo - 1 > 0 ? world.combo - 1 : 0;
  return 1 + 0.25 * chained;
}

export function addScore(world, base) {
  const gained = Math.round(base * comboMultiplier(world) * world.difficulty.scoreMul);
  world.score += gained;
  return gained;
}

// Step every particle, floating text and banner forward one tick.
export function updateFx(world, dt) {
  for (let i = world.particles.length - 1; i >= 0; i -= 1) {
    const p = world.particles[i];
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= Math.pow(0.02, dt);
    p.vy *= Math.pow(0.02, dt);
    if (p.life <= 0) world.particles.splice(i, 1);
  }
  for (let i = world.texts.length - 1; i >= 0; i -= 1) {
    const t = world.texts[i];
    t.life -= dt;
    t.y -= 34 * dt;
    if (t.life <= 0) world.texts.splice(i, 1);
  }
  if (world.banner) {
    world.banner.timer -= dt;
    if (world.banner.timer <= 0) world.banner = null;
  }
  world.shake = Math.max(0, world.shake - dt * 34);
  world.flash = Math.max(0, world.flash - dt * 1.4);
  if (world.comboTimer > 0) {
    world.comboTimer -= dt;
    if (world.comboTimer <= 0) world.combo = 0;
  }
}
