// Basit sözlük tabanlı i18n. Şu an TR ve EN tam çalışıyor; diğerleri arayüzde
// listelenir ama "Yakında" etiketiyle — henüz gerçek çeviri içermiyorlar.
export const DILLER = [
  { kod: 'tr', bayrak: '🇹🇷', kisa: 'TR', ad: 'Türkçe', hazir: true },
  { kod: 'en', bayrak: '🇬🇧', kisa: 'EN', ad: 'English', hazir: true },
  { kod: 'es', bayrak: '🇪🇸', kisa: 'ES', ad: 'Español', hazir: false },
  { kod: 'pt', bayrak: '🇧🇷', kisa: 'BR', ad: 'Português', hazir: false },
  { kod: 'de', bayrak: '🇩🇪', kisa: 'DE', ad: 'Deutsch', hazir: false },
  { kod: 'fr', bayrak: '🇫🇷', kisa: 'FR', ad: 'Français', hazir: false },
  { kod: 'it', bayrak: '🇮🇹', kisa: 'IT', ad: 'Italiano', hazir: false },
  { kod: 'ar', bayrak: '🇸🇦', kisa: 'SA', ad: 'العربية', hazir: false },
]

const SOZLUK = {
  tr: {
    tabTransfer: 'Transfer Analizi', tabSkor: 'Canlı Skorlar',
    heroBaslik: 'Futbol Dijital İkiz', heroAlt: 'Transfer Uyum Simülatörü',
    heroAciklama: 'Gerçek veriler ve Monte Carlo simülasyonu ile bir futbolcunun hedef takımdaki uyumunu, beklenen katkısını ve sakatlık riskini öngör.',
    lblOyuncu: 'OYUNCU', lblHedef: 'HEDEF TAKIM', phOyuncu: 'ör. Lautaro Martinez', phHedef: 'ör. Fenerbahçe',
    btnAnaliz: 'ANALİZ ET', btnIsleniyor: 'İşleniyor...', gecmis: 'Geçmiş Futbolcular', gecmisYok: 'Henüz analiz yok.',
    bosDurum: 'Soldan bir <b>oyuncu</b> ve <b>hedef takım</b> yaz, <b>Analiz Et</b>\u2019e bas. Sonuçların geçmişe kaydedilir.',
    uyumBilesenleri: 'Uyum Bileşenleri', parametreler: 'Hesaplanan parametreler (gerçek veriden)',
    skorHero: 'Canlı Skorlar', skorAlt: 'Tüm dünyadan ligler — bir maça tıkla, istatistiklerini ve kadrolarını gör.',
    bugun: 'Bugün', dun: 'Dün', yarin: 'Yarın', canli: 'canlı',
    maçYok: 'Bu tarihte maç bulunamadı.', getiriliyor: 'Maçlar getiriliyor...',
  },
  en: {
    tabTransfer: 'Transfer Analysis', tabSkor: 'Live Scores',
    heroBaslik: 'Football Digital Twin', heroAlt: 'Transfer Fit Simulator',
    heroAciklama: 'Using real data and Monte Carlo simulation, predict a player\u2019s fit at a target club, their expected contribution and injury risk.',
    lblOyuncu: 'PLAYER', lblHedef: 'TARGET CLUB', phOyuncu: 'e.g. Lautaro Martinez', phHedef: 'e.g. Fenerbahçe',
    btnAnaliz: 'ANALYZE', btnIsleniyor: 'Processing...', gecmis: 'Past Searches', gecmisYok: 'No analysis yet.',
    bosDurum: 'Enter a <b>player</b> and <b>target club</b> on the left, then press <b>Analyze</b>. Results are saved to history.',
    uyumBilesenleri: 'Fit Components', parametreler: 'Calculated parameters (from real data)',
    skorHero: 'Live Scores', skorAlt: 'Leagues from around the world — tap a match to see stats and lineups.',
    bugun: 'Today', dun: 'Yesterday', yarin: 'Tomorrow', canli: 'live',
    maçYok: 'No matches found for this date.', getiriliyor: 'Loading matches...',
  },
}

export function ceviriUret(kod) {
  const d = SOZLUK[kod] || SOZLUK.tr
  return (anahtar) => d[anahtar] ?? SOZLUK.tr[anahtar] ?? anahtar
}
