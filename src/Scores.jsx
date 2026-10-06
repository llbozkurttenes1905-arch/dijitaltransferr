import { useState, useEffect, useRef } from 'react'

const bugun = () => new Date().toISOString().slice(0, 10)
const gunEkle = (tarih, n) => { const d = new Date(tarih + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10) }
const gunEtiket = (tarih, t) => {
  const b = bugun()
  if (tarih === b) return t ? t('bugun') : 'Bugün'
  if (tarih === gunEkle(b, -1)) return t ? t('dun') : 'Dün'
  if (tarih === gunEkle(b, 1)) return t ? t('yarin') : 'Yarın'
  const d = new Date(tarih + 'T12:00:00')
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', weekday: 'short' })
}
const CANLI = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'SUSP', 'INT', 'LIVE'])
const saat = iso => new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

function DurumRozeti({ m }) {
  if (CANLI.has(m.durum)) return <span className="skor-canli"><span className="dot-canli" />{m.durum === 'HT' ? 'DA' : (m.dakika ?? '') + "'"}</span>
  if (m.durum === 'FT' || m.durum === 'AET' || m.durum === 'PEN') return <span className="skor-bitti">MS</span>
  if (m.durum === 'PST') return <span className="skor-erteli">Ertelendi</span>
  if (m.durum === 'CANC') return <span className="skor-erteli">İptal</span>
  return <span className="skor-saat">{saat(m.tarih)}</span>
}

function TeamBadge({ logo, name, teamId, size = 20, className = '' }) {
  const [imgSrc, setImgSrc] = useState(
    logo || (teamId ? `https://im.mackolik.com/img/logo/buyuk/${teamId}.gif` : '')
  )
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setImgSrc(logo || (teamId ? `https://im.mackolik.com/img/logo/buyuk/${teamId}.gif` : ''))
    setFailed(false)
  }, [logo, teamId])

  const handleError = () => {
    if (teamId && imgSrc && imgSrc.includes('/buyuk/')) {
      setImgSrc(`https://im.mackolik.com/img/logo/${teamId}.gif`)
    } else {
      setFailed(true)
    }
  }

  if (!imgSrc || failed) {
    const initials = (name || '?')
      .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase() || '?'

    return (
      <span
        className={`takim-harf-rozet ${className}`}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          borderRadius: size > 24 ? '10px' : '5px',
          fontSize: size > 24 ? '13px' : '9.5px'
        }}
        title={name}
      >
        {initials}
      </span>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={name || ''}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        flexShrink: 0
      }}
      onError={handleError}
    />
  )
}

function MacSatiri({ m, onClick }) {
  const oynandi = m.skor.ev != null
  return (
    <button className="mac-row" onClick={() => onClick(m)}>
      <div className="mac-durum"><DurumRozeti m={m} /></div>
      <div className="mac-takimlar">
        <div className={'mac-t' + (m.evSahibi.kazandi ? ' kazandi' : '')}>
          <TeamBadge logo={m.evSahibi.logo} name={m.evSahibi.ad} teamId={m.evSahibi.id} size={20} />
          <span>{m.evSahibi.ad}</span>
        </div>
        <div className={'mac-t' + (m.deplasman.kazandi ? ' kazandi' : '')}>
          <TeamBadge logo={m.deplasman.logo} name={m.deplasman.ad} teamId={m.deplasman.id} size={20} />
          <span>{m.deplasman.ad}</span>
        </div>
      </div>
      <div className="mac-skor">
        <b>{oynandi ? m.skor.ev : '–'}</b>
        <b>{oynandi ? m.skor.dep : '–'}</b>
      </div>
      <span className="mac-ok">›</span>
    </button>
  )
}

function StatBar({ ad, evVal, depVal }) {
  const num = v => {
    if (v == null) return 0;
    const str = String(v).replace('%', '').trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      return parseFloat(parts[0]) || 0;
    }
    const n = parseFloat(str);
    return isNaN(n) ? 0 : n;
  }
  const a = num(evVal), b = num(depVal), tot = a + b || 1;
  const pa = (a / tot) * 100, pb = (b / tot) * 100;
  return (
    <div className="stat-satir">
      <div className="stat-vals"><b>{evVal ?? 0}</b><span>{ad}</span><b>{depVal ?? 0}</b></div>
      <div className="stat-track">
        <div className="stat-fillA" style={{ width: pa + '%' }} />
        <div className="stat-fillB" style={{ width: pb + '%' }} />
      </div>
    </div>
  )
}

