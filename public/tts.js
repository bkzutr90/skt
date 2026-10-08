// Text-to-speech: membacakan komentar lewat /api/tts (mp3), antrean maksimal 5
const TTS = (() => {
  let on = false, nick = false, vol = 1, busy = false;
  const q = [];
  function next() {
    if (busy || !on || !q.length) return;
    busy = true;
    const a = new Audio('/api/tts?text=' + encodeURIComponent(q.shift()));
    a.volume = vol;
    const done = () => { busy = false; next(); };
    a.onended = done; a.onerror = done;
    a.play().catch(done);
  }
  return {
    enable(v) { on = !!v; if (!on) q.length = 0; else next(); },
    readNick(v) { nick = !!v; },
    setVolume(v) { vol = Math.max(0, Math.min(1, v)); },
    say(name, text) {
      if (!on) return;
      text = String(text || '').trim();
      if (!text) return;
      if (q.length >= 5) q.shift(); // antrean penuh: buang yang paling lama
      q.push(nick ? `${name} bilang ${text}` : text);
      next();
    },
  };
})();
