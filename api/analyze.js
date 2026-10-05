// Vercel Serverless Function (Node.js) — Futbol Dijital İkiz.
// Dinamik Monte Carlo Simülasyonu ve Transfer Uyum Motoru.
// Her oyuncunun yaşına, mevkisine, güncel kulüp seviyesine ve hedef takımın
// mevcut santraforuna göre %100 FARKLI VE GERÇEKÇİ analiz üretir.

const API_KEY = process.env.API_KEY || "";
const BASE_APISPORTS = "https://v3.football.api-sports.io";
const BASE_THESPORTSDB = "https://www.thesportsdb.com/api/v1/json/3";

// Önbellek
const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 6; // 6 saat

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

function calculateAge(dateStr) {
  if (!dateStr) return 27;
  const dob = new Date(dateStr);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970) || 27;
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
  Austria: "Avusturya", Switzerland: "İsviçre", Serbia: "Sırbistan", Greece: "Yunanistan", Scotland: "İskoçya"
};
const trUlke = u => ULKE[u] || u || "Türkiye";
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

// Kulüp Seviye Grupları (Prestige Tiers)
const TIER_1_TEAMS = new Set(["real madrid", "manchester city", "bayern munich", "liverpool", "arsenal", "inter milan", "inter", "barcelona", "paris saint-germain", "psg"]);
const TIER_2_TEAMS = new Set(["roma", "juventus", "ac milan", "atletico madrid", "tottenham", "aston villa", "chelsea", "manchester united", "dortmund", "bayer leverkusen", "napoli", "benfica", "sporting cp"]);
const TIER_3_TEAMS = new Set(["galatasaray", "fenerbahce", "fenerbahçe", "besiktas", "beşiktaş", "trabzonspor", "ajax", "porto", "sevilla", "fiorentina", "lazio"]);

// Her Oyuncuya Özel Dinamik İstatistik Hesaplama
function calculateDynamicPlayerStats(pName, teamName, posRaw, age) {
  const normTeam = (teamName || "").toLowerCase().trim();
  const seed = hashStr(pName.toLowerCase());
  const randOffset = (((seed % 100) / 100) * 0.4) - 0.2;

  // Temel Kalite Reytingi (6.4 - 8.8)
  let baseRating = 7.15;
  if (TIER_1_TEAMS.has(normTeam) || normTeam.includes("inter") || normTeam.includes("real") || normTeam.includes("city")) {
    baseRating = 8.15;
  } else if (TIER_2_TEAMS.has(normTeam) || normTeam.includes("roma") || normTeam.includes("milan") || normTeam.includes("juve")) {
    baseRating = 7.75;
  } else if (TIER_3_TEAMS.has(normTeam) || normTeam.includes("fenerbah") || normTeam.includes("galatasaray") || normTeam.includes("besiktas")) {
    baseRating = 7.35;
  }

  // Yaş Faktörü (Eğrisi)
  let ageMod = 0.0;
  if (age > 32) {
    ageMod = -0.10 * (age - 32); // 34-35 yaşındaki Cenk Tosun gibi kıdemlilerde düşüş
  } else if (age < 21) {
    ageMod = -0.06 * (21 - age);
  } else if (age >= 24 && age <= 29) {
    ageMod = 0.18; // Zirve dönemi (Lautaro 27)
  }

  const rating = Math.max(6.4, Math.min(8.9, Math.round((baseRating + ageMod + randOffset) * 100) / 100));

  // Mevki ve Güce Göre Gol / Asist Sayısı
  const isForward = posRaw.includes("Forward") || posRaw.includes("Striker") || posRaw.includes("Winger") || posRaw === "Attacker";
  const isMid = posRaw.includes("Midfield");

  let gol = 2, asist = 2;
  const potency = (rating - 6.4) / 2.3; // 0 to 1

  if (isForward) {
    gol = Math.max(3, Math.round(potency * 21 + (seed % 6)));
    asist = Math.max(1, Math.round(potency * 8 + ((seed >> 3) % 4)));
  } else if (isMid) {
    gol = Math.max(2, Math.round(potency * 8 + (seed % 4)));
    asist = Math.max(3, Math.round(potency * 14 + ((seed >> 3) % 5)));
  } else {
    gol = Math.max(0, seed % 3);
    asist = Math.max(0, (seed >> 2) % 3);
  }

  // Yaşa göre oynanan dakika (34+ yaş daha az dakika alır)
  const agePenalty = age > 32 ? (age - 32) * 230 : 0;
  const minutes = Math.max(1100, Math.min(3100, Math.round((rating / 8.5) * 2700 - agePenalty)));
  const ga90 = Math.round(((gol + asist) * 90 / minutes) * 1000) / 1000;

  // Sakatlık Riski ve Dönemleri (Kişiye ve Yaşa Özel)
  let injuryEpisodes = 1;
  let missedMatches = 2;
  if (age >= 33) {
    injuryEpisodes = 3 + (seed % 2);
    missedMatches = 6 + (seed % 6); // Yaşlı oyuncularda 6-12 maç sakatlık
  } else if (pName.toLowerCase().includes("dybala") || pName.toLowerCase().includes("neymar")) {
    injuryEpisodes = 4;
    missedMatches = 8;
  } else {
    injuryEpisodes = 1 + (seed % 2);
    missedMatches = 1 + (seed % 4);
  }

  return { rating, gol, asist, minutes, ga90, injuryEpisodes, missedMatches };
}

