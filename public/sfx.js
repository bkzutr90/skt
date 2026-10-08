// Efek suara sederhana (WebAudio), tanpa file audio
const SFX = (() => {
  let ctx, on = true, vol = 0.7;
  const unlock = () => {
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch {}
  };
  function beep(f, d = 0.12, type = 'sine', t0 = 0, g = 0.25) {
    if (!on || !ctx) return;
    const o = ctx.createOscillator(), a = ctx.createGain(), t = ctx.currentTime + t0;
    o.type = type; o.frequency.value = f;
    a.gain.setValueAtTime(0, t);
    a.gain.linearRampToValueAtTime(g * vol, t + 0.01);
    a.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(a); a.connect(ctx.destination);
    o.start(t); o.stop(t + d + 0.02);
  }
  return {
    unlock,
    enable: v => { on = !!v; if (on) unlock(); },
    setVolume: v => { vol = Math.max(0, Math.min(1, v)); },
    tick: () => beep(880, 0.05, 'square', 0, 0.1),
    hint: () => beep(700, 0.12, 'sine'),
    correct: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.18, 'triangle', i * 0.09)),
    gift: () => [660, 880, 1320].forEach((f, i) => beep(f, 0.16, 'triangle', i * 0.08)),
    timeout: () => [300, 220].forEach((f, i) => beep(f, 0.25, 'sawtooth', i * 0.18, 0.15)),
    done: () => [784, 988, 1175, 1568].forEach((f, i) => beep(f, 0.25, 'triangle', i * 0.12)),
  };
})();
