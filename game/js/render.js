// All canvas drawing for Simmer & Serve.
// One file owns the whole look: the kitchen, the order board, the stations,
// the food, the HUD, the title screen and the end-of-shift summary.
// drawGame also rebuilds the click zones the input layer reads.

import { INGREDIENTS, displayName, baseOf, plateMatchesRecipe } from './recipes.js';

export const W = 1280;
export const H = 720;

// Layout rectangles, shared with the input layer through getZones().
const L = {
  bins: { x: 16, y: 192, w: 148, h: 70, gap: 8 },
  board: { x: 16, y: 276, w: 300, h: 200 },
  grill: { x: 340, y: 276, w: 300, h: 200 },
  pot: { x: 664, y: 276, w: 300, h: 200 },
  plate: { x: 988, y: 276, w: 276, h: 200 },
  trash: { x: 16, y: 500, w: 130, h: 64 },
  serve: { x: 1000, y: 500, w: 264, h: 110 },
};

let zones = [];
export function getZones() {
  return zones;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, weight, align) {
  ctx.fillStyle = color || '#3d2b1f';
  ctx.font = (weight || 'bold') + ' ' + size + 'px Arial, sans-serif';
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- Food -----------------------------------------------------------------

export function drawFood(ctx, itemId, x, y, s) {
  const raw = baseOf(itemId);
  const ing = INGREDIENTS[raw];
  if (!ing) return;
  const burnt = itemId.endsWith(':burnt');
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 48, s / 48);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(61,43,31,0.55)';
  const c = burnt ? '#2b2b2b' : ing.color;
  const d = burnt ? '#111111' : ing.dark;
  if (ing.shape === 'bun') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(0, 4, 20, Math.PI, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = d;
    ctx.fillRect(-20, 4, 40, 8);
    ctx.fillStyle = '#fff3d6';
    for (const [sx, sy] of [[-10, -8], [0, -13], [10, -8], [-4, -4], [6, -4]]) {
      ctx.beginPath();
      ctx.ellipse(sx, sy, 2.4, 1.6, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ing.shape === 'patty') {
    ctx.fillStyle = c;
    rr(ctx, -22, -9, 44, 18, 8);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = d;
    ctx.beginPath();
    ctx.moveTo(-14, -6); ctx.lineTo(-14, 6);
    ctx.moveTo(0, -6); ctx.lineTo(0, 6);
    ctx.moveTo(14, -6); ctx.lineTo(14, 6);
    ctx.stroke();
  } else if (ing.shape === 'leaf') {
    ctx.fillStyle = c;
    for (const [ox, oy, r] of [[-12, 2, 11], [0, -4, 12], [12, 2, 11]]) {
      ctx.beginPath();
      ctx.arc(ox, oy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = d;
    ctx.beginPath();
    ctx.moveTo(-18, 4);
    ctx.quadraticCurveTo(0, -8, 18, 4);
    ctx.stroke();
  } else if (ing.shape === 'slice') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(0, 0, 19, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ff8a7a';
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd9d0';
    for (const [sx, sy] of [[-5, -4], [6, 3], [-2, 7]]) {
      ctx.beginPath();
      ctx.ellipse(sx, sy, 2.5, 3.5, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ing.shape === 'wedge') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(-20, 10);
    ctx.lineTo(20, 10);
    ctx.lineTo(20, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = d;
    for (const [hx, hy] of [[-8, 2], [6, -2], [10, 5]]) {
      ctx.beginPath();
      ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (ing.shape === 'pasta') {
    ctx.strokeStyle = c;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    for (const oy of [-8, 0, 8]) {
      ctx.beginPath();
      ctx.moveTo(-20, oy);
      ctx.bezierCurveTo(-10, oy - 7, 0, oy + 7, 10, oy);
      ctx.bezierCurveTo(15, oy - 4, 18, oy + 2, 20, oy);
      ctx.stroke();
    }
  } else if (ing.shape === 'dollop') {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(0, 2, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = d;
    ctx.beginPath();
    ctx.arc(-4, -3, 5, 0, Math.PI * 2);
    ctx.fill();
  } else if (ing.shape === 'rings') {
    ctx.strokeStyle = c;
    ctx.lineWidth = 5;
    for (const r of [17, 11, 5]) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = d;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0.6, 2.2);
    ctx.stroke();
  }
  ctx.restore();
}

// --- Kitchen pieces -------------------------------------------------------

function drawStation(ctx, rect, title, sub, accent) {
  ctx.fillStyle = '#fff8ea';
  rr(ctx, rect.x, rect.y, rect.w, rect.h, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(61,43,31,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Header with only its top corners rounded, so the text sits fully on colour.
  ctx.fillStyle = accent || '#2a9d8f';
  ctx.beginPath();
  ctx.moveTo(rect.x, rect.y + 34);
  ctx.lineTo(rect.x, rect.y + 14);
  ctx.arcTo(rect.x, rect.y, rect.x + 14, rect.y, 14);
  ctx.lineTo(rect.x + rect.w - 14, rect.y);
  ctx.arcTo(rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + 14, 14);
  ctx.lineTo(rect.x + rect.w, rect.y + 34);
  ctx.closePath();
  ctx.fill();
  text(ctx, title, rect.x + 14, rect.y + 17, 16, '#fff8ea');
  if (sub) text(ctx, sub, rect.x + rect.w - 16, rect.y + 17, 12, '#ffe9b0', 'normal', 'right');
}

function progressBar(ctx, x, y, w, frac, color) {
  ctx.fillStyle = 'rgba(61,43,31,0.18)';
  rr(ctx, x, y, w, 12, 6);
  ctx.fill();
  ctx.fillStyle = color;
  rr(ctx, x, y, Math.max(12, w * Math.min(1, frac)), 12, 6);
  ctx.fill();
}

function steam(ctx, x, y, t, n) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const ph = t * 1.4 + i * 1.7;
    const sx = x + Math.sin(ph) * 8;
    const sy = y - ((t * 22 + i * 16) % 44);
    ctx.globalAlpha = 0.7 - ((t * 22 + i * 16) % 44) / 60;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(sx + 6, sy - 8, sx - 2, sy - 14);
    ctx.stroke();
  }
  ctx.restore();
}

// --- Main draw ------------------------------------------------------------

export function drawGame(ctx, state, mouse) {
  zones = [];
  ctx.save();
  if (state.shake > 0) {
    ctx.translate((Math.random() - 0.5) * 8 * state.shake, (Math.random() - 0.5) * 8 * state.shake);
  }
  // Wall and floor.
  ctx.fillStyle = '#f6e7c9';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e8cfa0';
  for (let x = 0; x < W; x += 96) {
    ctx.fillRect(x, 168, 48, 4);
  }
  ctx.fillStyle = '#c98f5a';
  ctx.fillRect(0, 172, W, 8);

  drawTopBar(ctx, state);
  drawOrders(ctx, state);
  drawBins(ctx, state);
  drawBoard(ctx, state);
  drawGrill(ctx, state);
  drawPot(ctx, state);
  drawPlateStation(ctx, state);
  drawBottom(ctx, state);
  drawParticles(ctx, state);
  drawFloaters(ctx, state);

  // The item in hand follows the mouse.
  if (state.hand && mouse) {
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2a9d8f';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawFood(ctx, state.hand.id, mouse.x, mouse.y, 44);
    ctx.restore();
  }

  if (state.screen === 'title') drawTitle(ctx, state);
  if (state.screen === 'over') drawGameOver(ctx, state);
  ctx.restore();
}

function drawTopBar(ctx, state) {
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(0, 0, W, 58);
  // Chef hat mark.
  ctx.fillStyle = '#fff8ea';
  ctx.beginPath();
  ctx.arc(34, 26, 11, 0, Math.PI * 2);
  ctx.arc(50, 26, 11, 0, Math.PI * 2);
  ctx.arc(42, 18, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(30, 32, 24, 8);
  text(ctx, 'SIMMER & SERVE', 66, 30, 26, '#fff8ea');
  text(ctx, 'a cozy diner kitchen', 66, 48, 12, '#e8cfa0', 'normal');
  const mm = Math.floor(state.timeLeft / 60);
  const ss = String(Math.floor(state.timeLeft % 60)).padStart(2, '0');
  const lowTime = state.timeLeft <= 30 && state.screen === 'playing';
  text(ctx, 'SHIFT ' + mm + ':' + ss, 640, 30, 26, lowTime ? '#ff6b5e' : '#fff8ea', 'bold', 'center');
  text(ctx, 'SCORE ' + state.score, 980, 22, 18, '#ffe9b0', 'bold', 'right');
  text(ctx, 'COINS $' + state.coins + '   SERVED ' + state.served + '   COMBO x' + Math.max(1, state.combo), 980, 46, 14, '#e8cfa0', 'normal', 'right');
}

function drawOrders(ctx, state) {
  text(ctx, 'ORDER BOARD', 16, 66, 13, '#8a5a33');
  for (let i = 0; i < 4; i++) {
    const x = 16 + i * 316;
    const y = 74;
    const order = state.orders[i];
    ctx.fillStyle = order ? '#ffffff' : 'rgba(255,255,255,0.45)';
    rr(ctx, x, y, 300, 96, 12);
    ctx.fill();
    ctx.strokeStyle = order ? (order.patience / order.maxPatience < 0.3 ? '#e63946' : '#2a9d8f') : 'rgba(61,43,31,0.15)';
    ctx.lineWidth = order ? 3 : 2;
    ctx.stroke();
    if (!order) {
      text(ctx, 'waiting for customers…', x + 150, y + 50, 14, '#a08a70', 'normal', 'center');
      continue;
    }
    text(ctx, order.recipe.name.toUpperCase(), x + 14, y + 20, 16, '#3d2b1f');
    text(ctx, '$' + order.recipe.price, x + 286, y + 20, 16, '#2a7d5f', 'bold', 'right');
    let ix = x + 14;
    for (const item of order.recipe.needs) {
      ctx.fillStyle = '#fdf3dd';
      ctx.beginPath();
      ctx.arc(ix + 16, y + 56, 17, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(61,43,31,0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      drawFood(ctx, item, ix + 16, y + 56, 26);
      ix += 40;
    }
    const frac = Math.max(0, order.patience / order.maxPatience);
    progressBar(ctx, x + 14, y + 82, 272, frac, frac > 0.5 ? '#2a9d8f' : frac > 0.25 ? '#e8a94e' : '#e63946');
  }
}

function drawBins(ctx, state) {
  text(ctx, 'INGREDIENTS — click a bin to pick it up (keys 1–8)', 16, 186, 12, '#8a5a33');
  const ids = Object.keys(INGREDIENTS);
  ids.forEach((id, i) => {
    const ing = INGREDIENTS[id];
    const x = L.bins.x + i * (L.bins.w + L.bins.gap);
    const y = L.bins.y;
    const inHand = state.hand && state.hand.id === id;
    ctx.fillStyle = inHand ? '#ffe9b0' : '#fff8ea';
    rr(ctx, x, y, L.bins.w, L.bins.h, 10);
    ctx.fill();
    ctx.strokeStyle = inHand ? '#e8a94e' : 'rgba(61,43,31,0.25)';
    ctx.lineWidth = inHand ? 3 : 2;
    ctx.stroke();
    drawFood(ctx, id, x + 30, y + 35, 40);
    text(ctx, ing.name, x + 56, y + 26, 14, '#3d2b1f');
    text(ctx, ing.prep ? 'needs ' + ing.prep : 'ready to plate', x + 56, y + 46, 11, '#8a7a63', 'normal');
    text(ctx, ing.key, x + L.bins.w - 12, y + 14, 11, '#b0a090', 'bold', 'right');
    zones.push({ x, y, w: L.bins.w, h: L.bins.h, action: 'bin', id });
  });
}

function drawBoard(ctx, state) {
  const r = L.board;
  drawStation(ctx, r, 'CHOPPING BOARD', state.board ? 'chop x' + state.board.chops + '/' + 3 : 'click to chop', '#7bc043');
  ctx.fillStyle = '#c98f5a';
  rr(ctx, r.x + 30, r.y + 56, 240, 96, 10);
  ctx.fill();
  ctx.strokeStyle = '#a06a3b';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (state.board) {
    drawFood(ctx, state.board.id, r.x + 150, r.y + 104, 64);
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < state.board.chops ? '#7bc043' : 'rgba(255,255,255,0.6)';
      ctx.beginPath();
      ctx.arc(r.x + 120 + i * 30, r.y + 168, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4e8f2a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  } else {
    text(ctx, 'lettuce · tomato · onion', r.x + 150, r.y + 104, 14, '#8a6a45', 'normal', 'center');
    text(ctx, 'click 3 times to chop', r.x + 150, r.y + 128, 12, '#a08a70', 'normal', 'center');
  }
  zones.push({ x: r.x, y: r.y, w: r.w, h: r.h, action: 'board' });
}

function drawGrill(ctx, state) {
  const r = L.grill;
  const g = state.grill;
  drawStation(ctx, r, 'GRILL', g ? (g.burnt ? 'BURNT!' : g.done ? 'ready!' : 'grilling…') : 'patties only', '#e76f51');
  ctx.fillStyle = '#4a4a4a';
  rr(ctx, r.x + 30, r.y + 56, 240, 96, 10);
  ctx.fill();
  ctx.strokeStyle = '#2b2b2b';
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(r.x + 30 + i * 48, r.y + 56);
    ctx.lineTo(r.x + 30 + i * 48, r.y + 152);
    ctx.stroke();
  }
  if (g) {
    drawFood(ctx, g.burnt ? 'patty:burnt' : 'patty', r.x + 150, r.y + 104, 64);
    if (!g.done) progressBar(ctx, r.x + 60, r.y + 168, 180, g.progress, '#e76f51');
    else if (!g.burnt) text(ctx, 'READY — click to take it', r.x + 150, r.y + 174, 13, '#2a7d5f', 'bold', 'center');
    else text(ctx, 'click to toss it', r.x + 150, r.y + 174, 13, '#e63946', 'bold', 'center');
    if (!g.done) steam(ctx, r.x + 150, r.y + 60, state.time, 3);
  } else {
    text(ctx, 'raw patty → grilled patty', r.x + 150, r.y + 104, 14, '#cfc4b0', 'normal', 'center');
    text(ctx, 'take it off in time!', r.x + 150, r.y + 128, 12, '#a89a85', 'normal', 'center');
  }
  zones.push({ x: r.x, y: r.y, w: r.w, h: r.h, action: 'grill' });
}

function drawPot(ctx, state) {
  const r = L.pot;
  const p = state.pot;
  drawStation(ctx, r, 'POT', p ? (p.burnt ? 'SOGGY!' : p.done ? 'ready!' : 'boiling…') : 'pasta only', '#4a90d9');
  ctx.fillStyle = '#5a6b7d';
  ctx.beginPath();
  ctx.ellipse(r.x + 150, r.y + 104, 110, 46, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#7fa8c9';
  ctx.beginPath();
  ctx.ellipse(r.x + 150, r.y + 96, 96, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  if (p) {
    drawFood(ctx, p.burnt ? 'pasta' : 'pasta', r.x + 150, r.y + 100, 56);
    if (!p.done) {
      for (let i = 0; i < 4; i++) {
        const bx = r.x + 90 + i * 40 + Math.sin(state.time * 3 + i) * 4;
        const by = r.y + 92 - ((state.time * 26 + i * 13) % 26);
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.arc(bx, by, 4 + (i % 2), 0, Math.PI * 2);
        ctx.fill();
      }
      progressBar(ctx, r.x + 60, r.y + 168, 180, p.progress, '#4a90d9');
    } else if (!p.burnt) {
      text(ctx, 'READY — click to take it', r.x + 150, r.y + 174, 13, '#2a7d5f', 'bold', 'center');
    } else {
      text(ctx, 'click to toss it', r.x + 150, r.y + 174, 13, '#e63946', 'bold', 'center');
    }
    if (!p.done) steam(ctx, r.x + 150, r.y + 60, state.time, 3);
  } else {
    text(ctx, 'pasta → boiled pasta', r.x + 150, r.y + 100, 14, '#e8eef2', 'normal', 'center');
    text(ctx, "don't let it go soggy", r.x + 150, r.y + 124, 12, '#c3cfd8', 'normal', 'center');
  }
  zones.push({ x: r.x, y: r.y, w: r.w, h: r.h, action: 'pot' });
}

function drawPlateStation(ctx, state) {
  const r = L.plate;
  const match = state.plate.length > 0 && state.orders.some((o) => plateMatchesRecipe(state.plate, o.recipe));
  drawStation(ctx, r, 'YOUR PLATE', match ? 'matches!' : state.plate.length + ' item' + (state.plate.length === 1 ? '' : 's'), match ? '#2a9d8f' : '#b08954');
  ctx.fillStyle = '#f1f1f1';
  ctx.beginPath();
  ctx.ellipse(r.x + 138, r.y + 140, 108, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9c9c9';
  ctx.lineWidth = 2;
  ctx.stroke();
  if (state.plate.length === 0) {
    text(ctx, 'stack ingredients here', r.x + 138, r.y + 140, 13, '#a08a70', 'normal', 'center');
  } else {
    const n = state.plate.length;
    state.plate.forEach((item, i) => {
      const y = r.y + 148 - (n - 1 - i) * 16;
      drawFood(ctx, item, r.x + 138, y, 58);
    });
    let label = state.plate.map((p) => displayName(p)).join(' + ');
    ctx.font = 'normal 10px Arial, sans-serif';
    while (label.length > 4 && ctx.measureText(label).width > r.w - 16) {
      label = label.slice(0, -4) + '…';
    }
    text(ctx, label, r.x + 138, r.y + 186, 10, '#8a7a63', 'normal', 'center');
  }
  zones.push({ x: r.x, y: r.y, w: r.w, h: r.h, action: 'plate' });
}

function drawBottom(ctx, state) {
  const match = state.plate.length > 0 ? state.orders.find((o) => plateMatchesRecipe(state.plate, o.recipe)) : null;
  // Trash.
  const t = L.trash;
  ctx.fillStyle = '#fff8ea';
  rr(ctx, t.x, t.y, t.w, t.h, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(61,43,31,0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, 'TRASH', t.x + 65, t.y + 24, 16, '#e63946', 'bold', 'center');
  text(ctx, 'hand / top item', t.x + 65, t.y + 46, 11, '#8a7a63', 'normal', 'center');
  zones.push({ x: t.x, y: t.y, w: t.w, h: t.h, action: 'trash' });
  // Hand readout.
  ctx.fillStyle = 'rgba(255,248,234,0.9)';
  rr(ctx, 160, 490, 300, 84, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(61,43,31,0.25)';
  ctx.stroke();
  text(ctx, 'IN HAND', 176, 510, 12, '#8a7a63');
  if (state.hand) {
    drawFood(ctx, state.hand.id, 200, 548, 40);
    text(ctx, displayName(state.hand.id), 232, 548, 16, '#3d2b1f');
  } else {
    text(ctx, '— empty —', 232, 548, 15, '#a08a70', 'normal');
  }
  // Message line.
  if (state.message && state.messageLife > 0) {
    ctx.globalAlpha = Math.min(1, state.messageLife);
    text(ctx, state.message, 640, 540, 18, '#3d2b1f', 'bold', 'center');
    ctx.globalAlpha = 1;
  }
  // Serve button.
  const s = L.serve;
  const glow = match ? 0.75 + 0.25 * Math.sin(state.time * 6) : 1;
  ctx.save();
  ctx.globalAlpha = glow;
  ctx.fillStyle = match ? '#2a9d8f' : '#9db8a8';
  rr(ctx, s.x, s.y, s.w, s.h, 16);
  ctx.fill();
  ctx.strokeStyle = match ? '#1f7a6e' : '#7a9a8a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
  text(ctx, 'SERVE', s.x + 132, s.y + 38, 30, '#ffffff', 'bold', 'center');
  text(ctx, match ? match.recipe.name + '  +$' + match.recipe.price : 'plate a full order first', s.x + 132, s.y + 76, 14, '#ffffff', 'normal', 'center');
  zones.push({ x: s.x, y: s.y, w: s.w, h: s.h, action: 'serve' });
  // Controls hint.
  text(ctx, 'Mouse: click bins, stations, plate and SERVE   ·   Keys: 1–8 ingredients · Space serve · T trash · M mute · P pause', 640, 688, 13, '#8a7a63', 'normal', 'center');
  // Menu cheat-sheet: dish names and prices only, so the line always fits.
  text(ctx, 'MENU', 16, 640, 12, '#8a5a33');
  text(ctx, 'Classic Burger $12  ·  Cheesy Pasta $11  ·  Garden Salad $9  ·  Patty Melt $13', 68, 640, 13, '#6b5a44', 'normal');
}

function drawParticles(ctx, state) {
  for (const p of state.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawFloaters(ctx, state) {
  for (const f of state.floaters) {
    ctx.globalAlpha = Math.min(1, f.life);
    text(ctx, f.text, f.x, f.y, 22, f.color, 'bold', 'center');
  }
  ctx.globalAlpha = 1;
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(61,43,31,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff8ea';
  rr(ctx, 290, 120, 700, 460, 20);
  ctx.fill();
  ctx.strokeStyle = '#e8a94e';
  ctx.lineWidth = 4;
  ctx.stroke();
  // Chef hat.
  ctx.fillStyle = '#2a9d8f';
  ctx.beginPath();
  ctx.arc(600, 190, 26, 0, Math.PI * 2);
  ctx.arc(640, 190, 26, 0, Math.PI * 2);
  ctx.arc(620, 168, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(596, 200, 48, 18);
  text(ctx, 'SIMMER & SERVE', 640, 268, 46, '#3d2b1f', 'bold', 'center');
  text(ctx, 'Run the coziest diner kitchen in town.', 640, 308, 18, '#8a7a63', 'normal', 'center');
  text(ctx, 'Orders roll in on the board. Chop, grill and boil,', 640, 348, 16, '#6b5a44', 'normal', 'center');
  text(ctx, 'stack the plate, and serve before patience runs out!', 640, 372, 16, '#6b5a44', 'normal', 'center');
  text(ctx, '3-minute shift · tips for fast service · combos pay more', 640, 408, 15, '#2a7d5f', 'bold', 'center');
  ctx.fillStyle = '#2a9d8f';
  rr(ctx, 490, 440, 300, 64, 14);
  ctx.fill();
  text(ctx, 'CLICK TO START', 640, 473, 24, '#ffffff', 'bold', 'center');
  text(ctx, 'Mouse + keys 1–8 · Space serve · T trash · M mute', 640, 540, 13, '#8a7a63', 'normal', 'center');
}

function drawGameOver(ctx, state) {
  ctx.fillStyle = 'rgba(61,43,31,0.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff8ea';
  rr(ctx, 340, 150, 600, 420, 20);
  ctx.fill();
  ctx.strokeStyle = '#e8a94e';
  ctx.lineWidth = 4;
  ctx.stroke();
  text(ctx, 'SHIFT OVER!', 640, 210, 40, '#3d2b1f', 'bold', 'center');
  text(ctx, 'You served ' + state.served + ' dishes and earned $' + state.coins, 640, 262, 19, '#6b5a44', 'normal', 'center');
  text(ctx, 'Score ' + state.score + '   ·   Best combo x' + Math.max(1, state.bestCombo) + '   ·   Orders lost ' + state.lost, 640, 296, 16, '#6b5a44', 'normal', 'center');
  const rating = state.served >= 14 ? 'Master Chef!' : state.served >= 9 ? 'Sous Chef!' : state.served >= 5 ? 'Line Cook!' : 'Keep practising!';
  const stars = state.served >= 14 || state.served >= 9 ? '★★★' : state.served >= 5 ? '★★' : '★';
  text(ctx, stars, 640, 350, 40, '#e8a94e', 'bold', 'center');
  text(ctx, rating, 640, 396, 24, '#2a7d5f', 'bold', 'center');
  ctx.fillStyle = '#2a9d8f';
  rr(ctx, 490, 430, 300, 64, 14);
  ctx.fill();
  text(ctx, 'PLAY AGAIN  (R)', 640, 463, 22, '#ffffff', 'bold', 'center');
  text(ctx, 'Thanks for playing Simmer & Serve!', 640, 530, 14, '#8a7a63', 'normal', 'center');
}
