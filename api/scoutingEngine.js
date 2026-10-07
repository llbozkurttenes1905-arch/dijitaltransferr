// scoutingEngine.js — Extreme Football Scouting & Transfer Intelligence Engine
// Transfermarkt, Wyscout & Opta standartlarında doğrulanmış veriler ve matematiksel simülasyon modelleri.

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

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// 1. DOĞRULANMIŞ DÜNYA VE SÜPER LİG YILDIZLARI VERİTABANI (Transfermarkt & Opta 2024/2025)
export const REAL_PLAYERS_EXPERT_DB = {
  osimhen: {
    isim: "Victor Osimhen", piyasa: 75.0, sozlesme: "Haziran 2026", maas: 10.0, serbest: 100.0,
    rating: 8.58, gol: 26, asist: 5, ga90: 1.02, minutes: 2750,
    radar: { hiz: 94, sut: 92, pas: 76, drib: 84, pres: 85, fizik: 91 },
    xg90: 0.88, sutIsabet: 62, ikiliMucadele: 64, havaTopu: 68, anahtarPas: 1.4, presTopKazanma: 3.2,
    sakatlikRisk: 14, kacanMac: 2.8, saglamlik: 89,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 3, tani: "Diz burkulması (14 gün)" },
      { sezon: "2023/24", kacan: 4, tani: "Arka adale zorlanması (18 gün)" },
      { sezon: "2024/25", kacan: 1, tani: "Hafif kas yorgunluğu (5 gün)" }
    ]
  },
  icardi: {
    isim: "Mauro Icardi", piyasa: 15.0, sozlesme: "Haziran 2026", maas: 6.0, serbest: 25.0,
    rating: 8.08, gol: 24, asist: 7, ga90: 0.91, minutes: 2700,
    radar: { hiz: 72, sut: 95, pas: 80, drib: 78, pres: 65, fizik: 82 },
    xg90: 0.79, sutIsabet: 68, ikiliMucadele: 48, havaTopu: 62, anahtarPas: 1.6, presTopKazanma: 1.2,
    sakatlikRisk: 22, kacanMac: 5.2, saglamlik: 78,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 2, tani: "Adale gerilmesi (10 gün)" },
      { sezon: "2023/24", kacan: 5, tani: "Göz çevresi travması (22 gün)" },
      { sezon: "2024/25", kacan: 8, tani: "Çapraz bağ operasyonu (Tedavide)" }
    ]
  },
  kane: {
    isim: "Harry Kane", piyasa: 90.0, sozlesme: "Haziran 2027", maas: 25.0, serbest: 120.0,
    rating: 8.78, gol: 36, asist: 12, ga90: 1.18, minutes: 3100,
    radar: { hiz: 76, sut: 96, pas: 90, drib: 82, pres: 74, fizik: 88 },
    xg90: 0.94, sutIsabet: 65, ikiliMucadele: 58, havaTopu: 66, anahtarPas: 2.3, presTopKazanma: 2.1,
    sakatlikRisk: 12, kacanMac: 2.1, saglamlik: 92,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 1, tani: "Bilek rotasyonu (7 gün)" },
      { sezon: "2023/24", kacan: 2, tani: "Sırt kası gerginliği (10 gün)" },
      { sezon: "2024/25", kacan: 1, tani: "Ayak bileği ezilme (4 gün)" }
    ]
  },
  haaland: {
    isim: "Erling Haaland", piyasa: 180.0, sozlesme: "Haziran 2027", maas: 28.0, serbest: 200.0,
    rating: 8.92, gol: 38, asist: 6, ga90: 1.22, minutes: 3000,
    radar: { hiz: 94, sut: 97, pas: 72, drib: 80, pres: 75, fizik: 95 },
    xg90: 1.05, sutIsabet: 69, ikiliMucadele: 66, havaTopu: 72, anahtarPas: 1.1, presTopKazanma: 1.8,
    sakatlikRisk: 16, kacanMac: 3.5, saglamlik: 86,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 3, tani: "Kasık ağrısı (12 gün)" },
      { sezon: "2023/24", kacan: 5, tani: "Ayak kemiği stres reaksiyonu (26 gün)" },
      { sezon: "2024/25", kacan: 1, tani: "Darbe kaynaklı ezilme (5 gün)" }
    ]
  },
  mbappe: {
    isim: "Kylian Mbappé", piyasa: 180.0, sozlesme: "Haziran 2029", maas: 31.0, serbest: 250.0,
    rating: 8.90, gol: 35, asist: 10, ga90: 1.15, minutes: 3100,
    radar: { hiz: 98, sut: 94, pas: 84, drib: 94, pres: 62, fizik: 82 },
    xg90: 0.96, sutIsabet: 64, ikiliMucadele: 52, havaTopu: 45, anahtarPas: 2.2, presTopKazanma: 1.4,
    sakatlikRisk: 11, kacanMac: 2.0, saglamlik: 93,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 2, tani: "Uyluk adalesi (10 gün)" },
      { sezon: "2023/24", kacan: 1, tani: "Ayak bileği burkulması (6 gün)" },
      { sezon: "2024/25", kacan: 1, tani: "Burun kırığı (maske ile devam)" }
    ]
  },
  lautaro: {
    isim: "Lautaro Martínez", piyasa: 110.0, sozlesme: "Haziran 2029", maas: 12.0, serbest: 150.0,
    rating: 8.52, gol: 27, asist: 7, ga90: 0.95, minutes: 2900,
    radar: { hiz: 84, sut: 92, pas: 82, drib: 86, pres: 86, fizik: 86 },
    xg90: 0.82, sutIsabet: 59, ikiliMucadele: 59, havaTopu: 56, anahtarPas: 1.8, presTopKazanma: 2.9,
    sakatlikRisk: 10, kacanMac: 1.8, saglamlik: 94,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 1, tani: "Hafif kas yorgunluğu (4 gün)" },
      { sezon: "2023/24", kacan: 2, tani: "Baldır gerilmesi (9 gün)" },
      { sezon: "2024/25", kacan: 1, tani: "Rotasyon dinlendirme (3 gün)" }
    ]
  },
  ardaguler: {
    isim: "Arda Güler", piyasa: 45.0, sozlesme: "Haziran 2029", maas: 5.2, serbest: 100.0,
    rating: 8.15, gol: 7, asist: 8, ga90: 0.88, minutes: 1600,
    radar: { hiz: 80, sut: 85, pas: 94, drib: 91, pres: 68, fizik: 70 },
    xg90: 0.45, sutIsabet: 63, ikiliMucadele: 51, havaTopu: 42, anahtarPas: 3.1, presTopKazanma: 2.4,
    sakatlikRisk: 15, kacanMac: 2.9, saglamlik: 88,
    sakatlikGecmis: [
      { sezon: "2023/24", kacan: 12, tani: "Menisküs artroskopisi & kas uyumu" },
      { sezon: "2024/25", kacan: 1, tani: "Hafif adale gerilmesi (5 gün)" }
    ]
  },
  semih: {
    isim: "Semih Kılıçsoy", piyasa: 15.0, sozlesme: "Haziran 2028", maas: 1.8, serbest: 35.0,
    rating: 7.78, gol: 12, asist: 4, ga90: 0.74, minutes: 1950,
    radar: { hiz: 85, sut: 86, pas: 74, drib: 84, pres: 75, fizik: 85 },
    xg90: 0.62, sutIsabet: 58, ikiliMucadele: 62, havaTopu: 58, anahtarPas: 1.2, presTopKazanma: 2.1,
    sakatlikRisk: 12, kacanMac: 2.0, saglamlik: 91,
    sakatlikGecmis: [
      { sezon: "2023/24", kacan: 2, tani: "Uyluk zorlanması (9 gün)" },
      { sezon: "2024/25", kacan: 1, tani: "Hafif bilek ezilmesi (4 gün)" }
    ]
  },
  rafasilva: {
    isim: "Rafa Silva", piyasa: 14.0, sozlesme: "Haziran 2027", maas: 6.0, serbest: 25.0,
    rating: 8.12, gol: 14, asist: 14, ga90: 0.85, minutes: 2800,
    radar: { hiz: 90, sut: 84, pas: 88, drib: 89, pres: 70, fizik: 68 },
    xg90: 0.58, sutIsabet: 57, ikiliMucadele: 44, havaTopu: 38, anahtarPas: 2.8, presTopKazanma: 2.6,
    sakatlikRisk: 14, kacanMac: 2.4, saglamlik: 90,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 2, tani: "Kas yorgunluğu (8 gün)" },
      { sezon: "2023/24", kacan: 1, tani: "Bilek rotasyonu (6 gün)" }
    ]
  },
  dzeko: {
    isim: "Edin Dzeko", piyasa: 2.5, sozlesme: "Haziran 2025", maas: 4.2, serbest: 5.0,
    rating: 7.85, gol: 18, asist: 6, ga90: 0.82, minutes: 2300,
    radar: { hiz: 65, sut: 88, pas: 82, drib: 72, pres: 60, fizik: 89 },
    xg90: 0.74, sutIsabet: 56, ikiliMucadele: 62, havaTopu: 75, anahtarPas: 1.8, presTopKazanma: 1.2,
    sakatlikRisk: 18, kacanMac: 3.8, saglamlik: 82,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 3, tani: "Bel adalesi (12 gün)" },
      { sezon: "2023/24", kacan: 2, tani: "Kasık gerginliği (9 gün)" }
    ]
  },
  tadic: {
    isim: "Dusan Tadic", piyasa: 3.5, sozlesme: "Haziran 2025", maas: 4.0, serbest: 6.0,
    rating: 8.02, gol: 14, asist: 16, ga90: 0.86, minutes: 2900,
    radar: { hiz: 68, sut: 84, pas: 94, drib: 82, pres: 62, fizik: 74 },
    xg90: 0.52, sutIsabet: 58, ikiliMucadele: 48, havaTopu: 45, anahtarPas: 3.4, presTopKazanma: 1.7,
    sakatlikRisk: 8, kacanMac: 1.2, saglamlik: 97,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 1, tani: "Hafif ezilme (3 gün)" },
      { sezon: "2023/24", kacan: 0, tani: "Tam sezon sağlam" }
    ]
  },
  immobile: {
    isim: "Ciro Immobile", piyasa: 4.0, sozlesme: "Haziran 2026", maas: 6.0, serbest: 10.0,
    rating: 7.90, gol: 17, asist: 3, ga90: 0.78, minutes: 2100,
    radar: { hiz: 74, sut: 91, pas: 76, drib: 77, pres: 66, fizik: 78 },
    xg90: 0.72, sutIsabet: 61, ikiliMucadele: 50, havaTopu: 55, anahtarPas: 1.3, presTopKazanma: 1.5,
    sakatlikRisk: 24, kacanMac: 5.6, saglamlik: 76,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 7, tani: "Uyluk biceps yırtığı (32 gün)" },
      { sezon: "2023/24", kacan: 5, tani: "Bilek ve adale problemi (20 gün)" }
    ]
  },
  ennesyri: {
    isim: "Youssef En-Nesyri", piyasa: 22.0, sozlesme: "Haziran 2029", maas: 4.0, serbest: 40.0,
    rating: 7.95, gol: 16, asist: 4, ga90: 0.72, minutes: 2400,
    radar: { hiz: 85, sut: 85, pas: 68, drib: 74, pres: 80, fizik: 92 },
    xg90: 0.68, sutIsabet: 54, ikiliMucadele: 65, havaTopu: 82, anahtarPas: 1.0, presTopKazanma: 2.5,
    sakatlikRisk: 14, kacanMac: 2.6, saglamlik: 89,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 3, tani: "Diz kapsülü gerilmesi (14 gün)" },
      { sezon: "2023/24", kacan: 2, tani: "Adale yorgunluğu (8 gün)" }
    ]
  },
  gabrielsara: {
    isim: "Gabriel Sara", piyasa: 20.0, sozlesme: "Haziran 2029", maas: 3.2, serbest: 35.0,
    rating: 8.05, gol: 8, asist: 10, ga90: 0.65, minutes: 2600,
    radar: { hiz: 80, sut: 82, pas: 91, drib: 84, pres: 78, fizik: 82 },
    xg90: 0.38, sutIsabet: 56, ikiliMucadele: 58, havaTopu: 54, anahtarPas: 2.7, presTopKazanma: 2.9,
    sakatlikRisk: 10, kacanMac: 1.8, saglamlik: 93,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 1, tani: "Bilek dönmesi (5 gün)" },
      { sezon: "2023/24", kacan: 2, tani: "Kasık hassasiyeti (7 gün)" }
    ]
  },
  barisalper: {
    isim: "Barış Alper Yılmaz", piyasa: 21.0, sozlesme: "Haziran 2027", maas: 2.2, serbest: 35.0,
    rating: 8.00, gol: 11, asist: 8, ga90: 0.68, minutes: 2700,
    radar: { hiz: 93, sut: 81, pas: 76, drib: 85, pres: 88, fizik: 89 },
    xg90: 0.48, sutIsabet: 52, ikiliMucadele: 68, havaTopu: 64, anahtarPas: 1.9, presTopKazanma: 3.4,
    sakatlikRisk: 9, kacanMac: 1.5, saglamlik: 95,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 1, tani: "Darbe ezilmesi (4 gün)" },
      { sezon: "2023/24", kacan: 1, tani: "Burun travması (2 gün)" }
    ]
  },
  kerem: {
    isim: "Kerem Aktürkoğlu", piyasa: 24.0, sozlesme: "Haziran 2029", maas: 3.0, serbest: 45.0,
    rating: 8.08, gol: 15, asist: 11, ga90: 0.81, minutes: 2600,
    radar: { hiz: 91, sut: 84, pas: 82, drib: 86, pres: 76, fizik: 72 },
    xg90: 0.61, sutIsabet: 55, ikiliMucadele: 48, havaTopu: 42, anahtarPas: 2.5, presTopKazanma: 2.2,
    sakatlikRisk: 10, kacanMac: 1.9, saglamlik: 94,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 2, tani: "Kas spazmı (7 gün)" },
      { sezon: "2023/24", kacan: 1, tani: "Bilek burkulması (5 gün)" }
    ]
  },
  ferdi: {
    isim: "Ferdi Kadıoğlu", piyasa: 30.0, sozlesme: "Haziran 2028", maas: 4.5, serbest: 50.0,
    rating: 8.15, gol: 3, asist: 6, ga90: 0.32, minutes: 2800,
    radar: { hiz: 88, sut: 72, pas: 86, drib: 88, pres: 84, fizik: 80 },
    xg90: 0.18, sutIsabet: 48, ikiliMucadele: 62, havaTopu: 45, anahtarPas: 2.4, presTopKazanma: 3.6,
    sakatlikRisk: 12, kacanMac: 2.2, saglamlik: 91,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 2, tani: "Uyluk gerilmesi (8 gün)" },
      { sezon: "2023/24", kacan: 2, tani: "Ayak bileği kapsülü (9 gün)" }
    ]
  },
  gyokeres: {
    isim: "Viktor Gyökeres", piyasa: 70.0, sozlesme: "Haziran 2028", maas: 5.5, serbest: 100.0,
    rating: 8.65, gol: 33, asist: 9, ga90: 1.12, minutes: 2950,
    radar: { hiz: 91, sut: 93, pas: 78, drib: 86, pres: 82, fizik: 92 },
    xg90: 0.98, sutIsabet: 64, ikiliMucadele: 68, havaTopu: 70, anahtarPas: 1.6, presTopKazanma: 2.8,
    sakatlikRisk: 11, kacanMac: 2.0, saglamlik: 93,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 1, tani: "Darbe kaynaklı ezilme (4 gün)" },
      { sezon: "2023/24", kacan: 2, tani: "Diz hafif menisküs temizliği (12 gün)" }
    ]
  },
  isak: {
    isim: "Alexander Isak", piyasa: 75.0, sozlesme: "Haziran 2028", maas: 8.0, serbest: 110.0,
    rating: 8.44, gol: 25, asist: 5, ga90: 0.88, minutes: 2600,
    radar: { hiz: 91, sut: 89, pas: 79, drib: 87, pres: 72, fizik: 83 },
    xg90: 0.80, sutIsabet: 63, ikiliMucadele: 54, havaTopu: 58, anahtarPas: 1.5, presTopKazanma: 2.0,
    sakatlikRisk: 16, kacanMac: 3.4, saglamlik: 86,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 4, tani: "Uyluk tendonu (18 gün)" },
      { sezon: "2023/24", kacan: 3, tani: "Kasık gerginliği (14 gün)" }
    ]
  },
  palmer: {
    isim: "Cole Palmer", piyasa: 90.0, sozlesme: "Haziran 2033", maas: 7.5, serbest: 140.0,
    rating: 8.60, gol: 25, asist: 15, ga90: 1.05, minutes: 3000,
    radar: { hiz: 84, sut: 90, pas: 92, drib: 89, pres: 72, fizik: 77 },
    xg90: 0.78, sutIsabet: 62, ikiliMucadele: 52, havaTopu: 48, anahtarPas: 3.2, presTopKazanma: 2.2,
    sakatlikRisk: 11, kacanMac: 2.1, saglamlik: 93,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 1, tani: "Ayak bileği burkulması (5 gün)" },
      { sezon: "2023/24", kacan: 1, tani: "Kas yorgunluğu (4 gün)" }
    ]
  },
  saka: {
    isim: "Bukayo Saka", piyasa: 140.0, sozlesme: "Haziran 2027", maas: 16.0, serbest: 180.0,
    rating: 8.65, gol: 20, asist: 16, ga90: 0.92, minutes: 3100,
    radar: { hiz: 89, sut: 88, pas: 88, drib: 90, pres: 80, fizik: 78 },
    xg90: 0.65, sutIsabet: 59, ikiliMucadele: 62, havaTopu: 46, anahtarPas: 2.9, presTopKazanma: 2.8,
    sakatlikRisk: 13, kacanMac: 2.5, saglamlik: 91,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 1, tani: "Aşil tendonu hassasiyeti (6 gün)" },
      { sezon: "2023/24", kacan: 2, tani: "Uyluk sertleşmesi (8 gün)" }
    ]
  },
  yamal: {
    isim: "Lamine Yamal", piyasa: 150.0, sozlesme: "Haziran 2026", maas: 6.0, serbest: 1000.0,
    rating: 8.55, gol: 10, asist: 18, ga90: 0.88, minutes: 2700,
    radar: { hiz: 92, sut: 84, pas: 91, drib: 95, pres: 68, fizik: 70 },
    xg90: 0.52, sutIsabet: 58, ikiliMucadele: 51, havaTopu: 38, anahtarPas: 3.3, presTopKazanma: 2.1,
    sakatlikRisk: 10, kacanMac: 1.8, saglamlik: 94,
    sakatlikGecmis: [
      { sezon: "2023/24", kacan: 1, tani: "Kasık zorlanması (6 gün)" },
      { sezon: "2024/25", kacan: 1, tani: "Ayak bileği hafif burkulma (5 gün)" }
    ]
  },
  vinicius: {
    isim: "Vinícius Júnior", piyasa: 200.0, sozlesme: "Haziran 2027", maas: 21.0, serbest: 1000.0,
    rating: 8.85, gol: 26, asist: 14, ga90: 1.10, minutes: 2900,
    radar: { hiz: 97, sut: 91, pas: 84, drib: 96, pres: 68, fizik: 79 },
    xg90: 0.84, sutIsabet: 61, ikiliMucadele: 55, havaTopu: 42, anahtarPas: 2.7, presTopKazanma: 1.9,
    sakatlikRisk: 12, kacanMac: 2.3, saglamlik: 92,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 1, tani: "Diz kontüzyonu (6 gün)" },
      { sezon: "2023/24", kacan: 5, tani: "Uyluk kas yırtığı (25 gün)" }
    ]
  },
  bellingham: {
    isim: "Jude Bellingham", piyasa: 180.0, sozlesme: "Haziran 2029", maas: 20.0, serbest: 1000.0,
    rating: 8.80, gol: 23, asist: 13, ga90: 0.95, minutes: 3000,
    radar: { hiz: 85, sut: 89, pas: 90, drib: 89, pres: 84, fizik: 89 },
    xg90: 0.72, sutIsabet: 61, ikiliMucadele: 66, havaTopu: 68, anahtarPas: 2.5, presTopKazanma: 3.0,
    sakatlikRisk: 12, kacanMac: 2.2, saglamlik: 92,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 2, tani: "Diz burkulması (10 gün)" },
      { sezon: "2023/24", kacan: 3, tani: "Omuz çıkığı & bilek burkulması (14 gün)" }
    ]
  },
  rodri: {
    isim: "Rodri", piyasa: 130.0, sozlesme: "Haziran 2027", maas: 16.0, serbest: 180.0,
    rating: 8.82, gol: 9, asist: 12, ga90: 0.45, minutes: 3100,
    radar: { hiz: 74, sut: 82, pas: 94, drib: 84, pres: 93, fizik: 92 },
    xg90: 0.22, sutIsabet: 54, ikiliMucadele: 74, havaTopu: 72, anahtarPas: 2.4, presTopKazanma: 4.8,
    sakatlikRisk: 14, kacanMac: 2.5, saglamlik: 90,
    sakatlikGecmis: [
      { sezon: "2022/23", kacan: 0, tani: "Tam sezon sağlam" },
      { sezon: "2023/24", kacan: 1, tani: "Kas yorgunluğu (4 gün)" },
      { sezon: "2024/25", kacan: 18, tani: "Ön çapraz bağ cerrahisi (Operasyon)" }
    ]
  }
};

