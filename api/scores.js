// Vercel Serverless Function (Node.js) — Canlı Skorlar / Maç İstatistikleri.
// Aynı API_KEY (api-sports.io v3 football) kullanılır.
//   GET /api/scores?date=YYYY-MM-DD   → o güne ait maçlar (takip edilen ligler, canlı dahil)
//   GET /api/scores?fixture=<id>      → tek maç detay: istatistik + kadro + olaylar

const API_KEY = process.env.API_KEY || "";
const BASE = "https://v3.football.api-sports.io";

// Takip edilen ligler: Süper Lig + büyük Avrupa ligleri + Şampiyonlar Ligi
const LEAGUES = {
  203: "Süper Lig",
  39: "Premier League",
  140: "La Liga",
  135: "Serie A",
  78: "Bundesliga",
  61: "Ligue 1",
  2: "UEFA Şampiyonlar Ligi",
};

async function apiGet(path, params) {
  const qs = new URLSearchParams(params).toString();
  try {
    const r = await fetch(`${BASE}/${path}?${qs}`, { headers: { "x-apisports-key": API_KEY } });
    if (!r.ok) return [];
    const j = await r.json();
    return j.response ?? [];
  } catch (e) { return []; }
}

function sadeMac(f) {
  return {
    id: f.fixture.id,
    tarih: f.fixture.date,
    durum: f.fixture.status.short,      // NS, 1H, HT, 2H, FT, PST, CANC...
    durumUzun: f.fixture.status.long,
    dakika: f.fixture.status.elapsed,
    lig: { id: f.league.id, ad: LEAGUES[f.league.id] || f.league.name, logo: f.league.logo, tur: f.league.round },
    evSahibi: { id: f.teams.home.id, ad: f.teams.home.name, logo: f.teams.home.logo, kazandi: f.teams.home.winner },
    deplasman: { id: f.teams.away.id, ad: f.teams.away.name, logo: f.teams.away.logo, kazandi: f.teams.away.winner },
    skor: { ev: f.goals.home, dep: f.goals.away },
  };
}

const CANLI = new Set(["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]);

async function listeGetir(res, date) {
  const [gunMaclari, canliMaclar] = await Promise.all([
    apiGet("fixtures", { date, timezone: "Europe/Istanbul" }),
    apiGet("fixtures", { live: "all" }),
  ]);
  const map = new Map();
  for (const f of gunMaclari) if (LEAGUES[f.league.id]) map.set(f.fixture.id, f);
  for (const f of canliMaclar) if (LEAGUES[f.league.id]) map.set(f.fixture.id, f); // canlı veri daha güncel, üzerine yazar

  const maclar = [...map.values()].map(sadeMac).sort((a, b) => new Date(a.tarih) - new Date(b.tarih));
  const ligler = {};
  for (const m of maclar) {
    const k = m.lig.id;
    if (!ligler[k]) ligler[k] = { id: k, ad: m.lig.ad, logo: m.lig.logo, maclar: [] };
    ligler[k].maclar.push(m);
  }
  const siraliLigIds = Object.keys(LEAGUES).map(Number);
  const gruplar = siraliLigIds.map(id => ligler[id]).filter(Boolean);
  res.status(200).json({ ok: true, tarih: date, gruplar, canliSayisi: maclar.filter(m => CANLI.has(m.durum)).length });
}

const STAT_TR = {
  "Shots on Goal": "İsabetli Şut", "Shots off Goal": "İsabetsiz Şut", "Total Shots": "Toplam Şut",
  "Blocked Shots": "Engellenen Şut", "Shots insidebox": "Ceza Sahası İçi Şut", "Shots outsidebox": "Ceza Sahası Dışı Şut",
  "Fouls": "Faul", "Corner Kicks": "Korner", "Offsides": "Ofsayt", "Ball Possession": "Topa Sahip Olma",
  "Yellow Cards": "Sarı Kart", "Red Cards": "Kırmızı Kart", "Goalkeeper Saves": "Kaleci Kurtarışı",
  "Total passes": "Toplam Pas", "Passes accurate": "İsabetli Pas", "Passes %": "Pas İsabeti",
  "expected_goals": "Beklenen Gol (xG)", "goals_prevented": "Önlenen Gol",
};

async function detayGetir(res, fixtureId) {
  const [stats, lineups, events] = await Promise.all([
    apiGet("fixtures/statistics", { fixture: fixtureId }),
    apiGet("fixtures/lineups", { fixture: fixtureId }),
    apiGet("fixtures/events", { fixture: fixtureId }),
  ]);

  const istatistik = stats.map(t => ({
    takim: t.team.name, takimLogo: t.team.logo,
    kalemler: (t.statistics || []).map(s => ({ tip: STAT_TR[s.type] || s.type, deger: s.value })),
  }));

  const kadrolar = lineups.map(l => ({
    takim: l.team.name, takimLogo: l.team.logo, dizilis: l.formation,
    ilk11: (l.startXI || []).map(x => ({ no: x.player.number, isim: x.player.name, poz: x.player.pos })),
    yedekler: (l.substitutes || []).map(x => ({ no: x.player.number, isim: x.player.name, poz: x.player.pos })),
    teknikDirektor: l.coach ? l.coach.name : null,
  }));

  const olaylar = events.map(e => ({
    dakika: e.time.elapsed, ekDakika: e.time.extra,
    tip: e.type, detay: e.detail, takim: e.team.name, takimLogo: e.team.logo,
    oyuncu: e.player ? e.player.name : null, yardimci: e.assist ? e.assist.name : null,
  })).sort((a, b) => (a.dakika + (a.ekDakika || 0) / 100) - (b.dakika + (b.ekDakika || 0) / 100));

  res.status(200).json({ ok: true, istatistik, kadrolar, olaylar });
}

export default async function handler(req, res) {
  if (!API_KEY) return res.status(200).json({ ok: false, error: "API_KEY tanımlı değil (sunucu ortam değişkeni)." });
  try {
    const { date, fixture } = req.query;
    if (fixture) return await detayGetir(res, fixture);
    const gun = date || new Date().toISOString().slice(0, 10);
    return await listeGetir(res, gun);
  } catch (e) {
    res.status(200).json({ ok: false, error: e.message || "Bilinmeyen hata" });
  }
}
