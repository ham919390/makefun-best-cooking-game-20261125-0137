// Game state and rules for Simmer & Serve.
//
// The player holds one item at a time in their hand, preps it on the board,
// grill or pot, stacks it on the plate, and serves the plate when it matches
// an order ticket. Orders arrive over a 3-minute shift; patience runs out,
// the grill and pot can burn, and a served dish pays its price plus a tip.

import { INGREDIENTS, RECIPES, PREP_TIME, CHOPS_NEEDED, BURN_AFTER, preparedId, matchingOrder, displayName } from './recipes.js';
import { makeRng, pick } from './rng.js';
import { sfx } from './audio.js';

export const SHIFT_SECONDS = 180;
export const MAX_ORDERS = 4;

export function createState(seed) {
  const rng = makeRng(seed || 7);
  return {
    screen: 'title', // title | playing | over
    rng,
    time: 0,
    timeLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    served: 0,
    lost: 0,
    mistakes: 0,
    combo: 0,
    bestCombo: 0,
    hand: null, // { id } — raw or prepared ingredient id
    board: null, // { id, chops }
    grill: null, // { id, progress, done, burnt }
    pot: null, // { id, progress, done, burnt }
    plate: [], // prepared ingredient ids
    orders: [], // { uid, recipe, patience, maxPatience }
    orderUid: 1,
    spawnIn: 1.5,
    particles: [],
    floaters: [], // { x, y, text, color, life }
    message: '',
    messageLife: 0,
    shake: 0,
    servedValue: 0,
  };
}

// Start a fresh shift.
export function startShift(state) {
  const fresh = createState(7);
  Object.assign(state, fresh, { rng: state.rng });
  state.screen = 'playing';
  state.orders = [];
  spawnOrder(state);
  spawnOrder(state);
  sfx.start();
}

export function spawnOrder(state) {
  if (state.orders.length >= MAX_ORDERS) return;
  const recipe = pick(state.rng, RECIPES);
  const patience = 42 + state.rng() * 18;
  state.orders.push({
    uid: state.orderUid++,
    recipe,
    patience,
    maxPatience: patience,
  });
}

function addFloater(state, x, y, text, color) {
  state.floaters.push({ x, y, text, color: color || '#ffffff', life: 1.6 });
}

function burst(state, x, y, color, n) {
  for (let i = 0; i < (n || 12); i++) {
    const a = state.rng() * Math.PI * 2;
    const sp = 40 + state.rng() * 120;
    state.particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      life: 0.5 + state.rng() * 0.5,
      maxLife: 1,
      color: color || '#f4d35e',
      size: 3 + state.rng() * 4,
    });
  }
}

function say(state, text) {
  state.message = text;
  state.messageLife = 2.2;
}

function fail(state, text) {
  state.shake = 0.35;
  state.combo = 0;
  state.mistakes++;
  say(state, text);
  sfx.error();
}

// --- Player actions -------------------------------------------------------

// Pick an ingredient out of its bin into the hand.
export function pickIngredient(state, rawId) {
  if (state.screen !== 'playing') return;
  if (state.hand) { fail(state, 'Hands full — serve or trash first'); return; }
  if (!INGREDIENTS[rawId]) return;
  state.hand = { id: rawId };
  sfx.pickup();
}

// The chopping board: place a choppable, chop it, then take it back.
export function clickBoard(state) {
  if (state.screen !== 'playing') return;
  const b = state.board;
  if (!b) {
    if (!state.hand) { say(state, 'Pick an ingredient first'); return; }
    const ing = INGREDIENTS[state.hand.id];
    if (!ing || ing.prep !== 'chop') { fail(state, displayName(state.hand.id) + " doesn't need chopping"); return; }
    state.board = { id: state.hand.id, chops: 0 };
    state.hand = null;
    sfx.place();
    return;
  }
  b.chops++;
  sfx.chop();
  burst(state, 165, 380, '#7bc043', 6);
  if (b.chops >= CHOPS_NEEDED) {
    state.hand = { id: preparedId(b.id) };
    state.board = null;
    sfx.ding();
    say(state, displayName(state.hand.id) + ' ready!');
  }
}

// The grill: place a raw patty, wait for it to cook, take it before it burns.
export function clickGrill(state) {
  if (state.screen !== 'playing') return;
  const g = state.grill;
  if (!g) {
    if (!state.hand) { say(state, 'Pick a patty first'); return; }
    if (state.hand.id !== 'patty') { fail(state, 'Only patties go on the grill'); return; }
    state.grill = { id: 'patty', progress: 0, done: false, burnt: false };
    state.hand = null;
    sfx.place();
    sfx.sizzle();
    return;
  }
  if (g.burnt) {
    state.grill = null;
    sfx.burnt();
    say(state, 'Burnt patty tossed out');
    return;
  }
  if (!g.done) { say(state, 'Still grilling…'); return; }
  state.hand = { id: preparedId('patty') };
  state.grill = null;
  sfx.ding();
}

