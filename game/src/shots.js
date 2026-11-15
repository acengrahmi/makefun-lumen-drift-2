// Deterministic screenshot scenes. Each one resets the world from the same
// seed, then plays the real rules forward with a simple autopilot, so the
// frame is what a short game really looks like — never a staged mock.
// The autopilot moves, aims and fires like a decent player, spends dew in
// the shop, picks blessings and fires a Nova when surrounded; the 'win'
// scene is a full run it plays to the end.
import { ARENA, DIFFICULTIES } from './config.js';
import {
  createWorld, stepWorld, startRun, pickBlessing, nextWave,
  SCREEN_TITLE, SCREEN_PLAY, SCREEN_UPGRADE, SCREEN_OVER, SCREEN_WIN,
} from './world.js';
import { buyShopItem } from './economy.js';

const STEP = 1 / 60;

// Blessings the autopilot wants first, when they are on the table.
const BLESSING_WANT = ['twin', 'swift', 'ember', 'pierce', 'aegis', 'crit', 'vessel', 'thorns', 'nova', 'magnet', 'fleet', 'longshot'];

function bestBlessingIndex(world) {
  let best = 0;
  let bestRank = 99;
  world.offered.forEach((choice, i) => {
    const rank = BLESSING_WANT.indexOf(choice.id);
    if (rank >= 0 && rank < bestRank) {
      bestRank = rank;
      best = i;
    }
  });
  return best;
}

// Spend dew the way a sensible player would: heal first, then permanent
// damage, then a spare Nova.
function shopSmart(world) {
  if (world.hp < world.upgrades.maxHearts && world.dew >= 30) buyShopItem(world, 0);
  if (world.dew >= 90 && (world.shopTaken.ember ?? 0) < 3) buyShopItem(world, 3);
  if (world.dew >= 45 && world.novaCharges === 0) buyShopItem(world, 1);
}

function autopilotInput(world, reckless, firing = true, fireDuty = 1) {
  const player = world.player;
  let nearest = null;
  let nearestD = Infinity;
  let nearestEnemyD = Infinity;
  let nearestEnemy = null;
  world.enemies.forEach((enemy) => {
    const d = Math.hypot(enemy.x - player.x, enemy.y - player.y);
    // Spitters and chargers are the dangerous ones: hunt them first.
    const priority = (enemy.kind === 'spitter' || enemy.kind === 'charger') && d < 380 ? d * 0.55 : d;
    if (priority < nearestEnemyD) {
      nearestEnemyD = priority;
      nearestEnemy = enemy;
    }
  });
  world.pickups.forEach((pickup) => {
    const d = Math.hypot(pickup.x - player.x, pickup.y - player.y);
    if (d < nearestD) {
      nearestD = d;
      nearest = pickup;
    }
  });
  const trueNearestD = nearestEnemy
    ? Math.hypot(nearestEnemy.x - player.x, nearestEnemy.y - player.y)
    : Infinity;

  let mx = 0;
  let my = 0;
  if (reckless) {
    // Walk straight at the nearest foe and never back away.
    if (nearestEnemy) {
      mx = (nearestEnemy.x - player.x) / Math.max(1, trueNearestD);
      my = (nearestEnemy.y - player.y) / Math.max(1, trueNearestD);
    }
  } else if (nearestEnemy && trueNearestD < 130) {
    // Too close: back off from the threat.
    mx = (player.x - nearestEnemy.x) / trueNearestD;
    my = (player.y - nearestEnemy.y) / trueNearestD;
  } else if (nearest && nearestD < 260 && (!nearestEnemy || nearestD < trueNearestD)) {
    // A pickup is near and safe to grab: drift toward it.
    mx = (nearest.x - player.x) / Math.max(1, nearestD);
    my = (nearest.y - player.y) / Math.max(1, nearestD);
  } else if (nearestEnemy) {
    // Otherwise hold a firing distance of about 230 from the nearest foe.
    const want = 230;
    const dir = trueNearestD > want ? 1 : -1;
    mx = ((nearestEnemy.x - player.x) / Math.max(1, trueNearestD)) * dir * 0.6;
    my = ((nearestEnemy.y - player.y) / Math.max(1, trueNearestD)) * dir * 0.6;
    // Strafe sideways a little so the scene stays lively.
    const strafe = Math.sin(world.time * 1.4) * 0.7;
    mx += (-(nearestEnemy.y - player.y) / Math.max(1, trueNearestD)) * strafe;
    my += ((nearestEnemy.x - player.x) / Math.max(1, trueNearestD)) * strafe;
  } else {
    // Nothing to fight: drift back to the middle of the garden.
    mx = (ARENA.width / 2 - player.x) / 400;
    my = (ARENA.height / 2 - player.y) / 400;
  }
  const len = Math.hypot(mx, my) || 1;
  const aim = nearestEnemy ?? { x: player.x, y: player.y - 100 };
  // fireDuty thins the pilot's fire (1 = every step): a weaker pilot lets a
  // wave build up instead of mowing it down the moment it spawns.
  const trigger = firing && Math.floor(world.time * 60) % fireDuty === 0;
  // Nova when surrounded: six or more foes inside the blast.
  let nova = false;
  if (world.novaCharges > 0) {
    let close = 0;
    world.enemies.forEach((enemy) => {
      if (Math.hypot(enemy.x - player.x, enemy.y - player.y) < 240) close += 1;
    });
    nova = close >= 6;
  }
  return {
    up: my < -0.2,
    down: my > 0.2,
    left: mx < -0.2,
    right: mx > 0.2,
    firing: trigger,
    aimX: aim.x,
    aimY: aim.y,
    aimActive: true,
    pressedKeys: nova ? new Set(['KeyE']) : new Set(),
    clicked: null,
    mouseDown: false,
    consumeClick: () => null,
    wasPressed: (code) => {
      if (code === 'KeyE' && nova) return true;
      return false;
    },
    moveVector: () => ({ x: Math.max(-1, Math.min(1, mx / len)), y: Math.max(-1, Math.min(1, my / len)) }),
  };
}

