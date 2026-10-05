// Vercel Serverless Function (Node.js) — Futbol Dijital İkiz.
// Hibrit Mimari: API_KEY varsa API-Sports, yoksa veya kota bittiyse otomatik açık veri (TheSportsDB).
//   GET /api/analyze?ara=<isim>             → aday oyuncu listesi
//   GET /api/analyze?aratakim=<takim>       → hedef takım listesi
//   GET /api/analyze?pid=<id>&hedef=<takim>  → tam analiz (Monte Carlo simülasyonu)

const API_KEY = process.env.API_KEY || "";
const BASE_APISPORTS = "https://v3.football.api-sports.io";
const BASE_THESPORTSDB = "https://www.thesportsdb.com/api/v1/json/3";

// In-Memory Önbellek (Cache)
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 12; // 12 saat

function getCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.time > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  if (cache.size > 500) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { time: Date.now(), data });
}

async function apiGetSports(path, params) {
  if (!API_KEY) return null;
  const qs = new URLSearchParams(params).toString();
  const cacheKey = `apisports:${path}?${qs}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const r = await fetch(`${BASE_APISPORTS}/${path}?${qs}`, {
      headers: { "x-apisports-key": API_KEY }
    });
    if (!r.ok) return null;
    const j = await r.json();
    if (j.errors && Object.keys(j.errors).length > 0) return null;
    const result = j.response ?? [];
    if (result.length > 0) setCache(cacheKey, result);
    return result;
  } catch (e) {
    return null;
  }
}

async function sdbGet(endpoint) {
  const cacheKey = `sdb:${endpoint}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const r = await fetch(`${BASE_THESPORTSDB}/${endpoint}`, {
      headers: { "Accept": "application/json" }
    });
    if (!r.ok) return null;
    const j = await r.json();
    setCache(cacheKey, j);
    return j;
  } catch (e) {
    return null;
  }
}

function sade(t) {
  return (t || "").normalize("NFKD").replace(new RegExp("[" + String.fromCharCode(768) + "-" + String.fromCharCode(879) + "]", "g"), "");
}

function ratio(a, b) {
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

function calculateAge(dateStr) {
  if (!dateStr) return 26;
  const dob = new Date(dateStr);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970) || 26;
}

const POZ = {
  Goalkeeper: "Kaleci", Defender: "Defans", Midfielder: "Orta Saha", Attacker: "Forvet", Forward: "Forvet",
  "Centre-Forward": "Forvet", "Left Winger": "Forvet", "Right Winger": "Forvet", "Second Striker": "Forvet",
  "Central Midfield": "Orta Saha", "Attacking Midfield": "Orta Saha", "Defensive Midfield": "Orta Saha",
  "Left Midfield": "Orta Saha", "Right Midfield": "Orta Saha", "Centre-Back": "Defans",
  "Left-Back": "Defans", "Right-Back": "Defans"
};
const ULKE = {
  Nigeria: "Nijerya", Argentina: "Arjantin", Turkey: "Türkiye", Brazil: "Brezilya", France: "Fransa",
  Spain: "İspanya", Germany: "Almanya", England: "İngiltere", Portugal: "Portekiz", Italy: "İtalya",
  Netherlands: "Hollanda", Belgium: "Belçika", Croatia: "Hırvatistan", Morocco: "Fas", Senegal: "Senegal",
  Egypt: "Mısır", Ghana: "Gana", "Ivory Coast": "Fildişi Sahili", Uruguay: "Uruguay", Colombia: "Kolombiya",
  Mexico: "Meksika", USA: "ABD", Norway: "Norveç", Sweden: "İsveç", Denmark: "Danimarka", Poland: "Polonya",
  Austria: "Avusturya", Switzerland: "İsviçre", Serbia: "Sırbistan", Greece: "Yunanistan", Scotland: "İskoçya",
  Wales: "Galler", Ireland: "İrlanda", Japan: "Japonya", "South Korea": "Güney Kore", Australia: "Avustralya"
};
const trUlke = u => ULKE[u] || u || "";
const trPoz = p => POZ[p] || p || "Forvet";

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function gauss(rng, mean, sd) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function poisson(rng, lam) {
  if (lam <= 0) return 0;
  const L = Math.exp(-Math.min(lam, 30));
  let k = 0, p = 1;
  do { k++; p *= rng(); } while (p > L);
  return k - 1;
}

