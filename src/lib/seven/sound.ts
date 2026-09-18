const MUTE_KEY = "seven-nil-mute";
export const DICE_MS = 1100;

type Ctx = AudioContext;

let ctx: Ctx | null = null;
let master: GainNode | null = null;
let sfx: GainNode | null = null;
let noise: AudioBuffer | null = null;
let muted = false;
let unlocked = false;
const muteListeners = new Set<(v: boolean) => void>();
const diceListeners = new Set<(v: boolean) => void>();
let diceShowing = false;
let installed = false;
const live = new Set<AudioNode>();

function loadMute() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

muted = loadMute();

function ac(): Ctx | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor({ latencyHint: "interactive" });
  master = ctx.createGain();
  sfx = ctx.createGain();
  sfx.gain.value = 0.85;
  master.gain.value = muted ? 0 : 0.72;
  sfx.connect(master);
  master.connect(ctx.destination);
  const n = Math.floor(ctx.sampleRate * 0.25);
  noise = ctx.createBuffer(1, n, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

function bus() {
  return sfx;
}

function track(node: AudioNode, until: number) {
  live.add(node);
  window.setTimeout(() => {
    try {
      node.disconnect();
    } catch {
      // already gone
    }
    live.delete(node);
  }, Math.max(50, (until + 0.05) * 1000));
}

export function unlock() {
  const audio = ac();
  if (!audio) return;
  if (audio.state === "suspended") void audio.resume();
  unlocked = true;
}

export function installUnlock() {
  if (installed || typeof window === "undefined") return;
  installed = true;
  const go = () => unlock();
  window.addEventListener("pointerdown", go, { once: true });
  window.addEventListener("keydown", go, { once: true });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") unlock();
  });
}

export function isUnlocked() {
  return unlocked;
}

export function getMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  try {
    window.localStorage.setItem(MUTE_KEY, next ? "1" : "0");
  } catch {
    // ignore
  }
  const audio = ac();
  if (audio && master) {
    master.gain.setTargetAtTime(next ? 0 : 0.72, audio.currentTime, 0.02);
  }
  muteListeners.forEach((fn) => fn(next));
}

export function subscribeMute(fn: (v: boolean) => void) {
  muteListeners.add(fn);
  return () => {
    muteListeners.delete(fn);
  };
}

export function setDiceShowing(on: boolean) {
  diceShowing = on;
  diceListeners.forEach((fn) => fn(on));
}

export function subscribeDice(fn: (v: boolean) => void) {
  fn(diceShowing);
  diceListeners.add(fn);
  return () => {
    diceListeners.delete(fn);
  };
}

function silent() {
  return muted || typeof document !== "undefined" && document.hidden;
}

function clack(audio: Ctx, dest: GainNode, t: number, pitch: number, amp: number) {
  if (!noise) return;
  const src = audio.createBufferSource();
  src.buffer = noise;
  src.playbackRate.value = 2.2 + pitch * 1.4;
  const bp = audio.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 1600 + pitch * 1400;
  bp.Q.value = 3.4;
  const hp = audio.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = 400;
  const g = audio.createGain();
  g.gain.setValueAtTime(Math.max(0.0001, amp), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
  src.connect(hp);
  hp.connect(bp);
  bp.connect(g);
  g.connect(dest);
  src.start(t);
  src.stop(t + 0.05);
  track(g, 0.08);

  const osc = audio.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(240 + pitch * 110, t);
  osc.frequency.exponentialRampToValueAtTime(80, t + 0.07);
  const og = audio.createGain();
  og.gain.setValueAtTime(amp * 0.42, t);
  og.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
  osc.connect(og);
  og.connect(dest);
  osc.start(t);
  osc.stop(t + 0.09);
  track(og, 0.1);
}

function thud(audio: Ctx, dest: GainNode, t: number, amp: number) {
  const osc = audio.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(140, t);
  osc.frequency.exponentialRampToValueAtTime(48, t + 0.16);
  const g = audio.createGain();
  g.gain.setValueAtTime(amp, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
  osc.connect(g);
  g.connect(dest);
  osc.start(t);
  osc.stop(t + 0.2);
  track(g, 0.22);
}

export function playDiceRoll(kind: "full" | "short" = "full") {
  unlock();
  if (silent()) return;
  const audio = ac();
  const dest = bus();
  if (!audio || !dest) return;
  const now = audio.currentTime + 0.01;
  const hits = kind === "short" ? 3 : 16;
  let t = now;
  for (let i = 0; i < hits; i++) {
    const p = i / Math.max(1, hits - 1);
    const gap = kind === "short" ? 0.05 : 0.032 + p * 0.078;
    const amp = 0.16 + Math.random() * 0.08 + (i > hits - 3 ? 0.1 : 0);
    clack(audio, dest, t, 0.25 + Math.random() * 0.9, amp);
    t += gap;
  }
  thud(audio, dest, t + 0.02, kind === "short" ? 0.18 : 0.28);
  clack(audio, dest, t + 0.04, 0.55, 0.28);
}

function tone(audio: Ctx, dest: GainNode, freq: number, t: number, dur: number, amp: number) {
  const osc = audio.createOscillator();
  osc.type = "square";
  osc.frequency.value = freq;
  const lp = audio.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 2400;
  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(amp, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(lp);
  lp.connect(g);
  g.connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.02);
  track(g, dur + 0.04);
}

export function playTimerWarn(secondsLeft: number) {
  if (!unlocked) return;
  if (silent()) return;
  const audio = ac();
  const dest = bus();
  if (!audio || !dest) return;
  const now = audio.currentTime + 0.005;
  if (secondsLeft <= 1) {
    tone(audio, dest, 1318, now, 0.07, 0.16);
    tone(audio, dest, 1318, now + 0.11, 0.09, 0.18);
    return;
  }
  const freq = secondsLeft <= 3 ? 1174 : 880;
  const amp = secondsLeft <= 3 ? 0.16 : 0.11;
  tone(audio, dest, freq, now, 0.08, amp);
}

export function playTimerExpire() {
  if (!unlocked) return;
  if (silent()) return;
  const audio = ac();
  const dest = bus();
  if (!audio || !dest) return;
  const now = audio.currentTime + 0.005;
  tone(audio, dest, 523, now, 0.12, 0.14);
  tone(audio, dest, 349, now + 0.14, 0.22, 0.16);
}