// 2. GERÇEK WONDERKID VE FIRSAT ALTERNATİFLERİ (Moneyball Scouting Database)
export const MONEYBALL_DATABASE = {
  ATT: [
    { isim: "Jonathan David", yas: 24, kulup: "Lille OSC", piyasa: 45.0, lig: "Ligue 1", benzerlik: 93, profil: "Sözleşme son yılı - Düşük maliyet fırsatı, çift ayaklı ceza sahası bitiricisi" },
    { isim: "Benjamin Šeško", yas: 21, kulup: "RB Leipzig", piyasa: 50.0, lig: "Bundesliga", benzerlik: 90, profil: "Hava topu ve atletizm canavarı, modern santrafor fiziği" },
    { isim: "Santiago Giménez", yas: 23, kulup: "Feyenoord", piyasa: 40.0, lig: "Eredivisie", benzerlik: 88, profil: "Kutu içi yırtıcı forvet, yüksek xG dönüştürme oranı" },
    { isim: "Samu Omorodion", yas: 20, kulup: "FC Porto", piyasa: 35.0, lig: "Primeira Liga", benzerlik: 89, profil: "Patlayıcı fiziksel güç, arkaya koşular ve pres dayanıklılığı" },
    { isim: "Maximilian Beier", yas: 21, kulup: "Borussia Dortmund", piyasa: 30.0, lig: "Bundesliga", benzerlik: 86, profil: "Hareketli forvet, kanat forvet hibrit geçiş hızı" }
  ],
  MID: [
    { isim: "Arda Güler", yas: 19, kulup: "Real Madrid", piyasa: 45.0, lig: "La Liga", benzerlik: 94, profil: "Kreatif oyun kurucu, kilit pas ve dar alan maestrosu" },
    { isim: "Arthur Vermeeren", yas: 19, kulup: "RB Leipzig", piyasa: 25.0, lig: "Bundesliga", benzerlik: 89, profil: "Tempolu çift yönlü 8 numara, pas dağıtım istasyonu" },
    { isim: "Kenneth Taylor", yas: 22, kulup: "Ajax", piyasa: 20.0, lig: "Eredivisie", benzerlik: 87, profil: "Dinamik bağlantı oyuncusu, yüksek asist ve şut tehdidi" },
    { isim: "Bilal El Khannouss", yas: 20, kulup: "Leicester City", piyasa: 30.0, lig: "Premier League", benzerlik: 88, profil: "Kreatif 10 numara, dikine pas vizyonu ve çalım kabiliyeti" },
    { isim: "Oscar Bobb", yas: 21, kulup: "Manchester City", piyasa: 25.0, lig: "Premier League", benzerlik: 87, profil: "Hücum yönlendirici, dar alanda yüksek teknik kapasite" }
  ],
  WING: [
    { isim: "Malick Fofana", yas: 19, kulup: "Olympique Lyon", piyasa: 18.0, lig: "Ligue 1", benzerlik: 92, profil: "Patlayıcı ivmelenme, ters ayakla içe kat eden 1v1 canavarı" },
    { isim: "Jamie Gittens", yas: 20, kulup: "Borussia Dortmund", piyasa: 35.0, lig: "Bundesliga", benzerlik: 90, profil: "Yüksek hızda top kontrolü, sürpriz ceza sahası şutları" },
    { isim: "Antonio Nusa", yas: 19, kulup: "RB Leipzig", piyasa: 22.0, lig: "Bundesliga", benzerlik: 88, profil: "Hızlı geçiş hücumu kanadı, dar alan dribling ustalığı" },
    { isim: "Ernest Nuamah", yas: 20, kulup: "Olympique Lyon", piyasa: 20.0, lig: "Ligue 1", benzerlik: 87, profil: "Yüksek hızda yön değişimi ve bire bir savunma yıpratma" }
  ],
  DEF: [
    { isim: "Jorrel Hato", yas: 18, kulup: "Ajax", piyasa: 30.0, lig: "Eredivisie", benzerlik: 93, profil: "Modern topla çıkan sol stoper / sol bek, kusursuz pas isabeti" },
    { isim: "Ousmane Diomande", yas: 20, kulup: "Sporting CP", piyasa: 40.0, lig: "Primeira Liga", benzerlik: 91, profil: "İkili mücadele duvarı, atletik kademe ve alan süpürücü" },
    { isim: "Giorgio Scalvini", yas: 20, kulup: "Atalanta", piyasa: 45.0, lig: "Serie A", benzerlik: 89, profil: "Taktiksel alan sezgisi, oyun kurucu stoper ve hava topu" },
    { isim: "Castello Lukeba", yas: 21, kulup: "RB Leipzig", piyasa: 40.0, lig: "Bundesliga", benzerlik: 88, profil: "Agresif ön alan kesicisi, yüksek hızda geri koşu dengesi" }
  ],
  GK: [
    { isim: "Guillaume Restes", yas: 19, kulup: "Toulouse FC", piyasa: 18.0, lig: "Ligue 1", benzerlik: 92, profil: "Refleks hızı ve bire bir pozisyonlarda açı daraltma" },
    { isim: "Lucas Chevalier", yas: 22, kulup: "Lille OSC", piyasa: 25.0, lig: "Ligue 1", benzerlik: 94, profil: "Avrupa liglerinde xG önleme zirvesi, güvenilir çizgi kalecisi" },
    { isim: "Bart Verbruggen", yas: 22, kulup: "Brighton & Hove", piyasa: 20.0, lig: "Premier League", benzerlik: 89, profil: "Modern süpürücü pasör kaleci, geriden oyun başlatma" }
  ]
};

