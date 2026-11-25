// Boot, game loop and input for Simmer & Serve.
//
// The page reads ?shot= to stage a frozen scene for screenshots:
//   ?shot=start  title screen
//   ?shot=play   mid-shift: orders on the board, a burger half-built
//   ?shot=serve  a finished plate matching the first order, SERVE glowing
//   ?shot=rush   a full board with one order nearly out of patience
// &seed=N picks the kitchen's random stream. Without ?shot the game starts
// on its title screen and plays live.

import { createState, startShift, tick, pickIngredient, clickBoard, clickGrill, clickPot, clickPlate, clickTrash, clickServe } from './state.js';
import { drawGame, getZones, W, H } from './render.js';
import { INGREDIENTS, RECIPES, preparedId } from './recipes.js';
import { unlockAudio, toggleMute, sfx } from './audio.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seed = parseInt(params.get('seed') || '7', 10);
const frozen = Boolean(shot);

const canvas = document.getElementById('game');
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext('2d');

const state = createState(seed);
const mouse = { x: -100, y: -100 };
let paused = false;
let last = performance.now();

// Test/debug handle: the state is readable from the console and from
// automated play-tests (window.__simmer), nothing else uses it.
window.__simmer = state;

function stageShot(name) {
  state.screen = 'playing';
  state.timeLeft = 151;
  state.score = 1240;
  state.coins = 86;
  state.served = 6;
  state.combo = 3;
  if (name === 'start') {
    state.screen = 'title';
    return;
  }
  state.orders = [
    { uid: 1, recipe: RECIPES[0], patience: 34, maxPatience: 52 },
    { uid: 2, recipe: RECIPES[1], patience: 26, maxPatience: 48 },
    { uid: 3, recipe: RECIPES[2], patience: 44, maxPatience: 55 },
  ];
  if (name === 'play') {
    state.plate = ['bun', preparedId('patty')];
    state.board = { id: 'lettuce', chops: 2 };
    state.grill = { id: 'patty', progress: 0.62, done: false, burnt: false };
    state.hand = { id: 'tomato' };
    state.message = 'Burger needs lettuce + tomato — chop fast!';
    state.messageLife = 99;
  } else if (name === 'serve') {
    state.plate = ['bun', preparedId('patty'), preparedId('lettuce'), preparedId('tomato')];
    state.pot = { id: 'pasta', progress: 1, done: true, burnt: false };
    state.message = 'That burger matches order #1 — serve it!';
    state.messageLife = 99;
  } else if (name === 'rush') {
    state.orders.push({ uid: 4, recipe: RECIPES[3], patience: 6, maxPatience: 50 });
    state.orders[1].patience = 9;
    state.plate = [preparedId('pasta'), 'sauce'];
    state.pot = { id: 'pasta', progress: 0.45, done: false, burnt: false };
    state.grill = { id: 'patty', progress: 1, done: true, burnt: false };
    state.hand = { id: 'cheese' };
    state.message = 'Rush hour! Two orders are nearly out of time.';
    state.messageLife = 99;
  }
}

if (shot) stageShot(shot);

function zoneAt(x, y) {
  for (const z of getZones()) {
    if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return z;
  }
  return null;
}

function canvasPos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (evt.clientX - rect.left) * (W / rect.width),
    y: (evt.clientY - rect.top) * (H / rect.height),
  };
}

function handleAction(action, id) {
  if (state.screen === 'title') { startShift(state); return; }
  if (state.screen === 'over') { startShift(state); return; }
  if (paused) return;
  switch (action) {
    case 'bin': pickIngredient(state, id); break;
    case 'board': clickBoard(state); break;
    case 'grill': clickGrill(state); break;
    case 'pot': clickPot(state); break;
    case 'plate': clickPlate(state); break;
    case 'trash': clickTrash(state); break;
    case 'serve': clickServe(state); break;
  }
}

canvas.addEventListener('pointermove', (evt) => {
  const p = canvasPos(evt);
  mouse.x = p.x;
  mouse.y = p.y;
});

canvas.addEventListener('pointerdown', (evt) => {
  unlockAudio();
  const p = canvasPos(evt);
  mouse.x = p.x;
  mouse.y = p.y;
  const z = zoneAt(p.x, p.y);
  if (z) handleAction(z.action, z.id);
  else if (state.screen === 'title' || state.screen === 'over') startShift(state);
  else sfx.click();
});

window.addEventListener('keydown', (evt) => {
  unlockAudio();
  const k = evt.key.toLowerCase();
  if (k === 'm') { toggleMute(); return; }
  if (k === 'p' && state.screen === 'playing') { paused = !paused; return; }
  if (k === 'r' && state.screen === 'over') { startShift(state); return; }
  if (k === ' ' ) {
    evt.preventDefault();
    if (state.screen === 'title' || state.screen === 'over') { startShift(state); return; }
    clickServe(state);
    return;
  }
  if (k === 't') { clickTrash(state); return; }
  if (state.screen !== 'playing' || paused) return;
  const ing = Object.values(INGREDIENTS).find((g) => g.key === k);
  if (ing) pickIngredient(state, ing.id);
});

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!frozen && !paused) tick(state, dt);
  drawGame(ctx, state, mouse);
  if (paused && state.screen === 'playing') {
    ctx.fillStyle = 'rgba(61,43,31,0.6)';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#fff8ea';
    ctx.font = 'bold 44px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PAUSED — press P to resume', W / 2, H / 2);
  }
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
