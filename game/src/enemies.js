// Lumen Drift II — the foe roster in motion: spawning (with the chosen
// difficulty's multipliers), and one update per kind: chasers, zigzag bats,
// ranged spitters, splitting brutes, blinking shades, dashing chargers and
// the three bosses, each with its own phases. Death and scoring live in
// world.js; this file only moves foes and fires their attacks.
import { ARENA, ENEMIES, isBossKind } from './config.js';
import { rngRange } from './random.js';
import { announce, addText, burst, ring } from './fx.js';

function edgePoint(world) {
  const m = ARENA.margin;
  const side = Math.floor(world.rng() * 4);
  if (side === 0) return { x: rngRange(world.rng, m, ARENA.width - m), y: m - 20 };
  if (side === 1) return { x: rngRange(world.rng, m, ARENA.width - m), y: ARENA.height - m + 20 };
  if (side === 2) return { x: m - 20, y: rngRange(world.rng, m, ARENA.height - m) };
  return { x: ARENA.width - m + 20, y: rngRange(world.rng, m, ARENA.height - m) };
}

export function spawnEnemy(world, kind) {
  const def = ENEMIES[kind];
  const diff = world.difficulty;
  const at = isBossKind(kind)
    ? { x: ARENA.width / 2, y: ARENA.margin + 60 }
    : edgePoint(world);
  const enemy = {
    kind,
    x: at.x,
    y: at.y,
    vx: 0,
    vy: 0,
    radius: def.radius,
    hp: Math.max(1, Math.round(def.hp * diff.hpMul)),
    maxHp: Math.max(1, Math.round(def.hp * diff.hpMul)),
    speed: def.speed * diff.speedMul * rngRange(world.rng, 0.9, 1.15),
    angle: world.rng() * Math.PI * 2,
    zig: world.rng() * Math.PI * 2,
    shootTimer: rngRange(world.rng, 1.2, 2.2),
    burstTimer: 2.5,
    spawnTimer: 5,
    blinkTimer: rngRange(world.rng, 1.5, 2.8),
    state: 'stalk',
    stateTimer: 0,
    dashX: 0,
    dashY: 0,
    spiralAngle: 0,
    phase: 1,
    flash: 0,
    wobble: world.rng() * Math.PI * 2,
  };
  world.enemies.push(enemy);
  if (isBossKind(kind)) {
    announce(world, def.name.toUpperCase(), bossTagline(kind));
    if (world.sound) world.sound.bossRoar();
    world.shake = Math.max(world.shake, 10);
  }
  return enemy;
}

function bossTagline(kind) {
  if (kind === 'herald') return 'It drinks the lantern light — burn it down!';
  if (kind === 'ascendant') return 'It wears the dark twice over. Two phases. No mercy.';
  return 'Three phases of night. Hold the light — dawn is one wave away.';
}

function fireRing(world, enemy, count, speed, offset = 0) {
  for (let k = 0; k < count; k += 1) {
    const angle = (k / count) * Math.PI * 2 + offset;
    world.ebullets.push({
      x: enemy.x, y: enemy.y,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      radius: 8, life: 5,
    });
  }
  ring(world, enemy.x, enemy.y, ENEMIES[enemy.kind].colour, 120);
}

function bossPhaseOf(enemy) {
  const def = ENEMIES[enemy.kind];
  if (def.phases <= 1) return 1;
  const frac = enemy.hp / enemy.maxHp;
  if (enemy.kind === 'ascendant') return frac > 0.5 ? 1 : 2;
  if (frac > 2 / 3) return 1;
  if (frac > 1 / 3) return 2;
  return 3;
}

function bossAttack(world, enemy, dt) {
  const def = ENEMIES[enemy.kind];
  const phase = bossPhaseOf(enemy);
  if (phase !== enemy.phase) {
    enemy.phase = phase;
    const label = enemy.kind === 'sovereign'
      ? `THE SOVEREIGN — PHASE ${phase}`
      : 'THE HERALD ASCENDS — PHASE II';
    announce(world, label, phase === 3 ? 'The night itself is angry now.' : 'It sheds its skin and burns brighter.');
    addText(world, enemy.x, enemy.y - enemy.radius - 20, `PHASE ${phase}`, '#c9a7ff', 26);
    burst(world, enemy.x, enemy.y, '#c9a7ff', 40, 320, 6);
    world.shake = Math.max(world.shake, 12);
    if (world.sound) world.sound.phaseSound();
  }

  enemy.burstTimer -= dt;
  if (enemy.burstTimer <= 0) {
    if (enemy.kind === 'herald') {
      enemy.burstTimer = def.burstEvery;
      fireRing(world, enemy, 12, 130, world.time);
    } else if (enemy.kind === 'ascendant') {
      enemy.burstTimer = phase === 1 ? def.burstEvery : def.burstEvery * 0.7;
      if (phase === 1) {
        fireRing(world, enemy, 12, 140, world.time);
      } else {
        // Spiral: three streams that rotate a little with every burst.
        enemy.spiralAngle += 0.55;
        for (let s = 0; s < 3; s += 1) {
          const angle = enemy.spiralAngle + (s / 3) * Math.PI * 2;
          world.ebullets.push({
            x: enemy.x, y: enemy.y,
            vx: Math.cos(angle) * 165, vy: Math.sin(angle) * 165,
            radius: 8, life: 5,
          });
        }
        fireRing(world, enemy, 8, 120, world.time * 0.5);
      }
    } else {
      // Sovereign: three distinct phases.
      enemy.burstTimer = phase === 3 ? 1.9 : def.burstEvery;
      if (phase === 1) {
        fireRing(world, enemy, 14, 135, world.time);
      } else if (phase === 2) {
        enemy.spiralAngle += 0.7;
        for (let s = 0; s < 5; s += 1) {
          const angle = enemy.spiralAngle + (s / 5) * Math.PI * 2;
          world.ebullets.push({
            x: enemy.x, y: enemy.y,
            vx: Math.cos(angle) * 175, vy: Math.sin(angle) * 175,
            radius: 8, life: 5,
          });
        }
      } else {
        fireRing(world, enemy, 18, 150, world.time);
      }
    }
  }

  enemy.spawnTimer -= dt;
  if (enemy.spawnTimer <= 0 && world.enemies.length < 34) {
    enemy.spawnTimer = def.spawnEvery * (enemy.phase === 3 ? 0.6 : 1);
    if (enemy.kind === 'sovereign' && enemy.phase === 2) {
      const shade = spawnEnemy(world, 'shade');
      shade.x = enemy.x + rngRange(world.rng, -50, 50);
      shade.y = enemy.y + rngRange(world.rng, -50, 50);
    } else {
      const mote = spawnEnemy(world, 'mote');
      mote.x = enemy.x + rngRange(world.rng, -50, 50);
      mote.y = enemy.y + rngRange(world.rng, -50, 50);
    }
  }
}

