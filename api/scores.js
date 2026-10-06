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

// Milli takım bayrakları ve popüler kulüp logoları
const COUNTRY_FLAGS = {
  "ingiltere": "https://flagcdn.com/w80/gb-eng.png",
  "turkiye": "https://flagcdn.com/w80/tr.png",
  "türkiye": "https://flagcdn.com/w80/tr.png",
  "cekya": "https://flagcdn.com/w80/cz.png",
  "çekya": "https://flagcdn.com/w80/cz.png",
  "almanya": "https://flagcdn.com/w80/de.png",
  "fransa": "https://flagcdn.com/w80/fr.png",
  "italya": "https://flagcdn.com/w80/it.png",
  "ispanya": "https://flagcdn.com/w80/es.png",
  "portekiz": "https://flagcdn.com/w80/pt.png",
  "hollanda": "https://flagcdn.com/w80/nl.png",
  "belcika": "https://flagcdn.com/w80/be.png",
  "belçika": "https://flagcdn.com/w80/be.png",
  "hirvatistan": "https://flagcdn.com/w80/hr.png",
  "hırvatistan": "https://flagcdn.com/w80/hr.png",
  "isvicre": "https://flagcdn.com/w80/ch.png",
  "isviçre": "https://flagcdn.com/w80/ch.png",
  "avusturya": "https://flagcdn.com/w80/at.png",
  "danimarka": "https://flagcdn.com/w80/dk.png",
  "polonya": "https://flagcdn.com/w80/pl.png",
  "sirbistan": "https://flagcdn.com/w80/rs.png",
  "sırbistan": "https://flagcdn.com/w80/rs.png",
  "iskocya": "https://flagcdn.com/w80/gb-sct.png",
  "iskoçya": "https://flagcdn.com/w80/gb-sct.png",
  "galler": "https://flagcdn.com/w80/gb-wls.png",
  "gurcistan": "https://flagcdn.com/w80/ge.png",
  "gürcistan": "https://flagcdn.com/w80/ge.png",
  "norvec": "https://flagcdn.com/w80/no.png",
  "norveç": "https://flagcdn.com/w80/no.png",
  "isvec": "https://flagcdn.com/w80/se.png",
  "isveç": "https://flagcdn.com/w80/se.png",
  "macaristan": "https://flagcdn.com/w80/hu.png",
  "romanya": "https://flagcdn.com/w80/ro.png",
  "slovakya": "https://flagcdn.com/w80/sk.png",
  "slovenya": "https://flagcdn.com/w80/si.png",
  "ukrayna": "https://flagcdn.com/w80/ua.png",
  "yunanistan": "https://flagcdn.com/w80/gr.png",
  "irlanda": "https://flagcdn.com/w80/ie.png",
  "kuzey irlanda": "https://flagcdn.com/w80/gb-nir.png",
  "finlandiya": "https://flagcdn.com/w80/fi.png",
  "bosna hersek": "https://flagcdn.com/w80/ba.png",
  "izlanda": "https://flagcdn.com/w80/is.png",
  "arnavutluk": "https://flagcdn.com/w80/al.png",
  "karadag": "https://flagcdn.com/w80/me.png",
  "karadağ": "https://flagcdn.com/w80/me.png",
  "kosova": "https://flagcdn.com/w80/xk.png",
  "bulgaristan": "https://flagcdn.com/w80/bg.png",
  "israil": "https://flagcdn.com/w80/il.png",
  "azerbaycan": "https://flagcdn.com/w80/az.png",
  "kazakistan": "https://flagcdn.com/w80/kz.png",
  "ermenistan": "https://flagcdn.com/w80/am.png",
  "moldova": "https://flagcdn.com/w80/md.png",
  "luksemburg": "https://flagcdn.com/w80/lu.png",
  "lüksemburg": "https://flagcdn.com/w80/lu.png",
  "kibris": "https://flagcdn.com/w80/cy.png",
  "kıbrıs": "https://flagcdn.com/w80/cy.png",
  "litvanya": "https://flagcdn.com/w80/lt.png",
  "letonya": "https://flagcdn.com/w80/lv.png",
  "estonya": "https://flagcdn.com/w80/ee.png",
  "malta": "https://flagcdn.com/w80/mt.png",
  "cebelitarik": "https://flagcdn.com/w80/gi.png",
  "cebelitarık": "https://flagcdn.com/w80/gi.png",
  "san marino": "https://flagcdn.com/w80/sm.png",
  "andorra": "https://flagcdn.com/w80/ad.png",
  "lihtenstayn": "https://flagcdn.com/w80/li.png",
  "arjantin": "https://flagcdn.com/w80/ar.png",
  "brezilya": "https://flagcdn.com/w80/br.png",
  "uruguay": "https://flagcdn.com/w80/uy.png",
  "kolombiya": "https://flagcdn.com/w80/co.png",
  "japonya": "https://flagcdn.com/w80/jp.png"
};