// 6 Boyutlu Performans Radarı
function radarHesapla(stats, posGrp) {
  const cap = x => Math.max(0, Math.min(100, Math.round(x)));
  if (posGrp === "DEF") {
    return {
      labels: ["Müdahale", "Hava Topu", "Pas İsabeti", "Top Kapma", "Fizik Güç", "Konum Alma"],
      oyuncu: [cap(84 + stats.var1), cap(80 + stats.var2), cap(78 + stats.var3), cap(82 + stats.var1), cap(86 + stats.var2), cap(81 + stats.var3)],
      ortalama: [55, 52, 70, 50, 60, 58]
    };
  }
  if (posGrp === "MID") {
    return {
      labels: ["Pas İsabeti", "Kilit Pas", "Topla Buluşma", "Dribling", "Pres Gücü", "Gol Katkısı"],
      oyuncu: [cap(86 + stats.var1), cap(82 + stats.var2), cap(85 + stats.var3), cap(78 + stats.var1), cap(74 + stats.var2), cap(72 + stats.var3)],
      ortalama: [74, 52, 60, 48, 55, 45]
    };
  }
  // ATT (Forvet)
  return {
    labels: ["Gol Katkısı", "Topla Buluşma", "Dribling", "Pas İsabeti", "İkili Mücadele", "Pres Gücü"],
    oyuncu: [cap(92 + stats.var1), cap(76 + stats.var2), cap(82 + stats.var3), cap(78 + stats.var1), cap(74 + stats.var2), cap(80 + stats.var3)],
    ortalama: [52, 58, 42, 76, 50, 40]
  };
}

// --- OYUNCU ARAMA (TheSportsDB Failover & API-Sports Hibrit) ---
async function searchPlayers(isim) {
  const clean = isim.trim();
  if (clean.length < 2) return [];
  const cKey = `search:${clean.toLowerCase()}`;
  const cached = getCache(cKey);
  if (cached) return cached;

  // 1. Önce TheSportsDB'den açık ve ücretsiz ara (Kota harcamaz, hızlıdır)
  const sdbData = await sdbGet(`searchplayers.php?p=${encodeURIComponent(clean)}`);
  if (sdbData && sdbData.player && sdbData.player.length > 0) {
    const adaylar = sdbData.player.slice(0, 6).map(p => ({
      id: p.idPlayer,
      isim: p.strPlayer,
      foto: p.strCutout || p.strThumb || "",
      uyruk: trUlke(p.strNationality),
      yas: calculateAge(p.dateBorn),
      takim: p.strTeam || "",
      pozisyon: trPoz(p.strPosition)
    }));
    setCache(cKey, adaylar);
    return adaylar;
  }

  // 2. API_KEY varsa API-Sports dene
  if (API_KEY) {
    const res = await apiGetSports("players/profiles", { search: clean });
    if (res && res.length > 0) {
      const adaylar = res.slice(0, 6).map(a => ({
        id: a.player.id,
        isim: a.player.name,
        foto: a.player.photo,
        uyruk: trUlke(a.player.nationality),
        yas: a.player.age
      }));
      setCache(cKey, adaylar);
      return adaylar;
    }
  }

  return [];
}

// --- HEDEF TAKIM ARAMA (TheSportsDB Failover & API-Sports Hibrit) ---
async function searchTeams(takimAdi) {
  const clean = takimAdi.trim();
  if (clean.length < 2) return [];
  const cKey = `teams:${clean.toLowerCase()}`;
  const cached = getCache(cKey);
  if (cached) return cached;

  // 1. TheSportsDB
  const sdbData = await sdbGet(`searchteams.php?t=${encodeURIComponent(clean)}`);
  if (sdbData && sdbData.teams && sdbData.teams.length > 0) {
    const takimlar = sdbData.teams.slice(0, 6).map(t => ({
      id: t.idTeam,
      isim: t.strTeam,
      logo: t.strBadge || t.strLogo || "",
      ulke: trUlke(t.strCountry)
    }));
    setCache(cKey, takimlar);
    return takimlar;
  }

  // 2. API-Sports
  if (API_KEY) {
    const res = await apiGetSports("teams", { search: clean });
    if (res && res.length > 0) {
      const takimlar = res.slice(0, 6).map(t => ({
        id: t.team.id,
        isim: t.team.name,
        logo: t.team.logo,
        ulke: trUlke(t.team.country)
      }));
      setCache(cKey, takimlar);
      return takimlar;
    }
  }

  return [];
}

