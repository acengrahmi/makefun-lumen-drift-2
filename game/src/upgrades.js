// Lumen Drift II — the blessing cards offered between waves: deal three
// from the pool the player has not maxed out, and apply the one they pick.
// A blessing is free; the dew shop (economy.js) is where dew is spent.
import { UPGRADES } from './config.js';
import { rngShuffle } from './random.js';
import { burst, addText } from './fx.js';

export function offerBlessings(world) {
  const available = UPGRADES.filter((u) => (world.upgrades.taken[u.id] ?? 0) < u.max);
  const pool = available.length >= 3 ? available : UPGRADES;
  world.offered = rngShuffle(world.rng, pool).slice(0, 3);
}

export function applyUpgrade(world, index) {
  const choice = world.offered[index];
  if (!choice) return false;
  choice.apply(world.upgrades);
  world.upgrades.taken[choice.id] = (world.upgrades.taken[choice.id] ?? 0) + 1;
  if (choice.id === 'vessel') {
    world.hp = Math.min(world.upgrades.maxHearts, world.hp + 1);
  }
  // The Nova blessing tops up the live charge count, not just the tally.
  if (choice.id === 'nova') {
    world.novaCharges += 1;
  }
  if (choice.id === 'aegis') {
    world.shieldReady = true;
    world.shieldTimer = 0;
  }
  if (world.sound) world.sound.upgradePick();
  burst(world, world.player.x, world.player.y, '#ffd166', 24, 240, 5);
  addText(world, world.player.x, world.player.y - 34, choice.title, '#ffd166', 22);
  return true;
}
