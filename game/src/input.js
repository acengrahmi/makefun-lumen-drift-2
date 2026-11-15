// Keyboard and mouse state, kept in one place so the world update only ever
// reads this plain object. WASD or arrows move, mouse aims, hold mouse or
// Space to fire, E fires a Nova, P pauses, M mutes, R restarts, 1/2/3 pick
// a blessing card, 4-8 buy from the dew shop, Enter moves on. Clicks are
// also exposed as one-frame "pressed" flags.
export function createInput(canvas) {
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    firing: false,
    aimX: 640,
    aimY: 360,
    aimActive: false,
    pressedKeys: new Set(),
    clicked: null,
    mouseDown: false,
  };

  const KEYMAP = {
    KeyW: 'up',
    ArrowUp: 'up',
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyD: 'right',
    ArrowRight: 'right',
    Space: 'firing',
  };

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    input.pressedKeys.add(event.code);
    const field = KEYMAP[event.code];
    if (field) {
      input[field] = true;
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    input.pressedKeys.delete(event.code);
    const field = KEYMAP[event.code];
    if (field) input[field] = false;
  });

  window.addEventListener('blur', () => {
    input.up = input.down = input.left = input.right = false;
    input.firing = false;
    input.mouseDown = false;
  });

  function updateAim(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    input.aimX = (event.clientX - rect.left) * scaleX;
    input.aimY = (event.clientY - rect.top) * scaleY;
    input.aimActive = true;
  }

  canvas.addEventListener('mousemove', updateAim);
  canvas.addEventListener('mousedown', (event) => {
    updateAim(event);
    input.mouseDown = true;
    input.firing = true;
    input.clicked = { x: input.aimX, y: input.aimY };
  });
  window.addEventListener('mouseup', () => {
    input.mouseDown = false;
    if (!input.pressedKeys.has('Space')) input.firing = false;
  });

  // The world consumes these once per frame; they are cleared by main.js.
  input.consumeClick = function consumeClick() {
    const click = input.clicked;
    input.clicked = null;
    return click;
  };

  input.wasPressed = function wasPressed(code) {
    if (!input.pressedKeys.has(code)) return false;
    input.pressedKeys.delete(code);
    return true;
  };

  input.moveVector = function moveVector() {
    let x = 0;
    let y = 0;
    if (input.left) x -= 1;
    if (input.right) x += 1;
    if (input.up) y -= 1;
    if (input.down) y += 1;
    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }
    return { x, y };
  };

  return input;
}