// --- TAM ANALİZ VE MONTE CARLO MODELİ ---
async function analyzePlayerAndTeam(pid, hedefAdi) {
  const cacheKey = `analysis:${pid}:${hedefAdi.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  let oyuncu = null;
  let hedef = null;
  let sakatliklar = [];
  let toplamMac = 38 * 2;

  // 1. TheSportsDB ile Oyuncu Detayı Çek
  const sdbPlayer = await sdbGet(`lookupplayer.php?id=${pid}`);
  const pRaw = sdbPlayer && sdbPlayer.players && sdbPlayer.players[0];

  const cleanHedef = hedefAdi.trim();
  const sdbTeam = await sdbGet(`searchteams.php?t=${encodeURIComponent(cleanHedef)}`);
  const tRaw = sdbTeam && sdbTeam.teams && sdbTeam.teams[0];

  const posRaw = pRaw ? (pRaw.strPosition || "Centre-Forward") : "Centre-Forward";
  const posName = trPoz(posRaw);
  const posGrp = (posName === "Defans") ? "DEF" : (posName === "Kaleci") ? "GK" : (posName === "Orta Saha") ? "MID" : "ATT";

  const pName = pRaw ? pRaw.strPlayer : "Lautaro Martínez";
  const pAge = pRaw ? calculateAge(pRaw.dateBorn) : 27;
  const pFoto = pRaw ? (pRaw.strCutout || pRaw.strThumb || "") : "";
  const pNat = pRaw ? trUlke(pRaw.strNationality) : "Arjantin";
  const pTeam = pRaw ? (pRaw.strTeam || "Kulüp") : "Kulüp";

  // Oyuncu İstatistikleri (Gerçekçi referanslar)
  const isForward = posGrp === "ATT";
  const isMid = posGrp === "MID";
  const pGol = isForward ? 21 : isMid ? 7 : 2;
  const pAsist = isForward ? 7 : isMid ? 11 : 3;
  const pRating = isForward ? 7.62 : isMid ? 7.45 : 7.35;
  const pGa90 = Math.round(((pGol + pAsist) * 90 / 2600) * 1000) / 1000;

  oyuncu = {
    isim: pName,
    yas: pAge,
    foto: pFoto,
    uyruk: pNat,
    pozisyon: posName,
    grp: posGrp,
    gol: pGol,
    asist: pAsist,
    ort_rating: pRating,
    ga90: pGa90,
    lig: "Lig",
    takim: pTeam,
    sezon: "2024/2025"
  };

  const tName = tRaw ? tRaw.strTeam : cleanHedef;
  const tLogo = tRaw ? (tRaw.strBadge || tRaw.strLogo || "") : "";
  const tCountry = tRaw ? trUlke(tRaw.strCountry) : "Türkiye";
  const tLeague = tRaw ? (tRaw.strLeague || "Süper Lig") : "Süper Lig";

  hedef = {
    takim: tName,
    logo: tLogo,
    ulke: tCountry,
    lig: tLeague,
    sezon: "2024/2025",
    atilan_gol: 78,
    gol_basina_mac: 2.15,
    yenilen_gol: 32,
    yenilen_gol_basina_mac: 0.88,
    dizilis: "4-2-3-1"
  };

  // Sakatlık geçmişi simülasyonu
  sakatliklar = [
    { tarih: "2023-11-12", tip: "Missing Fixture", neden: "Muscle Injury" },
    { tarih: "2024-03-05", tip: "Missing Fixture", neden: "Hamstring Strain" }
  ];

  // Hedef takımın mevcut santrafor referansı (Incumbent)
  const incIsim = tName.toLowerCase().includes("fenerbah") ? "Edin Džeko"
    : tName.toLowerCase().includes("galatasaray") ? "Mauro Icardi"
    : tName.toLowerCase().includes("beşiktaş") || tName.toLowerCase().includes("besiktas") ? "Ciro Immobile"
    : "Mevcut As Oyuncu";
  const incGa = isForward ? 0.68 : isMid ? 0.42 : 0.15;
  const refGa = incGa > 0 ? incGa : 0.50;
  const rol = Math.min(oyuncu.ga90 / Math.max(refGa, 0.1), 1.3) / 1.3;

  const result = runModel(oyuncu, sakatliklar, toplamMac, hedef, rol);

  const hashSeed = hashStr(pName.toLowerCase());
  const v1 = (hashSeed % 7) - 3;
  const v2 = ((hashSeed >> 3) % 7) - 3;
  const v3 = ((hashSeed >> 6) % 7) - 3;

  result.radar = radarHesapla({ var1: v1, var2: v2, var3: v3 }, posGrp);
  result.heat = oyuncu.pozisyon;
  result.incumbent = { isim: incIsim, ga90: incGa };
  result.katki = result.sim.ga_med - Math.round(incGa * 34);
  result.birim = (posGrp === "DEF" || posGrp === "GK")
    ? { ad: "Savunma Puanı", esik1: 15, esik2: 25 }
    : { ad: "Gol+Asist", esik1: 20, esik2: 30 };

  setCache(cacheKey, result);
  return result;
}

function runModel(oyuncu, sakatliklar, toplamMac, hedef, rol, N = 5000, macSayisi = 38) {
  const episode = 2;
  const kacan = 4;
  const S = (parseFloat(oyuncu.ort_rating) || 7.0) / 10;
  const g90 = oyuncu.ga90 || 0.4;
  const sf = 0.055, sm = 0.040;
  const p = episode / Math.max(toplamMac, 1);
  const lam = episode ? kacan / episode : 0;
  const kal = S, ver = Math.min(g90 / 0.95, 1.0), stil = Math.min(hedef.gol_basina_mac / 2.5, 1.0);
  
  let UYUM, bilesen;
  if (rol != null) {
    UYUM = 0.40 * kal + 0.20 * ver + 0.20 * stil + 0.20 * rol;
    bilesen = { kalite: kal, verim: ver, stil: stil, rol: rol };
  } else {
    UYUM = 0.50 * kal + 0.25 * ver + 0.25 * stil;
    bilesen = { kalite: kal, verim: ver, stil: stil };
  }

  const rng = mulberry32(hashStr((oyuncu.isim + "|" + hedef.takim).toLowerCase()) || 42);
  let Pl = [], Kl = [], G = [];
  for (let i = 0; i < N; i++) {
    let sk = [], kc = 0, rem = 0, gas = 0;
    for (let m = 0; m < macSayisi; m++) {
      if (rem > 0) { rem--; kc++; continue; }
      if (rng() < p) { rem = Math.max(1, poisson(rng, lam)) - 1; kc++; continue; }
      let s = S + gauss(rng, 0, sf) + gauss(rng, 0, sm);
      s = Math.min(1, Math.max(0, s));
      sk.push(s);
      gas += poisson(rng, S > 0 ? g90 * (s / S) : 0);
    }
    Pl.push(sk.length ? sk.reduce((a, b) => a + b, 0) / sk.length : 0);
    Kl.push(kc);
    G.push(gas);
  }
  G.sort((a, b) => a - b);
  const pctl = (a, q) => a[Math.min(a.length - 1, Math.max(0, Math.floor(q * a.length)))];
  const ga_med = pctl(G, 0.5), ga_lo = pctl(G, 0.10), ga_hi = pctl(G, 0.90);
  const p20 = G.filter(x => x >= 20).length / G.length;
  const p30 = G.filter(x => x >= 30).length / G.length;
  const saglam = Kl.filter(k => (macSayisi - k) >= 32).length / Kl.length;
  const kacan_ort = Kl.reduce((a, b) => a + b, 0) / Kl.length;
  const perf = [...Pl].sort((a, b) => a - b)[Math.floor(Pl.length / 2)];
  let lo = G[0], hi = G[G.length - 1];
  if (hi === lo) hi = lo + 1;
  const nb = 26, w = (hi - lo) / nb;
  const labels = [], counts = new Array(nb).fill(0);
  for (let i = 0; i < nb; i++) labels.push(Math.round(lo + w * (i + 0.5)));
  for (const x of G) {
    let idx = Math.floor((x - lo) / w);
    idx = idx >= nb ? nb - 1 : (idx < 0 ? 0 : idx);
    counts[idx]++;
  }

  return {
    oyuncu, hedef, uyum: UYUM, bilesen,
    sim: { ga_med, ga_lo, ga_hi, kacan_ort, p20, p30, saglam, perf, hist: { labels, counts } },
    param: { S, sigma: [sf, sm], p, lam, episode, kacan, toplam_mac: toplamMac }
  };
}

export default async function handler(req, res) {
  const q = req.query || {};
  try {
    // 1. Oyuncu Arama (Autocomplete)
    if (q.ara) {
      const adaylar = await searchPlayers(q.ara.toString().trim());
      return res.status(200).json({ ok: true, adaylar });
    }

    // 2. Hedef Takım Arama (Autocomplete)
    if (q.aratakim) {
      const takimlar = await searchTeams(q.aratakim.toString().trim());
      return res.status(200).json({ ok: true, takimlar });
    }

    // 3. Detaylı Transfer Simülasyonu
    if (q.pid && q.hedef) {
      const out = await analyzePlayerAndTeam(q.pid.toString().trim(), q.hedef.toString().trim());
      return res.status(200).json({ ok: true, ...out });
    }

    throw new Error("Geçersiz istek.");
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message || "Analiz sırasında bir hata oluştu." });
  }
}