const CLUB_LOGOS = {
  "galatasaray": "https://www.thesportsdb.com/images/media/team/badge/vxvtut1421434912.png",
  "fenerbahce": "https://www.thesportsdb.com/images/media/team/badge/7a22h91535492193.png",
  "fenerbahçe": "https://www.thesportsdb.com/images/media/team/badge/7a22h91535492193.png",
  "besiktas": "https://www.thesportsdb.com/images/media/team/badge/xqtxpy1421434759.png",
  "beşiktaş": "https://www.thesportsdb.com/images/media/team/badge/xqtxpy1421434759.png",
  "trabzonspor": "https://www.thesportsdb.com/images/media/team/badge/rwswxs1421435272.png",
  "basaksehir": "https://www.thesportsdb.com/images/media/team/badge/u191311603714526.png",
  "başakşehir": "https://www.thesportsdb.com/images/media/team/badge/u191311603714526.png",
  "samsunspor": "https://r2.thesportsdb.com/images/media/team/badge/v6k1441708892348.png",
  "goztepe": "https://r2.thesportsdb.com/images/media/team/badge/06s9m21598466632.png",
  "göztepe": "https://r2.thesportsdb.com/images/media/team/badge/06s9m21598466632.png",
  "eyupspor": "https://r2.thesportsdb.com/images/media/team/badge/7o99s01626087595.png",
  "eyüpspor": "https://r2.thesportsdb.com/images/media/team/badge/7o99s01626087595.png",
  "kasimpasa": "https://r2.thesportsdb.com/images/media/team/badge/vwsqqu1421435255.png",
  "kasımpaşa": "https://r2.thesportsdb.com/images/media/team/badge/vwsqqu1421435255.png",
  "sivasspor": "https://r2.thesportsdb.com/images/media/team/badge/twuqsq1421435238.png",
  "antalyaspor": "https://r2.thesportsdb.com/images/media/team/badge/rvtqvt1421435219.png",
  "konyaspor": "https://r2.thesportsdb.com/images/media/team/badge/xsqtsq1421435201.png",
  "alanyaspor": "https://r2.thesportsdb.com/images/media/team/badge/txuqww1471372719.png",
  "kayserispor": "https://r2.thesportsdb.com/images/media/team/badge/uqvsqu1421435183.png",
  "rizespor": "https://r2.thesportsdb.com/images/media/team/badge/qvutts1421435165.png",
  "gaziantep": "https://r2.thesportsdb.com/images/media/team/badge/8z01h51603714774.png",
  "adanademirspor": "https://r2.thesportsdb.com/images/media/team/badge/w84z211626087498.png",
  "adana demirspor": "https://r2.thesportsdb.com/images/media/team/badge/w84z211626087498.png",
  "bodrum": "https://r2.thesportsdb.com/images/media/team/badge/4n0m8f1686737978.png",
  "hatayspor": "https://r2.thesportsdb.com/images/media/team/badge/d93cce1603714652.png",
  "real madrid": "https://www.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png",
  "barcelona": "https://www.thesportsdb.com/images/media/team/badge/07ipyz1620577740.png",
  "manchester city": "https://www.thesportsdb.com/images/media/team/badge/vwpvry1467462651.png",
  "arsenal": "https://www.thesportsdb.com/images/media/team/badge/uyhbfe1612467038.png",
  "liverpool": "https://www.thesportsdb.com/images/media/team/badge/c873f01705658607.png",
  "bayern": "https://www.thesportsdb.com/images/media/team/badge/rwqvpr1421433919.png",
  "inter": "https://www.thesportsdb.com/images/media/team/badge/9d7yee1618239014.png",
  "milan": "https://www.thesportsdb.com/images/media/team/badge/wvvuwt1421434407.png",
  "juventus": "https://www.thesportsdb.com/images/media/team/badge/b533f81596798088.png",
  "psg": "https://www.thesportsdb.com/images/media/team/badge/rwsttw1421434316.png",
  "chelsea": "https://www.thesportsdb.com/images/media/team/badge/yvwvtu1448813215.png"
};

