// Vercel Serverless Function (Node.js) — Futbol Dijital İkiz analiz motoru.
// API_KEY ortam değişkeninden okunur (koda yazılmaz). Hiç dış paket kullanmaz.
// Uç nokta:  GET /api/analyze?oyuncu=...&hedef=...

const API_KEY = process.env.API_KEY || "";
const BASE = "https://v3.football.api-sports.io";

async function apiGet(path, params) {
  const qs = new URLSearchParams(params).toString();
  try {
    const r = await fetch(`${BASE}/${path}?${qs}`, { headers: { "x-apisports-key": API_KEY } });
    if (!r.ok) return [];
    const j = await r.json();
    return j.response ?? [];
  } catch (e) {
    return [];
  }
}

function sade(t) { const re = new RegExp("[" + String.fromCharCode(768) + "-" + String.fromCharCode(879) + "]", "g"); return (t || "").normalize("NFKD").replace(re, ""); }

function ratio(a, b) {                              // Levenshtein tabanlı benzerlik (0-1)
  a = sade(a).toLowerCase(); b = sade(b).toLowerCase();
  const m = a.length, n = b.length;
  if (!m && !n) return 1; if (!m || !n) return 0;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - dp[m][n] / Math.max(m, n);
}
function benzerlik(aday, isim) {
  const p = aday.player;
  const adlar = [p.name || "", p.lastname || "", p.firstname || ""].filter(Boolean);
  return Math.max(0, ...adlar.map(x => ratio(isim, x)));
}
function ga90(s) {
  const dk = s.games.minutes || 0;
  return dk > 0 ? ((s.goals.total || 0) + (s.goals.assists || 0)) * 90 / dk : 0;
}

