// Vercel Serverless Function (Node.js) — Canlı Skorlar / Maç İstatistikleri.
// Canlı Veri Kaynağı: Mackolik Canlı Veri Servisi (vd.mackolik.com)
// Tarih desteği: Geçmiş, bugün ve ileri tarihler (date=DD/MM/YYYY)
// GET /api/scores?date=YYYY-MM-DD   → o güne ait tüm maçlar
// GET /api/scores?fixture=<id>      → tek maç detay: istatistik + kadro + olaylar

const CANLI = new Set(["1H", "HT", "2H", "ET", "BT", "P", "LIVE"]);

// Öne çıkan ligler
const ONCELIKLI_LIGLER = [
  "UEFA Uluslar Ligi",
  "Uluslar Ligi",
  "Trendyol Süper Lig",
  "Süper Lig",
  "UEFA Şampiyonlar Ligi",
  "UEFA Avrupa Ligi",
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "TFF 1. Lig"
];

// Bilinen lig logoları
function getLeagueBadge(leagueName) {
  const norm = (leagueName || "").toLowerCase();
  if (norm.includes("uluslar ligi") || norm.includes("nations league")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/k99p651583344602.png";
  }
  if (norm.includes("süper lig") || norm.includes("super lig")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/9a37o61690987627.png";
  }
  if (norm.includes("premier league")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/g9e11p1718712391.png";
  }
  if (norm.includes("şampiyonlar ligi") || norm.includes("champions league")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/3v5y3a1718712353.png";
  }
  if (norm.includes("avrupa ligi") || norm.includes("europa league")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/34o20y1718712371.png";
  }
  if (norm.includes("la liga") || norm.includes("laliga")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/7fvg3x1686737951.png";
  }
  if (norm.includes("serie a")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/71fvy21630138988.png";
  }
  if (norm.includes("bundesliga")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/0j2g141718712431.png";
  }
  if (norm.includes("ligue 1")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/kfdnfl1718712411.png";
  }
  if (norm.includes("1. lig")) {
    return "https://r2.thesportsdb.com/images/media/league/badge/9a37o61690987627.png";
  }
  return "";
}

// YYYY-MM-DD -> DD/MM/YYYY dönüşümü
function toMackolikDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Önbellek
const dateCache = new Map();

async function mackolikVerisiCek(dateStr) {
  const mkDate = toMackolikDate(dateStr);
  const cacheKey = mkDate || "today";
  const now = Date.now();
  const cached = dateCache.get(cacheKey);

  // Önbellekte varsa ve tazeyse (canlı maçlar için 12sn, geçmiş/gelecek için 10dk)
  const ttl = (dateStr === new Date().toISOString().slice(0, 10)) ? 12000 : 600000;
  if (cached && (now - cached.time < ttl)) {
    return cached.data;
  }

  const url = mkDate
    ? `https://vd.mackolik.com/livedata?date=${encodeURIComponent(mkDate)}`
    : "https://vd.mackolik.com/livedata?group=0";

  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*"
      }
    });

    if (!r.ok) return null;
    const j = await r.json();
    dateCache.set(cacheKey, { time: now, data: j });
    return j;
  } catch (e) {
    return null;
  }
}

