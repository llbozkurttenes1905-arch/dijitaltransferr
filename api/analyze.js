// Vercel Serverless Function (Node.js) — Futbol Dijital İkiz.
// Dinamik Monte Carlo Simülasyonu ve Transfer Uyum Motoru.
// Her oyuncunun yaşına, mevkisine, güncel kulüp seviyesine ve hedef takımın
// mevcut santraforuna göre %100 FARKLI VE GERÇEKÇİ analiz üretir.

const API_KEY = process.env.API_KEY || "";
const BASE_APISPORTS = "https://v3.football.api-sports.io";
const BASE_THESPORTSDB = "https://www.thesportsdb.com/api/v1/json/3";

import { generateExtremeScoutingPackage, findRealPlayerExpert } from "./scoutingEngine.js";

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
  return (t || "")
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .normalize("NFKD")
    .replace(new RegExp("[" + String.fromCharCode(768) + "-" + String.fromCharCode(879) + "]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
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
  const expert = findRealPlayerExpert(pName);
  if (expert) {
    return {
      rating: expert.rating,
      gol: expert.gol,
      asist: expert.asist,
      minutes: expert.minutes,
      ga90: expert.ga90,
      injuryEpisodes: 1,
      missedMatches: Math.round(expert.kacanMac || 2)
    };
  }

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

// Güncel Kadrolar, Mevcut As Oyuncular ve Kulüp Taktik Profilleri (2024/2025 - 2025/2026)
const TEAMS_DATABASE = {
  // SÜPER LİG
  galatasaray: {
    isim: "Galatasaray",
    aliases: ["galatasaray", "cimbom", "gs"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 94, golBasina: 2.47, yenilenGol: 28, yenilenBasina: 0.74,
    att: "Victor Osimhen", attGa90: 0.96, altAtt: "Mauro Icardi / Michy Batshuayi",
    mid: "Gabriel Sara / Lucas Torreira", midGa90: 0.45,
    def: "Davinson Sánchez / Abdülkerim Bardakcı", defGa90: 0.12,
    gk: "Uğurcan Çakır / Günay Güvenç", gkGa90: 0.03,
    felsefe: "Ön Alanda Boğucu Şok Pres & Hakim Topa Sahip Olma",
    hucumStili: "Ceza sahasına dikine kilit paslar, Osimhen bitiriciliği ve dinamik kanat varyasyonları",
    savunmaStili: "Yüksek savunma çizgisi, Torreira merkezli şok karşı pres ve kompakt hatlar",
    tempo: "Yüksek & Boğucu Hücum Temposu",
    topaSahipOlma: "%62",
    presSiddeti: "Çok Yüksek (PPDA: 7.8)",
    xgMac: "2.40",
    gucluYonler: [
      "Ceza sahası içi ölümcül bitiricilik (Victor Osimhen / Mauro Icardi)",
      "Ön alanda şok pres ile top kazanma (Torreira & Gabriel Sara)",
      "Bireysel dribling ile adam eksiltme (Barış Alper & Yunus Akgün)",
      "Kalede elit refleksler ve pasör süpürücü kaleci üstünlüğü (Uğurcan Çakır)"
    ],
    zayifYonler: [
      "Yüksek savunma çizgisi arkasına atılan kontratak topları",
      "Geniş alanda geçiş savunması ve temas gecikmesi",
      "Duran top savunmasında adam paylaşımı dalgalanmaları"
    ],
    anaDizilis: "4-2-3-1",
    altDizilis: "3-4-1-2",
    kadro: ["Victor Osimhen", "Mauro Icardi", "Michy Batshuayi", "Barış Alper Yılmaz", "Yunus Akgün", "Roland Sallai", "Leroy Sané", "Dries Mertens", "Gabriel Sara", "Lucas Torreira", "Hakim Ziyech", "Kerem Demirbay", "Berkan Kutlu", "Eyüp Aydın", "Davinson Sánchez", "Abdülkerim Bardakcı", "Wilfried Singo", "Ismail Jakobs", "Kaan Ayhan", "Metehan Baltacı", "Uğurcan Çakır", "Günay Güvenç", "Batuhan Şen"],
    kadroDetay: {
      kaleciler: ["Uğurcan Çakır (1. Kaleci)", "Günay Güvenç", "Batuhan Şen"],
      defans: ["Davinson Sánchez", "Abdülkerim Bardakcı", "Wilfried Singo", "Ismail Jakobs", "Kaan Ayhan", "Metehan Baltacı"],
      ortasaha: ["Lucas Torreira", "Gabriel Sara", "Kerem Demirbay", "Berkan Kutlu", "Eyüp Aydın"],
      kanat_forvet: ["Barış Alper Yılmaz", "Yunus Akgün", "Roland Sallai", "Leroy Sané", "Dries Mertens", "Hakim Ziyech", "Victor Osimhen", "Mauro Icardi", "Michy Batshuayi"]
    }
  },
  fenerbahce: {
    isim: "Fenerbahçe",
    aliases: ["fenerbahce", "fenerbahçe", "fb"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 86, golBasina: 2.26, yenilenGol: 31, yenilenBasina: 0.81,
    att: "Youssef En-Nesyri", attGa90: 0.78, altAtt: "Edin Džeko / Cenk Tosun",
    mid: "Sebastian Szymański / Fred", midGa90: 0.44,
    def: "Alexander Djiku / Çağlar Söyüncü", defGa90: 0.12,
    gk: "Dominik Livaković", gkGa90: 0.03,
    felsefe: "Kompakt Geçiş Oyunu & Taktiksel Disiplin (Mourinho Felsefesi)",
    hucumStili: "Hedef santrafor bağlantıları, ceza sahasına erken kavisli ortalar ve duran top setleri",
    savunmaStili: "Kompakt orta blok, fiziki ikili mücadele üstünlüğü ve alan daraltma",
    tempo: "Kontrollü & Fırsatçı Geçiş Temposu",
    topaSahipOlma: "%57",
    presSiddeti: "Orta-Yüksek Blok (PPDA: 9.6)",
    xgMac: "2.12",
    gucluYonler: [
      "Hava topları ve ceza sahası ribaundlarında üstünlük (En-Nesyri & Džeko)",
      "Duran top organizasyonları ve kilit pas üretimi (Dušan Tadić)",
      "Kanatta patlayıcı birebir dribling tehdidi (Allan Saint-Maximin)",
      "Orta alanda dinamik süpürme (Fred & Sofyan Amrabat)"
    ],
    zayifYonler: [
      "Derin blokla kapanan takımlara karşı set oyununda üretim tıkanıklığı",
      "Merkez savunmada arkaya sarkan hızlı oyunculara karşı hamle gecikmesi",
      "Skorda geriye düşüldüğünde yaşanan ritim kaybı"
    ],
    anaDizilis: "4-2-3-1",
    altDizilis: "3-5-2",
    kadro: ["Youssef En-Nesyri", "Edin Džeko", "Dušan Tadić", "Allan Saint-Maximin", "Filip Kostić", "İrfan Can Kahveci", "Sebastian Szymański", "Fred", "Sofyan Amrabat", "İsmail Yüksek", "Mert Hakan Yandaş", "Alexander Djiku", "Çağlar Söyüncü", "Rodrigo Becão", "Jayden Oosterwolde", "Mert Müldür", "Bright Osayi-Samuel", "Levent Mercan", "Oğuz Aydın", "Cenk Tosun", "Cengiz Ünder", "Dominik Livaković", "İrfan Can Eğribayat"],
    kadroDetay: {
      kaleciler: ["Dominik Livaković", "İrfan Can Eğribayat"],
      defans: ["Alexander Djiku", "Çağlar Söyüncü", "Rodrigo Becão", "Jayden Oosterwolde", "Mert Müldür", "Bright Osayi-Samuel", "Levent Mercan"],
      ortasaha: ["Fred", "Sofyan Amrabat", "Sebastian Szymański", "İsmail Yüksek", "Mert Hakan Yandaş"],
      kanat_forvet: ["Dušan Tadić", "Allan Saint-Maximin", "Filip Kostić", "İrfan Can Kahveci", "Oğuz Aydın", "Cengiz Ünder", "Youssef En-Nesyri", "Edin Džeko", "Cenk Tosun"]
    }
  },
  besiktas: {
    isim: "Beşiktaş",
    aliases: ["besiktas", "beşiktaş", "bjk"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 74, golBasina: 1.95, yenilenGol: 36, yenilenBasina: 0.95,
    att: "Ciro Immobile", attGa90: 0.75, altAtt: "Semih Kılıçsoy",
    mid: "Rafa Silva / Gedson Fernandes", midGa90: 0.60,
    def: "Gabriel Paulista / Felix Uduokhai", defGa90: 0.12,
    gk: "Mert Günok", gkGa90: 0.03,
    felsefe: "Hızlı Hücum Reaksiyonu & Yaratıcı Ön Hat",
    hucumStili: "Rafa Silva liderliğinde dikine akınlar, Immobile ceza sahası koşuları ve merkezden sızmalar",
    savunmaStili: "Gedson Fernandes dinamizmiyle pres, Paulista liderliğinde savunma emniyeti",
    tempo: "Değişken & Patlayıcı Hücum Temposu",
    topaSahipOlma: "%58",
    presSiddeti: "Yüksek (PPDA: 8.5)",
    xgMac: "1.95",
    gucluYonler: [
      "Ceza sahası önünde ölümcül pas kombinasyonları (Rafa Silva)",
      "Son vuruş ustalığı ve ceza sahası sezgisi (Ciro Immobile)",
      "Orta sahadan top taşıma ve dikine dribling gücü (Gedson Fernandes)",
      "Genç forvet patlayıcılığı (Semih Kılıçsoy)"
    ],
    zayifYonler: [
      "Beklerin hücuma çıkışında kanat arkasında kalan geniş koridorlar",
      "Fiziksel temaslı sert maçlarda orta sahada oyundan düşme riski",
      "Kadro rotasyon derinliğindeki eksiklikler"
    ],
    anaDizilis: "4-2-3-1",
    altDizilis: "4-3-3",
    kadro: ["Ciro Immobile", "Semih Kılıçsoy", "Rafa Silva", "Gedson Fernandes", "João Mário", "Milot Rashica", "Ernest Muçi", "Cher Ndour", "Al-Musrati", "Salih Uçan", "Jean Onana", "Arthur Masuaku", "Gabriel Paulista", "Felix Uduokhai", "Emirhan Topçu", "Jonas Svensson", "Bakhtiyor Zaynutdinov", "Tayyip Talha Sanuç", "Mustafa Erhan Hekimoğlu", "Mert Günok", "Ersin Destanoğlu"],
    kadroDetay: {
      kaleciler: ["Mert Günok", "Ersin Destanoğlu"],
      defans: ["Gabriel Paulista", "Felix Uduokhai", "Emirhan Topçu", "Arthur Masuaku", "Jonas Svensson", "Bakhtiyor Zaynutdinov", "Tayyip Talha Sanuç"],
      ortasaha: ["Gedson Fernandes", "Al-Musrati", "Cher Ndour", "João Mário", "Salih Uçan", "Ernest Muçi"],
      kanat_forvet: ["Rafa Silva", "Milot Rashica", "Semih Kılıçsoy", "Ciro Immobile", "Mustafa Erhan Hekimoğlu"]
    }
  },
  trabzonspor: {
    isim: "Trabzonspor",
    aliases: ["trabzonspor", "trabzon", "ts"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 64, golBasina: 1.68, yenilenGol: 40, yenilenBasina: 1.05,
    att: "Simon Banza", attGa90: 0.65, altAtt: "Denis Drăguș / Enis Destan",
    mid: "Edin Višća / Muhammed Cham", midGa90: 0.46,
    def: "Stefan Savić / Stefano Denswil", defGa90: 0.10,
    gk: "André Onana / Onuralp Çevikkan", gkGa90: 0.03,
    felsefe: "Kanat Odaklı Hücum & Geçiş Fırsatçılığı",
    hucumStili: "Višća ve Nwakaeme ile kanatlardan yüklenme, Banza'ya kafa topu servisleri",
    savunmaStili: "Kompakt karşılama ve ceza sahası içi direnç",
    tempo: "Orta Tempo & Ani Kanat Hızlanmaları",
    topaSahipOlma: "%53",
    presSiddeti: "Dengeli (PPDA: 11.0)",
    xgMac: "1.68",
    gucluYonler: [
      "Hava topları ve pivot santrafor etkinliği (Simon Banza)",
      "Kanat ortaları ve ceza sahası kilit servisi (Edin Višća)",
      "Kalede tecrübeli çizgi performansı (André Onana & Onuralp)"
    ],
    zayifYonler: [
      "Orta alandan savunmaya geri dönüşlerde tempo kaybı",
      "Deplasman maçlarında top hakimiyetini koruma zorluğu"
    ],
    anaDizilis: "4-2-3-1",
    altDizilis: "4-3-3",
    kadro: ["Simon Banza", "Denis Drăguș", "Edin Višća", "Anthony Nwakaeme", "Muhammed Cham", "Okay Yokuşlu", "John Lundstram", "Batista Mendy", "Ozan Tufan", "Cihan Çanak", "Enis Destan", "Stefan Savić", "Stefano Denswil", "Arseniy Batagov", "Pedro Malheiro", "Borna Barišić", "Eren Elmalı", "Serdar Saatçı", "André Onana", "Onuralp Çevikkan", "Ahmet Doğan Yıldırım"],
    kadroDetay: {
      kaleciler: ["André Onana", "Onuralp Çevikkan", "Ahmet Doğan Yıldırım"],
      defans: ["Stefan Savić", "Stefano Denswil", "Arseniy Batagov", "Pedro Malheiro", "Borna Barišić", "Eren Elmalı", "Serdar Saatçı"],
      ortasaha: ["Batista Mendy", "Okay Yokuşlu", "John Lundstram", "Ozan Tufan", "Muhammed Cham"],
      kanat_forvet: ["Edin Višća", "Anthony Nwakaeme", "Denis Drăguș", "Cihan Çanak", "Simon Banza", "Enis Destan"]
    }
  },
  basaksehir: {
    isim: "Başakşehir",
    aliases: ["basaksehir", "başakşehir", "istanbul basaksehir", "rams basaksehir"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-3-3", atilanGol: 60, golBasina: 1.58, yenilenGol: 42, yenilenBasina: 1.10,
    att: "Krzysztof Piątek", attGa90: 0.72, altAtt: "Philippe Keny",
    mid: "Deniz Türüç / Miguel Crespo", midGa90: 0.40,
    def: "Jerome Opoku / Léo Duarte", defGa90: 0.10,
    gk: "Muhammed Şengezer", gkGa90: 0.03,
    kadro: ["Krzysztof Piątek", "Deniz Türüç", "Miguel Crespo", "Berkay Özcan", "Serdar Gürler", "Jerome Opoku", "Léo Duarte", "Muhammed Şengezer"]
  },
  samsunspor: {
    isim: "Samsunspor",
    aliases: ["samsunspor", "samsun"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 56, golBasina: 1.47, yenilenGol: 40, yenilenBasina: 1.05,
    att: "Marius Mouandilmadji", attGa90: 0.58, altAtt: "Landry Dimata",
    mid: "Olivier Ntcham / Carlo Holse", midGa90: 0.44,
    def: "Rick van Drongelen / Lubomír Šatka", defGa90: 0.10,
    gk: "Okan Kocuk", gkGa90: 0.03,
    kadro: ["Marius Mouandilmadji", "Olivier Ntcham", "Carlo Holse", "Landry Dimata", "Emre Kılınç", "Rick van Drongelen", "Lubomír Šatka", "Okan Kocuk"]
  },
  eyupspor: {
    isim: "Eyüpspor",
    aliases: ["eyupspor", "eyüpspor", "eyup"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-1-4-1", atilanGol: 54, golBasina: 1.42, yenilenGol: 42, yenilenBasina: 1.10,
    att: "Mame Thiam", attGa90: 0.62, altAtt: "Gianni Bruno",
    mid: "Ahmed Kutucu / Emre Akbaba", midGa90: 0.46,
    def: "Luccas Claro / Robin Yalçın", defGa90: 0.10,
    gk: "Berke Özer", gkGa90: 0.03,
    kadro: ["Mame Thiam", "Ahmed Kutucu", "Emre Akbaba", "Gianni Bruno", "Samu Sáiz", "Luccas Claro", "Robin Yalçın", "Berke Özer"]
  },
  goztepe: {
    isim: "Göztepe",
    aliases: ["goztepe", "göztepe"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "3-5-2", atilanGol: 52, golBasina: 1.37, yenilenGol: 38, yenilenBasina: 1.00,
    att: "David Datro Fofana / Rômulo", attGa90: 0.60, altAtt: "Juan",
    mid: "Anthony Dennis / Isaac Solet", midGa90: 0.36,
    def: "Héliton / Koray Günter", defGa90: 0.10,
    gk: "Mateusz Lis", gkGa90: 0.03,
    kadro: ["David Datro Fofana", "Rômulo", "Juan", "Anthony Dennis", "Isaac Solet", "Djalma Silva", "Héliton", "Koray Günter", "Mateusz Lis"]
  },
  kasimpasa: {
    isim: "Kasımpaşa",
    aliases: ["kasimpasa", "kasımpaşa"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-1-4-1", atilanGol: 55, golBasina: 1.45, yenilenGol: 50, yenilenBasina: 1.31,
    att: "Nuno da Costa", attGa90: 0.58, altAtt: "Mamadou Fall",
    mid: "Haris Hajradinović / Aytaç Kara", midGa90: 0.50,
    def: "Nicholas Opoku / Yasin Özcan", defGa90: 0.10,
    gk: "Andreas Gianniotis", gkGa90: 0.03,
    kadro: ["Nuno da Costa", "Haris Hajradinović", "Aytaç Kara", "Mamadou Fall", "Mortadha Ben Ouanes", "Nicholas Opoku", "Yasin Özcan", "Andreas Gianniotis"]
  },
  sivasspor: {
    isim: "Sivasspor",
    aliases: ["sivasspor", "sivas"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-3-3", atilanGol: 48, golBasina: 1.26, yenilenGol: 52, yenilenBasina: 1.36,
    att: "Rey Manaj", attGa90: 0.68, altAtt: "Keita Baldé",
    mid: "Alex Pritchard / Charis Charisis", midGa90: 0.35,
    def: "Uroš Radaković / Samba Camara", defGa90: 0.10,
    gk: "Đorđe Nikolić", gkGa90: 0.03,
    kadro: ["Rey Manaj", "Keita Baldé", "Alex Pritchard", "Charis Charisis", "Azizbek Turgunboev", "Uroš Radaković", "Samba Camara", "Đorđe Nikolić"]
  },
  antalyaspor: {
    isim: "Antalyaspor",
    aliases: ["antalyaspor", "antalya"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 46, golBasina: 1.21, yenilenGol: 54, yenilenBasina: 1.42,
    att: "Adolfo Gaich / Sam Larsson", attGa90: 0.52, altAtt: "Sander van de Streek",
    mid: "Erdal Rakip / Jakub Kałuziński", midGa90: 0.34,
    def: "Veysel Sarı / Thalisson Kelven", defGa90: 0.08,
    gk: "Kenan Pirić", gkGa90: 0.03,
    kadro: ["Adolfo Gaich", "Sam Larsson", "Sander van de Streek", "Jakub Kałuziński", "Erdal Rakip", "Veysel Sarı", "Thalisson Kelven", "Kenan Pirić"]
  },
  gaziantep: {
    isim: "Gaziantep FK",
    aliases: ["gaziantep", "gaziantepfk", "antep"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 48, golBasina: 1.26, yenilenGol: 54, yenilenBasina: 1.42,
    att: "David Okereke / Kenan Kodro", attGa90: 0.50, altAtt: "Halil Dervişoğlu",
    mid: "Deian Sorescu / Alexandru Maxim", midGa90: 0.42,
    def: "Bruno Viana / Arda Kızıldağ", defGa90: 0.08,
    gk: "Mustafa Burak Bozan", gkGa90: 0.03,
    kadro: ["David Okereke", "Kenan Kodro", "Deian Sorescu", "Alexandru Maxim", "Kacper Kozłowski", "Bruno Viana", "Arda Kızıldağ", "Mustafa Burak Bozan"]
  },
  rizespor: {
    isim: "Çaykur Rizespor",
    aliases: ["rizespor", "caykurrizespor", "rize"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 48, golBasina: 1.26, yenilenGol: 56, yenilenBasina: 1.47,
    att: "Ali Sowe", attGa90: 0.52, altAtt: "Martin Minchev",
    mid: "Dal Varešanović / Ibrahim Olawoyin", midGa90: 0.40,
    def: "Khusniddin Alikulov / Attila Mocsi", defGa90: 0.08,
    gk: "Ivo Grbić", gkGa90: 0.03,
    kadro: ["Ali Sowe", "Dal Varešanović", "Ibrahim Olawoyin", "Babajide David", "Khusniddin Alikulov", "Attila Mocsi", "Ivo Grbić"]
  },
  konyaspor: {
    isim: "Konyaspor",
    aliases: ["konyaspor", "konya"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 44, golBasina: 1.15, yenilenGol: 52, yenilenBasina: 1.36,
    att: "Umut Nayir / Blaž Kramer", attGa90: 0.50, altAtt: "Melih Bostan",
    mid: "Pedrinho / Marko Jevtović", midGa90: 0.38,
    def: "Adil Demirbağ / Riechedly Bazoer", defGa90: 0.08,
    gk: "Jakub Słowik", gkGa90: 0.03,
    kadro: ["Umut Nayir", "Blaž Kramer", "Pedrinho", "Alassane Ndao", "Marko Jevtović", "Adil Demirbağ", "Riechedly Bazoer", "Jakub Słowik"]
  },
  alanyaspor: {
    isim: "Alanyaspor",
    aliases: ["alanyaspor", "alanya"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 45, golBasina: 1.18, yenilenGol: 50, yenilenBasina: 1.31,
    att: "Sergio Córdova", attGa90: 0.48, altAtt: "Serdar Dursun",
    mid: "Nicolas Janvier / Richard", midGa90: 0.36,
    def: "Fidan Aliti / Furkan Bayır", defGa90: 0.08,
    gk: "Ertuğrul Taşkıran", gkGa90: 0.03,
    kadro: ["Sergio Córdova", "Nicolas Janvier", "Richard", "Florent Hadergjonaj", "Fidan Aliti", "Furkan Bayır", "Ertuğrul Taşkıran"]
  },
  kayserispor: {
    isim: "Kayserispor",
    aliases: ["kayserispor", "kayseri"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 44, golBasina: 1.15, yenilenGol: 56, yenilenBasina: 1.47,
    att: "Stéphane Bahoken / Duckens Nazon", attGa90: 0.48, altAtt: "Talha Sarıarslan",
    mid: "Mehdi Bourabia / Miguel Cardoso", midGa90: 0.38,
    def: "Joseph Attamah / Majid Hosseini", defGa90: 0.08,
    gk: "Bilal Bayazit", gkGa90: 0.03,
    kadro: ["Stéphane Bahoken", "Duckens Nazon", "Miguel Cardoso", "Mehdi Bourabia", "Aylton Boa Morte", "Joseph Attamah", "Majid Hosseini", "Bilal Bayazit"]
  },
  bodrum: {
    isim: "Bodrum FK",
    aliases: ["bodrum", "bodrumfk"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-1-4-1", atilanGol: 40, golBasina: 1.05, yenilenGol: 50, yenilenBasina: 1.31,
    att: "George Pușcaș", attGa90: 0.46, altAtt: "Celal Dumanlı",
    mid: "Fredy / Taylan Antalyalı", midGa90: 0.34,
    def: "Christophe Hérelle / Arlind Ajeti", defGa90: 0.08,
    gk: "Diogo Sousa", gkGa90: 0.03,
    kadro: ["George Pușcaș", "Fredy", "Taylan Antalyalı", "Taulant Seferi", "Christophe Hérelle", "Arlind Ajeti", "Diogo Sousa"]
  },
  adanademir: {
    isim: "Adana Demirspor",
    aliases: ["adanademir", "adanademirspor", "adana"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 38, golBasina: 1.00, yenilenGol: 62, yenilenBasina: 1.63,
    att: "Yusuf Barası", attGa90: 0.40, altAtt: "Ali Yavuz Kol",
    mid: "Maestro / Tayfun Aydoğan", midGa90: 0.32,
    def: "Semih Güler / Jovan Manev", defGa90: 0.08,
    gk: "Vedat Karakuş", gkGa90: 0.03,
    kadro: ["Yusuf Barası", "Ali Yavuz Kol", "Maestro", "Tayfun Aydoğan", "Semih Güler", "Jovan Manev", "Vedat Karakuş"]
  },
  hatayspor: {
    isim: "Hatayspor",
    aliases: ["hatayspor", "hatay"],
    ulke: "Türkiye", lig: "Süper Lig",
    dizilis: "4-2-3-1", atilanGol: 42, golBasina: 1.10, yenilenGol: 56, yenilenBasina: 1.47,
    att: "Vincent Aboubakar / Carlos Strandberg", attGa90: 0.50, altAtt: "Joelson Fernandes",
    mid: "Görkem Sağlam / Lamine Diack", midGa90: 0.36,
    def: "Guy-Marcelin Kilama / Francisco Calvo", defGa90: 0.08,
    gk: "Erce Kardeşler", gkGa90: 0.03,
    kadro: ["Vincent Aboubakar", "Carlos Strandberg", "Joelson Fernandes", "Görkem Sağlam", "Lamine Diack", "Guy-Marcelin Kilama", "Francisco Calvo", "Erce Kardeşler"]
  },

  // AVRUPA DEVLERİ
  realmadrid: {
    isim: "Real Madrid",
    aliases: ["realmadrid", "real madrid", "madrid"],
    ulke: "İspanya", lig: "La Liga",
    dizilis: "4-3-3", atilanGol: 98, golBasina: 2.58, yenilenGol: 26, yenilenBasina: 0.68,
    att: "Kylian Mbappé", attGa90: 1.08, altAtt: "Vinícius Júnior / Rodrygo",
    mid: "Jude Bellingham / Federico Valverde", midGa90: 0.70,
    def: "Antonio Rüdiger / Éder Militão", defGa90: 0.15,
    gk: "Thibaut Courtois", gkGa90: 0.03,
    kadro: ["Kylian Mbappé", "Vinícius Júnior", "Jude Bellingham", "Rodrygo", "Federico Valverde", "Eduardo Camavinga", "Aurélien Tchouaméni", "Luka Modrić", "Arda Güler", "Brahim Díaz", "Endrick", "Antonio Rüdiger", "Éder Militão", "Dani Carvajal", "Ferland Mendy", "Lucas Vázquez", "Fran García", "Thibaut Courtois", "Andriy Lunin"]
  },
  mancity: {
    isim: "Manchester City",
    aliases: ["manchestercity", "mancity", "city"],
    ulke: "İngiltere", lig: "Premier League",
    dizilis: "4-1-4-1", atilanGol: 102, golBasina: 2.68, yenilenGol: 30, yenilenBasina: 0.79,
    att: "Erling Haaland", attGa90: 1.15, altAtt: "Phil Foden",
    mid: "Kevin De Bruyne / Bernardo Silva / Rodri", midGa90: 0.72,
    def: "Rúben Dias / Joško Gvardiol", defGa90: 0.15,
    gk: "Ederson", gkGa90: 0.03,
    kadro: ["Erling Haaland", "Phil Foden", "Kevin De Bruyne", "Bernardo Silva", "Rodri", "Jack Grealish", "İlkay Gündoğan", "Jérémy Doku", "Savinho", "Mateo Kovačić", "Matheus Nunes", "Rúben Dias", "Joško Gvardiol", "Manuel Akanji", "John Stones", "Kyle Walker", "Nathan Aké", "Ederson", "Stefan Ortega"]
  },
  arsenal: {
    isim: "Arsenal",
    aliases: ["arsenal", "gunners"],
    ulke: "İngiltere", lig: "Premier League",
    dizilis: "4-3-3", atilanGol: 90, golBasina: 2.37, yenilenGol: 28, yenilenBasina: 0.74,
    att: "Kai Havertz", attGa90: 0.85, altAtt: "Gabriel Jesus / Bukayo Saka",
    mid: "Martin Ødegaard / Declan Rice", midGa90: 0.68,
    def: "William Saliba / Gabriel Magalhães", defGa90: 0.14,
    gk: "David Raya", gkGa90: 0.03,
    kadro: ["Bukayo Saka", "Kai Havertz", "Gabriel Martinelli", "Martin Ødegaard", "Declan Rice", "Mikel Merino", "Thomas Partey", "Leandro Trossard", "Gabriel Jesus", "Raheem Sterling", "Jorginho", "William Saliba", "Gabriel Magalhães", "Jurriën Timber", "Ben White", "Riccardo Calafiori", "Oleksandr Zinchenko", "David Raya", "Neto"]
  },
  liverpool: {
    isim: "Liverpool",
    aliases: ["liverpool", "lfc"],
    ulke: "İngiltere", lig: "Premier League",
    dizilis: "4-3-3", atilanGol: 92, golBasina: 2.42, yenilenGol: 30, yenilenBasina: 0.79,
    att: "Mohamed Salah / Darwin Núñez", attGa90: 0.95, altAtt: "Diogo Jota / Cody Gakpo",
    mid: "Alexis Mac Allister / Dominik Szoboszlai", midGa90: 0.60,
    def: "Virgil van Dijk / Trent Alexander-Arnold", defGa90: 0.18,
    gk: "Alisson Becker", gkGa90: 0.03,
    kadro: ["Mohamed Salah", "Luis Díaz", "Darwin Núñez", "Diogo Jota", "Cody Gakpo", "Federico Chiesa", "Alexis Mac Allister", "Ryan Gravenberch", "Dominik Szoboszlai", "Curtis Jones", "Harvey Elliott", "Wataru Endo", "Virgil van Dijk", "Ibrahima Konaté", "Trent Alexander-Arnold", "Andrew Robertson", "Kostas Tsimikas", "Joe Gomez", "Alisson Becker", "Caoimhín Kelleher"]
  },
  barcelona: {
    isim: "Barcelona",
    aliases: ["barcelona", "barca", "barça"],
    ulke: "İspanya", lig: "La Liga",
    dizilis: "4-2-3-1", atilanGol: 96, golBasina: 2.53, yenilenGol: 32, yenilenBasina: 0.84,
    att: "Robert Lewandowski", attGa90: 1.05, altAtt: "Lamine Yamal / Ferran Torres",
    mid: "Raphinha / Dani Olmo / Pedri", midGa90: 0.78,
    def: "Pau Cubarsí / Jules Koundé", defGa90: 0.14,
    gk: "Wojciech Szczęsny", gkGa90: 0.03,
    kadro: ["Robert Lewandowski", "Lamine Yamal", "Raphinha", "Dani Olmo", "Pedri", "Gavi", "Frenkie de Jong", "Marc Casadó", "Fermín López", "Ferran Torres", "Ansu Fati", "Pau Cubarsí", "Iñigo Martínez", "Jules Koundé", "Alejandro Balde", "Ronald Araújo", "Andreas Christensen", "Wojciech Szczęsny", "Marc-André ter Stegen", "Iñaki Peña"]
  },
  bayern: {
    isim: "Bayern München",
    aliases: ["bayern", "bayern munich", "bayern münchen"],
    ulke: "Almanya", lig: "Bundesliga",
    dizilis: "4-2-3-1", atilanGol: 100, golBasina: 2.94, yenilenGol: 32, yenilenBasina: 0.94,
    att: "Harry Kane", attGa90: 1.12, altAtt: "Mathys Tel",
    mid: "Jamal Musiala / Michael Olise", midGa90: 0.80,
    def: "Dayot Upamecano / Kim Min-jae", defGa90: 0.12,
    gk: "Manuel Neuer", gkGa90: 0.03,
    kadro: ["Harry Kane", "Jamal Musiala", "Michael Olise", "Serge Gnabry", "Leroy Sané", "Kingsley Coman", "Mathys Tel", "Joshua Kimmich", "Aleksandar Pavlović", "Leon Goretzka", "João Palhinha", "Konrad Laimer", "Kim Min-jae", "Dayot Upamecano", "Alphonso Davies", "Raphaël Guerreiro", "Eric Dier", "Hiroki Ito", "Manuel Neuer", "Sven Ulreich"]
  },
  inter: {
    isim: "Inter Milan",
    aliases: ["inter", "inter milan", "internazionale"],
    ulke: "İtalya", lig: "Serie A",
    dizilis: "3-5-2", atilanGol: 88, golBasina: 2.32, yenilenGol: 26, yenilenBasina: 0.68,
    att: "Lautaro Martínez", attGa90: 0.90, altAtt: "Marcus Thuram / Mehdi Taremi",
    mid: "Nicolò Barella / Hakan Çalhanoğlu", midGa90: 0.58,
    def: "Alessandro Bastoni / Benjamin Pavard", defGa90: 0.14,
    gk: "Yann Sommer", gkGa90: 0.03,
    kadro: ["Lautaro Martínez", "Marcus Thuram", "Mehdi Taremi", "Marko Arnautović", "Nicolò Barella", "Hakan Çalhanoğlu", "Henrikh Mkhitaryan", "Davide Frattesi", "Piotr Zieliński", "Kristjan Asllani", "Federico Dimarco", "Denzel Dumfries", "Matteo Darmian", "Carlos Augusto", "Alessandro Bastoni", "Benjamin Pavard", "Stefan de Vrij", "Francesco Acerbi", "Yann Bisseck", "Yann Sommer", "Josep Martínez"]
  },
  juventus: {
    isim: "Juventus",
    aliases: ["juventus", "juve"],
    ulke: "İtalya", lig: "Serie A",
    dizilis: "4-2-3-1", atilanGol: 72, golBasina: 1.89, yenilenGol: 28, yenilenBasina: 0.74,
    att: "Dušan Vlahović", attGa90: 0.78, altAtt: "Arkadiusz Milik",
    mid: "Kenan Yıldız / Teun Koopmeiners", midGa90: 0.55,
    def: "Bremer / Federico Gatti", defGa90: 0.12,
    gk: "Michele Di Gregorio", gkGa90: 0.03,
    kadro: ["Dušan Vlahović", "Kenan Yıldız", "Nicolás González", "Francisco Conceição", "Teun Koopmeiners", "Douglas Luiz", "Manuel Locatelli", "Khéphren Thuram", "Weston McKennie", "Timothy Weah", "Samuel Mbangula", "Andrea Cambiaso", "Bremer", "Federico Gatti", "Pierre Kalulu", "Nicolò Savona", "Juan Cabal", "Danilo", "Michele Di Gregorio", "Mattia Perin"]
  },
  milan: {
    isim: "AC Milan",
    aliases: ["acmilan", "milan"],
    ulke: "İtalya", lig: "Serie A",
    dizilis: "4-2-3-1", atilanGol: 76, golBasina: 2.00, yenilenGol: 38, yenilenBasina: 1.00,
    att: "Álvaro Morata", attGa90: 0.74, altAtt: "Tammy Abraham / Luka Jović",
    mid: "Rafael Leão / Christian Pulisic", midGa90: 0.72,
    def: "Theo Hernández / Fikayo Tomori", defGa90: 0.16,
    gk: "Mike Maignan", gkGa90: 0.03,
    kadro: ["Álvaro Morata", "Rafael Leão", "Christian Pulisic", "Tammy Abraham", "Samuel Chukwueze", "Noah Okafor", "Luka Jović", "Tijjani Reijnders", "Youssouf Fofana", "Ruben Loftus-Cheek", "Yunus Musah", "Ismaël Bennacer", "Theo Hernández", "Fikayo Tomori", "Strahinja Pavlović", "Emerson Royal", "Matteo Gabbia", "Malick Thiaw", "Davide Calabria", "Mike Maignan", "Marco Sportiello"]
  },
  psg: {
    isim: "Paris Saint-Germain",
    aliases: ["psg", "paris", "parissaintgermain"],
    ulke: "Fransa", lig: "Ligue 1",
    dizilis: "4-3-3", atilanGol: 88, golBasina: 2.58, yenilenGol: 32, yenilenBasina: 0.94,
    att: "Bradley Barcola", attGa90: 0.82, altAtt: "Gonçalo Ramos / Randal Kolo Muani",
    mid: "Ousmane Dembélé / Vitinha", midGa90: 0.65,
    def: "Marquinhos / Willian Pacho", defGa90: 0.12,
    gk: "Gianluigi Donnarumma", gkGa90: 0.03,
    kadro: ["Bradley Barcola", "Ousmane Dembélé", "Gonçalo Ramos", "Randal Kolo Muani", "Marco Asensio", "Lee Kang-in", "Vitinha", "João Neves", "Warren Zaïre-Emery", "Fabián Ruiz", "Senny Mayulu", "Marquinhos", "Willian Pacho", "Lucas Beraldo", "Lucas Hernández", "Achraf Hakimi", "Nuno Mendes", "Gianluigi Donnarumma", "Matvey Safonov"]
  },
  chelsea: {
    isim: "Chelsea",
    aliases: ["chelsea"],
    ulke: "İngiltere", lig: "Premier League",
    dizilis: "4-2-3-1", atilanGol: 80, golBasina: 2.10, yenilenGol: 42, yenilenBasina: 1.10,
    att: "Nicolas Jackson", attGa90: 0.78, altAtt: "Christopher Nkunku",
    mid: "Cole Palmer / Enzo Fernández", midGa90: 0.75,
    def: "Levi Colwill / Marc Cucurella", defGa90: 0.12,
    gk: "Robert Sánchez", gkGa90: 0.03,
    kadro: ["Nicolas Jackson", "Christopher Nkunku", "Cole Palmer", "Noni Madueke", "Pedro Neto", "Jadon Sancho", "Mykhailo Mudryk", "João Félix", "Enzo Fernández", "Moisés Caicedo", "Roméo Lavia", "Kiernan Dewsbury-Hall", "Levi Colwill", "Wesley Fofana", "Tosin Adarabioyo", "Marc Cucurella", "Malo Gusto", "Reece James", "Robert Sánchez", "Filip Jørgensen"]
  },
  sporting: {
    isim: "Sporting CP",
    aliases: ["sporting", "sportingcp", "sportinglisbon"],
    ulke: "Portekiz", lig: "Primeira Liga",
    dizilis: "3-4-2-1", atilanGol: 92, golBasina: 2.70, yenilenGol: 24, yenilenBasina: 0.70,
    att: "Viktor Gyökeres", attGa90: 1.12, altAtt: "Conrad Harder",
    mid: "Pedro Gonçalves / Francisco Trincão", midGa90: 0.68,
    def: "Gonçalo Inácio / Ousmane Diomande", defGa90: 0.12,
    gk: "Franco Israel", gkGa90: 0.03,
    kadro: ["Viktor Gyökeres", "Pedro Gonçalves", "Francisco Trincão", "Marcus Edwards", "Conrad Harder", "Geovany Quenda", "Morten Hjulmand", "Hidemasa Morita", "Daniel Bragança", "Gonçalo Inácio", "Ousmane Diomande", "Zeno Debast", "Matheus Reis", "Nuno Santos", "Franco Israel", "Vladan Kovačević"]
  },
  benfica: {
    isim: "Benfica",
    aliases: ["benfica", "slb"],
    ulke: "Portekiz", lig: "Primeira Liga",
    dizilis: "4-3-3", atilanGol: 84, golBasina: 2.47, yenilenGol: 28, yenilenBasina: 0.82,
    att: "Vangelis Pavlidis", attGa90: 0.82, altAtt: "Arthur Cabral",
    mid: "Kerem Aktürkoğlu / Orkun Kökçü", midGa90: 0.80,
    def: "Nicolás Otamendi / António Silva", defGa90: 0.14,
    gk: "Anatoliy Trubin", gkGa90: 0.03,
    kadro: ["Vangelis Pavlidis", "Kerem Aktürkoğlu", "Orkun Kökçü", "Ángel Di María", "Florentino Luís", "Nicolás Otamendi", "António Silva", "Anatoliy Trubin"]
  },
  leverkusen: {
    isim: "Bayer Leverkusen",
    aliases: ["leverkusen", "bayerleverkusen"],
    ulke: "Almanya", lig: "Bundesliga",
    dizilis: "3-4-2-1", atilanGol: 88, golBasina: 2.58, yenilenGol: 34, yenilenBasina: 1.00,
    att: "Victor Boniface", attGa90: 0.86, altAtt: "Patrik Schick",
    mid: "Florian Wirtz / Granit Xhaka", midGa90: 0.82,
    def: "Jonathan Tah / Jeremie Frimpong", defGa90: 0.20,
    gk: "Lukáš Hrádecký", gkGa90: 0.03,
    kadro: ["Victor Boniface", "Patrik Schick", "Florian Wirtz", "Granit Xhaka", "Jeremie Frimpong", "Alejandro Grimaldo", "Robert Andrich", "Jonathan Tah", "Lukáš Hrádecký"]
  },
  dortmund: {
    isim: "Borussia Dortmund",
    aliases: ["dortmund", "borussiadortmund", "bvb"],
    ulke: "Almanya", lig: "Bundesliga",
    dizilis: "4-2-3-1", atilanGol: 80, golBasina: 2.35, yenilenGol: 40, yenilenBasina: 1.17,
    att: "Serhou Guirassy", attGa90: 0.88, altAtt: "Maximilian Beier",
    mid: "Julian Brandt / Marcel Sabitzer", midGa90: 0.64,
    def: "Nico Schlotterbeck / Waldemar Anton", defGa90: 0.12,
    gk: "Gregor Kobel", gkGa90: 0.03,
    kadro: ["Serhou Guirassy", "Karim Adeyemi", "Julian Brandt", "Marcel Sabitzer", "Donyell Malen", "Pascal Groß", "Nico Schlotterbeck", "Waldemar Anton", "Gregor Kobel"]
  },
  atletico: {
    isim: "Atlético Madrid",
    aliases: ["atletico", "atleticomadrid"],
    ulke: "İspanya", lig: "La Liga",
    dizilis: "3-5-2", atilanGol: 78, golBasina: 2.05, yenilenGol: 30, yenilenBasina: 0.79,
    att: "Julián Álvarez", attGa90: 0.85, altAtt: "Alexander Sørloth",
    mid: "Antoine Griezmann / Rodrigo De Paul", midGa90: 0.70,
    def: "Robin Le Normand / José María Giménez", defGa90: 0.12,
    gk: "Jan Oblak", gkGa90: 0.03,
    kadro: ["Julián Álvarez", "Alexander Sørloth", "Antoine Griezmann", "Conor Gallagher", "Rodrigo De Paul", "Koke", "Robin Le Normand", "José María Giménez", "Jan Oblak"]
  },
  tottenham: {
    isim: "Tottenham Hotspur",
    aliases: ["tottenham", "spurs"],
    ulke: "İngiltere", lig: "Premier League",
    dizilis: "4-3-3", atilanGol: 78, golBasina: 2.05, yenilenGol: 45, yenilenBasina: 1.18,
    att: "Dominic Solanke", attGa90: 0.76, altAtt: "Richarlison",
    mid: "Son Heung-min / James Maddison", midGa90: 0.74,
    def: "Cristian Romero / Micky van de Ven", defGa90: 0.14,
    gk: "Guglielmo Vicario", gkGa90: 0.03,
    kadro: ["Dominic Solanke", "Son Heung-min", "James Maddison", "Dejan Kulusevski", "Brennan Johnson", "Pape Matar Sarr", "Cristian Romero", "Micky van de Ven", "Guglielmo Vicario"]
  },
  astonvilla: {
    isim: "Aston Villa",
    aliases: ["astonvilla", "villa"],
    ulke: "İngiltere", lig: "Premier League",
    dizilis: "4-2-3-1", atilanGol: 76, golBasina: 2.00, yenilenGol: 44, yenilenBasina: 1.15,
    att: "Ollie Watkins", attGa90: 0.82, altAtt: "Jhon Durán",
    mid: "Morgan Rogers / Youri Tielemans", midGa90: 0.60,
    def: "Ezri Konsa / Pau Torres", defGa90: 0.12,
    gk: "Emiliano Martínez", gkGa90: 0.03,
    kadro: ["Ollie Watkins", "Jhon Durán", "Morgan Rogers", "Leon Bailey", "Youri Tielemans", "John McGinn", "Ezri Konsa", "Pau Torres", "Lucas Digne", "Emiliano Martínez"]
  },
  napoli: {
    isim: "Napoli",
    aliases: ["napoli"],
    ulke: "İtalya", lig: "Serie A",
    dizilis: "4-3-3", atilanGol: 74, golBasina: 1.95, yenilenGol: 28, yenilenBasina: 0.74,
    att: "Romelu Lukaku", attGa90: 0.82, altAtt: "Giacomo Raspadori",
    mid: "Khvicha Kvaratskhelia / Scott McTominay", midGa90: 0.68,
    def: "Alessandro Buongiorno / Giovanni Di Lorenzo", defGa90: 0.14,
    gk: "Alex Meret", gkGa90: 0.03,
    kadro: ["Romelu Lukaku", "Khvicha Kvaratskhelia", "Matteo Politano", "Scott McTominay", "Stanislav Lobotka", "Frank Anguissa", "Alessandro Buongiorno", "Giovanni Di Lorenzo", "Alex Meret"]
  },
  roma: {
    isim: "AS Roma",
    aliases: ["roma", "asroma"],
    ulke: "İtalya", lig: "Serie A",
    dizilis: "3-4-2-1", atilanGol: 68, golBasina: 1.78, yenilenGol: 38, yenilenBasina: 1.00,
    att: "Artem Dovbyk", attGa90: 0.74, altAtt: "Eldor Shomurodov",
    mid: "Paulo Dybala / Lorenzo Pellegrini", midGa90: 0.64,
    def: "Gianluca Mancini / Evan Ndicka", defGa90: 0.12,
    gk: "Mile Svilar", gkGa90: 0.03,
    kadro: ["Artem Dovbyk", "Paulo Dybala", "Lorenzo Pellegrini", "Matías Soulé", "Manu Koné", "Bryan Cristante", "Gianluca Mancini", "Evan Ndicka", "Angeliño", "Mile Svilar"]
  },
  porto: {
    isim: "FC Porto",
    aliases: ["porto", "fcporto"],
    ulke: "Portekiz", lig: "Primeira Liga",
    dizilis: "4-2-3-1", atilanGol: 82, golBasina: 2.41, yenilenGol: 26, yenilenBasina: 0.76,
    att: "Samu Omorodion", attGa90: 0.85, altAtt: "Danny Namaso",
    mid: "Galeno / Nico González", midGa90: 0.62,
    def: "Nehuén Pérez / Zé Pedro", defGa90: 0.12,
    gk: "Diogo Costa", gkGa90: 0.03,
    kadro: ["Samu Omorodion", "Galeno", "Pepê", "Nico González", "Alan Varela", "Nehuén Pérez", "João Mário", "Diogo Costa"]
  },
  ajax: {
    isim: "Ajax",
    aliases: ["ajax"],
    ulke: "Hollanda", lig: "Eredivisie",
    dizilis: "4-3-3", atilanGol: 76, golBasina: 2.23, yenilenGol: 38, yenilenBasina: 1.11,
    att: "Wout Weghorst / Brian Brobbey", attGa90: 0.72, altAtt: "Chuba Akpom",
    mid: "Kenneth Taylor / Jordan Henderson", midGa90: 0.48,
    def: "Josip Šutalo / Jorrel Hato", defGa90: 0.14,
    gk: "Remko Pasveer", gkGa90: 0.03,
    kadro: ["Wout Weghorst", "Brian Brobbey", "Chuba Akpom", "Bertrand Traoré", "Kenneth Taylor", "Jordan Henderson", "Kian Fitz-Jim", "Josip Šutalo", "Jorrel Hato", "Remko Pasveer"]
  },
  newcastle: {
    isim: "Newcastle United",
    aliases: ["newcastle", "newcastleunited"],
    ulke: "İngiltere", lig: "Premier League",
    dizilis: "4-3-3", atilanGol: 74, golBasina: 1.95, yenilenGol: 46, yenilenBasina: 1.21,
    att: "Alexander Isak", attGa90: 0.84, altAtt: "Callum Wilson",
    mid: "Anthony Gordon / Bruno Guimarães", midGa90: 0.62,
    def: "Fabian Schär / Dan Burn", defGa90: 0.12,
    gk: "Nick Pope", gkGa90: 0.03,
    kadro: ["Alexander Isak", "Anthony Gordon", "Harvey Barnes", "Bruno Guimarães", "Joelinton", "Sandro Tonali", "Fabian Schär", "Dan Burn", "Tino Livramento", "Nick Pope"]
  },
  manutd: {
    isim: "Manchester United",
    aliases: ["manchesterunited", "manutd", "united"],
    ulke: "İngiltere", lig: "Premier League",
    dizilis: "4-2-3-1", atilanGol: 66, golBasina: 1.74, yenilenGol: 48, yenilenBasina: 1.26,
    att: "Rasmus Højlund / Joshua Zirkzee", attGa90: 0.68, altAtt: "Marcus Rashford",
    mid: "Bruno Fernandes / Alejandro Garnacho", midGa90: 0.64,
    def: "Matthijs de Ligt / Lisandro Martínez", defGa90: 0.12,
    gk: "André Onana", gkGa90: 0.03,
    kadro: ["Rasmus Højlund", "Joshua Zirkzee", "Marcus Rashford", "Alejandro Garnacho", "Bruno Fernandes", "Kobbie Mainoo", "Manuel Ugarte", "Matthijs de Ligt", "Lisandro Martínez", "André Onana"]
  }
};

function findTeamData(targetName) {
  if (!targetName) return null;
  const norm = sade(targetName.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const [key, data] of Object.entries(TEAMS_DATABASE)) {
    const keyNorm = sade(key.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const nameNorm = sade((data.isim || "").toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (norm === keyNorm || norm === nameNorm || norm.includes(keyNorm) || keyNorm.includes(norm) || norm.includes(nameNorm) || nameNorm.includes(norm)) {
      return data;
    }
    if (data.aliases) {
      for (const al of data.aliases) {
        const alNorm = sade(al.toLowerCase().replace(/[^a-z0-9]/g, ""));
        if (norm === alNorm || norm.includes(alNorm) || alNorm.includes(norm)) {
          return data;
        }
      }
    }
  }
  return null;
}

// WhoScored / Opta Stili Akıllı Taktik ve Oynayış Tarzı Motoru
function getTacticalData(teamData, targetName, atilanGol, yenilenGol, dizilis, kadro) {
  if (teamData && teamData.felsefe) {
    return {
      felsefe: teamData.felsefe,
      hucumStili: teamData.hucumStili,
      savunmaStili: teamData.savunmaStili,
      tempo: teamData.tempo,
      topaSahipOlma: teamData.topaSahipOlma,
      presSiddeti: teamData.presSiddeti,
      xgMac: teamData.xgMac,
      gucluYonler: teamData.gucluYonler,
      zayifYonler: teamData.zayifYonler,
      anaDizilis: teamData.anaDizilis || teamData.dizilis || "4-2-3-1",
      altDizilis: teamData.altDizilis || "4-3-3",
      kadroDetay: teamData.kadroDetay || null
    };
  }

  // Kulüp veritabanında özel profil yoksa matematiksel WhoScored profil üretici
  const seed = hashStr((targetName || "kulup").toLowerCase());
  const possess = Math.min(65, Math.max(45, Math.round(48 + (atilanGol / 38 - 1.2) * 11 + (seed % 5))));
  const xG = (atilanGol / 38 * 0.94).toFixed(2);
  const isHighPress = possess >= 54;

  return {
    felsefe: isHighPress ? "Ön Alanda Agresif Pres & Dominant Topa Sahip Olma" : "Disiplinli Kompakt Alan Savunması & Hızlı Geçiş Hücumu",
    hucumStili: isHighPress ? "Kısa pas kombinasyonları, kanat bindirmeleri ve ceza sahası içi şut tehdidi" : "Dikey kontra paslar, hızlı hücum kanatları ve duran top fırsatçılığı",
    savunmaStili: isHighPress ? "Yüksek savunma çizgisi ve ön blokta şok karşılama" : "Kompakt çift hatlı orta blok ve ceza sahası emniyeti",
    tempo: isHighPress ? "Yüksek & Yoğun Baskılı Tempo" : "Kontrollü & Fırsatçı Geçiş Temposu",
    topaSahipOlma: `%${possess}`,
    presSiddeti: isHighPress ? "Yüksek (PPDA: 8.4)" : "Orta Blok (PPDA: 11.2)",
    xgMac: xG,
    gucluYonler: [
      "Hızlı geçiş hücumları ve kontra fırsatçılığı",
      "Duran top organizasyonları ve hava topu üstünlüğü",
      "Taktiksel sadakat ve takım dayanışması"
    ],
    zayifYonler: [
      "Top kaybı sonrası geniş alanda yakalanma riski",
      "Kapanan rakiplere karşı set oyununda üretim zorluğu"
    ],
    anaDizilis: dizilis || "4-2-3-1",
    altDizilis: "4-3-3",
    kadroDetay: (kadro && kadro.length >= 8) ? {
      kaleciler: [kadro[kadro.length - 1] || "As Kaleci"],
      defans: kadro.slice(0, 3),
      ortasaha: kadro.slice(3, 6),
      kanat_forvet: kadro.slice(6, kadro.length - 1)
    } : null
  };
}

// Hedef Takımın Gerçek Mevcut Oyuncusu (Incumbent), Aktif Kadrosu ve Taktik Bilgisi
function getTargetTeamProfile(targetName, posGrp = "ATT", playerName = "") {
  const teamData = findTeamData(targetName);
  
  let incumbentName = "Mevcut As Forvet";
  let incumbentGa90 = 0.55;
  let atilanGol = 70;
  let golBasina = 1.95;
  let yenilenGol = 36;
  let yenilenBasina = 1.0;
  let dizilis = "4-2-3-1";
  let kadro = [];
  let isim = targetName;

  if (teamData) {
    isim = teamData.isim;
    atilanGol = teamData.atilanGol;
    golBasina = teamData.golBasina;
    yenilenGol = teamData.yenilenGol;
    yenilenBasina = teamData.yenilenBasina;
    dizilis = teamData.dizilis;
    kadro = teamData.kadro || [];

    const pNorm = sade((playerName || "").toLowerCase());
    
    if (posGrp === "DEF") {
      incumbentName = teamData.def || "As Stoper";
      incumbentGa90 = teamData.defGa90 || 0.12;
    } else if (posGrp === "GK") {
      incumbentName = teamData.gk || "As Kaleci";
      incumbentGa90 = teamData.gkGa90 || 0.03;
    } else if (posGrp === "MID") {
      incumbentName = teamData.mid || "As Orta Saha";
      incumbentGa90 = teamData.midGa90 || 0.45;
    } else {
      // ATT / Forvet
      incumbentName = teamData.att;
      incumbentGa90 = teamData.attGa90;
      
      // Eğer analiz edilen oyuncu zaten o takımın as forvetiyse alternatif yıldızla kıyasla
      const firstName = sade(incumbentName.split(" ")[0].toLowerCase());
      if (pNorm && (pNorm.includes(firstName) || firstName.includes(pNorm))) {
        if (teamData.altAtt) {
          incumbentName = teamData.altAtt;
          incumbentGa90 = Math.round(teamData.attGa90 * 0.85 * 100) / 100;
        }
      }
    }
  } else {
    // Genel / Bilinmeyen Takım fallback
    if (posGrp === "DEF") { incumbentName = "Mevcut As Stoper"; incumbentGa90 = 0.10; }
    else if (posGrp === "GK") { incumbentName = "Mevcut As Kaleci"; incumbentGa90 = 0.03; }
    else if (posGrp === "MID") { incumbentName = "Mevcut As Orta Saha"; incumbentGa90 = 0.38; }
    else { incumbentName = "Mevcut As Forvet"; incumbentGa90 = 0.55; }
  }

  const taktik = getTacticalData(teamData, targetName, atilanGol, yenilenGol, dizilis, kadro);

  return { isim, incumbentName, incumbentGa90, atilanGol, golBasina, yenilenGol, yenilenBasina, dizilis, kadro, taktik };
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

  let takimlar = [];
  const sdbData = await sdbGet(`searchteams.php?t=${encodeURIComponent(clean)}`);
  if (sdbData && sdbData.teams && sdbData.teams.length > 0) {
    takimlar = sdbData.teams.slice(0, 6).map(t => ({
      id: t.idTeam,
      isim: t.strTeam,
      logo: t.strBadge || t.strLogo || "",
      ulke: trUlke(t.strCountry)
    }));
  }

  // Yerel güncel veritabanından tamamlayıcı takımları ekle
  const qNorm = sade(clean.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const [k, d] of Object.entries(TEAMS_DATABASE)) {
    const dNorm = sade(d.isim.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const matchAlias = d.aliases && d.aliases.some(a => sade(a.toLowerCase()).includes(qNorm));
    if (dNorm.includes(qNorm) || matchAlias) {
      if (!takimlar.some(x => sade(x.isim.toLowerCase()).includes(dNorm))) {
        takimlar.unshift({
          id: `team_${k}`,
          isim: d.isim,
          logo: "",
          ulke: d.ulke || "Türkiye"
        });
      }
    }
  }

  takimlar = takimlar.slice(0, 8);
  setCache(cKey, takimlar);
  return takimlar;
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
export async function analyzePlayerAndTeam(pid, hedefAdi) {
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
  const teamProfile = getTargetTeamProfile(cleanHedef, posGrp, pName);
  const tName = tRaw ? tRaw.strTeam : (teamProfile.isim || cleanHedef);
  const tLogo = tRaw ? (tRaw.strBadge || tRaw.strLogo || "") : "";
  const tCountry = tRaw ? trUlke(tRaw.strCountry) : (teamProfile.ulke || "Türkiye");
  const tLeague = tRaw ? (tRaw.strLeague || "Süper Lig") : (teamProfile.lig || "Süper Lig");

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
    dizilis: teamProfile.dizilis,
    kadro: teamProfile.kadro || []
  };

  // Rol Uyumu (Hedef takımın mevcut mevkidaşına göre kıyaslama)
  const rol = Math.min(oyuncu.ga90 / Math.max(teamProfile.incumbentGa90, 0.05), 1.3) / 1.3;

  // Monte Carlo Modelini Çalıştır
  const toplamMac = 76;
  const result = runModel(oyuncu, pStats.injuryEpisodes, pStats.missedMatches, toplamMac, hedef, rol);

  // Radarı ve Diğer Alanları Hesapla
  result.radar = calculateCustomRadar(pName, pStats.rating, pStats.ga90, posGrp);
  result.heat = oyuncu.pozisyon;
  result.incumbent = { isim: teamProfile.incumbentName, ga90: teamProfile.incumbentGa90 };
  result.taktik = teamProfile.taktik;
  
  // Takıma kattığı net değer
  const benchmarkVal = (posGrp === "DEF" || posGrp === "GK")
    ? 22
    : Math.round(teamProfile.incumbentGa90 * 34);
  const netKatki = result.sim.ga_med - benchmarkVal;
  result.katki = netKatki;
  result.birim = (posGrp === "DEF" || posGrp === "GK")
    ? { ad: "Savunma Puanı", esik1: 15, esik2: 25 }
    : { ad: "Gol+Asist", esik1: 20, esik2: 30 };

  // Ekstrem Taktik & Scouting Kokpiti Paketi (Transfermarkt, Opta Radar, Düello, Deplasman, Moneyball, Sakatlık, FFP)
  result.ekstrem = generateExtremeScoutingPackage(oyuncu, hedef, teamProfile, pStats, result.sim);
  result.piyasa = result.ekstrem.piyasa;

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
