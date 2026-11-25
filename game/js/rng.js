// Seeded random numbers for Simmer & Serve.
// Every run of the game draws from one mulberry32 stream so a screenshot
// setup (?shot=...&seed=N) renders the same kitchen every time.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pick one element from an array using a seeded stream.
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}

// Shuffle a copy of an array using a seeded stream.
export function shuffle(rng, items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}