// ---------- seed'li rastgele (aynı oyuncu+takım => aynı sonuç) ----------
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function gauss(rng, mean, sd) {
  let u = 0, v = 0; while (u === 0) u = rng(); while (v === 0) v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function poisson(rng, lam) {
  if (lam <= 0) return 0;
  const L = Math.exp(-Math.min(lam, 30)); let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}

// ---------- oyuncu bulma (az istekli) ----------
async function oyuncuBul(isim) {
  let kokler = [];
  if (isim.includes(" ")) { const son = isim.trim().split(/\s+/).pop(); kokler.push(son, sade(son)); }
  kokler.push(isim, sade(isim));
  kokler = [...new Set(kokler)].filter(k => k.length >= 3);
  let havuz = {};
  for (const kok of kokler) {
    let sorgular = [];
    if (kok.includes(" ")) sorgular = [kok];
    else for (let n = kok.length; n > 3; n--) sorgular.push(kok.slice(0, n));
    for (const q of sorgular.slice(0, 2)) {
      const res = await apiGet("players/profiles", { search: q });
      if (res.length) { for (const a of res) havuz[a.player.id] = a; break; }
    }
    if (Object.keys(havuz).length) break;
  }
  const adaylar = Object.values(havuz).sort((a, b) => benzerlik(b, isim) - benzerlik(a, isim));
  for (const aday of adaylar.slice(0, 1)) {
    const cid = aday.player.id;
    const cs = (await apiGet("players/seasons", { player: cid })).sort((a, b) => b - a);
    for (const sez of cs.slice(0, 2)) {
      const res = await apiGet("players", { id: cid, season: sez });
      if (res.length && res[0].statistics && res[0].statistics.length) return { cid, hit: res[0], sez, seasons: cs };
    }
  }
  return null;
}

const NON_INJURY = new Set(["Red Card", "Yellow Cards", "Yellow Card", "National selection",
  "International duty", "Rest", "Inactive", "Suspended", "Coach's decision", "Personal reasons", "Other"]);

async function analyze(oyuncuAdi, hedefAdi) {
  const bul = await oyuncuBul(oyuncuAdi);
  if (!bul) throw new Error(`'${oyuncuAdi}' bulunamadı. Soyadıyla ve doğruya yakın yaz.`);
  const { hit, sez, seasons, cid: pid } = bul;
  let stats = hit.statistics.filter(s => (s.games.appearences || 0) > 0);
  if (!stats.length) stats = hit.statistics;
  const main = stats.reduce((a, b) => ((b.games.appearences || 0) > (a.games.appearences || 0) ? b : a));
  const oyuncu = {
    isim: hit.player.name, yas: hit.player.age, foto: hit.player.photo, uyruk: hit.player.nationality,
    pozisyon: main.games.position, gol: main.goals.total || 0, asist: main.goals.assists || 0,
    ort_rating: main.games.rating ? parseFloat(main.games.rating) : 7.0,
    ga90: Math.round(ga90(main) * 1000) / 1000, lig: main.league.name, takim: main.team.name, sezon: sez
  };
  let sakatliklar = [];
  for (const yil of seasons.slice(0, 2)) {
    const inj = await apiGet("injuries", { player: pid, season: yil });
    for (const rec of inj) sakatliklar.push({ tarih: rec.fixture.date.slice(0, 10), tip: rec.player.type, neden: rec.player.reason });
  }
  const toplamMac = 38 * Math.max(seasons.slice(0, 2).length, 1);

  let tt = await apiGet("teams", { search: hedefAdi });
  if (!tt.length) tt = await apiGet("teams", { search: sade(hedefAdi) });
  if (!tt.length) throw new Error(`'${hedefAdi}' takımı bulunamadı.`);
  const htid = tt[0].team.id, ulke = tt[0].team.country || "", logo = tt[0].team.logo;
  const ligler = await apiGet("leagues", { team: htid });
  let ls = [];
  for (const l of ligler) if (l.league.type === "League") for (const s of l.seasons) ls.push([s.year, l.league.id, l.league.name]);
  if (!ls.length) for (const l of ligler) for (const s of l.seasons) ls.push([s.year, l.league.id, l.league.name]);
  ls.sort((a, b) => b[0] - a[0]);
  let ts = null, hlig = null, hsez = null;
  for (const [yil, lid, lad] of ls.slice(0, 3)) {
    const r = await apiGet("teams/statistics", { team: htid, league: lid, season: yil });
    if (r && !Array.isArray(r) && ((r.fixtures && r.fixtures.played && r.fixtures.played.total) || 0) > 0) { ts = r; hlig = lad; hsez = yil; break; }
  }
  if (!ts) throw new Error("Hedef takımın istatistik verisi bulunamadı.");
  const mac = ts.fixtures.played.total, atilan = (ts.goals.for.total.total) || 0;
  const hedef = {
    takim: ts.team.name, logo, ulke, lig: hlig, sezon: hsez, atilan_gol: atilan,
    gol_basina_mac: Math.round(atilan / Math.max(mac, 1) * 100) / 100,
    dizilis: (ts.lineups && ts.lineups[0]) ? ts.lineups[0].formation : "—"
  };
  return runModel(oyuncu, sakatliklar, toplamMac, hedef);
}

function runModel(oyuncu, sakatliklar, toplamMac, hedef, N = 5000, macSayisi = 38) {
  const inj = sakatliklar.filter(r => r.tip === "Missing Fixture" && !NON_INJURY.has(r.neden));
  const gunler = inj.map(r => new Date(r.tarih)).sort((a, b) => a - b);
  let kacan = gunler.length, episode = 0, prev = null;
  for (const d of gunler) { if (prev === null || (d - prev) / 86400000 > 30) episode++; prev = d; }
  episode = Math.max(episode, 1);
  const S = (parseFloat(oyuncu.ort_rating) || 7.0) / 10;
  const g90 = oyuncu.ga90 || 0.3;
  const sf = 0.060, sm = 0.045;
  const p = episode / Math.max(toplamMac, 1), lam = episode ? kacan / episode : 0;
  const kal = S, ver = Math.min(g90 / 1.0, 1.0), stil = Math.min(hedef.gol_basina_mac / 2.6, 1.0);
  const UYUM = 0.50 * kal + 0.25 * ver + 0.25 * stil;
  const rng = mulberry32(hashStr((oyuncu.isim + "|" + hedef.takim).toLowerCase()) || 42);
  let Pl = [], Kl = [], G = [];
  for (let i = 0; i < N; i++) {
    let sk = [], kc = 0, rem = 0, gas = 0;
    for (let m = 0; m < macSayisi; m++) {
      if (rem > 0) { rem--; kc++; continue; }
      if (rng() < p) { rem = Math.max(1, poisson(rng, lam)) - 1; kc++; continue; }
      let s = S + gauss(rng, 0, sf) + gauss(rng, 0, sm); s = Math.min(1, Math.max(0, s)); sk.push(s);
      gas += poisson(rng, S > 0 ? g90 * (s / S) : 0);
    }
    Pl.push(sk.length ? sk.reduce((a, b) => a + b, 0) / sk.length : 0); Kl.push(kc); G.push(gas);
  }
  G.sort((a, b) => a - b);
  const pctl = (a, q) => a[Math.min(a.length - 1, Math.max(0, Math.floor(q * a.length)))];
  const ga_med = pctl(G, 0.5), ga_lo = pctl(G, 0.10), ga_hi = pctl(G, 0.90);
  const p20 = G.filter(x => x >= 20).length / G.length;
  const p30 = G.filter(x => x >= 30).length / G.length;
  const saglam = Kl.filter(k => (macSayisi - k) >= 32).length / Kl.length;
  const kacan_ort = Kl.reduce((a, b) => a + b, 0) / Kl.length;
  const perf = [...Pl].sort((a, b) => a - b)[Math.floor(Pl.length / 2)];
  let lo = G[0], hi = G[G.length - 1]; if (hi === lo) hi = lo + 1;
  const nb = 24, w = (hi - lo) / nb;
  const labels = [], counts = new Array(nb).fill(0);
  for (let i = 0; i < nb; i++) labels.push(Math.round(lo + w * (i + 0.5)));
  for (const x of G) { let idx = Math.floor((x - lo) / w); idx = idx >= nb ? nb - 1 : (idx < 0 ? 0 : idx); counts[idx]++; }
  return {
    oyuncu, hedef, uyum: UYUM, bilesen: { kalite: kal, verim: ver, stil: stil },
    sim: { ga_med, ga_lo, ga_hi, kacan_ort, p20, p30, saglam, perf, hist: { labels, counts } },
    param: { S, sigma: [sf, sm], p, lam, episode, kacan, toplam_mac: toplamMac }
  };
}

module.exports = async (req, res) => {
  const oyuncu = ((req.query && req.query.oyuncu) || "").toString().trim();
  const hedef = ((req.query && req.query.hedef) || "").toString().trim();
  try {
    if (!API_KEY) throw new Error("Sunucuda API_KEY tanımlı değil (Vercel → Settings → Environment Variables).");
    if (!oyuncu || !hedef) throw new Error("Oyuncu ve hedef takım gerekli.");
    const out = await analyze(oyuncu, hedef);
    res.status(200).json({ ok: true, ...out });
  } catch (e) {
    res.status(200).json({ ok: false, error: e.message });
  }
};