// One foe's movement and attacks for this tick. Returns nothing; the foe's
// velocity and position are updated in place.
export function updateEnemy(world, enemy, dt) {
  const player = world.player;
  const def = ENEMIES[enemy.kind];
  enemy.flash = Math.max(0, enemy.flash - dt);
  enemy.wobble += dt * 3;
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d;
  const uy = dy / d;

  if (enemy.kind === 'mote') {
    enemy.vx = ux * enemy.speed;
    enemy.vy = uy * enemy.speed;
  } else if (enemy.kind === 'emberbat') {
    const zig = Math.sin(enemy.wobble * 2.2) * 0.9;
    enemy.vx = (ux + -uy * zig) * enemy.speed;
    enemy.vy = (uy + ux * zig) * enemy.speed;
  } else if (enemy.kind === 'spitter') {
    if (d > 300) {
      enemy.vx = ux * enemy.speed;
      enemy.vy = uy * enemy.speed;
    } else if (d < 210) {
      enemy.vx = -ux * enemy.speed;
      enemy.vy = -uy * enemy.speed;
    } else {
      enemy.vx *= 0.9;
      enemy.vy *= 0.9;
    }
    enemy.shootTimer -= dt;
    if (enemy.shootTimer <= 0 && d < 540) {
      enemy.shootTimer = def.shootEvery * rngRange(world.rng, 0.85, 1.2);
      world.ebullets.push({
        x: enemy.x, y: enemy.y,
        vx: ux * def.bulletSpeed, vy: uy * def.bulletSpeed,
        radius: 7, life: 4,
      });
      burst(world, enemy.x, enemy.y, def.colour, 4, 90, 3);
    }
  } else if (enemy.kind === 'brute') {
    enemy.vx = ux * enemy.speed;
    enemy.vy = uy * enemy.speed;
  } else if (enemy.kind === 'shade') {
    // Drifts toward the lantern, then blinks closer in a puff of dark.
    enemy.vx = ux * enemy.speed;
    enemy.vy = uy * enemy.speed;
    enemy.blinkTimer -= dt;
    if (enemy.blinkTimer <= 0 && d > 200) {
      enemy.blinkTimer = def.blinkEvery * rngRange(world.rng, 0.9, 1.2);
      burst(world, enemy.x, enemy.y, def.colour, 10, 120, 4);
      enemy.x += ux * def.blinkRange;
      enemy.y += uy * def.blinkRange;
      burst(world, enemy.x, enemy.y, def.colour, 10, 120, 4);
    }
  } else if (enemy.kind === 'charger') {
    // Stalks, flashes a telegraph, then dashes in a straight line.
    enemy.stateTimer -= dt;
    if (enemy.state === 'stalk') {
      enemy.vx = ux * enemy.speed;
      enemy.vy = uy * enemy.speed;
      if (enemy.stateTimer <= 0 && d < 420 && d > 90) {
        enemy.state = 'telegraph';
        enemy.stateTimer = def.telegraph;
        enemy.dashX = ux;
        enemy.dashY = uy;
      } else if (enemy.stateTimer <= 0) {
        enemy.stateTimer = 0.4;
      }
    } else if (enemy.state === 'telegraph') {
      enemy.vx *= 0.8;
      enemy.vy *= 0.8;
      enemy.flash = 0.1;
      if (enemy.stateTimer <= 0) {
        enemy.state = 'dash';
        enemy.stateTimer = def.dashTime;
      }
    } else if (enemy.state === 'dash') {
      enemy.vx = enemy.dashX * def.dashSpeed;
      enemy.vy = enemy.dashY * def.dashSpeed;
      if (enemy.stateTimer <= 0) {
        enemy.state = 'rest';
        enemy.stateTimer = def.restAfter;
      }
    } else {
      enemy.vx *= 0.85;
      enemy.vy *= 0.85;
      if (enemy.stateTimer <= 0) {
        enemy.state = 'stalk';
        enemy.stateTimer = 0.8;
      }
    }
  } else if (isBossKind(enemy.kind)) {
    // Bosses chase slowly; the Sovereign's final phase hunts in earnest.
    const chase = enemy.kind === 'sovereign' && enemy.phase === 3 ? 1.8 : 1;
    enemy.vx = ux * enemy.speed * chase;
    enemy.vy = uy * enemy.speed * chase;
    bossAttack(world, enemy, dt);
  }

  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;
  enemy.x = Math.min(ARENA.width - ARENA.margin, Math.max(ARENA.margin, enemy.x));
  enemy.y = Math.min(ARENA.height - ARENA.margin, Math.max(ARENA.margin, enemy.y));
}
