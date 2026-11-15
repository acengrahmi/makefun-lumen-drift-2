// Lumen Drift II — every tunable number lives here so the loop can be
// balanced from one place: arena, palette, three difficulties, the player,
// the seven foe kinds plus three multi-phase bosses, the 12-wave recipes,
// the blessing pool and the dew shop the player spends between waves.
export const ARENA = {
  width: 1280,
  height: 720,
  margin: 26,
};

export const PALETTE = {
  skyTop: '#0a0e2c',
  skyBottom: '#141d42',
  groundGlow: '#1c2a55',
  grassDark: '#16233f',
  grassLight: '#1e3050',
  flowerPink: '#ff7fb0',
  flowerGold: '#ffd166',
  flowerBlue: '#7fd4ff',
  playerCore: '#fff3b0',
  playerGlow: '#ffcf4d',
  playerRing: '#ffe98a',
  dew: '#8ef7ff',
  heart: '#ff5d7e',
  nova: '#c9a7ff',
  ember: '#ff9a3d',
  text: '#f4f1de',
  textDim: '#aab4d4',
  panel: 'rgba(8, 12, 32, 0.78)',
  panelEdge: 'rgba(255, 207, 77, 0.55)',
  shopEdge: 'rgba(142, 247, 255, 0.55)',
};

// Three difficulties, picked on the title screen. They scale the foe's
// toughness and speed and multiply the score, so a Heroic win outranks a
// Gentle one.
export const DIFFICULTIES = {
  gentle: {
    id: 'gentle',
    name: 'GENTLE',
    tag: 'a slow dawn',
    hpMul: 0.8,
    speedMul: 0.85,
    scoreMul: 0.8,
    desc: 'Foes are frailer and slower. Score x0.8',
  },
  brave: {
    id: 'brave',
    name: 'BRAVE',
    tag: 'the intended night',
    hpMul: 1,
    speedMul: 1,
    scoreMul: 1,
    desc: 'The night as it was meant to be. Score x1.0',
  },
  heroic: {
    id: 'heroic',
    name: 'HEROIC',
    tag: 'no mercy, bright reward',
    hpMul: 1.35,
    speedMul: 1.2,
    scoreMul: 1.5,
    desc: 'Foes are tougher and faster. Score x1.5',
  },
};
export const DIFFICULTY_ORDER = ['gentle', 'brave', 'heroic'];

export const PLAYER = {
  radius: 16,
  speed: 265,
  fireInterval: 0.21,
  bulletSpeed: 620,
  bulletRadius: 6,
  bulletDamage: 1,
  bulletLife: 0.85,
  invulnSeconds: 1.3,
  pickupRadius: 64,
  maxHearts: 3,
};

export const NOVA = {
  startCharges: 1,
  damage: 6,
  radius: 560,
};

// One entry per foe kind: movement, toughness, score and what it drops.
// Bosses are kinds too — their phases live in enemies.js.
export const ENEMIES = {
  mote: {
    name: 'Mote', radius: 13, speed: 95, hp: 1, score: 10, dew: 1, touch: 1,
    colour: '#b388ff', dark: '#7b4fd0',
  },
  emberbat: {
    name: 'Emberbat', radius: 12, speed: 175, hp: 1, score: 15, dew: 1, touch: 1,
    colour: '#ff9a3d', dark: '#c85a17',
  },
  spitter: {
    name: 'Spitter', radius: 17, speed: 70, hp: 3, score: 30, dew: 2, touch: 1,
    colour: '#7be495', dark: '#2f9e5f',
    shootEvery: 2.4, bulletSpeed: 150,
  },
  brute: {
    name: 'Brute', radius: 26, speed: 52, hp: 8, score: 50, dew: 4, touch: 1,
    colour: '#e05d5d', dark: '#8f2f3a', splitInto: 3,
  },
  shade: {
    name: 'Shade', radius: 14, speed: 130, hp: 2, score: 25, dew: 2, touch: 1,
    colour: '#9d8cff', dark: '#4a3d8f',
    blinkEvery: 2.8, blinkRange: 150,
  },
  charger: {
    name: 'Charger', radius: 15, speed: 88, hp: 3, score: 35, dew: 2, touch: 1,
    colour: '#ff6b9d', dark: '#a8325c',
    telegraph: 0.6, dashSpeed: 540, dashTime: 0.42, restAfter: 1.4,
  },
  herald: {
    name: 'Gloom Herald', radius: 46, speed: 42, hp: 80, score: 500, dew: 12, touch: 2,
    colour: '#5d5df0', dark: '#2c2c7a',
    burstEvery: 3.1, spawnEvery: 6.5, phases: 1,
  },
  ascendant: {
    name: 'Herald Ascendant', radius: 50, speed: 48, hp: 170, score: 900, dew: 18, touch: 2,
    colour: '#8b5cf6', dark: '#3d2b7a',
    burstEvery: 2.7, spawnEvery: 5.5, phases: 2,
  },
  sovereign: {
    name: 'Gloom Sovereign', radius: 58, speed: 46, hp: 280, score: 2000, dew: 30, touch: 2,
    colour: '#c084fc', dark: '#4c1d95',
    burstEvery: 2.4, spawnEvery: 5, phases: 3,
  },
};

export function isBossKind(kind) {
  return kind === 'herald' || kind === 'ascendant' || kind === 'sovereign';
}