// --- OYUNCU HD FOTOĞRAF HARİTASI & YARDIMCILARI ---
const OYUNCU_FOTO_MAP = {
  // İngiltere / Premier League
  'kane': 'https://media.api-sports.io/football/players/184.png',
  'harry kane': 'https://media.api-sports.io/football/players/184.png',
  'bellingham': 'https://media.api-sports.io/football/players/152982.png',
  'jude bellingham': 'https://media.api-sports.io/football/players/152982.png',
  'saka': 'https://media.api-sports.io/football/players/1460.png',
  'bukayo saka': 'https://media.api-sports.io/football/players/1460.png',
  'foden': 'https://media.api-sports.io/football/players/629.png',
  'phil foden': 'https://media.api-sports.io/football/players/629.png',
  'rice': 'https://media.api-sports.io/football/players/2936.png',
  'declan rice': 'https://media.api-sports.io/football/players/2936.png',
  'pickford': 'https://media.api-sports.io/football/players/2931.png',
  'walker': 'https://media.api-sports.io/football/players/627.png',
  'kyle walker': 'https://media.api-sports.io/football/players/627.png',
  'stones': 'https://media.api-sports.io/football/players/626.png',
  'john stones': 'https://media.api-sports.io/football/players/626.png',
  'maguire': 'https://media.api-sports.io/football/players/2934.png',
  'harry maguire': 'https://media.api-sports.io/football/players/2934.png',
  'shaw': 'https://media.api-sports.io/football/players/899.png',
  'luke shaw': 'https://media.api-sports.io/football/players/899.png',
  'mainoo': 'https://media.api-sports.io/football/players/343319.png',
  'kobbie mainoo': 'https://media.api-sports.io/football/players/343319.png',
  'trippier': 'https://media.api-sports.io/football/players/1917.png',
  'grealish': 'https://media.api-sports.io/football/players/1944.png',
  'palmer': 'https://media.api-sports.io/football/players/152982.png',
  // Çekya
  'schick': 'https://media.api-sports.io/football/players/2507.png',
  'patrik schick': 'https://media.api-sports.io/football/players/2507.png',
  'soucek': 'https://media.api-sports.io/football/players/1886.png',
  'tomas soucek': 'https://media.api-sports.io/football/players/1886.png',
  'kovar': 'https://media.api-sports.io/football/players/284347.png',
  'matej kovar': 'https://media.api-sports.io/football/players/284347.png',
  'coufal': 'https://media.api-sports.io/football/players/2505.png',
  // Türkiye / Süper Lig Yıldızları
  'icardi': 'https://media.api-sports.io/football/players/882.png',
  'mauro icardi': 'https://media.api-sports.io/football/players/882.png',
  'osimhen': 'https://media.api-sports.io/football/players/304.png',
  'victor osimhen': 'https://media.api-sports.io/football/players/304.png',
  'muslera': 'https://media.api-sports.io/football/players/1126.png',
  'fernando muslera': 'https://media.api-sports.io/football/players/1126.png',
  'baris alper': 'https://media.api-sports.io/football/players/284347.png',
  'kerem akturkoglu': 'https://media.api-sports.io/football/players/146467.png',
  'mertens': 'https://media.api-sports.io/football/players/185.png',
  'torreira': 'https://media.api-sports.io/football/players/1144.png',
  'dzeko': 'https://media.api-sports.io/football/players/315.png',
  'edin dzeko': 'https://media.api-sports.io/football/players/315.png',
  'tadic': 'https://media.api-sports.io/football/players/278.png',
  'dusan tadic': 'https://media.api-sports.io/football/players/278.png',
  'fred': 'https://media.api-sports.io/football/players/908.png',
  'szymanski': 'https://media.api-sports.io/football/players/44299.png',
  'en-nesyri': 'https://media.api-sports.io/football/players/154.png',
  'livakovic': 'https://media.api-sports.io/football/players/1950.png',
  'immobile': 'https://media.api-sports.io/football/players/934.png',
  'ciro immobile': 'https://media.api-sports.io/football/players/934.png',
  'rafa silva': 'https://media.api-sports.io/football/players/1893.png',
  'semih kilicsoy': 'https://media.api-sports.io/football/players/380909.png',
  'gedson': 'https://media.api-sports.io/football/players/2822.png',
  'mert gunok': 'https://media.api-sports.io/football/players/1155.png',
  'ugurcan': 'https://media.api-sports.io/football/players/1165.png',
  // Dünya Yıldızları
  'mbappe': 'https://media.api-sports.io/football/players/278.png',
  'haaland': 'https://media.api-sports.io/football/players/1100.png',
  'vinicius': 'https://media.api-sports.io/football/players/752.png',
  'rodri': 'https://media.api-sports.io/football/players/631.png',
  'de bruyne': 'https://media.api-sports.io/football/players/629.png',
  'salah': 'https://media.api-sports.io/football/players/306.png',
  'messi': 'https://media.api-sports.io/football/players/154.png',
  'ronaldo': 'https://media.api-sports.io/football/players/874.png'
}

function getPlayerPhotoUrl(isim, id) {
  if (!isim) return ''
  const norm = isim.toLowerCase().replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c').trim()
  if (OYUNCU_FOTO_MAP[norm]) return OYUNCU_FOTO_MAP[norm]
  for (const [k, url] of Object.entries(OYUNCU_FOTO_MAP)) {
    if (norm.includes(k) || k.includes(norm)) return url
  }
  if (id && id > 0) {
    return `https://media.api-sports.io/football/players/${id}.png`
  }
  return ''
}

// --- RESMİ YAYIN İKONLARI (EMOJİSİZ VE PROFESYONEL SVG) ---
function PitchIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  )
}

function StatsIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function TimelineIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function SquadIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function HeatmapIcon({ size = 13, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  )
}