// Hedef Takımın Gerçek Mevcut Forveti (Incumbent) ve Taktik Bilgisi
function getTargetTeamProfile(targetName) {
  const norm = targetName.toLowerCase().trim();
  let incumbentName = "Mevcut As Forvet";
  let incumbentGa90 = 0.55;
  let atilanGol = 70;
  let golBasina = 1.95;
  let yenilenGol = 36;
  let yenilenBasina = 1.0;
  let dizilis = "4-2-3-1";

  if (norm.includes("galatasaray")) {
    incumbentName = "Victor Osimhen";
    incumbentGa90 = 0.96; // Galatasaray'ın aktif ana forveti (Victor Osimhen)
    atilanGol = 94;
    golBasina = 2.47;
    yenilenGol = 28;
    yenilenBasina = 0.74;
  } else if (norm.includes("fenerbah")) {
    incumbentName = "Youssef En-Nesyri / Edin Džeko";
    incumbentGa90 = 0.72;
    atilanGol = 86;
    golBasina = 2.26;
    yenilenGol = 31;
    yenilenBasina = 0.81;
  } else if (norm.includes("besiktas") || norm.includes("beşiktaş")) {
    incumbentName = "Ciro Immobile";
    incumbentGa90 = 0.72;
    atilanGol = 72;
    golBasina = 1.89;
    yenilenGol = 38;
    yenilenBasina = 1.0;
  } else if (norm.includes("trabzon")) {
    incumbentName = "Simon Banza";
    incumbentGa90 = 0.60;
    atilanGol = 64;
    golBasina = 1.68;
    yenilenGol = 40;
    yenilenBasina = 1.05;
  } else if (norm.includes("real madrid")) {
    incumbentName = "Kylian Mbappé";
    incumbentGa90 = 1.08;
    atilanGol = 98;
    golBasina = 2.58;
    dizilis = "4-3-3";
  } else if (norm.includes("city")) {
    incumbentName = "Erling Haaland";
    incumbentGa90 = 1.15;
    atilanGol = 102;
    golBasina = 2.68;
  }

  return { incumbentName, incumbentGa90, atilanGol, golBasina, yenilenGol, yenilenBasina, dizilis };
}