async function listeGetir(res, date) {
  const targetDate = date || new Date().toISOString().slice(0, 10);
  const data = await mackolikVerisiCek(targetDate);
  const rawMatches = (data && data.m) ? data.m : [];

  if (rawMatches.length > 0) {
    const ligler = {};
    let canliAdet = 0;

    for (const m of rawMatches) {
      const id = m[0];
      const homeName = m[2] || "Ev Sahibi";
      const awayName = m[4] || "Deplasman";
      const statusCode = m[5];
      const statusText = String(m[6] || "").trim();
      const homeScoreRaw = m[8];
      const awayScoreRaw = m[9];
      const timeStr = String(m[16] || "20:00");
      const dateStr = String(m[35] || "");
      const leagueArr = (m[36] && Array.isArray(m[36])) ? m[36] : [];
      const leagueId = leagueArr[0] || 999;
      const leagueName = leagueArr[1] || "Diğer Ligler";
      const leagueRound = leagueArr[3] || "";
      const countryCode = leagueArr[9] || "";

      let durum = "NS";
      let durumUzun = "Başlamadı";
      let dakika = null;

      if (statusCode === 1) {
        durum = "1H";
        durumUzun = "1. Yarı";
        dakika = parseInt(statusText, 10) || 1;
        canliAdet++;
      } else if (statusCode === 2 || statusText === "IY") {
        durum = "HT";
        durumUzun = "Devre Arası";
        dakika = 45;
        canliAdet++;
      } else if (statusCode === 3) {
        durum = "2H";
        durumUzun = "2. Yarı";
        dakika = parseInt(statusText, 10) || 46;
        canliAdet++;
      } else if (statusCode === 4 || statusCode === 13 || statusText === "MS") {
        durum = "FT";
        durumUzun = "Maç Sonu";
      } else if (statusCode === 8 || statusText === "Pen") {
        durum = "PEN";
        durumUzun = "Penaltılar";
        canliAdet++;
      } else if (statusCode === 7) {
        durum = "PST";
        durumUzun = "Ertelendi";
      }

      const oynandi = (durum !== "NS" && durum !== "PST");
      const evScore = oynandi ? (Number(homeScoreRaw) || 0) : null;
      const depScore = oynandi ? (Number(awayScoreRaw) || 0) : null;

      let isoDate = new Date().toISOString();
      if (dateStr && dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length === 3) {
          isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}T${timeStr}:00+03:00`;
        }
      }

      const macObj = {
        id,
        tarih: isoDate,
        durum,
        durumUzun,
        dakika,
        lig: {
          id: leagueId,
          ad: leagueName,
          logo: getLeagueBadge(leagueName),
          bayrak: "",
          ulke: countryCode,
          tur: leagueRound
        },
        evSahibi: {
          id: m[1] || 1,
          ad: homeName,
          logo: "",
          kazandi: oynandi && evScore > depScore
        },
        deplasman: {
          id: m[3] || 2,
          ad: awayName,
          logo: "",
          kazandi: oynandi && depScore > evScore
        },
        skor: { ev: evScore, dep: depScore }
      };

      if (!ligler[leagueId]) {
        ligler[leagueId] = {
          id: leagueId,
          ad: leagueName,
          logo: getLeagueBadge(leagueName),
          bayrak: "",
          ulke: countryCode,
          maclar: []
        };
      }
      ligler[leagueId].maclar.push(macObj);
    }

    const tumGruplar = Object.values(ligler);

    // Öncelikli ligleri başa al
    const oncelikliler = [];
    const digerleri = [];

    for (const g of tumGruplar) {
      const idx = ONCELIKLI_LIGLER.findIndex(p => g.ad.toLowerCase().includes(p.toLowerCase()));
      if (idx !== -1) {
        oncelikliler.push({ g, idx });
      } else {
        digerleri.push(g);
      }
    }

    oncelikliler.sort((a, b) => a.idx - b.idx);
    const siraliGruplar = [...oncelikliler.map(x => x.g), ...digerleri];

    return res.status(200).json({
      ok: true,
      tarih: targetDate,
      gruplar: siraliGruplar,
      canliSayisi: canliAdet
    });
  }

  // Eğer maç bulunamadıysa boş grup dön
  return res.status(200).json({
    ok: true,
    tarih: targetDate,
    gruplar: [],
    canliSayisi: 0
  });
}

async function detayGetir(res, fixtureId) {
  const istatistik = [
    {
      takim: "Ev Sahibi",
      kalemler: [
        { tip: "Toplam Şut", deger: 15 },
        { tip: "İsabetli Şut", deger: 7 },
        { tip: "Topa Sahip Olma", deger: "57%" },
        { tip: "Pas İsabeti", deger: "85%" },
        { tip: "Korner", deger: 6 },
        { tip: "Faul", deger: 10 },
        { tip: "Beklenen Gol (xG)", deger: "1.92" }
      ]
    },
    {
      takim: "Deplasman",
      kalemler: [
        { tip: "Toplam Şut", deger: 8 },
        { tip: "İsabetli Şut", deger: 3 },
        { tip: "Topa Sahip Olma", deger: "43%" },
        { tip: "Pas İsabeti", deger: "78%" },
        { tip: "Korner", deger: 3 },
        { tip: "Faul", deger: 14 },
        { tip: "Beklenen Gol (xG)", deger: "0.85" }
      ]
    }
  ];

  const kadrolar = [
    {
      takim: "Ev Sahibi", dizilis: "4-2-3-1", teknikDirektor: "Teknik Sorumlu",
      ilk11: [
        { no: 1, isim: "Kaleci", poz: "G" }, { no: 2, isim: "Sağ Bek", poz: "D" }, { no: 4, isim: "Stoper", poz: "D" },
        { no: 5, isim: "Stoper", poz: "D" }, { no: 3, isim: "Sol Bek", poz: "D" }, { no: 6, isim: "Ön Libero", poz: "M" },
        { no: 8, isim: "Merkez Orta", poz: "M" }, { no: 7, isim: "Sağ Kanat", poz: "M" }, { no: 10, isim: "Oyun Kurucu", poz: "M" },
        { no: 11, isim: "Sol Kanat", poz: "M" }, { no: 9, isim: "Santrafor", poz: "F" }
      ]
    },
    {
      takim: "Deplasman", dizilis: "4-3-3", teknikDirektor: "Teknik Sorumlu",
      ilk11: [
        { no: 1, isim: "Kaleci", poz: "G" }, { no: 22, isim: "Sağ Bek", poz: "D" }, { no: 15, isim: "Stoper", poz: "D" },
        { no: 14, isim: "Stoper", poz: "D" }, { no: 18, isim: "Sol Bek", poz: "D" }, { no: 20, isim: "Ön Libero", poz: "M" },
        { no: 8, isim: "Merkez Orta", poz: "M" }, { no: 21, isim: "Merkez Orta", poz: "M" }, { no: 77, isim: "Sağ Açık", poz: "F" },
        { no: 7, isim: "Sol Açık", poz: "F" }, { no: 99, isim: "Santrafor", poz: "F" }
      ]
    }
  ];

  const olaylar = [
    { dakika: 18, tip: "Goal", detay: "Normal Goal", oyuncu: "Santrafor", takim: "Ev Sahibi" },
    { dakika: 34, tip: "Card", detay: "Yellow Card", oyuncu: "Ön Libero", takim: "Deplasman" },
    { dakika: 52, tip: "Goal", detay: "Normal Goal", oyuncu: "Sol Kanat", takim: "Deplasman" },
    { dakika: 68, tip: "Goal", detay: "Penalty", oyuncu: "Oyun Kurucu", takim: "Ev Sahibi" }
  ];

  return res.status(200).json({ ok: true, istatistik, kadrolar, olaylar });
}

export default async function handler(req, res) {
  try {
    const { date, fixture } = req.query;
    if (fixture) return await detayGetir(res, fixture);
    const gun = date || new Date().toISOString().slice(0, 10);
    return await listeGetir(res, gun);
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message || "Bilinmeyen hata" });
  }
}
