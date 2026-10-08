require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const { TikTokLiveConnection, WebcastEvent } = require('tiktok-live-connector');
const { Game } = require('./lib/game');
const { loadWords, LEVELS, DEFAULT_LEVEL } = require('./lib/words');

// num = angka minimal `min` (0 / kosong -> pakai default); numz = angka apa saja termasuk 0
const num = (k, d, min) => Math.max(min, +process.env[k] || d);
const numz = (k, d) => { const v = process.env[k]; return v === undefined || v === '' || isNaN(+v) ? d : +v; };

const PORT = process.env.PORT || 3000;
const DEBUG = !!process.env.DEBUG_TIKTOK;
const TIME_S = num('TIME_SECONDS', 40, 10);            // batas waktu per soal
const HINT_S = num('HINT_SECONDS', 12, 5);             // tiap N detik, hint muncul
const NEXT_S = num('NEXT_DELAY_S', 5, 2);              // jeda ke soal berikutnya
const ROUND_S = num('ROUND_DELAY_S', 10, 3);           // jeda podium antar ronde
const TOTAL = num('QUESTIONS_PER_ROUND', 10, 1);       // soal per ronde
const END_SECONDS = num('END_SECONDS', 10, 1);         // countdown End Live
const GIFT_SOLVE = process.env.GIFT_SOLVE !== '0';     // gift otomatis menjawab soal
const GIFT_RATE = numz('GIFT_POINT_RATE', 1);          // poin gift = diamond x GIFT_RATE
const AUTO_EVERY = num('AUTO_EVERY', 5, 1);            // Mode otomatis: ganti tingkat tiap N ronde
const SPIN_S = num('SPIN_SECONDS', 6, 3);              // lama animasi spin
const ANSWERS_KEY = process.env.ANSWERS_KEY || '';

const CFG = {
  limit: TIME_S * 1000,
  total: TOTAL,
  hintPerTick: Math.max(1, Math.round(numz('HINT_LETTERS', 1))),
  hintMax: Math.max(0, Math.round(numz('HINT_MAX', 0))),
  points: {
    base: numz('POINTS_BASE', 10),
    speed: numz('POINTS_SPEED', 10),
    penalty: numz('POINTS_HINT_PENALTY', 2),
    min: numz('POINTS_MIN', 5),
    gift: numz('POINTS_GIFT', 0),
    mult: {
      mudah: numz('POINTS_MULT_MUDAH', 1),
      sedang: numz('POINTS_MULT_SEDANG', 1.5),
      sulit: numz('POINTS_MULT_SULIT', 2),
    },
  },
};

const app = express();
app.use(cors(), express.json(), express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });
const game = new Game(CFG);
let level = DEFAULT_LEVEL, conn = null, wantUser = '', retry;
let status = { state: 'idle', username: '', viewers: 0, likes: 0 };

// End Live / Skor Akhir: frozen = game berhenti & skor dibekukan
let frozen = false, endTimer = null, podium = null;
let qTimer = null, hintTimer = null, nextTimer = null, spinTimer = null;

// Mode otomatis: tiap AUTO_EVERY ronde selesai -> spin acak untuk ganti tingkat kesulitan
let autoMode = false, autoRounds = 0, spinning = false;

const send = (ws, type, data) => ws.readyState === 1 && ws.send(JSON.stringify({ type, data }));
const broadcast = (type, data) => wss.clients.forEach(ws => send(ws, type, data));
const setStatus = p => { Object.assign(status, p); broadcast('status', status); };
// Halaman jawaban (/answers.html): hanya dikirim ke koneksi yang berhak (ANSWERS_KEY)
const history = []; // soal-soal sebelumnya (terbaru di depan), maksimal 10
let curMeta = null; // { round, qNo } soal yang sedang berjalan
const answerData = () => {
  const q = game.q;
  return {
    round: game.round, qNo: game.qNo, total: TOTAL, level,
    word: q?.word || '', clue: q?.clue || '', opened: q?.revealed.size || 0,
    status: !q ? 'idle' : q.solved ? 'solved' : q.over ? 'over' : 'open',
    by: q?.solved?.nick || '', via: q?.solved?.via || '', points: q?.solved?.points || 0,
    history,
  };
};
const sendState = () => {
  broadcast('state', game.state());
  const a = answerData();
  wss.clients.forEach(ws => ws.canSeeAnswers && send(ws, 'answer', a));
};
const autoInfo = () => ({ on: autoMode, every: AUTO_EVERY, count: autoRounds });
const broadcastAuto = () => broadcast('auto', autoInfo());