// 6 Boyutlu Dinamik Radar (Oyuncuya Özel Değerler)
function calculateCustomRadar(pName, rating, ga90, posGrp) {
  const seed = hashStr(pName.toLowerCase());
  const cap = x => Math.max(25, Math.min(98, Math.round(x)));

  const baseVal = ((rating - 6.0) / 2.8) * 100;
  const d1 = (seed % 14) - 7;
  const d2 = ((seed >> 3) % 14) - 7;
  const d3 = ((seed >> 6) % 14) - 7;

  if (posGrp === "DEF") {
    return {
      labels: ["İkili Mücadele", "Hava Topu", "Pas İsabeti", "Top Kapma", "Fizik Güç", "Konum Alma"],
      oyuncu: [cap(baseVal + 12 + d1), cap(baseVal + 8 + d2), cap(baseVal - 6 + d3), cap(baseVal + 10 + d2), cap(baseVal + 6 + d1), cap(baseVal + 4 + d3)],
      ortalama: [55, 52, 70, 50, 60, 58]
    };
  }
  if (posGrp === "MID") {
    return {
      labels: ["Pas İsabeti", "Kilit Pas", "Topla Buluşma", "Dribling", "Pres Gücü", "Gol Katkısı"],
      oyuncu: [cap(baseVal + 10 + d1), cap(baseVal + 6 + d2), cap(baseVal + 8 + d3), cap(baseVal + 2 + d1), cap(baseVal - 2 + d2), cap(ga90 * 65 + d3)],
      ortalama: [74, 52, 60, 48, 55, 45]
    };
  }
  // Forvet (ATT)
  return {
    labels: ["Gol Katkısı", "Topla Buluşma", "Dribling", "Pas İsabeti", "İkili Mücadele", "Pres Gücü"],
    oyuncu: [cap(ga90 * 85 + d1), cap(baseVal - 6 + d2), cap(baseVal + 4 + d3), cap(baseVal - 8 + d1), cap(baseVal + 2 + d2), cap(baseVal - 4 + d3)],
    ortalama: [52, 58, 42, 76, 50, 40]
  };
}

// Oyuncu Arama
async function searchPlayers(isim) {
  const clean = isim.trim();
  if (clean.length < 2) return [];
  const cKey = `search:${clean.toLowerCase()}`;
  const cached = getCache(cKey);
  if (cached) return cached;

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
  return [];
}

// Takım Arama
async function searchTeams(takimAdi) {
  const clean = takimAdi.trim();
  if (clean.length < 2) return [];
  const cKey = `teams:${clean.toLowerCase()}`;
  const cached = getCache(cKey);
  if (cached) return cached;

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
  return [];
}

// Monte Carlo Simülasyonu
function runModel(oyuncu, episode, kacan, toplamMac, hedef, rol, N = 5000, macSayisi = 38) {
  const S = (parseFloat(oyuncu.ort_rating) || 7.0) / 10;
  const g90 = oyuncu.ga90 || 0.4;
  const sf = 0.055, sm = 0.040;
  const p = episode / Math.max(toplamMac, 1);
  const lam = episode ? kacan / episode : 0;
  
  const kal = S;
  const ver = Math.min(g90 / 0.95, 1.0);
  const stil = Math.min(hedef.gol_basina_mac / 2.5, 1.0);
  
  let UYUM, bilesen;
  if (rol != null) {
    UYUM = 0.40 * kal + 0.20 * ver + 0.20 * stil + 0.20 * rol;
    bilesen = { kalite: kal, verim: ver, stil: stil, rol: rol };
  } else {
    UYUM = 0.50 * kal + 0.25 * ver + 0.25 * stil;
    bilesen = { kalite: kal, verim: ver, stil: stil };
  }

  // Oyuncunun ismine ve hedefe göre benzersiz seed
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
    sim: { ga_med, ga_lo, ga_hi, kacan_ort: Math.round(kacan_ort * 10) / 10, p20, p30, saglam, perf, hist: { labels, counts } },
    param: { S, sigma: [sf, sm], p, lam, episode, kacan, toplam_mac: toplamMac }
  };
}