// How many of each kind a wave throws at the player, in spawn order.
// Waves 4, 8 and 12 are boss waves: the boss arrives once the field thins.
export function waveRecipe(wave) {
  const table = {
    1: { mote: 8 },
    2: { mote: 10, emberbat: 5 },
    3: { mote: 11, emberbat: 7, spitter: 2 },
    4: { mote: 10, emberbat: 6, spitter: 3, brute: 1, herald: 1 },
    5: { mote: 13, emberbat: 8, spitter: 3, brute: 2, shade: 3 },
    6: { mote: 14, emberbat: 9, spitter: 4, brute: 2, shade: 4, charger: 2 },
    7: { mote: 15, emberbat: 10, spitter: 5, brute: 3, shade: 5, charger: 3 },
    8: { mote: 12, emberbat: 8, spitter: 4, brute: 3, shade: 4, charger: 3, ascendant: 1 },
    9: { mote: 17, emberbat: 12, spitter: 6, brute: 4, shade: 6, charger: 4 },
    10: { mote: 18, emberbat: 13, spitter: 7, brute: 5, shade: 7, charger: 5 },
    11: { mote: 20, emberbat: 14, spitter: 8, brute: 5, shade: 8, charger: 6 },
    12: { mote: 14, emberbat: 10, spitter: 6, brute: 4, shade: 6, charger: 4, sovereign: 1 },
  };
  return table[wave] ?? table[12];
}

export const TOTAL_WAVES = 12;

// Seconds between spawns shrink as waves get harder, so later waves flood in.
export function spawnGap(wave) {
  return Math.max(0.32, 1.15 - wave * 0.07);
}

// The blessing cards offered between waves. `max` caps how often one stacks.
export const UPGRADES = [
  {
    id: 'twin', title: 'Twin Spark', body: '+1 lantern bolt per shot', max: 2,
    apply: (u) => { u.shots += 1; },
  },
  {
    id: 'swift', title: 'Swift Shots', body: 'Fire 25% faster', max: 3,
    apply: (u) => { u.fireRate *= 0.8; },
  },
  {
    id: 'pierce', title: 'Piercing Light', body: 'Bolts pass through +1 foe', max: 2,
    apply: (u) => { u.pierce += 1; },
  },
  {
    id: 'longshot', title: 'Long Lantern', body: 'Bolts fly farther and faster', max: 2,
    apply: (u) => { u.bulletSpeed *= 1.25; u.bulletLife *= 1.2; },
  },
  {
    id: 'magnet', title: 'Magnet Bloom', body: 'Dew and hearts fly to you', max: 2,
    apply: (u) => { u.magnet *= 1.7; },
  },
  {
    id: 'fleet', title: 'Fleet Wisp', body: 'Move 18% faster', max: 2,
    apply: (u) => { u.moveSpeed *= 1.18; },
  },
  {
    id: 'vessel', title: 'Heart Vessel', body: '+1 max heart, heal 1 now', max: 2,
    apply: (u) => { u.maxHearts += 1; },
  },
  {
    id: 'thorns', title: 'Thorn Halo', body: 'A burning ring hurts nearby foes', max: 2,
    apply: (u) => { u.thorns += 1; },
  },
  {
    id: 'crit', title: 'Crit Spark', body: '+15% chance a bolt hits double', max: 3,
    apply: (u) => { u.crit += 0.15; },
  },
  {
    id: 'nova', title: 'Nova Charge', body: '+1 Nova bomb (press E)', max: 2,
    apply: (u) => { u.novaCharges += 1; },
  },
  {
    id: 'ember', title: 'Ember Edge', body: 'Every bolt hits +1 harder', max: 2,
    apply: (u) => { u.damage += 1; },
  },
  {
    id: 'aegis', title: 'Aegis Bloom', body: 'A shield blocks one hit, then recharges', max: 2,
    apply: (u) => { u.aegis += 1; },
  },
];

// The dew shop: between waves the player spends the dew they gathered.
// Prices are in dew; `stock` caps how often one can be bought in a run.
export const SHOP = [
  {
    id: 'heal', title: 'Mend Heart', cost: 30, stock: 99,
    body: 'Heal 1 heart right now',
    canBuy: (w) => w.hp < w.upgrades.maxHearts,
    buy: (w) => { w.hp += 1; },
  },
  {
    id: 'nova', title: 'Nova Charge', cost: 45, stock: 99,
    body: '+1 Nova bomb for the next wave',
    canBuy: () => true,
    buy: (w) => { w.novaCharges += 1; },
  },
  {
    id: 'reroll', title: 'New Blessings', cost: 15, stock: 99,
    body: 'Deal three fresh blessing cards',
    canBuy: () => true,
    buy: () => {},
  },
  {
    id: 'ember', title: 'Ember Core', cost: 90, stock: 3,
    body: 'Every bolt hits +1 harder, forever',
    canBuy: (w) => (w.shopTaken.ember ?? 0) < 3,
    buy: (w) => { w.upgrades.damage += 1; },
  },
  {
    id: 'vessel', title: 'Heart Vessel', cost: 150, stock: 2,
    body: '+1 max heart, heal 1 now',
    canBuy: (w) => (w.shopTaken.vessel ?? 0) < 2,
    buy: (w) => { w.upgrades.maxHearts += 1; w.hp = Math.min(w.upgrades.maxHearts, w.hp + 1); },
  },
];

export const COMBO_WINDOW = 2.5;
export const COMBO_CAP = 8;
export const FLAWLESS_BONUS = 150;

// End-of-run ranks on the raw score. A full Brave win with most waves
// flawless lands just under 60,000, so S starts at 55,000.
export function rankForScore(score) {
  if (score >= 55000) return 'S';
  if (score >= 38000) return 'A';
  if (score >= 22000) return 'B';
  if (score >= 10000) return 'C';
  return 'D';
}
