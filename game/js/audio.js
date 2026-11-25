// Tiny synthesised sound effects for Simmer & Serve.
// Everything is made with the Web Audio API at run time: no audio files,
// no network, and nothing to load. Sounds only start after the player's
// first click or key press, as browsers require.

let audioCtx = null;
let muted = false;

function ctx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

// Call once from the first user gesture so later sounds are allowed.
export function unlockAudio() {
  ctx();
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

function tone(freq, dur, type, vol, when, slideTo) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime + (when || 0);
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol || 0.12, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur, vol, when, lowpass) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime + (when || 0);
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buffer;
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpass || 1200;
  const gain = ac.createGain();
  gain.gain.setValueAtTime(vol || 0.08, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(ac.destination);
  src.start(t0);
}

export const sfx = {
  click() { tone(660, 0.07, 'triangle', 0.08); },
  pickup() { tone(520, 0.08, 'triangle', 0.09, 0, 760); },
  place() { tone(330, 0.09, 'triangle', 0.09, 0, 260); },
  chop() { noise(0.09, 0.14, 0, 2400); tone(180, 0.06, 'square', 0.05); },
  sizzle() { noise(0.5, 0.05, 0, 5000); },
  ding() { tone(880, 0.18, 'sine', 0.12); tone(1318, 0.28, 'sine', 0.1, 0.09); },
  serve() {
    tone(523, 0.12, 'triangle', 0.12);
    tone(659, 0.12, 'triangle', 0.12, 0.1);
    tone(784, 0.22, 'triangle', 0.12, 0.2);
  },
  error() { tone(220, 0.16, 'sawtooth', 0.07, 0, 160); },
  burnt() { noise(0.3, 0.12, 0, 900); tone(140, 0.3, 'sawtooth', 0.06, 0, 90); },
  expire() { tone(392, 0.14, 'triangle', 0.09); tone(311, 0.22, 'triangle', 0.09, 0.12); },
  start() {
    tone(392, 0.12, 'triangle', 0.11);
    tone(523, 0.12, 'triangle', 0.11, 0.1);
    tone(659, 0.2, 'triangle', 0.11, 0.2);
  },
};