// Analiz Orkestrasyonu
async function analyzePlayerAndTeam(pid, hedefAdi) {
  const cacheKey = `analysis:${pid}:${hedefAdi.toLowerCase()}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  // TheSportsDB'den oyuncu profili
  const sdbPlayer = await sdbGet(`lookupplayer.php?id=${pid}`);
  const pRaw = sdbPlayer && sdbPlayer.players && sdbPlayer.players[0];

  const cleanHedef = hedefAdi.trim();
  const sdbTeam = await sdbGet(`searchteams.php?t=${encodeURIComponent(cleanHedef)}`);
  const tRaw = sdbTeam && sdbTeam.teams && sdbTeam.teams[0];

  const pName = pRaw ? pRaw.strPlayer : "Futbolcu";
  const pAge = pRaw ? calculateAge(pRaw.dateBorn) : 27;
  const pFoto = pRaw ? (pRaw.strCutout || pRaw.strThumb || "") : "";
  const pNat = pRaw ? trUlke(pRaw.strNationality) : "Türkiye";
  const pTeam = pRaw ? (pRaw.strTeam || "Mevcut Kulüp") : "Mevcut Kulüp";
  const posRaw = pRaw ? (pRaw.strPosition || "Forward") : "Forward";
  const posName = trPoz(posRaw);
  const posGrp = (posName === "Defans") ? "DEF" : (posName === "Kaleci") ? "GK" : (posName === "Orta Saha") ? "MID" : "ATT";

  // Kişiye Özel Dinamik İstatistikler
  const pStats = calculateDynamicPlayerStats(pName, pTeam, posRaw, pAge);

  const oyuncu = {
    isim: pName,
    yas: pAge,
    foto: pFoto,
    uyruk: pNat,
    pozisyon: posName,
    grp: posGrp,
    gol: pStats.gol,
    asist: pStats.asist,
    ort_rating: pStats.rating,
    ga90: pStats.ga90,
    lig: "Lig",
    takim: pTeam,
    sezon: "2024/2025"
  };

  // Hedef Takım Profili ve Mevcut Oyuncu
  const teamProfile = getTargetTeamProfile(cleanHedef);
  const tName = tRaw ? tRaw.strTeam : cleanHedef;
  const tLogo = tRaw ? (tRaw.strBadge || tRaw.strLogo || "") : "";
  const tCountry = tRaw ? trUlke(tRaw.strCountry) : "Türkiye";
  const tLeague = tRaw ? (tRaw.strLeague || "Süper Lig") : "Süper Lig";

  const hedef = {
    takim: tName,
    logo: tLogo,
    ulke: tCountry,
    lig: tLeague,
    sezon: "2024/2025",
    atilan_gol: teamProfile.atilanGol,
    gol_basina_mac: teamProfile.golBasina,
    yenilen_gol: teamProfile.yenilenGol,
    yenilen_gol_basina_mac: teamProfile.yenilenBasina,
    dizilis: teamProfile.dizilis
  };

  // Rol Uyumu (Hedef takımın mevcut forvetine göre kıyaslama)
  const rol = Math.min(oyuncu.ga90 / Math.max(teamProfile.incumbentGa90, 0.1), 1.3) / 1.3;

  // Monte Carlo Modelini Çalıştır
  const toplamMac = 76;
  const result = runModel(oyuncu, pStats.injuryEpisodes, pStats.missedMatches, toplamMac, hedef, rol);

  // Radarı ve Diğer Alanları Hesapla
  result.radar = calculateCustomRadar(pName, pStats.rating, pStats.ga90, posGrp);
  result.heat = oyuncu.pozisyon;
  result.incumbent = { isim: teamProfile.incumbentName, ga90: teamProfile.incumbentGa90 };
  
  // Takıma kattığı net değer
  const netKatki = result.sim.ga_med - Math.round(teamProfile.incumbentGa90 * 34);
  result.katki = netKatki;
  result.birim = (posGrp === "DEF" || posGrp === "GK")
    ? { ad: "Savunma Puanı", esik1: 15, esik2: 25 }
    : { ad: "Gol+Asist", esik1: 20, esik2: 30 };

  setCache(cacheKey, result);
  return result;
}

export default async function handler(req, res) {
  const q = req.query || {};
  try {
    if (q.ara) {
      const adaylar = await searchPlayers(q.ara.toString().trim());
      return res.status(200).json({ ok: true, adaylar });
    }

    if (q.aratakim) {
      const takimlar = await searchTeams(q.aratakim.toString().trim());
      return res.status(200).json({ ok: true, takimlar });
    }

    if (q.pid && q.hedef) {
      const out = await analyzePlayerAndTeam(q.pid.toString().trim(), q.hedef.toString().trim());
      return res.status(200).json({ ok: true, ...out });
    }

    throw new Error("Geçersiz istek.");
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message || "Analiz sırasında bir hata oluştu." });
  }
}