wss.on('connection', (ws, req) => {
  let key = ''; try { key = new URL(req.url, 'http://x').searchParams.get('key') || ''; } catch {}
  ws.canSeeAnswers = !ANSWERS_KEY || key === ANSWERS_KEY;
  if (ws.canSeeAnswers) send(ws, 'answer', answerData());
  send(ws, 'level', level); send(ws, 'auto', autoInfo()); send(ws, 'state', game.state()); send(ws, 'status', status);
  if (podium) send(ws, 'podium', podium); // widget OBS yang di-refresh tetap menampilkan podium
});

// ---------- alur soal ----------
function clearQ() {
  clearTimeout(qTimer); clearInterval(hintTimer); clearTimeout(nextTimer); clearTimeout(spinTimer);
  qTimer = hintTimer = nextTimer = spinTimer = null; spinning = false;
}

function startQuestion() {
  clearQ();
  if (frozen) return;
  if (game.q && curMeta) { // simpan soal sebelumnya ke riwayat
    history.unshift({ ...curMeta, word: game.q.word, clue: game.q.clue, by: game.q.solved?.nick || '', via: game.q.solved?.via || '', over: game.q.over });
    if (history.length > 10) history.pop();
  }
  game.nextQuestion(); curMeta = { round: game.round, qNo: game.qNo }; sendState();
  hintTimer = setInterval(() => {
    if (frozen) return;
    const h = game.hint();
    if (h) { sendState(); broadcast('hint', h); }
  }, HINT_S * 1000);
  qTimer = setTimeout(onTimeout, TIME_S * 1000);
}

// Mode otomatis: spin acak (hasil selalu beda dari tingkat sekarang), tampil di layar, lalu ganti tingkat + ronde baru
function startSpin() {
  if (spinning) return;
  const others = Object.keys(LEVELS).filter(l => l !== level);
  const result = others[Math.floor(Math.random() * others.length)];
  spinning = true; autoRounds = 0; broadcastAuto();
  broadcast('spin', { result, seconds: SPIN_S, from: level });
  spinTimer = setTimeout(async () => {
    spinTimer = null;
    if (frozen) { spinning = false; return; }
    level = result;
    game.setWords(await loadWords(result), result);
    spinning = false;
    broadcast('level', level);
    game.newRound(); startQuestion();
  }, SPIN_S * 1000);
}

// soal selesai (benar / habis waktu): jadwalkan soal berikutnya atau podium ronde
function afterQuestion() {
  clearTimeout(qTimer); clearInterval(hintTimer);
  if (game.qNo >= TOTAL) {
    let willSpin = false;
    if (autoMode) { autoRounds++; willSpin = autoRounds >= AUTO_EVERY; broadcastAuto(); }
    broadcast('roundend', { seconds: ROUND_S, round: game.round, players: topPlayers(10), spin: willSpin });
    nextTimer = setTimeout(() => {
      if (frozen) return;
      if (autoMode && autoRounds >= AUTO_EVERY) return startSpin();
      game.newRound(); startQuestion();
    }, ROUND_S * 1000);
  } else {
    broadcast('next', { seconds: NEXT_S });
    nextTimer = setTimeout(() => { if (!frozen) startQuestion(); }, NEXT_S * 1000);
  }
}

function onTimeout() {
  if (frozen || !game.active()) return;
  game.expire(); sendState();
  broadcast('timeout', { answer: game.q.word });
  afterQuestion();
}

function onSolved(entry) {
  sendState();
  broadcast('solved', { user: entry, answer: game.q.word });
  afterQuestion();
}

// ---------- chat / gift ----------
function handleChat(user, text) {
  remember(user);
  broadcast('chat', { user, text }); // dipakai TTS (dashboard / tts.html)
  if (frozen) return;
  const entry = game.guess(user, text);
  if (entry) onSolved(entry);
}

