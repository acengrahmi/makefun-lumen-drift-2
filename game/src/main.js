// Lumen Drift II — entry point. Boots the canvas, runs the loop at a fixed
// 60 Hz step, and handles the deterministic screenshot mode the maker uses:
// ?shot=start|play|shop|win&seed=N renders one scene, then sets
// window.__shotReady so the screenshot tool knows the frame is final.
import { ARENA, DIFFICULTIES } from './config.js';
import { createWorld, stepWorld, startRun, SCREEN_TITLE } from './world.js';
import { pickDifficultyAt } from './screens.js';
import { createInput } from './input.js';
import { drawWorld } from './render.js';
import { stageShot } from './shots.js';
import { SoundEngine } from './audio.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const shotSeed = Number(params.get('seed') ?? '1') || 1;

const sound = new SoundEngine();
const input = createInput(canvas);

// First gesture unlocks audio and, from the title, starts the run.
function armAudio() {
  sound.ensure();
}
window.addEventListener('pointerdown', armAudio, { once: false });
window.addEventListener('keydown', armAudio, { once: false });

if (shotName) {
  // Screenshot mode: stage the scene synchronously, draw once, signal ready.
  const world = stageShot(shotName, shotSeed);
  world.sound = sound;
  drawWorld(ctx, world);
  window.__shotReady = true;
} else {
  const world = createWorld(Date.now() % 2147483647);
  world.sound = sound;
  let last = performance.now();
  let accumulator = 0;
  const STEP = 1 / 60;

  function frame(now) {
    const elapsed = Math.min(0.1, (now - last) / 1000);
    last = now;
    accumulator += elapsed;
    while (accumulator >= STEP) {
      accumulator -= STEP;
      // Title: a click on a difficulty pill picks it; any other click or
      // Enter starts the run on the chosen difficulty. The loop owns the rest.
      if (world.screen === SCREEN_TITLE) {
        if (input.wasPressed('Enter') || input.wasPressed('Space')) {
          sound.ensure();
          sound.uiClick();
          startRun(world);
        } else {
          const click = input.consumeClick();
          if (click) {
            const picked = pickDifficultyAt(click.x, click.y);
            if (picked >= 0) {
              sound.ensure();
              sound.uiClick();
              const ids = ['gentle', 'brave', 'heroic'];
              world.difficulty = DIFFICULTIES[ids[picked]];
            } else {
              sound.ensure();
              sound.uiClick();
              startRun(world);
            }
          }
        }
      }
      stepWorld(world, STEP, input);
      input.consumeClick();
    }
    drawWorld(ctx, world);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