// The pot: boil pasta the same way.
export function clickPot(state) {
  if (state.screen !== 'playing') return;
  const p = state.pot;
  if (!p) {
    if (!state.hand) { say(state, 'Pick pasta first'); return; }
    if (state.hand.id !== 'pasta') { fail(state, 'Only pasta goes in the pot'); return; }
    state.pot = { id: 'pasta', progress: 0, done: false, burnt: false };
    state.hand = null;
    sfx.place();
    return;
  }
  if (p.burnt) {
    state.pot = null;
    sfx.burnt();
    say(state, 'Soggy pasta tossed out');
    return;
  }
  if (!p.done) { say(state, 'Still boiling…'); return; }
  state.hand = { id: preparedId('pasta') };
  state.pot = null;
  sfx.ding();
}

// Stack what the hand holds onto the plate.
export function clickPlate(state) {
  if (state.screen !== 'playing') return;
  if (!state.hand) { say(state, 'Nothing in hand to plate'); return; }
  const ing = INGREDIENTS[state.hand.id.split(':')[0]];
  if (ing && ing.prep && !state.hand.id.includes(':')) {
    fail(state, displayName(state.hand.id) + ' needs prep first!');
    return;
  }
  state.plate.push(state.hand.id);
  state.hand = null;
  sfx.place();
}

// Throw away what the hand holds.
export function clickTrash(state) {
  if (state.screen !== 'playing') return;
  if (!state.hand && state.plate.length === 0) { say(state, 'Nothing to throw away'); return; }
  if (state.hand) state.hand = null;
  else state.plate.pop();
  sfx.place();
  say(state, 'Tossed');
}

// Serve the plate to the order it completes.
export function clickServe(state) {
  if (state.screen !== 'playing') return;
  if (state.plate.length === 0) { say(state, 'The plate is empty'); return; }
  const order = matchingOrder(state.plate, state.orders);
  if (!order) {
    fail(state, 'No order wants this dish!');
    return;
  }
  const patienceFrac = Math.max(0, order.patience / order.maxPatience);
  const tip = Math.round(5 * patienceFrac);
  const comboMult = 1 + Math.min(state.combo, 8) * 0.1;
  const earned = Math.round((order.recipe.price + tip) * comboMult);
  state.coins += earned;
  state.score += earned * 10 + 50;
  state.combo++;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.served++;
  state.servedValue = earned;
  state.orders = state.orders.filter((o) => o.uid !== order.uid);
  state.plate = [];
  burst(state, 1120, 380, '#f4d35e', 22);
  addFloater(state, 1120, 330, '+$' + earned, '#f4d35e');
  if (state.combo >= 3) addFloater(state, 1120, 300, 'COMBO x' + state.combo, '#ff8fa3');
  sfx.serve();
  say(state, order.recipe.name + ' served! +$' + earned);
}

// --- Simulation -----------------------------------------------------------

function cookStation(station, kind, dt, state, x, y) {
  if (!station || station.done) return;
  station.progress += dt / PREP_TIME[kind];
  if (station.progress >= 1) {
    station.progress = 1;
    station.done = true;
    station.over = 0;
    sfx.ding();
    addFloater(state, x, y, 'Ready!', '#7bc043');
  }
}

function burnCheck(station, dt, state, x, y, what) {
  if (!station || !station.done || station.burnt) return;
  station.over = (station.over || 0) + dt;
  if (station.over > BURN_AFTER) {
    station.burnt = true;
    sfx.burnt();
    addFloater(state, x, y, 'Burnt!', '#e63946');
    say(state, what + ' burnt — click it to toss it');
  }
}

export function tick(state, dt) {
  if (state.screen !== 'playing') return;
  state.time += dt;
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.screen = 'over';
    sfx.expire();
    return;
  }
  // Orders lose patience and walk out.
  for (const order of state.orders) order.patience -= dt;
  const expired = state.orders.filter((o) => o.patience <= 0);
  if (expired.length) {
    state.orders = state.orders.filter((o) => o.patience > 0);
    state.lost += expired.length;
    state.combo = 0;
    sfx.expire();
    say(state, 'An order walked out!');
  }
  // New orders arrive, faster as the shift goes on.
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnOrder(state);
    const rush = 1 - state.timeLeft / SHIFT_SECONDS;
    state.spawnIn = 13 - rush * 5;
  }
  cookStation(state.grill, 'grill', dt, state, 490, 300);
  cookStation(state.pot, 'pot', dt, state, 815, 300);
  burnCheck(state.grill, dt, state, 490, 300, 'Patty');
  burnCheck(state.pot, dt, state, 815, 300, 'Pasta');
  // Particles and floaters.
  for (const p of state.particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 220 * dt;
    p.life -= dt;
  }
  state.particles = state.particles.filter((p) => p.life > 0);
  for (const f of state.floaters) {
    f.y -= 34 * dt;
    f.life -= dt;
  }
  state.floaters = state.floaters.filter((f) => f.life > 0);
  if (state.messageLife > 0) state.messageLife -= dt;
  if (state.shake > 0) state.shake -= dt;
}

// Rating for the end-of-shift summary.
export function shiftRating(state) {
  if (state.served >= 14) return '★★★ Master Chef!';
  if (state.served >= 9) return '★★★ Sous Chef!';
  if (state.served >= 5) return '★★ Line Cook!';
  return '★ Keep practising!';
}