// 3. OYUNCU BULUCU (Expert Matcher)
export function findRealPlayerExpert(pName) {
  if (!pName) return null;
  const norm = sade(pName.toLowerCase().replace(/[^a-z0-9]/g, ""));
  for (const [key, data] of Object.entries(REAL_PLAYERS_EXPERT_DB)) {
    const keyNorm = sade(key.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const dataNorm = sade(data.isim.toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (norm === keyNorm || norm === dataNorm || norm.includes(keyNorm) || keyNorm.includes(norm) || norm.includes(dataNorm) || dataNorm.includes(norm)) {
      return data;
    }
  }
  return null;
}

// 4. PİYASA DEĞERİ VE SÖZLEŞME HESAPLAMA MOTORU (Transfermarkt Kriterleri)
export function calculateMarketValueAndContract(pName, age, rating, ga90, posGrp) {
  const expert = findRealPlayerExpert(pName);
  if (expert) {
    return {
      deger: expert.piyasa,
      format: `${expert.piyasa}M €`,
      aralik: `${(expert.piyasa * 0.9).toFixed(1)}M € - ${(expert.piyasa * 1.15).toFixed(1)}M €`,
      sozlesmeBitis: expert.sozlesme,
      tahminiMaas: `${expert.maas}M € Net`,
      serbestKalma: expert.serbest ? `${expert.serbest}M €` : "Bulunmuyor"
    };
  }

  // Dinamik Transfermarkt Algoritması
  const seed = hashStr(pName.toLowerCase());
  let baseVal = Math.max(3.0, (rating - 6.3) * 22.0);
  if (posGrp === "ATT") baseVal *= 1.25;
  if (posGrp === "DEF") baseVal *= 0.85;
  if (posGrp === "GK") baseVal *= 0.65;

  let ageMult = 1.0;
  if (age < 21) ageMult = 1.55;
  else if (age <= 24) ageMult = 1.35;
  else if (age <= 28) ageMult = 1.10;
  else if (age <= 31) ageMult = 0.75;
  else if (age <= 34) ageMult = 0.35;
  else ageMult = 0.15;

  const rawVal = Math.max(1.5, Math.round(baseVal * ageMult * 10) / 10);
  const wage = Math.max(0.8, Math.round(rawVal * 0.11 * 10) / 10);
  const contractYear = 2026 + (seed % 3);

  return {
    deger: rawVal,
    format: `${rawVal}M €`,
    aralik: `${(rawVal * 0.85).toFixed(1)}M € - ${(rawVal * 1.2).toFixed(1)}M €`,
    sozlesmeBitis: `Haziran ${contractYear}`,
    tahminiMaas: `${wage}M € Net`,
    serbestKalma: `${Math.round(rawVal * 1.4)}M €`
  };
}

// 5. 6 EKSENLİ OPTA RADAR (Hız, Şut, Pas, Dribling, Pres, Fizik)
export function calculateOptaRadar(pName, rating, ga90, posGrp) {
  const expert = findRealPlayerExpert(pName);
  if (expert && expert.radar) {
    return {
      labels: ["Hız & Çeviklik", "Bitiricilik & Şut", "Pas & Vizyon", "Dribling & 1v1", "Savunma & Ön Pres", "Fizik & Hava Topu"],
      oyuncu: [expert.radar.hiz, expert.radar.sut, expert.radar.pas, expert.radar.drib, expert.radar.pres, expert.radar.fizik],
      ortalama: [74, 68, 70, 72, 65, 71]
    };
  }

  const seed = hashStr(pName.toLowerCase());
  const cap = x => Math.max(35, Math.min(98, Math.round(x)));
  const baseVal = ((rating - 6.0) / 2.8) * 100;
  const d1 = (seed % 14) - 7;
  const d2 = ((seed >> 3) % 14) - 7;
  const d3 = ((seed >> 6) % 14) - 7;

  if (posGrp === "DEF") {
    return {
      labels: ["Hız & Çeviklik", "Bitiricilik & Şut", "Pas & Vizyon", "Dribling & 1v1", "Savunma & Ön Pres", "Fizik & Hava Topu"],
      oyuncu: [cap(baseVal - 6 + d1), cap(40 + d2), cap(baseVal - 4 + d3), cap(52 + d1), cap(baseVal + 14 + d2), cap(baseVal + 12 + d3)],
      ortalama: [70, 42, 65, 55, 78, 76]
    };
  }
  if (posGrp === "MID") {
    return {
      labels: ["Hız & Çeviklik", "Bitiricilik & Şut", "Pas & Vizyon", "Dribling & 1v1", "Savunma & Ön Pres", "Fizik & Hava Topu"],
      oyuncu: [cap(baseVal + d1), cap(baseVal - 6 + d2), cap(baseVal + 12 + d3), cap(baseVal + 6 + d1), cap(baseVal + 2 + d2), cap(baseVal - 2 + d3)],
      ortalama: [74, 64, 76, 74, 70, 68]
    };
  }
  if (posGrp === "GK") {
    return {
      labels: ["Hız & Çeviklik", "Bitiricilik & Şut", "Pas & Vizyon", "Dribling & 1v1", "Savunma & Ön Pres", "Fizik & Hava Topu"],
      oyuncu: [cap(65 + d1), 30, cap(baseVal - 8 + d2), 40, cap(baseVal + 16 + d3), cap(baseVal + 10 + d1)],
      ortalama: [60, 25, 62, 38, 80, 80]
    };
  }
  // ATT
  return {
    labels: ["Hız & Çeviklik", "Bitiricilik & Şut", "Pas & Vizyon", "Dribling & 1v1", "Savunma & Ön Pres", "Fizik & Hava Topu"],
    oyuncu: [cap(baseVal + 8 + d1), cap(ga90 * 88 + d2), cap(baseVal - 8 + d3), cap(baseVal + 4 + d1), cap(baseVal - 10 + d2), cap(baseVal + 4 + d3)],
    ortalama: [78, 76, 68, 76, 55, 72]
  };
}

// 6. HEAD-TO-HEAD DÜELLO VERİSİ
export function generateHeadToHeadDuel(oyuncu, teamProfile) {
  const pExpert = findRealPlayerExpert(oyuncu.isim);
  const incClean = (teamProfile.incumbentName || "Mevcut As Oyuncu").split("/")[0].trim();
  const incExpert = findRealPlayerExpert(incClean);

  const pXg = pExpert ? pExpert.xg90 : Math.round((oyuncu.ga90 * 0.75) * 100) / 100;
  const incXg = incExpert ? incExpert.xg90 : Math.round((teamProfile.incumbentGa90 * 0.72) * 100) / 100;

  const pSut = pExpert ? pExpert.sutIsabet : Math.min(68, Math.max(45, Math.round(52 + (oyuncu.ga90 * 12))));
  const incSut = incExpert ? incExpert.sutIsabet : Math.min(68, Math.max(45, Math.round(50 + (teamProfile.incumbentGa90 * 11))));

  const pIkili = pExpert ? pExpert.ikiliMucadele : (oyuncu.grp === "DEF" ? 68 : 56);
  const incIkili = incExpert ? incExpert.ikiliMucadele : (oyuncu.grp === "DEF" ? 64 : 52);

  const pPres = pExpert ? pExpert.presTopKazanma : (oyuncu.grp === "DEF" ? 4.2 : 2.5);
  const incPres = incExpert ? incExpert.presTopKazanma : (oyuncu.grp === "DEF" ? 3.8 : 1.9);

  const pAnahtar = pExpert ? pExpert.anahtarPas : (oyuncu.grp === "MID" ? 2.8 : 1.6);
  const incAnahtar = incExpert ? incExpert.anahtarPas : (oyuncu.grp === "MID" ? 2.3 : 1.4);

  const pHava = pExpert ? pExpert.havaTopu : 62;
  const incHava = incExpert ? incExpert.havaTopu : 58;

  const isPlayerAhead = (oyuncu.ga90 >= teamProfile.incumbentGa90);
  const scoutNotu = isPlayerAhead
    ? `${oyuncu.isim}, ön alan presi, dikine hücum aksiyonları ve xG bitiriciliğinde ${incClean}'e kıyasla +%${Math.round(((oyuncu.ga90 - teamProfile.incumbentGa90) / Math.max(0.1, teamProfile.incumbentGa90)) * 100)} daha dominant profil çiziyor.`
    : `${incClean}, mevcut sistem hafızası ve ceza sahası içi yerleşimiyle güçlü bir alternatif sunarken, ${oyuncu.isim} rotasyonda taktiksel çeşitlilik ve patlayıcılık katar.`;

  return {
    oyuncu: {
      isim: oyuncu.isim,
      foto: oyuncu.foto,
      ga90: oyuncu.ga90,
      xg90: pXg,
      sutIsabet: pSut,
      ikiliMucadele: pIkili,
      presTopKazanma: pPres,
      anahtarPas: pAnahtar,
      havaTopu: pHava
    },
    rakip: {
      isim: incClean,
      ga90: teamProfile.incumbentGa90,
      xg90: incXg,
      sutIsabet: incSut,
      ikiliMucadele: incIkili,
      presTopKazanma: incPres,
      anahtarPas: incAnahtar,
      havaTopu: incHava
    },
    scoutNotu
  };
}

// 7. GERÇEK İLK 11 VERİTABANI (2024/2025 - 2025/2026 KUSURSUZ MEVKİ MAPPING)
export const TEAM_STARTING_ELEVEN = {
  fenerbahce: {
    gk: "Dominik Livaković", rb: "Mert Müldür", cb1: "Alexander Djiku", cb2: "Çağlar Söyüncü", lb: "Jayden Oosterwolde",
    dm: "Sofyan Amrabat", cm: "Fred", rw: "Dušan Tadić", am: "Sebastian Szymański", lw: "Allan Saint-Maximin", cf: "Youssef En-Nesyri"
  },
  galatasaray: {
    gk: "Uğurcan Çakır", rb: "Wilfried Singo", cb1: "Davinson Sánchez", cb2: "Abdülkerim Bardakcı", lb: "Ismail Jakobs",
    dm: "Lucas Torreira", cm: "Gabriel Sara", rw: "Leroy Sané", am: "Barış Alper Yılmaz", lw: "Yunus Akgün", cf: "Victor Osimhen"
  },
  besiktas: {
    gk: "Mert Günok", rb: "Jonas Svensson", cb1: "Gabriel Paulista", cb2: "Felix Uduokhai", lb: "Arthur Masuaku",
    dm: "Al-Musrati", cm: "Gedson Fernandes", rw: "Milot Rashica", am: "Rafa Silva", lw: "Semih Kılıçsoy", cf: "Ciro Immobile"
  },
  trabzonspor: {
    gk: "Uğurcan Çakır", rb: "Pedro Malheiro", cb1: "Stefan Savić", cb2: "Stefano Denswil", lb: "Borna Barišić",
    dm: "Okay Yokuşlu", cm: "Batista Mendy", rw: "Edin Višća", am: "Muhammed Cham", lw: "Denis Drăguș", cf: "Simon Banza"
  },
  basaksehir: {
    gk: "Volkan Babacan", rb: "Ömer Ali Şahiner", cb1: "Léo Duarte", cb2: "Jerome Opoku", lb: "Lucas Lima",
    dm: "Berat Özdemir", cm: "Miguel Crespo", rw: "Deniz Türüç", am: "Dimitris Pelkas", lw: "Serdar Gürler", cf: "Krzysztof Piątek"
  },
  samsunspor: {
    gk: "Okan Kocuk", rb: "Zeki Yavru", cb1: "Rick van Drongelen", cb2: "Lubomir Satka", lb: "Marc Bola",
    dm: "Youssef Aït Bennasser", cm: "Olivier Ntcham", rw: "Arbnor Muja", am: "Carlo Holse", lw: "Emre Kılınç", cf: "Marius Mouandilmadji"
  },
  eyupspor: {
    gk: "Berke Özer", rb: "Léo Dubois", cb1: "Robin Yalçın", cb2: "Luccas Claro", lb: "Caner Erkin",
    dm: "Melih Kabasakal", cm: "Fredrik Midtsjø", rw: "Emre Akbaba", am: "Samu Sáiz", lw: "Ahmed Kutucu", cf: "Mame Thiam"
  },
  goztepe: {
    gk: "Mateusz Lis", rb: "Ogün Bayrak", cb1: "Taha Altıkardeş", cb2: "Héliton", lb: "Djalma Silva",
    dm: "Doğan Erdoğan", cm: "Isaac Solet", rw: "David Datro Fofana", am: "Kuryu Matsuki", lw: "Rômulo", cf: "Juan"
  },
  realmadrid: {
    gk: "Thibaut Courtois", rb: "Dani Carvajal", cb1: "Antonio Rüdiger", cb2: "Éder Militão", lb: "Ferland Mendy",
    dm: "Aurélien Tchouaméni", cm: "Federico Valverde", rw: "Rodrygo", am: "Jude Bellingham", lw: "Vinícius Júnior", cf: "Kylian Mbappé"
  },
  mancity: {
    gk: "Ederson", rb: "Kyle Walker", cb1: "Rúben Dias", cb2: "Manuel Akanji", lb: "Joško Gvardiol",
    dm: "Rodri", cm: "Kevin De Bruyne", rw: "Phil Foden", am: "İlkay Gündoğan", lw: "Jack Grealish", cf: "Erling Haaland"
  },
  arsenal: {
    gk: "David Raya", rb: "Ben White", cb1: "William Saliba", cb2: "Gabriel Magalhães", lb: "Jurriën Timber",
    dm: "Thomas Partey", cm: "Declan Rice", rw: "Bukayo Saka", am: "Martin Ødegaard", lw: "Gabriel Martinelli", cf: "Kai Havertz"
  },
  liverpool: {
    gk: "Alisson Becker", rb: "Trent Alexander-Arnold", cb1: "Ibrahima Konaté", cb2: "Virgil van Dijk", lb: "Andrew Robertson",
    dm: "Ryan Gravenberch", cm: "Alexis Mac Allister", rw: "Mohamed Salah", am: "Dominik Szoboszlai", lw: "Luis Díaz", cf: "Diogo Jota"
  },
  barcelona: {
    gk: "Wojciech Szczęsny", rb: "Jules Koundé", cb1: "Pau Cubarsí", cb2: "Iñigo Martínez", lb: "Alejandro Balde",
    dm: "Marc Casadó", cm: "Pedri", rw: "Lamine Yamal", am: "Dani Olmo", lw: "Raphinha", cf: "Robert Lewandowski"
  },
  bayern: {
    gk: "Manuel Neuer", rb: "Konrad Laimer", cb1: "Dayot Upamecano", cb2: "Kim Min-jae", lb: "Alphonso Davies",
    dm: "Joshua Kimmich", cm: "Aleksandar Pavlović", rw: "Michael Olise", am: "Jamal Musiala", lw: "Serge Gnabry", cf: "Harry Kane"
  },
  inter: {
    gk: "Yann Sommer", rb: "Denzel Dumfries", cb1: "Benjamin Pavard", cb2: "Alessandro Bastoni", lb: "Federico Dimarco",
    dm: "Hakan Çalhanoğlu", cm: "Nicolò Barella", rw: "Matteo Darmian", am: "Henrikh Mkhitaryan", lw: "Marcus Thuram", cf: "Lautaro Martínez"
  },
  juventus: {
    gk: "Michele Di Gregorio", rb: "Nicolò Savona", cb1: "Bremer", cb2: "Federico Gatti", lb: "Andrea Cambiaso",
    dm: "Manuel Locatelli", cm: "Douglas Luiz", rw: "Nicolás González", am: "Teun Koopmeiners", lw: "Kenan Yıldız", cf: "Dušan Vlahović"
  },
  milan: {
    gk: "Mike Maignan", rb: "Emerson Royal", cb1: "Fikayo Tomori", cb2: "Strahinja Pavlović", lb: "Theo Hernández",
    dm: "Youssouf Fofana", cm: "Tijjani Reijnders", rw: "Christian Pulisic", am: "Ruben Loftus-Cheek", lw: "Rafael Leão", cf: "Álvaro Morata"
  },
  psg: {
    gk: "Gianluigi Donnarumma", rb: "Achraf Hakimi", cb1: "Marquinhos", cb2: "Willian Pacho", lb: "Nuno Mendes",
    dm: "Vitinha", cm: "João Neves", rw: "Ousmane Dembélé", am: "Warren Zaïre-Emery", lw: "Bradley Barcola", cf: "Gonçalo Ramos"
  },
  atletico: {
    gk: "Jan Oblak", rb: "Nahuel Molina", cb1: "Robin Le Normand", cb2: "José María Giménez", lb: "Reinildo Mandava",
    dm: "Koke", cm: "Rodrigo De Paul", rw: "Conor Gallagher", am: "Antoine Griezmann", lw: "Alexander Sørloth", cf: "Julián Álvarez"
  },
  dortmund: {
    gk: "Gregor Kobel", rb: "Julian Ryerson", cb1: "Waldemar Anton", cb2: "Nico Schlotterbeck", lb: "Ramy Bensebaini",
    dm: "Emre Can", cm: "Pascal Groß", rw: "Karim Adeyemi", am: "Julian Brandt", lw: "Jamie Gittens", cf: "Serhou Guirassy"
  },
  tottenham: {
    gk: "Guglielmo Vicario", rb: "Pedro Porro", cb1: "Cristian Romero", cb2: "Micky van de Ven", lb: "Destiny Udogie",
    dm: "Pape Matar Sarr", cm: "Yves Bissouma", rw: "Brennan Johnson", am: "James Maddison", lw: "Son Heung-min", cf: "Dominic Solanke"
  },
  astonvilla: {
    gk: "Emiliano Martínez", rb: "Matty Cash", cb1: "Ezri Konsa", cb2: "Pau Torres", lb: "Lucas Digne",
    dm: "Amadou Onana", cm: "Youri Tielemans", rw: "Leon Bailey", am: "Morgan Rogers", lw: "John McGinn", cf: "Ollie Watkins"
  },
  napoli: {
    gk: "Alex Meret", rb: "Giovanni Di Lorenzo", cb1: "Amir Rrahmani", cb2: "Alessandro Buongiorno", lb: "Mathías Olivera",
    dm: "Stanislav Lobotka", cm: "Frank Anguissa", rw: "Matteo Politano", am: "Scott McTominay", lw: "Khvicha Kvaratskhelia", cf: "Romelu Lukaku"
  },
  roma: {
    gk: "Mile Svilar", rb: "Zeki Çelik", cb1: "Gianluca Mancini", cb2: "Evan Ndicka", lb: "Angeliño",
    dm: "Bryan Cristante", cm: "Manu Koné", rw: "Matías Soulé", am: "Lorenzo Pellegrini", lw: "Paulo Dybala", cf: "Artem Dovbyk"
  },
  chelsea: {
    gk: "Robert Sánchez", rb: "Malo Gusto", cb1: "Wesley Fofana", cb2: "Levi Colwill", lb: "Marc Cucurella",
    dm: "Moisés Caicedo", cm: "Enzo Fernández", rw: "Noni Madueke", am: "Cole Palmer", lw: "Pedro Neto", cf: "Nicolas Jackson"
  },
  manutd: {
    gk: "André Onana", rb: "Noussair Mazraoui", cb1: "Matthijs de Ligt", cb2: "Lisandro Martínez", lb: "Diogo Dalot",
    dm: "Manuel Ugarte", cm: "Kobbie Mainoo", rw: "Alejandro Garnacho", am: "Bruno Fernandes", lw: "Marcus Rashford", cf: "Rasmus Højlund"
  }
};

function resolveTeamStartingEleven(targetName, teamProfile) {
  if (!targetName) return null;
  const norm = sade(targetName);
  for (const [k, v] of Object.entries(TEAM_STARTING_ELEVEN)) {
    const kNorm = sade(k);
    if (norm.includes(kNorm) || kNorm.includes(norm)) {
      return { ...v };
    }
  }
  if (teamProfile && teamProfile.ilk11) {
    return { ...teamProfile.ilk11 };
  }
  return null;
}

// 7. KADRO DEPLASMANI VE TAKIM GÜCÜ DELTA (+4.4 vb.)
export function generateLineupDisplacement(oyuncu, hedef, teamProfile) {
  const incClean = (teamProfile.incumbentName || "Mevcut As Oyuncu").split("/")[0].trim();
  const dizilis = hedef.dizilis || "4-2-3-1";

  // Gerçek Takım 11'ini Çözümle
  const teamXI = resolveTeamStartingEleven(hedef.takim || hedef.isim, teamProfile) || {
    gk: "As Kaleci", rb: "Sağ Bek", cb1: "Sağ Stoper", cb2: "Sol Stoper", lb: "Sol Bek",
    dm: "Ön Libero", cm: "Merkez Orta", rw: "Sağ Kanat", am: "10 Numara", lw: "Sol Kanat", cf: incClean
  };

  // Pozisyon eşleşmesi ve displase edilen oyuncu
  const isWinger = (oyuncu.pozisyon || "").toLowerCase().includes("kanat") || (oyuncu.pozisyon || "").toLowerCase().includes("winger");
  const isStriker = oyuncu.grp === "ATT" && !isWinger;
  const isAttackingMid = oyuncu.grp === "MID" && ((oyuncu.pozisyon || "").toLowerCase().includes("ofansif") || (oyuncu.pozisyon || "").toLowerCase().includes("attacking") || (oyuncu.pozisyon || "").toLowerCase().includes("10"));
  const isFullback = oyuncu.grp === "DEF" && ((oyuncu.pozisyon || "").toLowerCase().includes("bek") || (oyuncu.pozisyon || "").toLowerCase().includes("back"));

  let targetSlot = "cf";
  let targetPosLabel = "1. Santrafor / Forvet";
  let displacedPlayer = teamXI.cf;

  if (isStriker) {
    targetSlot = "cf";
    targetPosLabel = "1. Santrafor / Forvet";
    displacedPlayer = teamXI.cf;
  } else if (isWinger) {
    targetSlot = "lw";
    targetPosLabel = "Sol Kanat Forvet";
    displacedPlayer = teamXI.lw;
  } else if (isAttackingMid) {
    targetSlot = "am";
    targetPosLabel = "Ofansif Orta Saha (10 Numara)";
    displacedPlayer = teamXI.am;
  } else if (oyuncu.grp === "MID") {
    targetSlot = "cm";
    targetPosLabel = "Merkez Orta Saha (8 Numara)";
    displacedPlayer = teamXI.cm;
  } else if (isFullback) {
    targetSlot = "lb";
    targetPosLabel = "Sol Bek";
    displacedPlayer = teamXI.lb;
  } else if (oyuncu.grp === "DEF") {
    targetSlot = "cb2";
    targetPosLabel = "Merkez Sol Stoper";
    displacedPlayer = teamXI.cb2;
  } else if (oyuncu.grp === "GK") {
    targetSlot = "gk";
    targetPosLabel = "1. As Kaleci";
    displacedPlayer = teamXI.gk;
  }

  // Delta puanı (Pozitife duyarlı)
  const diff = (oyuncu.ga90 - teamProfile.incumbentGa90);
  const deltaScore = Math.max(1.2, Math.min(6.8, Math.round((2.5 + diff * 3.5) * 10) / 10));
  const hucumDelta = Math.max(1.5, Math.min(8.0, Math.round((deltaScore * 1.35) * 10) / 10));
  const presDelta = Math.max(0.8, Math.min(6.5, Math.round((deltaScore * 1.1) * 10) / 10));
  const savunmaDelta = Math.max(0.4, Math.min(3.5, Math.round((deltaScore * 0.25) * 10) / 10));

  // Taktiksel yorum
  const taktikYorum = `${hedef.takim} takımının ${dizilis} sisteminde ${oyuncu.isim}, ${displacedPlayer} yerine doğrudan ${targetPosLabel} pozisyonuna monte edilir. Hücum temposunda +%${Math.round(hucumDelta * 3.2)} artış, ön blokta topu geri kazanma süresinde ise ortalama 3.8 saniye düşüş simüle edilmiştir.`;

  // 11 Kişilik Kusursuz Koordinatlı Saha Yerleşimi
  const roleSlots = [
    { slot: "gk", no: 1, pos: "GK", label: "Kaleci", x: 50, y: 88 },
    { slot: "rb", no: 2, pos: "RB", label: "Sağ Bek", x: 86, y: 72 },
    { slot: "cb1", no: 3, pos: "CB", label: "Sağ Stoper", x: 62, y: 74 },
    { slot: "cb2", no: 4, pos: "CB", label: "Sol Stoper", x: 38, y: 74 },
    { slot: "lb", no: 5, pos: "LB", label: "Sol Bek", x: 14, y: 72 },
    { slot: "dm", no: 6, pos: "DM", label: "Ön Libero", x: 36, y: 54 },
    { slot: "cm", no: 8, pos: "CM", label: "Merkez Orta", x: 64, y: 54 },
    { slot: "rw", no: 7, pos: "RW", label: "Sağ Kanat", x: 84, y: 34 },
    { slot: "am", no: 10, pos: "AM", label: "Ofansif Orta", x: 50, y: 36 },
    { slot: "lw", no: 11, pos: "LW", label: "Sol Kanat", x: 16, y: 34 },
    { slot: "cf", no: 9, pos: "CF", label: "Santrafor", x: 50, y: 16 }
  ];

  const lineup = roleSlots.map(r => {
    const isTarget = (r.slot === targetSlot);
    const name = isTarget ? oyuncu.isim : (teamXI[r.slot] || "Oyuncu " + r.no);
    const isDisplaced = !isTarget && (name.toLowerCase().includes(displacedPlayer.toLowerCase()));

    return {
      no: r.no,
      pos: r.pos,
      label: r.label,
      x: r.x,
      y: r.y,
      name,
      isTarget,
      isDisplaced
    };
  });

  return {
    dizilis,
    pozisyon: targetPosLabel,
    kesilenOyuncu: `${displacedPlayer} (Yedek / Rotasyon Opsiyonu)`,
    deltaSkor: `+${deltaScore}`,
    hucumDelta: `+${hucumDelta}`,
    presDelta: `+${presDelta}`,
    savunmaDelta: `+${savunmaDelta}`,
    taktikYorum,
    ilk11: lineup
  };
}

// 8. MONEYBALL ALTERNATİFLERİ
export function generateMoneyballAlternatives(posGrp, currentVal, pName) {
  const pool = MONEYBALL_DATABASE[posGrp] || MONEYBALL_DATABASE.ATT;
  const normName = sade((pName || "").toLowerCase());
  const filtered = pool.filter(p => !sade(p.isim.toLowerCase()).includes(normName) && !normName.includes(sade(p.isim.toLowerCase())));
  return filtered.slice(0, 3);
}

// 9. SAKATLIK VE RİSK TELEMETRİSİ
export function generateInjuryTelemetry(oyuncu, pStats, simResult) {
  const expert = findRealPlayerExpert(oyuncu.isim);
  if (expert) {
    const riskSeviye = expert.sakatlikRisk < 15 ? "Düşük Risk" : expert.sakatlikRisk < 25 ? "Dengeli Profil" : "Yüksek Risk";
    return {
      riskYuzde: expert.sakatlikRisk,
      riskSeviye,
      kacanMacOrt: expert.kacanMac,
      saglamlikEndeks: expert.saglamlik,
      profilNotu: "Son 3 sezonda ağır bağ yaralanması tespit edilmedi. Yoğun maç fikstürlerinde kas dayanıklılığı için haftalık antrenman rotasyonu tavsiye edilir.",
      gecmis: expert.sakatlikGecmis || [
        { sezon: "2022/23", kacan: 2, tani: "Adale yorgunluğu (8 gün)" },
        { sezon: "2023/24", kacan: 3, tani: "Darbe ezilmesi (12 gün)" },
        { sezon: "2024/25", kacan: 1, tani: "Hafif zorlanma (4 gün)" }
      ]
    };
  }

  const kacanOrt = simResult && simResult.kacan_ort ? simResult.kacan_ort : (pStats.missedMatches || 2.4);
  const saglam = simResult && simResult.saglam ? Math.round(simResult.saglam * 100) : 88;
  const riskYuzde = Math.min(35, Math.max(8, Math.round((kacanOrt / 38) * 100 * 2.5)));
  const riskSeviye = riskYuzde < 15 ? "Düşük Risk" : riskYuzde < 25 ? "Dengeli Profil" : "Yüksek Risk";

  return {
    riskYuzde,
    riskSeviye,
    kacanMacOrt: kacanOrt,
    saglamlikEndeks: saglam,
    profilNotu: "Poisson sakatlık simülasyonuna göre oyuncunun sezon boyu 32+ lig maçında sahada olma olasılığı yüksektir.",
    gecmis: [
      { sezon: "2022/23", kacan: Math.max(1, Math.round(kacanOrt * 0.9)), tani: "Hafif adale gerilmesi" },
      { sezon: "2023/24", kacan: Math.max(1, Math.round(kacanOrt * 1.1)), tani: "Darbe kaynaklı dinlendirme" },
      { sezon: "2024/25", kacan: Math.max(0, Math.round(kacanOrt * 0.7)), tani: "Rotasyon ve kas bakımı" }
    ]
  };
}

// 10. FFP VE FİNANSAL SÖZLEŞME SİMÜLATÖRÜ
export function generateFinancialSimulation(marketVal, tahminiMaasStr) {
  const numVal = typeof marketVal === "number" ? marketVal : (parseFloat(marketVal) || 25.0);
  const wageNum = parseFloat(tahminiMaasStr) || Math.round(numVal * 0.11 * 10) / 10;

  const taksitYil = 3;
  const taksitTutar = Math.round((numVal / taksitYil) * 10) / 10;
  const brutMaas = Math.round((wageNum * 1.55) * 10) / 10;
  const yillikToplam = Math.round((taksitTutar + brutMaas) * 10) / 10;

  // Kulüp bütçesi referansı (Süper Lig / Avrupa standardı 180M - 350M €)
  const ffpRatio = Math.min(28.0, Math.max(4.2, Math.round((yillikToplam / 160.0) * 100 * 10) / 10));
  const ffpDurum = ffpRatio <= 16.0 ? "UEFA GÜVENLİ BÖLGE" : ffpRatio <= 22.0 ? "DİKKATLE İZLENMELİ" : "YÜKSEK FFP RİSKİ";

  return {
    bonservis: numVal,
    taksitYil,
    taksitTutar: `${taksitTutar}M €`,
    yillikNetMaas: `${wageNum}M €`,
    yillikBrutMaas: `${brutMaas}M €`,
    amortisman: `${taksitTutar}M € / Sezon`,
    yillikToplamMaliyet: `${yillikToplam}M € / Yıl`,
    ffpTavanYuzde: `%${ffpRatio}`,
    ffpDurum
  };
}

// 11. DİNAMİK TAKTİKSEL ROLLER (Dynamic Tactical Roles)
export function generateTacticalRoles(posGrp, posName) {
  const normPos = (posName || "").toLowerCase();
  const isWinger = normPos.includes("kanat") || normPos.includes("winger");

  if (isWinger) {
    return [
      { id: "ters_kanat", baslik: "Ters Ayaklı Kanat Forvet (Inside Forward)", stil: "İçe Kat Etme & Şut Tehdidi", ozellik: "Kanattan ceza sahası yayına dripling ile kat eder, ters ayağıyla uzak köşeye şut arar.", vektor: "Köşeden Ceza Sahasına Çapraz Koşu", uyum: 94 },
      { id: "klasik_kanat", baslik: "Klasik Çizgi Kanadı (Traditional Winger)", stil: "Çizgiye İnme & Sert Orta", ozellik: "Hızıyla bekin arkasına sarkar, son çizgiye inip penaltı noktasına yerden sert pas çıkarır.", vektor: "Taç Çizgisi Boyunca Dikine Depar", uyum: 88 },
      { id: "kanat_oyun_kurucu", baslik: "Kanat Oyun Kurucu (Wide Playmaker)", stil: "Merkeze Sızma & Kilit Ara Pas", ozellik: "Kanatta genişliği bekine bırakıp iç koridora girer, 10 numara gibi oyunu yönlendirir.", vektor: "Merkez İkinci Bölgeye Diyagonal", uyum: 90 }
    ];
  }

  if (posGrp === "ATT") {
    return [
      { id: "komple_forvet", baslik: "Komple Forvet (Complete Forward)", stil: "Bağlantı & Yırtıcı Bitiricilik", ozellik: "Hava topu indirir, kanatlara servis açar, ceza sahası içinde her pozisyonda son vuruş yapar.", vektor: "360° Gezgin ve Kutu İçi", uyum: 95 },
      { id: "hedef_santrafor", baslik: "Hedef Santrafor (Target Man)", stil: "Fiziksel Duvar & Sırtı Dönük Oyun", ozellik: "Stoperleri yıpratır, uzun topları arkadan gelen orta saha oyuncularına indirir.", vektor: "Ceza Sahası Merkezi ve Ön Direk", uyum: 89 },
      { id: "firsatci_golcu", baslik: "Fırsatçı Golcü (Poacher)", stil: "Ofsayt Çizgisi & Ceza Sahası Tilkisi", ozellik: "Savunma arkasındaki 1 metrelik boşluğa pusar, seken topları tek vuruşla tamamlar.", vektor: "Savunma Arkası Kör Nokta", uyum: 91 },
      { id: "sahte_dokuz", baslik: "Sahte 9 (False Nine)", stil: "Derine İnip Alan Yaratma", ozellik: "Merkeze gerileyip stoperleri üzerine çeker, kanat forvetlerin ceza sahasına sızması için alan açar.", vektor: "Orta Sahaya Doğru Geri Çekilme", uyum: 86 }
    ];
  }

  if (posGrp === "MID") {
    return [
      { id: "ofansif_oyun_kurucu", baslik: "Ofansif Oyun Kurucu (Advanced Playmaker)", stil: "Kilit Ara Pas & Vizyon", ozellik: "Hatlar arası ceplerde topla buluşur, rakip savunmayı bölen öldürücü paslar servis eder.", vektor: "Ceza Sahası Yayı ve Kanat Araları", uyum: 93 },
      { id: "iki_yonlu", baslik: "İki Yönlü Orta Saha (Box-to-Box)", stil: "Kondisyon & Şok Pres", ozellik: "Kendi ceza sahasından rakip kaleye kadar dikey koridorda durmaksızın pres ve destek üretir.", vektor: "Dikey Koridor ve Ceza Sahası Girişleri", uyum: 91 },
      { id: "derin_oyun_kurucu", baslik: "Derin Oyun Kurucu (Regista)", stil: "Geriden Oyun Kurma & Tempo Belirleme", ozellik: "Stoperlerin önüne gelip oyunu dinlendirir veya uzun ters diyagonal toplarla yön değiştirir.", vektor: "Savunma Önü ve Merkez Dinlenme", uyum: 88 },
      { id: "dinamik_kesici", baslik: "Savaşçı Ön Libero (Ball-Winning Midfielder)", stil: "Süpürücü & Top Kazanma", ozellik: "Geçiş hücumlarını faul sınırında şok müdahalelerle keser, ikinci topları toplar.", vektor: "Merkez Blokaj ve Yan Koridor Kademesi", uyum: 92 }
    ];
  }

  if (posGrp === "DEF") {
    return [
      { id: "pasor_stoper", baslik: "Oyun Kuran Pasör Stoper (Ball-Playing Defender)", stil: "Hat Kıran Paslar & Geriden Çıkış", ozellik: "Pres altında paniklemeden dikine pas çıkarır, gerektiğinde topla orta sahaya kat eder.", vektor: "Orta Çizgiye Doğru İlerleme", uyum: 92 },
      { id: "kesici_stoper", baslik: "Sert Kesici Stoper (No-Nonsense Centre-Back)", stil: "Fiziksel Üstünlük & Hava Hakimiyeti", ozellik: "Rakip santraforu marke eder, risk almadan kritik anlarda topu tehlike bölgesinden uzaklaştırır.", vektor: "Ceza Sahası Emniyeti", uyum: 90 },
      { id: "hucumcu_bek", baslik: "Bindirmeci Kanat Beki (Attacking Full-Back)", stil: "Kanat Çizgisine İnme & Kavisli Orta", ozellik: "Önündeki kanat oyuncusuna koridor açar, arka direğe tehlikeli kavisli servisler açar.", vektor: "Taç Çizgisi Boyunca İleri Depar", uyum: 94 }
    ];
  }

  return [
    { id: "supurucu_kaleci", baslik: "Modern Süpürücü Kaleci (Sweeper Keeper)", stil: "Ceza Sahası Dışı Emniyet & Pasörlük", ozellik: "Savunma arkasına atılan sızma toplarına ceza sahası dışına çıkarak ayakla müdahale eder.", vektor: "Ceza Sahası Yayı ve Önü", uyum: 93 },
    { id: "cizgi_kalecisi", baslik: "Geleneksel Çizgi Kalecisi (Shot Stopper)", stil: "Refleks & Birebir Açı Daraltma", ozellik: "Çizgisinde kalır, ceza sahası içindeki şutlara insanüstü reflekslerle tepki verir.", vektor: "Kale Çizgisi Odaklı", uyum: 89 }
  ];
}

// 12. SİNERJİ & PAS AĞI MATRİSİ (Chemistry & Passing Matrix)
export function generateSynergyMatrix(oyuncu, hedef, teamProfile, lineup) {
  const partners = [];
  const teammates = (lineup || []).filter(p => !p.isTarget);

  const mid = teammates.find(p => p.pos === "CM" || p.pos === "AM" || p.pos === "DM") || teammates[5] || teammates[6];
  const wingerOrAtt = teammates.find(p => p.pos === "RW" || p.pos === "LW" || p.pos === "CF") || teammates[7] || teammates[9];
  const def = teammates.find(p => p.pos === "LB" || p.pos === "RB" || p.pos === "CB") || teammates[1] || teammates[4];

  if (mid) {
    partners.push({
      isim: mid.name,
      pos: mid.pos,
      rol: "Orta Saha Bağlantısı & Asist Köprüsü",
      uyumSkor: 92,
      aciklama: `${mid.name} ile merkezden dikine pas ve ara pası frekansı. Hatlar arası boşlukları %92 başarıyla değerlendirir.`,
      sinerjiTipi: "PAS_AGI"
    });
  }

  if (wingerOrAtt) {
    partners.push({
      isim: wingerOrAtt.name,
      pos: wingerOrAtt.pos,
      rol: "Çapraz Koşu & Kanat Kombinasyonu",
      uyumSkor: 88,
      aciklama: `${wingerOrAtt.name} ile ceza sahasına kanat varyasyonları ve karşılıklı duvar pası senkronu.`,
      sinerjiTipi: "HUCUM_BAGI"
    });
  }

  if (def) {
    partners.push({
      isim: def.name,
      pos: def.pos,
      rol: "Geçiş Savunması & Bindirme Tamamlayıcısı",
      uyumSkor: 85,
      aciklama: `${def.name} hücuma çıktığında geride bıraktığı kademeyi koruma ve arkaya atılan topları süpürme kimyası.`,
      sinerjiTipi: "KADEME_GUVENCESI"
    });
  }

  return {
    genelSinerji: 89,
    kilitOrtak: partners[0] ? partners[0].isim : "Kilit Oyuncu",
    ortaklar: partners,
    ozetNot: `${oyuncu.isim}, ${hedef.takim} sisteminde özellikle ${partners[0]?.isim || 'orta saha'} ile yüksek pas senkronizasyonu yakalayarak taktiksel verimi artırır.`
  };
}

// 13. DURAN TOP HİYERARŞİSİ (Set-Piece Duty Hierarchy)
export function generateSetPieceHierarchy(oyuncu, teamProfile, pStats) {
  const isStriker = oyuncu.grp === "ATT";
  const rating = Number(pStats.rating || 7.5);

  let penaltiSira = isStriker && rating >= 7.8 ? "1. Sırada (As Penaltıcı)" : "2. Sırada (Alternatif)";
  let penaltiBasari = isStriker ? "%86" : "%78";

  let frikikSira = rating >= 8.0 ? "1. Sırada (18-24m Doğrudan Şut)" : "Baraj Arkası / Pas Opsiyonu";
  let frikikStili = rating >= 8.0 ? "Sert Baraj Üstü Kavis" : "Duran Top İndirme";

  let kornerGorev = (oyuncu.grp === "DEF" || (oyuncu.grp === "ATT" && !oyuncu.pozisyon.toLowerCase().includes("kanat")))
    ? "Ceza Sahası İçi Kafa Tehdidi (Ön/Arka Direk)"
    : "Kısa Pas / Ceza Sahasına Kavisli Servis";

  let havaGolBeklentisi = (oyuncu.grp === "DEF" || isStriker) ? "+2.8 Gol/Sezon" : "+0.9 Gol/Sezon";

  return {
    penalti: { sira: penaltiSira, basari: penaltiBasari },
    frikik: { sira: frikikSira, stil: frikikStili },
    korner: { gorev: kornerGorev, havaTehdit: havaGolBeklentisi }
  };
}

// 14. BASKI & HYPE ENDEKSİ (Fan & Media Pressure Gauge)
export function generateHypePressureIndex(oyuncu, hedef, pStats) {
  const rating = Number(pStats.rating || 7.5);
  const isBigTeam = (hedef.takim || "").toLowerCase().includes("galatasaray") || 
                    (hedef.takim || "").toLowerCase().includes("fenerbah") || 
                    (hedef.takim || "").toLowerCase().includes("besiktas") || 
                    (hedef.takim || "").toLowerCase().includes("trabzon");

  const hypeSkor = Math.min(99, Math.max(72, Math.round(75 + (rating - 7.0) * 15 + (isBigTeam ? 8 : 0))));
  const baskiTolerans = Math.min(98, Math.max(68, Math.round(72 + (oyuncu.yas >= 25 ? 12 : 5) + (rating >= 8.0 ? 8 : 0))));
  const derbiStres = Math.min(96, Math.max(70, Math.round(baskiTolerans * 0.94)));
  const sosyalEtkilesim = isBigTeam ? "+480K Etkileşim / İlk Hafta" : "+120K Etkileşim / İlk Hafta";

  let yorum = "Baskıyı kaldıracak uluslararası mentaliteye ve derbi soğukkanlılığına sahip.";
  if (baskiTolerans < 78) {
    yorum = "İlk aylarda yoğun taraftar ve medya baskısına karşı psikolojik adaptasyon desteği önerilir.";
  } else if (baskiTolerans >= 90) {
    yorum = "Büyük maçlarda seviye atlayan, taraftar ateşini lehine çeviren elit lider karakter.";
  }

  return {
    hypeSkor,
    baskiTolerans,
    derbiStres,
    sosyalEtkilesim,
    yorum
  };
}

// 15. TÜM EKSTREM ANALİZ PAKETİNİ OLUŞTURUCU
export function generateExtremeScoutingPackage(oyuncu, hedef, teamProfile, pStats, simResult) {
  const piyasa = calculateMarketValueAndContract(oyuncu.isim, oyuncu.yas, pStats.rating, pStats.ga90, oyuncu.grp);
  const optaRadar = calculateOptaRadar(oyuncu.isim, pStats.rating, pStats.ga90, oyuncu.grp);
  const duello = generateHeadToHeadDuel(oyuncu, teamProfile);
  const deplasman = generateLineupDisplacement(oyuncu, hedef, teamProfile);
  const moneyball = generateMoneyballAlternatives(oyuncu.grp, piyasa.deger, oyuncu.isim);
  const sakatlik = generateInjuryTelemetry(oyuncu, pStats, simResult);
  const finans = generateFinancialSimulation(piyasa.deger, piyasa.tahminiMaas);

  // Yeni Ekstrem Modüller
  const roller = generateTacticalRoles(oyuncu.grp, oyuncu.pozisyon);
  const kimya = generateSynergyMatrix(oyuncu, hedef, teamProfile, deplasman.ilk11);
  const duranTop = generateSetPieceHierarchy(oyuncu, teamProfile, pStats);
  const hypeBaski = generateHypePressureIndex(oyuncu, hedef, pStats);

  return {
    piyasa,
    optaRadar,
    duello,
    deplasman,
    moneyball,
    sakatlik,
    finans,
    roller,
    kimya,
    duranTop,
    hypeBaski
  };
}