function getTeamLogo(teamName, teamId) {
  // 1. Mackolik teamId varsa doğrudan resmi yüksek kaliteli logo (Tüm Türk ve Dünya takımları için)
  if (teamId) {
    return `https://im.mackolik.com/img/logo/buyuk/${teamId}.gif`;
  }
  if (!teamName) return "";
  const norm = (teamName || "").toLowerCase().trim();
  if (COUNTRY_FLAGS[norm]) return COUNTRY_FLAGS[norm];
  for (const [k, url] of Object.entries(COUNTRY_FLAGS)) {
    if (norm.includes(k) || k.includes(norm)) return url;
  }
  for (const [k, url] of Object.entries(CLUB_LOGOS)) {
    if (norm.includes(k) || k.includes(norm)) return url;
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
          logo: getTeamLogo(homeName, m[1]),
          kazandi: oynandi && evScore > depScore
        },
        deplasman: {
          id: m[3] || 2,
          ad: awayName,
          logo: getTeamLogo(awayName, m[3]),
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

async function detayGetir(res, fixtureId, query = {}) {
  const status = (query.status || "").toUpperCase();
  const isPlayed = query.oynandi === "true" || (status !== "NS" && status !== "PST" && status !== "CANC" && status !== "");

  if (!isPlayed) {
    return res.status(200).json({
      ok: true,
      oynandi: false,
      baslamadi: true,
      istatistik: null,
      kadrolar: null,
      olaylar: []
    });
  }

  // Oynanan / Canlı maç için Mackolik servisinden gerçek olay ve verileri çek
  let olaylar = [];
  let skor = null;
  let dakika = null;

  try {
    const dtlUrl = `https://arsiv.mackolik.com/Match/MatchData.aspx?t=dtl&id=${fixtureId}`;
    const r = await fetch(dtlUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Referer": `https://arsiv.mackolik.com/Match/Default.aspx?id=${fixtureId}`,
        "X-Requested-With": "XMLHttpRequest"
      }
    });
    if (r.ok) {
      const d = await r.json();
      if (d && d.d) {
        skor = d.d.s;
        dakika = d.d.st || d.d.time;
      }
      if (d && Array.isArray(d.e) && d.e.length > 0) {
        olaylar = d.e.map(ev => {
          const teamSide = ev[0] === 1 ? "ev" : "dep";
          const dk = ev[1];
          const oyuncu = ev[3] || "Oyuncu";
          const eventCode = ev[4];
          let tip = "Goal";
          let detay = "";
          if (eventCode === 1) tip = "Goal";
          else if (eventCode === 2) { tip = "Card"; detay = "Red Card"; }
          else if (eventCode === 3) { tip = "Card"; detay = "Yellow-Red Card"; }
          else if (eventCode === 5) { tip = "Card"; detay = "Yellow Card"; }
          else if (eventCode === 6) { tip = "Goal"; detay = "Penalty"; }
          else if (eventCode === 7) { tip = "Goal"; detay = "Own Goal"; }
          else tip = "Other";

          return {
            dakika: dk,
            tip,
            detay,
            oyuncu,
            takimTaraf: teamSide
          };
        });
      }
    }
  } catch (err) {
    // ignore
  }

  // Eğer MatchData'da olay yoksa, livedata 'e' listesinde canlı maç olayı var mı kontrol et
  if (olaylar.length === 0) {
    try {
      const liveData = await mackolikVerisiCek(new Date().toISOString().slice(0, 10));
      if (liveData && Array.isArray(liveData.e)) {
        const matchEvs = liveData.e.filter(ev => String(ev[1]) === String(fixtureId));
        if (matchEvs.length > 0) {
          olaylar = matchEvs.map(ev => ({
            dakika: String(ev[18] || "").replace("'", ""),
            tip: ev[12] === 1 ? "Goal" : "Card",
            detay: ev[12] === 2 ? "Red Card" : (ev[12] === 5 ? "Yellow Card" : ""),
            oyuncu: ev[13] === 1 ? (ev[8] || "Ev Sahibi") : (ev[10] || "Deplasman"),
            takimTaraf: ev[13] === 1 ? "ev" : "dep"
          }));
        }
      }
    } catch (err) {
      // ignore
    }
  }

  return res.status(200).json({
    ok: true,
    oynandi: true,
    baslamadi: false,
    skor,
    dakika,
    istatistik: null,
    kadrolar: null,
    olaylar
  });
}

export default async function handler(req, res) {
  try {
    const { date, fixture } = req.query;
    if (fixture) return await detayGetir(res, fixture, req.query);
    const gun = date || new Date().toISOString().slice(0, 10);
    return await listeGetir(res, gun);
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message || "Bilinmeyen hata" });
  }
}