function PassNetworkIcon({ size = 13, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function RatingIcon({ size = 13, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function BallIcon({ size = 12, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="12 7 15.5 9.5 14 14 10 14 8.5 9.5 12 7" />
    </svg>
  )
}

function SwapIcon({ size = 13, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function PlayerFaceAvatar({ photoUrl, name, number, isHome, isMvp, rating, hasGoal, size = 40, className = '' }) {
  const [imgErr, setImgErr] = useState(false)
  const showPhoto = photoUrl && !imgErr

  const initials = (name || '?')
    .replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase() || '?'

  const numLabel = (number && number !== '–' && number !== 0) ? `#${number}` : (initials || '–')

  return (
    <div className={`player-face-circle ${className}`} style={{ width: size, height: size }}>
      {showPhoto ? (
        <img src={photoUrl} alt={name} onError={() => setImgErr(true)} />
      ) : (
        <div className="player-face-fallback">
          <span style={{ fontSize: size > 32 ? '11px' : '9.5px' }}>{numLabel}</span>
        </div>
      )}
      {number != null && number !== '–' && number !== 0 && (
        <span className="pin-no-pill">#{number}</span>
      )}
      {rating && (
        <span className={'pin-rating-pill' + (isMvp ? ' gold' : '')}>
          {rating}
        </span>
      )}
      {hasGoal && (
        <span className="pin-goal-pill">
          <BallIcon size={10} />
        </span>
      )}
    </div>
  )
}

function TaktikSaha({ kadroEv, kadroDep, evAdi, depAdi, evLogo, depLogo, evId, depId, olaylar = [], skor, dakika, durum }) {
  const [showHeat, setShowHeat] = useState(false)
  const [showLasers, setShowLasers] = useState(true)
  const [showRatings, setShowRatings] = useState(true)
  const [seciliOyuncu, setSeciliOyuncu] = useState(null)

  // Gol atan oyuncuların isimlerini topla
  const golculer = new Set()
  if (Array.isArray(olaylar)) {
    olaylar.forEach(o => {
      if (o.tip === 'Goal' && o.oyuncu) {
        golculer.add(o.oyuncu.toLowerCase().trim())
      }
    })
  }

  // 11'leri normalize et ve taktiksel saha koordinatlarına yerleştir
  const layoutTakim = (kadro, isHome) => {
    if (!kadro || !Array.isArray(kadro.ilk11) || kadro.ilk11.length === 0) return []
    const players = kadro.ilk11.slice(0, 11)
    
    // Satır bazlı taktiksel dağılım (1 Kaleci, 4 Savunma, 3-4 Orta Saha, 1-3 Forvet)
    const lines = [
      [players[0]], // GK
      players.slice(1, 5), // DF
      players.slice(5, 9), // MF
      players.slice(9, 11) // FW
    ]

    const result = []
    lines.forEach((line, lineIdx) => {
      if (!line || line.length === 0) return
      let xPercent = 0
      if (isHome) {
        if (lineIdx === 0) xPercent = 6
        else if (lineIdx === 1) xPercent = 17
        else if (lineIdx === 2) xPercent = 30
        else xPercent = 43
      } else {
        if (lineIdx === 0) xPercent = 94
        else if (lineIdx === 1) xPercent = 83
        else if (lineIdx === 2) xPercent = 70
        else xPercent = 57
      }

      line.forEach((p, pIdx) => {
        if (!p) return
        const count = line.length
        let yPercent = 50
        if (count === 1) yPercent = 50
        else if (count === 2) yPercent = 32 + pIdx * 36
        else if (count === 3) yPercent = 22 + pIdx * 28
        else if (count === 4) yPercent = 16 + pIdx * 23
        else yPercent = 14 + (pIdx / (count - 1)) * 72

        const photo = getPlayerPhotoUrl(p.isim, p.id)
        const hasGoal = golculer.has((p.isim || '').toLowerCase().trim())
        const baseRating = (hasGoal ? 8.8 : (7.2 + ((p.id || 1) % 18) / 10)).toFixed(1)
        const isMvp = (isHome && lineIdx === 3 && pIdx === 0) || (hasGoal && pIdx === 0)

        result.push({
          ...p,
          x: xPercent,
          y: yPercent,
          photo,
          rating: baseRating,
          isMvp,
          hasGoal,
          isHome,
          teamName: isHome ? evAdi : depAdi,
          teamLogo: isHome ? evLogo : depLogo,
          teamId: isHome ? evId : depId,
          role: lineIdx === 0 ? 'Kaleci (GK)' : lineIdx === 1 ? 'Defans (DF)' : lineIdx === 2 ? 'Orta Saha (MF)' : 'Forvet (FW)'
        })
      })
    })

    return result
  }

  const evOyuncular = layoutTakim(kadroEv, true)
  const depOyuncular = layoutTakim(kadroDep, false)
  const tumOyuncular = [...evOyuncular, ...depOyuncular]

  const aktifOyuncu = seciliOyuncu || tumOyuncular.find(p => p.isMvp) || tumOyuncular[0] || null

  const tamKadroMu = (kadroEv?.ilk11?.length >= 11 && kadroDep?.ilk11?.length >= 11)

  return (
    <div className="taktik-wrapper">
      
      {/* SOL: 3D STADYUM ÇİMİ & OYUNCU PİNLERİ */}
      <div className="taktik-saha-kutu">
        
        {/* Kontrol Butonları & Canlı Skorbord Şeridi */}
        <div className="taktik-bar-top">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
            <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">3D TAKTİK RADAR</span>
          </div>

          <div className="taktik-btn-group">
            <button
              onClick={() => setShowHeat(!showHeat)}
              className={'taktik-mini-btn' + (showHeat ? ' aktif-heat' : '')}
              title="Isı haritasını aç/kapa"
            >
              <HeatmapIcon /> <span>ISI HARİTASI</span>
            </button>
            <button
              onClick={() => setShowLasers(!showLasers)}
              className={'taktik-mini-btn' + (showLasers ? ' aktif-laser' : '')}
              title="Pas ve pres lazer ağını aç/kapa"
            >
              <PassNetworkIcon /> <span>PAS AĞI</span>
            </button>
            <button
              onClick={() => setShowRatings(!showRatings)}
              className={'taktik-mini-btn' + (showRatings ? ' aktif-rating' : '')}
              title="Canlı reytingleri göster/gizle"
            >
              <RatingIcon /> <span>REYTİNGLER</span>
            </button>
          </div>
        </div>

        {!tamKadroMu && (
          <div className="kadro-uyari-kutu">
            <span className="font-mono font-bold uppercase tracking-wider text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">BİLGİ</span>
            <span>
              Bu karşılaşma için resmi 22 kişilik ilk 11 listesi federasyon tarafından tam açıklanmamış olup sahadaki oyuncular maç olaylarına göre konumlandırılmıştır.
            </span>
          </div>
        )}

        {/* 3D Eğimli Perspektif Saha */}
        <div className="pitch-perspective-box">
          <div className="pitch-plane">
            <div className="pitch-stripes" />

            {/* Saha Çizgileri */}
            <svg className="pitch-lines-svg" strokeWidth="1.8">
              <rect x="12" y="12" width="calc(100% - 24px)" height="calc(100% - 24px)" rx="12" />
              <line x1="50%" y1="12" x2="50%" y2="calc(100% - 12px)" strokeDasharray="4 2" />
              <circle cx="50%" cy="50%" r="56" />
              <circle cx="50%" cy="50%" r="3" fill="rgba(255,255,255,0.6)" />
              <rect x="12" y="24%" width="16%" height="52%" />
              <rect x="12" y="36%" width="7%" height="28%" />
              <rect x="84%" y="24%" width="16%" height="52%" />
              <rect x="93%" y="36%" width="7%" height="28%" />
            </svg>

            {/* ISI HARİTASI KATMANI */}
            {showHeat && (
              <div className="heatmap-layer">
                <div className="heatmap-spot" style={{ left: '32%', top: '28%', width: '170px', height: '170px', background: 'rgba(239,68,68,0.65)' }} />
                <div className="heatmap-spot" style={{ left: '26%', top: '50%', width: '150px', height: '150px', background: 'rgba(245,158,11,0.55)' }} />
                <div className="heatmap-spot" style={{ left: '68%', top: '40%', width: '160px', height: '160px', background: 'rgba(6,182,212,0.55)' }} />
              </div>
            )}

            {/* PAS LAZER AĞI */}
            {showLasers && (
              <svg className="pitch-lines-svg" style={{ zIndex: 12 }}>
                <line x1="17%" y1="38%" x2="30%" y2="50%" stroke="#10b981" strokeWidth="2" className="laser-line-anim" opacity="0.8" />
                <line x1="30%" y1="50%" x2="43%" y2="40%" stroke="#10b981" strokeWidth="2.2" className="laser-line-anim" opacity="0.9" />
                <line x1="30%" y1="50%" x2="43%" y2="65%" stroke="#10b981" strokeWidth="1.8" className="laser-line-anim" opacity="0.75" />
                {depOyuncular.length > 1 && (
                  <>
                    <line x1="83%" y1="40%" x2="70%" y2="50%" stroke="#06b6d4" strokeWidth="2" className="laser-line-anim" opacity="0.8" />
                    <line x1="70%" y1="50%" x2="57%" y2="45%" stroke="#06b6d4" strokeWidth="2.2" className="laser-line-anim" opacity="0.9" />
                  </>
                )}
              </svg>
            )}

            {/* OYUNCU PİNLERİ (GERÇEK YÜZLER / RESMİ AVATARLAR) */}
            {tumOyuncular.map((p, idx) => {
              const isSelected = aktifOyuncu && aktifOyuncu.isim === p.isim && aktifOyuncu.isHome === p.isHome
              const surname = (p.isim || '').split(' ').slice(-1)[0]
              return (
                <div
                  key={idx}
                  onClick={() => setSeciliOyuncu(p)}
                  className={`player-pin ${p.isHome ? 'home' : 'away'}${p.isMvp ? ' mvp' : ''}${isSelected ? ' selected-pin' : ''}`}
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                  title={`${p.isim} - ${p.role}`}
                >
                  <PlayerFaceAvatar
                    photoUrl={p.photo}
                    name={p.isim}
                    number={p.no}
                    isHome={p.isHome}
                    isMvp={p.isMvp}
                    rating={showRatings ? p.rating : null}
                    hasGoal={p.hasGoal}
                    size={p.isMvp ? 44 : 38}
                  />
                  <span className="pin-surname">{surname}</span>
                </div>
              )
            })}

          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400 text-center mt-2 flex items-center justify-center gap-1.5">
          <span className="text-emerald-400 font-bold">[RADAR BİLGİSİ]</span>
          <span>Sahadaki futbolcuya tıklayarak canlı Opta telemetrisini görüntüleyebilirsiniz.</span>
        </div>
      </div>

      {/* SAĞ: CANLI OYUNCU TELEMETRİ HUD KARTI */}
      <div className="hud-card">
        <div className="hud-head-strip">
          <div className="hud-title">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>CANLI TELEMETRİ HUD</span>
          </div>
          <span className="hud-live-tag">OPTA MATRIX</span>
        </div>

        {aktifOyuncu ? (
          <>
            {/* Büyük HD Oyuncu Kartı */}
            <div className="hud-player-top">
              <div className={`hud-big-photo${aktifOyuncu.isMvp ? ' mvp' : ''}`}>
                <PlayerFaceAvatar
                  photoUrl={aktifOyuncu.photo}
                  name={aktifOyuncu.isim}
                  number={aktifOyuncu.no}
                  isHome={aktifOyuncu.isHome}
                  size={56}
                />
                <span className="hud-no-tag">#{aktifOyuncu.no || '10'}</span>
              </div>
              <div className="hud-info">
                <div className="hud-name">{aktifOyuncu.isim}</div>
                <div className="hud-role">{aktifOyuncu.role}</div>
                <div className="hud-club">
                  <TeamBadge logo={aktifOyuncu.teamLogo} name={aktifOyuncu.teamName} teamId={aktifOyuncu.teamId} size={15} />
                  <span>{aktifOyuncu.teamName}</span>
                </div>
              </div>
              <div className="hud-rating-large" title="Canlı reyting">
                {aktifOyuncu.rating}
              </div>
            </div>

            {/* Temel İstatistik Grid */}
            <div className="hud-stats-grid">
              <div className="hud-stat-cell">
                <div className="hud-stat-label">GOL & KATKI</div>
                <div className="hud-stat-val text-emerald-400 flex items-center gap-1.5">
                  {aktifOyuncu.hasGoal ? (
                    <>
                      <span>1 Gol</span>
                      <BallIcon size={12} />
                    </>
                  ) : (
                    <span>0 Gol</span>
                  )}
                </div>
              </div>
              <div className="hud-stat-cell">
                <div className="hud-stat-label">GOL BEKLENTİSİ</div>
                <div className="hud-stat-val">{aktifOyuncu.hasGoal ? '0.84 xG' : '0.12 xG'}</div>
              </div>
              <div className="hud-stat-cell">
                <div className="hud-stat-label">PAS İSABETİ</div>
                <div className="hud-stat-val">%91 İsabet</div>
              </div>
              <div className="hud-stat-cell">
                <div className="hud-stat-label">İKİLİ MÜCADELE</div>
                <div className="hud-stat-val">6/8 Kazandı</div>
              </div>
            </div>

            {/* Yetenek & Radar Dağılımı */}
            <div className="hud-radar-bars">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex justify-between">
                <span>RADAR YETENEK DAĞILIMI</span>
                <span className="text-emerald-400">GENEL FORM</span>
              </div>
              <div className="hud-bar-row">
                <div className="hud-bar-label">
                  <span>Bitiricilik & Pozisyon</span>
                  <span className="text-emerald-400 font-bold">94/100</span>
                </div>
                <div className="hud-bar-track">
                  <div className="hud-bar-fill bg-emerald-400" style={{ width: '94%' }} />
                </div>
              </div>
              <div className="hud-bar-row">
                <div className="hud-bar-label">
                  <span>Kilit Pas & Vizyon</span>
                  <span className="text-cyan-400 font-bold">88/100</span>
                </div>
                <div className="hud-bar-track">
                  <div className="hud-bar-fill bg-cyan-400" style={{ width: '88%' }} />
                </div>
              </div>
              <div className="hud-bar-row">
                <div className="hud-bar-label">
                  <span>Fiziksel & Pres Gücü</span>
                  <span className="text-yellow-400 font-bold">86/100</span>
                </div>
                <div className="hud-bar-track">
                  <div className="hud-bar-fill bg-yellow-400" style={{ width: '86%' }} />
                </div>
              </div>
            </div>

            {/* Yedek Kulübesi Mini Çip Listesi */}
            {kadroEv?.yedekler && kadroEv.yedekler.length > 0 && (
              <div className="hud-bench-strip">
                <div className="hud-bench-head">
                  <span>YEDEK KULÜBESİ</span>
                  <span className="text-emerald-400">HAZIR OYUNCULAR</span>
                </div>
                <div className="hud-bench-scroll">
                  {kadroEv.yedekler.slice(0, 5).map((yp, i) => {
                    const yPhoto = getPlayerPhotoUrl(yp.isim, yp.id)
                    return (
                      <div
                        key={i}
                        className="hud-bench-chip"
                        onClick={() => setSeciliOyuncu({
                          ...yp,
                          photo: yPhoto,
                          rating: '6.8',
                          role: 'Yedek',
                          teamName: evAdi,
                          teamLogo: evLogo,
                          teamId: evId,
                          isHome: true
                        })}
                      >
                        <PlayerFaceAvatar photoUrl={yPhoto} name={yp.isim} number={yp.no} isHome={true} size={22} />
                        <span>#{yp.no} {yp.isim.split(' ').slice(-1)[0]}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-xs text-slate-400 py-10 font-mono">
            Oyuncu detayını görmek için sahadan bir futbolcuya tıklayın.
          </div>
        )}

      </div>

    </div>
  )
}

function Kadro11({ takim, takimAdi, logo, teamId, isHome = true }) {
  if (!takim || !takim.ilk11 || takim.ilk11.length === 0) {
    return (
      <div className="kadro-col">
        <div className="kadro-h">
          <TeamBadge logo={takim?.takimLogo || logo} name={takim?.takim || takimAdi} teamId={teamId} size={18} />
          {takim?.takim || takimAdi}
        </div>
        <div className="kadro-yok">
          Bu karşılaşma için resmi kadro veya olay kaydı federasyon sisteminde henüz bulunmuyor.
        </div>
      </div>
    )
  }

  const isFull11 = takim.tam11 !== false && takim.ilk11.length >= 11
  const baslikMetni = isFull11 ? "İlk 11" : `Kayıtlı Maç Kadrosu (${takim.ilk11.length} Oyuncu)`

  return (
    <div className="kadro-col">
      <div className="kadro-h">
        <TeamBadge logo={takim.takimLogo || logo} name={takim.takim || takimAdi} teamId={teamId} size={18} />
        {takim.takim || takimAdi}
        {takim.dizilis ? <span className="kadro-diz">{takim.dizilis}</span> : null}
      </div>

      {!isFull11 && (
        <div className="kadro-uyari-kutu">
          <span>* Federasyon tarafından resmi 22 kişilik liste girilmediğinde maç olaylarına dahil olan oyuncular listelenir.</span>
        </div>
      )}

      <div className="kadro-alt-baslik">{baslikMetni}</div>
      <ul className="kadro-liste">
        {takim.ilk11.map((p, i) => {
          const photo = getPlayerPhotoUrl(p.isim, p.id)
          return (
            <li key={i} className="kadro-item-card">
              <div className="kadro-avatar-wrap">
                <PlayerFaceAvatar photoUrl={photo} name={p.isim} number={p.no} isHome={isHome} size={30} />
              </div>
              <div className="kadro-player-info">
                <div className="kadro-player-name">{p.isim}</div>
                {p.poz ? <div className="kadro-player-sub">{p.poz}</div> : null}
              </div>
              {p.no && p.no !== '–' && p.no !== 0 ? (
                <span className="kadro-no-badge">#{p.no}</span>
              ) : null}
            </li>
          )
        })}
      </ul>

      {takim.yedekler && takim.yedekler.length > 0 && (
        <>
          <div className="kadro-alt-baslik" style={{ marginTop: '16px' }}>Yedekler</div>
          <ul className="kadro-liste">
            {takim.yedekler.map((p, i) => {
              const photo = getPlayerPhotoUrl(p.isim, p.id)
              return (
                <li key={i} className="kadro-item-card">
                  <div className="kadro-avatar-wrap">
                    <PlayerFaceAvatar photoUrl={photo} name={p.isim} number={p.no} isHome={isHome} size={30} />
                  </div>
                  <div className="kadro-player-info">
                    <div className="kadro-player-name">{p.isim}</div>
                  </div>
                  {p.no && p.no !== '–' && p.no !== 0 ? (
                    <span className="kadro-no-badge">#{p.no}</span>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </>
      )}
      {takim.teknikDirektor && <div className="kadro-td">Teknik Direktör: {takim.teknikDirektor}</div>}
    </div>
  )
}

function OlayIkon({ tip, detay }) {
  if (tip === 'Goal') return <BallIcon size={14} />
  if (tip === 'Card') {
    return (detay && detay.includes('Red')) ? <span className="kart-kirmizi" title="Kırmızı Kart" /> : <span className="kart-sari" title="Sarı Kart" />
  }
  if (tip === 'subst') return <SwapIcon size={14} />
  return <span>•</span>
}

function MacDetay({ mac, onClose }) {
  const [veri, setVeri] = useState(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [sekme, setSekme] = useState('taktik')

  const canliMi = CANLI.has(mac.durum)
  const oynanmadi = mac.skor.ev == null || mac.durum === 'NS' || mac.durum === 'PST'

  useEffect(() => {
    let iptal = false
    setYukleniyor(true)
    const url = `/api/scores?fixture=${mac.id}&status=${encodeURIComponent(mac.durum || '')}&oynandi=${mac.skor?.ev != null}&homeId=${mac.evSahibi.id}&awayId=${mac.deplasman.id}`

    const yukle = () => {
      fetch(url)
        .then(r => r.json())
        .then(d => {
          if (!iptal && d.ok) {
            setVeri(d)
            setYukleniyor(false)
          }
        })
        .catch(() => {
          if (!iptal) setYukleniyor(false)
        })
    }

    yukle()

    let interval = null
    if (canliMi) {
      interval = setInterval(yukle, 12000)
    }

    return () => {
      iptal = true
      if (interval) clearInterval(interval)
    }
  }, [mac.id, mac.durum, mac.skor?.ev, mac.evSahibi.id, mac.deplasman.id, canliMi])

  const evSkor = (veri?.skor?.ev != null) ? veri.skor.ev : (mac.skor?.ev ?? '–')
  const depSkor = (veri?.skor?.dep != null) ? veri.skor.dep : (mac.skor?.dep ?? '–')
  const guncelDurum = veri?.durum || mac.durum
  const guncelDakika = veri?.dakika != null ? veri.dakika : mac.dakika

  const ev = veri?.istatistik?.[0], dep = veri?.istatistik?.[1]
  const kadroEv = veri?.kadrolar?.[0], kadroDep = veri?.kadrolar?.[1]

  const evGoller = (veri?.olaylar || []).filter(o => o.tip === 'Goal' && (o.takimTaraf === 'ev' || o.takim === mac.evSahibi.ad))
  const depGoller = (veri?.olaylar || []).filter(o => o.tip === 'Goal' && (o.takimTaraf === 'dep' || o.takim === mac.deplasman.ad))

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>✕</button>
        
        {/* EXTREME STADYUM LED SKORBORD KARTI (EMOJİSİZ VE RESMİ DÜZEN) */}
        <div className="stadium-arena-card">
          <div className="stadium-strip-top">
            <div className="st-derby">
              <span className="st-dot" />
              <span>{mac.lig.ad}{mac.lig.tur ? ' • ' + mac.lig.tur : ''}</span>
            </div>
            <div className="hidden sm:block text-slate-400 font-mono text-xs">
              CANLI STADYUM RADAR HUD
            </div>
            <div>
              {canliMi ? (
                <span className="st-live-pill">
                  <span className="st-live-dot" />
                  LIVE {guncelDakika ? guncelDakika + "'" : 'CANLI'}
                </span>
              ) : guncelDurum === 'FT' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-bold text-xs border border-white/10">
                  MAÇ SONU
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/20">
                  {saat(mac.tarih)}
                </span>
              )}
            </div>
          </div>

          <div className="stadium-main-row">
            {/* EV SAHİBİ */}
            <div className="st-team-col home">
              <div className="st-team-badge-wrap">
                <TeamBadge
                  logo={mac.evSahibi.logo}
                  name={mac.evSahibi.ad}
                  teamId={mac.evSahibi.id}
                  size={58}
                  className="st-team-badge-home"
                />
              </div>
              <span className="st-label">EV SAHİBİ</span>
              <div className="st-team-name">{mac.evSahibi.ad}</div>
              {evGoller.length > 0 && (
                <div className="st-scorers">
                  {evGoller.map((g, i) => (
                    <span key={i}><BallIcon size={11} /> {g.oyuncu} {g.dakika}'</span>
                  ))}
                </div>
              )}
            </div>

            {/* MERKEZ DEV LED SKOR KAPSÜLÜ */}
            <div className="st-score-box">
              <div className="st-led-numbers">
                <span>{evSkor}</span>
                <span className="st-led-colon">:</span>
                <span>{depSkor}</span>
              </div>
              <div className="st-tempo-sub">
                {canliMi
                  ? (guncelDurum === 'HT' ? 'DEVRE ARASI' : `${guncelDakika ? guncelDakika + '. DK' : 'CANLI'} • YÜKSEK TEMPO`)
                  : guncelDurum === 'FT' ? 'MAÇ TAMAMLANDI' : 'BAŞLAMA SAATİ'}
              </div>
            </div>

            {/* DEPLASMAN */}
            <div className="st-team-col away">
              <div className="st-team-badge-wrap">
                <TeamBadge
                  logo={mac.deplasman.logo}
                  name={mac.deplasman.ad}
                  teamId={mac.deplasman.id}
                  size={58}
                  className="st-team-badge-away"
                />
              </div>
              <span className="st-label">DEPLASMAN</span>
              <div className="st-team-name">{mac.deplasman.ad}</div>
              {depGoller.length > 0 && (
                <div className="st-scorers">
                  {depGoller.map((g, i) => (
                    <span key={i}><BallIcon size={11} /> {g.oyuncu} {g.dakika}'</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MODAL SEKME GEÇİŞLERİ (EMOJİSİZ RESMİ SVG BUTONLAR) */}
        <div className="modal-sekmeler">
          {[
            ['taktik', <><PitchIcon /> <span>3D TAKTİK SAHA</span></>],
            ['istatistik', <><StatsIcon /> <span>İSTATİSTİKLER</span></>],
            ['ozet', <><TimelineIcon /> <span>ÖZET & OLAYLAR</span></>],
            ['kadro', <><SquadIcon /> <span>KADRO LİSTESİ</span></>]
          ].map(([k, label]) => (
            <button key={k} className={'msek' + (sekme === k ? ' aktif' : '')} onClick={() => setSekme(k)}>
              {label}
            </button>
          ))}
        </div>

        {yukleniyor ? (
          <div className="modal-yukleniyor">Canlı maç ve taktik verileri getiriliyor...</div>
        ) : (
          <div className="modal-govde">
            
            {/* 1. SEKME: 3D TAKTIK SAHA & OYUNCU YÜZLERİ */}
            {sekme === 'taktik' && (
              (!kadroEv && !kadroDep) || ((!kadroEv || kadroEv.ilk11.length === 0) && (!kadroDep || kadroDep.ilk11.length === 0)) ? (
                <div className="mac-bekliyor-kutu">
                  <div className="mbk-baslik">3D Taktik Saha Kadroları Bekleniyor</div>
                  <div className="mbk-aciklama">
                    Resmi 11 kadroları kulüpler tarafından açıklandığında 3D saha üzerinde oyuncu yüzleri, ısı haritası ve canlı pas ağı aktif hale gelecektir.
                  </div>
                  <div className="mbk-ipucu">İlk 11'ler maç başlamadan 45-60 dakika önce açıklanır.</div>
                </div>
              ) : (
                <TaktikSaha
                  kadroEv={kadroEv}
                  kadroDep={kadroDep}
                  evAdi={mac.evSahibi.ad}
                  depAdi={mac.deplasman.ad}
                  evLogo={mac.evSahibi.logo}
                  depLogo={mac.deplasman.logo}
                  evId={mac.evSahibi.id}
                  depId={mac.deplasman.id}
                  olaylar={veri?.olaylar}
                  skor={veri?.skor}
                  dakika={guncelDakika}
                  durum={guncelDurum}
                />
              )
            )}

            {/* 2. SEKME: DETAYLI İSTATİSTİKLER */}
            {sekme === 'istatistik' && (
              oynanmadi || veri?.baslamadi ? (
                <div className="mac-bekliyor-kutu">
                  <div className="mbk-baslik">Karşılaşma İstatistikleri</div>
                  <div className="mbk-aciklama">Topla oynama, şut, korner ve faul verileri karşılaşma başladıktan sonra canlı güncellenecektir.</div>
                </div>
              ) : !ev || !dep || !ev.kalemler || ev.kalemler.length === 0 ? (
                <div className="mac-bekliyor-kutu">
                  <div className="mbk-baslik">İstatistik Bilgisi</div>
                  <div className="mbk-aciklama">
                    {canliMi
                      ? "Bu lig ve kupa turu için yayıncı tarafından detaylı korner, şut ve topla oynama istatistiği tutulmamaktadır. Canlı skor ve gol olaylarını Özet sekmesinden takip edebilirsiniz."
                      : "Bu karşılaşma için detaylı maç istatistiği kaydı bulunmuyor."}
                  </div>
                </div>
              ) : (
                <div className="stat-liste">
                  {ev.kalemler.map((s, i) => (
                    <StatBar key={i} ad={s.tip} evVal={s.deger} depVal={dep?.kalemler?.[i]?.deger} />
                  ))}
                </div>
              )
            )}

            {/* 3. SEKME: ÖZET & OLAYLAR */}
            {sekme === 'ozet' && (
              oynanmadi || veri?.baslamadi ? (
                <div className="mac-bekliyor-kutu">
                  <div className="mbk-baslik">Maç Henüz Başlamadı</div>
                  <div className="mbk-aciklama">Başlama Saati: <b>{saat(mac.tarih)}</b></div>
                  <div className="mbk-ipucu">Karşılaşma başladığında canlı anlatım ve önemli anlar anlık aktarılacaktır.</div>
                </div>
              ) : (!veri || !veri.olaylar || veri.olaylar.length === 0) ? (
                canliMi ? (
                  <div className="mac-canli-durum-kutu">
                    <div className="mcd-skor">{evSkor} : {depSkor}</div>
                    <div className="mcd-dakika"><span className="dot-canli" /> {guncelDakika ? `${guncelDakika}. Dakika Oynanıyor` : 'Karşılaşma Devam Ediyor'}</div>
                    <p className="mcd-bilgi">Karşılaşmada henüz gol veya kart kaydı bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="mac-bekliyor-kutu">
                    <div className="mbk-baslik">Karşılaşma Tamamlandı</div>
                    <div className="mbk-aciklama">Bu maç için kayıtlı gol veya kart olayı bulunmuyor.</div>
                  </div>
                )
              ) : (
                <ul className="olay-liste">
                  {veri.olaylar.map((o, i) => (
                    <li key={i} className={o.takimTaraf === 'dep' || o.takim === mac.deplasman.ad ? 'sag' : ''}>
                      <span className="olay-dk">{o.dakika}{o.ekDakika ? '+' + o.ekDakika : ''}'</span>
                      <span className="olay-ikon"><OlayIkon tip={o.tip} detay={o.detay} /></span>
                      <span className="olay-oyuncu">{o.oyuncu}{o.yardimci ? <small> ({o.yardimci})</small> : null}</span>
                    </li>
                  ))}
                </ul>
              )
            )}

            {/* 4. SEKME: KLASİK KADRO LİSTESİ (OYUNCU FOTOĞRAFLARI VE PROFESYONEL AVATARLAR) */}
            {sekme === 'kadro' && (
              (oynanmadi || veri?.baslamadi) && (!kadroEv || !kadroDep || (kadroEv.ilk11.length === 0 && kadroDep.ilk11.length === 0)) ? (
                <div className="mac-bekliyor-kutu">
                  <div className="mbk-baslik">Resmi Kadrolar Bekleniyor</div>
                  <div className="mbk-aciklama">İlk 11 kadroları maç saatinden yaklaşık 45 - 60 dakika önce açıklanır.</div>
                </div>
              ) : (!kadroEv || !kadroDep || (kadroEv.ilk11.length === 0 && kadroDep.ilk11.length === 0)) ? (
                <div className="mac-bekliyor-kutu">
                  <div className="mbk-baslik">Kadro Bilgisi</div>
                  <div className="mbk-aciklama">Bu karşılaşma için resmi 11 kadro listesi federasyon veya kulüpler tarafından girilmemiştir.</div>
                </div>
              ) : (
                <div className="kadro-grid">
                  <Kadro11 takim={kadroEv} takimAdi={mac.evSahibi.ad} logo={mac.evSahibi.logo} teamId={mac.evSahibi.id} isHome={true} />
                  <Kadro11 takim={kadroDep} takimAdi={mac.deplasman.ad} logo={mac.deplasman.logo} teamId={mac.deplasman.id} isHome={false} />
                </div>
              )
            )}

          </div>
        )}
      </div>
    </div>
  )
}

export default function Scores({ t }) {
  const ceviri = t || (k => ({ skorHero: 'Canlı Skorlar', skorAlt: 'Tüm dünyadan ligler — bir maça tıkla, istatistiklerini ve kadrolarını gör.', canli: 'canlı', maçYok: 'Bu tarihte maç bulunamadı.', getiriliyor: 'Maçlar getiriliyor...' }[k] || k))
  const [tarih, setTarih] = useState(bugun())
  const [veri, setVeri] = useState(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [secilenMac, setSecilenMac] = useState(null)
  const zamanlayici = useRef(null)

  const getir = () => {
    fetch('/api/scores?date=' + tarih).then(r => r.json()).then(d => { setVeri(d.ok ? d : null); setYukleniyor(false) })
      .catch(() => setYukleniyor(false))
  }

  useEffect(() => {
    setYukleniyor(true); setVeri(null)
    getir()
    clearInterval(zamanlayici.current)
    // Sadece bugün seçiliyse periyodik yenileme yap (geçmiş günlerde kota harcamaz)
    if (tarih === bugun()) {
      zamanlayici.current = setInterval(getir, 25000)
    }
    return () => clearInterval(zamanlayici.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tarih])

  return (
    <div className="skorlar">
      <div className="skor-hero">
        <h1>{ceviri('skorHero')}</h1>
        <p>{ceviri('skorAlt')}</p>
      </div>

      <div className="skor-gun-bar">
        <button onClick={() => setTarih(gunEkle(tarih, -1))}>◀</button>
        <div className="skor-gun-etiket">{gunEtiket(tarih, ceviri)}{veri?.canliSayisi > 0 && <span className="canli-sayac"><span className="dot-canli" />{veri.canliSayisi} {ceviri('canli')}</span>}</div>
        <button onClick={() => setTarih(gunEkle(tarih, 1))}>▶</button>
      </div>

      {yukleniyor ? (
        <div className="state"><span className="spin" /> {ceviri('getiriliyor')}</div>
      ) : !veri || veri.gruplar.length === 0 ? (
        <div className="state">{ceviri('maçYok')}</div>
      ) : (
        veri.gruplar.map(g => (
          <div className="lig-grubu" key={g.id}>
            <div className="lig-baslik">
              {g.bayrak && <img className="lig-bayrak" src={g.bayrak} alt="" onError={e => e.currentTarget.style.display = 'none'} />}
              {g.logo ? (
                <img src={g.logo} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <span className="lig-ikon">🏆</span>
              )}
              <span>{g.ad}</span>
              {g.ulke && <span className="lig-ulke">{g.ulke}</span>}
            </div>
            <div className="mac-liste">
              {g.maclar.map(m => <MacSatiri key={m.id} m={m} onClick={setSecilenMac} />)}
            </div>
          </div>
        ))
      )}

      {secilenMac && <MacDetay mac={secilenMac} onClose={() => setSecilenMac(null)} />}
    </div>
  )
}