function handleGift(user, giftName, diamonds, count) {
  remember(user);
  broadcast('gift', { user, gift: giftName, count });
  if (frozen) return; // dibekukan: tidak menambah poin
  const pts = Math.round(diamonds * count * GIFT_RATE);
  if (pts > 0) game.addScore(user, pts);
  if (GIFT_SOLVE && game.active()) {
    const entry = game.reveal(user);
    if (entry) return onSolved(entry);
  }
  sendState();
}

// ---------- data user ----------
const avatars = new Map();
const getUser = d => {
  const u = d.user || d;
  return {
    id: String(u.userId || u.uniqueId || u.displayId || u.nickname),
    nick: u.nickname || u.uniqueId || u.displayId || 'anon',
    avatar: u.avatarThumb?.urlList?.[0] || u.profilePicture?.urls?.[0] || u.profilePicture?.url?.[0] || u.profilePictureUrl || '',
  };
};
const remember = u => { if (u?.avatar) { avatars.set(String(u.id), u.avatar); avatars.set(String(u.nick), u.avatar); } };
function topPlayers(n = 10) {
  return game.top(n).map(p => ({ ...p, avatar: p.avatar || avatars.get(p.id) || avatars.get(p.nick) || '' }));
}

// ---------- End Live / Skor Akhir ----------
function startEnd(sec) {
  clearTimeout(endTimer); clearQ(); podium = null; frozen = true;
  broadcast('endlive', { seconds: sec });
  endTimer = setTimeout(() => { endTimer = null; podium = { players: topPlayers(10) }; broadcast('podium', podium); }, sec * 1000);
}
function resume() { // keluar dari mode beku / batalkan spin, mulai ronde baru
  clearTimeout(endTimer); endTimer = null; frozen = false; podium = null; autoRounds = 0;
  broadcast('endlive_cancel', {}); broadcastAuto();
  game.newRound(); startQuestion();
}

// ---------- koneksi TikTok ----------
function disconnect() { clearTimeout(retry); wantUser = ''; try { conn?.disconnect(); } catch {} conn = null; setStatus({ state: 'idle' }); }

async function connect(username) {
  username = String(username || '').replace(/^@/, '').trim();
  if (!username) return;
  try { conn?.removeAllListeners(); conn?.disconnect(); } catch {}
  clearTimeout(retry); wantUser = username;
  setStatus({ state: 'connecting', username, error: '' });

  conn = new TikTokLiveConnection(username, {
    processInitialData: false,
    signApiKey: process.env.SIGN_API_KEY || undefined,
    sessionId: process.env.SESSION_ID || undefined,
  });

  conn.on(WebcastEvent.CHAT, d => {
    if (DEBUG) console.log('[DEBUG chat]', JSON.stringify(d));
    handleChat(getUser(d), d.comment ?? d.content ?? '');
  });
  conn.on(WebcastEvent.GIFT, d => {
    if (DEBUG) console.log('[DEBUG gift]', JSON.stringify(d));
    const type = d.giftType ?? d.giftDetails?.giftType;
    if (type === 1 && !d.repeatEnd) return; // gift beruntun: tunggu streak selesai
    handleGift(getUser(d), d.giftName || d.giftDetails?.giftName || 'gift',
      d.diamondCount ?? d.giftDetails?.diamondCount ?? 1, d.repeatCount || 1);
  });
  conn.on(WebcastEvent.LIKE, d => setStatus({ likes: d.totalLikeCount ?? (status.likes + (d.likeCount || 1)) }));
  conn.on(WebcastEvent.ROOM_USER, d => setStatus({ viewers: d.viewerCount ?? 0 }));
  conn.on(WebcastEvent.STREAM_END, () => setStatus({ state: 'ended' }));
  conn.on('disconnected', () => { if (wantUser) { setStatus({ state: 'reconnecting' }); retry = setTimeout(() => connect(wantUser), 5000); } });
  conn.on('error', e => console.error('[tiktok]', e?.info || e?.message || e));

  try {
    const st = await conn.connect();
    console.log('[connected] roomId:', st?.roomId);
    setStatus({ state: 'connected' });
  } catch (e) {
    console.error('[connect]', e?.message || e);
    setStatus({ state: 'error', error: String(e?.message || e) });
    wantUser = '';
  }
}

