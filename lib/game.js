// Game "Susun Kata": huruf diacak, penonton menebak lewat chat
const COLORS = ['#ff2d95', '#ff8a1f', '#ffd93b', '#2ee66b', '#22d3ee', '#4aa8ff', '#b36bff', '#ff6b6b', '#8be28b', '#f5a3ff'];
const rnd = n => Math.floor(Math.random() * n);

// acak huruf, pastikan hasilnya beda dari kata aslinya
function scramble(word) {
  const a = [...word];
  if (new Set(a).size < 2) return a;
  let s;
  do {
    s = [...a];
    for (let i = s.length - 1; i > 0; i--) { const j = rnd(i + 1); [s[i], s[j]] = [s[j], s[i]]; }
  } while (s.join('') === word);
  return s;
}

class Game {
  // cfg: { limit(ms), total, hintPerTick, hintMax, points:{base,speed,penalty,min,gift,mult:{mudah,sedang,sulit}} }
  constructor(cfg = {}) {
    this.limit = cfg.limit || 40000;       // batas waktu per soal (ms)
    this.total = cfg.total || 10;          // jumlah soal per ronde
    this.hintPerTick = cfg.hintPerTick || 1; // huruf dibuka tiap hint
    this.hintMax = cfg.hintMax || 0;       // maksimal huruf terbuka (0 = setengah panjang kata)
    this.pts = { base: 10, speed: 10, penalty: 2, min: 5, gift: 0, mult: {}, ...(cfg.points || {}) };
    this.level = 'mudah';
    this.words = [];                       // [[KATA, petunjuk], ...]
    this.used = new Set();
    this.scores = new Map();
    this.round = 1;
    this.qNo = 0;
    this.q = null;
    this.colorIdx = 0;
  }

  setWords(list, level) { this.words = list; this.used = new Set(); if (level) this.level = level; }
  newRound() { this.round++; this.qNo = 0; }
  active() { return !!this.q && !this.q.solved && !this.q.over; }

  nextQuestion() {
    let fresh = this.words.filter(([w]) => !this.used.has(w));
    if (!fresh.length) { this.used.clear(); fresh = [...this.words]; }
    const [word, clue] = fresh[rnd(fresh.length)];
    this.used.add(word);
    this.qNo++;
    const now = Date.now();
    this.q = {
      word, clue, letters: scramble(word), revealed: new Set(), hints: 0,
      solved: null, over: false, startedAt: now, deadline: now + this.limit,
    };
    return this.q;
  }

  addScore(user, pts) {
    const s = this.scores.get(user.id) || { nick: user.nick, avatar: user.avatar, points: 0 };
    s.points += pts; s.nick = user.nick; s.avatar = user.avatar || s.avatar;
    this.scores.set(user.id, s);
  }

  // Sistem poin:
  //   mentah = base + bonus kecepatan (0..speed) - penalty x huruf hint terbuka, minimal min
  //   poin   = mentah x pengali tingkat kesulitan
  //   via gift: kalau points.gift > 0 dipakai sebagai poin mentah tetap
  points(via = 'chat') {
    const q = this.q, p = this.pts;
    let raw;
    if (via === 'gift' && p.gift > 0) raw = p.gift;
    else {
      const ratio = Math.max(0, q.deadline - Date.now()) / this.limit;
      raw = Math.max(p.min, p.base + Math.round(p.speed * ratio) - p.penalty * q.revealed.size);
    }
    const m = p.mult[this.level];
    return Math.max(1, Math.round(raw * (m > 0 ? m : 1)));
  }

  claim(user, via = 'chat') {
    const q = this.q;
    if (!this.active()) return null;
    const points = this.points(via);
    q.solved = { id: user.id, nick: user.nick, avatar: user.avatar || '', via, points, at: Date.now(), color: COLORS[this.colorIdx++ % COLORS.length] };
    this.addScore(user, points);
    return q.solved;
  }

  // return solved entry kalau tebakan benar, selain itu null
  guess(user, text) {
    if (!this.active()) return null;
    for (const tok of String(text).split(/\s+/)) {
      if (tok.toUpperCase().replace(/[^A-Z]/g, '') === this.q.word) return this.claim(user, 'chat');
    }
    return null;
  }

  // gift: jawab soal atas nama pemberi gift
  reveal(user) { return this.claim(user, 'gift'); }

  expire() { if (this.active()) this.q.over = true; }

  // batas huruf yang boleh terbuka: HINT_MAX, atau setengah panjang kata; selalu sisakan minimal 2 huruf tertutup
  hintCap(q) {
    const len = q.word.length;
    const max = this.hintMax > 0 ? this.hintMax : Math.floor(len / 2);
    return Math.max(0, Math.min(max, len - 2));
  }

  // hint otomatis: buka hintPerTick huruf (di posisinya) sampai batas
  hint() {
    if (!this.active()) return null;
    const q = this.q, cap = this.hintCap(q);
    let n = 0;
    for (let k = 0; k < this.hintPerTick && q.revealed.size < cap; k++) {
      const left = [...q.word].map((_, i) => i).filter(i => !q.revealed.has(i));
      if (!left.length) break;
      q.revealed.add(left[rnd(left.length)]); n++;
    }
    if (!n) return null;
    q.hints++;
    return { hints: q.hints, opened: q.revealed.size };
  }

  top(n = 10) {
    return [...this.scores.entries()].map(([id, v]) => ({ id, ...v })).sort((a, b) => b.points - a.points).slice(0, n);
  }

  state() {
    const q = this.q;
    if (!q) return { idle: true, round: this.round, qNo: 0, total: this.total, top: this.top(5) };
    const ended = !!(q.solved || q.over);
    return {
      round: this.round, qNo: this.qNo, total: this.total,
      clue: q.clue, length: q.word.length, letters: q.letters,
      pattern: [...q.word].map((ch, i) => (ended || q.revealed.has(i) ? ch : '')),
      limit: this.limit, left: Math.max(0, q.deadline - Date.now()),
      over: q.over, hints: q.hints, opened: q.revealed.size, answer: ended ? q.word : null,
      solved: q.solved ? { nick: q.solved.nick, avatar: q.solved.avatar, via: q.solved.via, points: q.solved.points, color: q.solved.color } : null,
      top: this.top(5),
    };
  }
}

module.exports = { Game };