function runSteps(world, seconds, reckless, firing = true, fireDuty = 1) {
  const steps = Math.floor(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (world.screen === SCREEN_OVER) break;
    if (world.screen === SCREEN_UPGRADE) break;
    if (world.screen === SCREEN_WIN) break;
    stepWorld(world, STEP, autopilotInput(world, reckless, firing, fireDuty));
  }
}

// Drive the between-wave screen the way the pilot would: shop, bless, on.
function handleUpgrade(world) {
  shopSmart(world);
  pickBlessing(world, bestBlessingIndex(world));
  nextWave(world);
}

// Stage one named scene and return the world ready to render.
export function stageShot(name, seed) {
  const world = createWorld(seed);
  if (name === 'start') {
    // Title over a live garden: play four real seconds first so foes, dew
    // and bolts are already drifting behind the menu, then freeze on title.
    startRun(world);
    runSteps(world, 4, false);
    world.screen = SCREEN_TITLE;
    return world;
  }
  if (name === 'play') {
    // The wave-8 boss fight: drive through the early waves (shopping and
    // blessing whenever they appear) and stop once the Ascendant is on the
    // field with foes around it. The pilot fires at quarter pace, so the
    // wave builds up instead of being mowed down the moment it spawns.
    startRun(world);
    let guard = 0;
    let bossSince = null;
    while (guard < 600) {
      guard += 1;
      if (world.screen === SCREEN_UPGRADE) {
        handleUpgrade(world);
        continue;
      }
      if (world.screen === SCREEN_OVER || world.screen === SCREEN_WIN) {
        // The pilot won or died: start over at full strength so it reaches
        // the boss fight.
        bossSince = null;
        startRun(world);
        continue;
      }
      if (world.wave > 8) {
        // The boss window closed without a shot: try the run again.
        bossSince = null;
        startRun(world);
        continue;
      }
      const boss = world.enemies.find((e) => e.kind === 'ascendant');
      if (boss && bossSince === null) bossSince = world.time;
      if (!boss) bossSince = null;
      // Take the frame once the boss has company, or after 20 s of the
      // fight even if the pilot kept the field thin.
      if (world.wave >= 8 && boss && (world.enemies.length >= 5 || world.time - bossSince > 20)) break;
      // The pilot fights at full pace: throttling it got the pilot killed
      // in the boss fight, and the boss now arrives mid-wave with foes
      // around it, so the frame is busy without any throttling.
      runSteps(world, 1, false, true, 1);
    }
    // One last burst of fire so bolts cross the frame too.
    runSteps(world, 0.75, false, true, 1);
    return world;
  }
  if (name === 'shop') {
    // Wave cleared, three blessing cards above the dew shop. Drive past
    // wave 1 so the screen shows a run already in progress, with real dew.
    startRun(world);
    let guard = 0;
    while (guard < 200) {
      guard += 1;
      if (world.screen === SCREEN_UPGRADE && world.wave >= 2) break;
      if (world.screen === SCREEN_UPGRADE) {
        pickBlessing(world, guard % 3);
        nextWave(world);
        continue;
      }
      if (world.screen === SCREEN_OVER) {
        startRun(world);
        continue;
      }
      runSteps(world, 2, false);
    }
    return world;
  }
  // 'win': a full run, played to the end. If the pilot dies twice on Brave,
  // it finishes the shot on Gentle rather than faking the screen.
  let attempts = 0;
  startRun(world);
  let guard = 0;
  while (guard < 800) {
    guard += 1;
    if (world.screen === SCREEN_WIN) break;
    if (world.screen === SCREEN_UPGRADE) {
      handleUpgrade(world);
      continue;
    }
    if (world.screen === SCREEN_OVER) {
      attempts += 1;
      if (attempts >= 2) world.difficulty = DIFFICULTIES.gentle;
      startRun(world);
      continue;
    }
    runSteps(world, 2, false);
  }
  return world;
}

// A full autopilot run in the open (no shot staging): used by the logic
// tests to prove the game can be won — and lost — on the real rules.
export function autopilotRun(seed, difficultyId = 'brave') {
  const world = createWorld(seed, difficultyId);
  startRun(world);
  let guard = 0;
  while (guard < 900) {
    guard += 1;
    if (world.screen === SCREEN_WIN || world.screen === SCREEN_OVER) break;
    if (world.screen === SCREEN_UPGRADE) {
      handleUpgrade(world);
      continue;
    }
    runSteps(world, 2, false);
  }
  return world;
}

export function recklessRun(seed, difficultyId = 'brave') {
  const world = createWorld(seed, difficultyId);
  startRun(world);
  let guard = 0;
  while (guard < 900) {
    guard += 1;
    if (world.screen === SCREEN_WIN || world.screen === SCREEN_OVER) break;
    if (world.screen === SCREEN_UPGRADE) {
      pickBlessing(world, 0);
      nextWave(world);
      continue;
    }
    runSteps(world, 2, true);
  }
  return world;
}