// ---------- Text-to-speech: proxy ke Google Translate TTS (mp3), dengan cache kecil ----------
const ttsCache = new Map();
app.get('/api/tts', async (req, res) => {
  const text = String(req.query.text || '').replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ' ').replace(/https?:\/\/\S+/g, 'tautan').replace(/\s+/g, ' ').trim().slice(0, 180);
  if (!text) return res.status(400).end();
  try {
    let buf = ttsCache.get(text);
    if (!buf) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${process.env.TTS_LANG || 'id'}&q=${encodeURIComponent(text)}`;
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://translate.google.com/' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      buf = Buffer.from(await r.arrayBuffer());
      ttsCache.set(text, buf);
      if (ttsCache.size > 200) ttsCache.delete(ttsCache.keys().next().value);
    }
    res.set({ 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=3600' }).send(buf);
  } catch (e) { console.error('[tts]', e.message); res.status(502).end(); }
});

// ---------- API dashboard ----------
app.post('/api/connect', (req, res) => { connect(req.body.username); res.json({ ok: true }); });
app.post('/api/disconnect', (_, res) => { disconnect(); res.json({ ok: true }); });

app.post('/api/difficulty', async (req, res) => {
  const l = req.body.level; if (!LEVELS[l]) return res.status(400).json({ ok: false });
  level = l; game.setWords(await loadWords(l), l);
  broadcast('level', level); resume(); res.json({ ok: true, level });
});
app.get('/api/difficulty', (_, res) => res.json({ level }));

// Mode otomatis: aktif/mati. Penghitung ronde mulai dari 0 setiap kali diubah.
app.post('/api/auto', (req, res) => {
  autoMode = !!req.body?.on; autoRounds = 0; broadcastAuto();
  res.json({ ok: true, ...autoInfo() });
});
app.get('/api/auto', (_, res) => res.json(autoInfo()));

app.post('/api/new-round', (_, res) => { resume(); res.json({ ok: true }); });
app.post('/api/skip', (_, res) => { // lewati soal sekarang (jawaban ditampilkan)
  if (!frozen && game.active()) onTimeout();
  res.json({ ok: true });
});
app.post('/api/reset-scores', (_, res) => { game.scores.clear(); sendState(); res.json({ ok: true }); });

// End Live: countdown N detik, lalu podium top 10
app.post('/api/end-live', (req, res) => {
  const sec = Math.min(60, Math.max(1, Math.round(+req.body?.seconds || END_SECONDS)));
  startEnd(sec); res.json({ ok: true, seconds: sec });
});
app.post('/api/end-live/cancel', (_, res) => { resume(); res.json({ ok: true }); });

// Skor Akhir: podium langsung tanpa countdown, game dibekukan
app.post('/api/final-score', (_, res) => {
  clearTimeout(endTimer); endTimer = null; clearQ(); frozen = true;
  podium = { players: topPlayers(10), kind: 'score' };
  broadcast('podium', podium); res.json({ ok: true });
});

// Simulasi untuk testing tanpa live
app.post('/api/sim', (req, res) => {
  const { nick = 'tester', text = '' } = req.body;
  handleChat({ id: nick, nick, avatar: '' }, text); res.json({ ok: true });
});
app.post('/api/sim-gift', (req, res) => {
  const { nick = 'tester', gift = 'Rose', diamonds = 1, count = 1 } = req.body;
  handleGift({ id: nick, nick, avatar: '' }, gift, +diamonds, +count); res.json({ ok: true });
});

// Versi JSON dari halaman /answers.html (pakai ?key=ANSWERS_KEY kalau diisi)
app.get('/api/answer', (req, res) => {
  if (ANSWERS_KEY && req.query.key !== ANSWERS_KEY) return res.status(403).json({ ok: false });
  res.json({ answer: game.q?.word || null, clue: game.q?.clue || null });
});

(async () => {
  game.setWords(await loadWords(level), level);
  startQuestion();
  server.listen(PORT, () => {
    console.log(`Dashboard   : http://localhost:${PORT}\nGame (OBS)  : http://localhost:${PORT}/?overlay=1\nSuara (OBS) : http://localhost:${PORT}/tts.html\nJawaban     : http://localhost:${PORT}/answers.html${ANSWERS_KEY ? '?key=' + ANSWERS_KEY : ''}`);
    if (process.env.TIKTOK_USERNAME) connect(process.env.TIKTOK_USERNAME);
  });
})();
