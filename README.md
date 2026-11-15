# Lumen Drift II — Dawn of the Ember Garden

An original 2D arena-survival game for make.fun `best-game-01`, built from
scratch in plain HTML5 Canvas + ES modules. No libraries, no network, no
build step — `game/index.html` opens in desktop Chrome and plays offline.
This is the v2 auto-upgrade of Lumen Drift: deeper systems, a living garden
and three multi-phase bosses.

## The game

You are Luma, the last lantern wisp of a night garden overrun by the Gloom.
Survive **12 waves** of Motes, Emberbats, Spitters, Brutes, blinking Shades
and dashing Chargers, and burn three bosses: the **Gloom Herald** (wave 4),
the two-phase **Herald Ascendant** (wave 8) and the three-phase
**Gloom Sovereign** (wave 12). Gather dew, chain kills into combos, and
between waves pick **1 of 3 blessing cards** from a pool of 12 — then spend
your dew in the **dew shop** (heal, Nova, fresh blessings, permanent Ember
Cores, extra Heart Vessels). Clear a wave without taking a hit for a
**Flawless** bonus. Three difficulties — Gentle, Brave, Heroic — scale the
foes and multiply the score; the run ends with a rank from D to S.

- **Controls:** WASD / arrows to move, mouse to aim, hold click / Space to
  fire, E for a Nova bomb, P to pause, M to mute, 1/2/3 to pick a blessing,
  4–8 to buy from the shop, Enter for the next wave, R to restart after the
  run ends. Click the difficulty pills on the title to choose your night.
- **Complete loop:** title screen with difficulty select → 12 waves with
  escalating recipes and bosses → blessings + dew shop between waves →
  victory screen ("DAWN BREAKS!" with rank S–D) or game-over screen with
  score, best score, waves, kills, bosses, flawless waves, dew and accuracy,
  and a restart. Best score persists in `localStorage`.
- **Feel:** WebAudio-synthesised shots, hits, pickups, horns, boss roars and
  a victory arpeggio over an ambient pad and a generative pentatonic
  music-box melody; particles, explosion rings, screen shake, hit flashes,
  floating score text, kill-streak callouts, a boss health bar with phase
  pips and a combo multiplier in the HUD.
- **The garden lives:** a haloed moon, drifting clouds, wandering fireflies,
  swaying pine silhouettes, glowing mushrooms and a shimmering pond, over
  the seeded stars, grass and flowers.

## Play it

```
node serve.ts        # http://localhost:8080
```

## Hand it in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored `vendor/makefun-game.ts`.

## Screenshots

`shots.json` lists the four deterministic scenes, rendered from the game's
own code in a headless browser (`?shot=start|play|shop|win&seed=1`):

1. `1-start.jpg` — title screen with difficulty pills over the live garden
2. `2-play.jpg` — the wave-8 boss fight: Herald Ascendant, boss bar, HUD
3. `3-shop.jpg` — blessing cards above the dew shop between waves
4. `4-win.jpg` — victory screen: DAWN BREAKS, rank S, full run stats

## Layout

```
main.ts            hand-in program (Node 22, stdlib only)
serve.ts           tiny static server for local play-testing
game/index.html    canvas page, loads src/main.js
game/src/config.js tuning, palette, difficulties, roster, recipes, blessings, shop
game/src/random.js seeded RNG (deterministic screenshots)
game/src/fx.js     particles, rings, floating text, banners, score
game/src/audio.js  WebAudio synth: SFX + generative music-box melody
game/src/input.js  keyboard + mouse
game/src/enemies.js foe spawning + per-kind AI, boss phases
game/src/upgrades.js blessing pool: deal three, apply the pick
game/src/economy.js the dew shop: prices, stock, purchases
game/src/world.js  simulation: player, waves, combat, pickups, score, screens
game/src/background.js the living night garden: moon, clouds, fireflies, pines
game/src/render.js entities, HUD, boss bar, banners
game/src/screens.js title, blessings + shop, pause, victory / game-over
game/src/shots.js  deterministic screenshot scenes + autopilot
game/src/main.js   boot, fixed-step loop, ?shot= mode
vendor/            make.fun dossier library (kit copy, unchanged)
screenshots/       the four real renders
```
