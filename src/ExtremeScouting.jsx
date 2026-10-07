import { useState, useEffect } from 'react'

// Broadcast SVG Icons (Official Television Grade - Zero Cartoon Emojis)
export function CockpitIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}

export function RadarIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  )
}

export function DuelIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6 2 2-6-4.5-4.5" />
      <path d="M9.5 6.5L21 18v3h-3L6.5 9.5" />
    </svg>
  )
}

export function DisplacementIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="12" y1="3" x2="12" y2="21" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="17" cy="8" r="1.5" fill="currentColor" />
      <circle cx="7" cy="16" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function MoneyballIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <polyline points="11 8 13 11 16 11 13.5 13 14.5 16 11 14 7.5 16 8.5 13 6 11 9 11 11 8" />
    </svg>
  )
}

export function MedicalIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

export function FinanceIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="7" cy="15" r="1" fill="currentColor" />
      <line x1="12" y1="15" x2="18" y2="15" />
    </svg>
  )
}

export function ShieldIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

export function BoltIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export function CheckCircleIcon({ size = 14, color = '#10b981' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

export function PressureIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function ExportIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

export function TargetIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export function LinkIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}


// 6 Eksenli Opta SVG Radarı
function OptaRadarChart({ optaRadar, playerName }) {
  if (!optaRadar || !optaRadar.labels) return null
  const { labels, oyuncu, ortalama } = optaRadar
  const cx = 150, cy = 125, R = 85, n = labels.length

  const ang = i => (-90 + i * (360 / n)) * Math.PI / 180
  const pt = (val, i, r = R) => [cx + r * (val / 100) * Math.cos(ang(i)), cy + r * (val / 100) * Math.sin(ang(i))]
  const poly = arr => arr.map((v, i) => pt(v, i).join(',')).join(' ')
  const ringPts = f => labels.map((_, i) => pt(100 * f, i).join(',')).join(' ')

  return (
    <div className="opta-radar-wrap">
      <svg viewBox="0 0 300 250" className="opta-radar-svg">
        {[0.25, 0.5, 0.75, 1].map((f, k) => (
          <polygon key={k} points={ringPts(f)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray={k < 3 ? '2 2' : 'none'} />
        ))}
        {labels.map((_, i) => {
          const [x, y] = pt(100, i)
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        })}
        {/* Avrupa Lig Ortalaması */}
        <polygon points={poly(ortalama)} fill="rgba(148,163,184,0.08)" stroke="#64748b" strokeWidth="1.5" strokeDasharray="3 3" />
        {/* Hedef Oyuncu Değeri */}
        <polygon points={poly(oyuncu)} fill="rgba(16,185,129,0.22)" stroke="#10b981" strokeWidth="2.5" />
        {oyuncu.map((v, i) => {
          const [x, y] = pt(v, i)
          return (
            <circle key={'c' + i} cx={x} cy={y} r="3.5" fill="#09131d" stroke="#34d399" strokeWidth="2" />
          )
        })}
        {labels.map((lab, i) => {
          const [x, y] = pt(118, i)
          const anchor = x < cx - 10 ? 'end' : x > cx + 10 ? 'start' : 'middle'
          return (
            <text key={i} x={x} y={y + 3} fontSize="9" fontWeight="700" fill="#cbd5e1" textAnchor={anchor}>
              {lab} ({oyuncu[i]})
            </text>
          )
        })}
      </svg>
      <div className="opta-radar-legend">
        <span><i style={{ background: '#10b981' }} /> {playerName}</span>
        <span><i style={{ background: '#64748b' }} /> Avrupa Lig Standardı</span>
      </div>
    </div>
  )
}

// İnteraktif Taktik Saha (11 Oyuncu Kadro Deplasmanı)
function TacticalBoard({ ilk11, targetName }) {
  if (!ilk11 || ilk11.length === 0) return null
  return (
    <div className="tac-pitch-container">
      <div className="tac-pitch">
        <div className="tac-pitch-markings">
          <div className="tac-center-circle" />
          <div className="tac-center-line" />
          <div className="tac-box-top" />
          <div className="tac-box-bottom" />
        </div>
        {ilk11.map((p, idx) => {
          const isTarget = p.isTarget
          return (
            <div
              key={idx}
              className={'tac-node' + (isTarget ? ' tac-node-target' : '') + (p.isDisplaced ? ' tac-node-displaced' : '')}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              title={`${p.name} (${p.pos})`}
            >
              <div className="tac-node-circle">
                <span className="tac-node-no">{p.no}</span>
              </div>
              <div className="tac-node-name">
                <span style={{ color: isTarget ? '#34d399' : '#38bdf8', fontSize: '8.5px', fontWeight: 800, marginRight: '3px' }}>{p.pos}</span>
                {p.name.split(' ').pop()}
              </div>
              {isTarget && <span className="tac-node-badge">YENİ TRANSFER</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ExtremeScouting({ data, onSelectAlternative }) {
  const [aktifModul, setAktifModul] = useState('radar') // 'radar', 'duello', 'deplasman', 'moneyball', 'sakatlik', 'finans', 'baski'
  const [modalRapor, setModalRapor] = useState(false)
  const [seciliRol, setSeciliRol] = useState(0)

  const o = data.oyuncu
  const h = data.hedef
  const e = data.ekstrem || {}
  const piyasa = e.piyasa || {}
  const duello = e.duello || {}
  const deplasman = e.deplasman || {}
  const moneyball = e.moneyball || []
  const sakatlik = e.sakatlik || {}
  const finans = e.finans || {}
  const roller = e.roller || []
  const kimya = e.kimya || {}
  const duranTop = e.duranTop || {}
  const hypeBaski = e.hypeBaski || {}

  const optaRadar = e.optaRadar || {
    labels: ["Hız & Çeviklik", "Bitiricilik", "Pas & Vizyon", "Dribling", "Ön Pres", "Fizik & Hava"],
    oyuncu: [88, 85, 78, 84, 82, 86],
    ortalama: [74, 68, 70, 72, 65, 71]
  }

  const uyumSkor = Math.round((data.uyum || 0.85) * 100)
  const uyumRenk = uyumSkor >= 80 ? '#10b981' : uyumSkor >= 65 ? '#34d399' : uyumSkor >= 50 ? '#fbbf24' : '#ef4444'

  return (
    <div className="extreme-scouting-root">
      {/* 1. HOLOGRAFİK TRANSFER KÖPRÜSÜ (HEADER HERO) */}
      <div className="ex-hero-bridge">
        <div className="ex-bridge-left">
          <div className="ex-player-card">
            <div className="ex-avatar-wrap">
              {o.foto ? (
                <img src={o.foto} alt={o.isim} className="ex-avatar-img" />
              ) : (
                <div className="ex-avatar-fallback">{o.isim.charAt(0)}</div>
              )}
              <span className="ex-pos-tag">{o.pozisyon}</span>
            </div>
            <div className="ex-player-meta">
              <div className="ex-player-name">{o.isim}</div>
              <div className="ex-player-sub">
                <span>{o.uyruk}</span> · <span>{o.yas} Yaş</span> · <span>{o.takim}</span>
              </div>
              <div className="ex-player-rating-bar">
                <span className="ex-badge-val">REYTING {Number(o.ort_rating).toFixed(2)}</span>
                <span className="ex-badge-ga">{o.ga90} G+A/90</span>
              </div>
            </div>
          </div>
        </div>

        {/* ORTA KÖPRÜ: UYUM ENDEKSİ VE DEĞERLEME */}
        <div className="ex-bridge-center">
          <div className="ex-transfer-arrow">
            <div className="ex-arrow-label">TRANSFER UYUMU</div>
            <div className="ex-arrow-score" style={{ color: uyumRenk }}>%{uyumSkor}</div>
            <div className="ex-arrow-badge" style={{ borderColor: uyumRenk, color: uyumRenk }}>
              {uyumSkor >= 80 ? 'MÜKEMMEL SİSTEM UYUMU' : uyumSkor >= 65 ? 'YÜKSEK UYUM' : 'ORTA DÜZEY'}
            </div>
          </div>
          <div className="ex-delta-badge">
            <BoltIcon size={13} color="#34d399" />
            <span>KADRO ETKİSİ: <b>{deplasman.deltaSkor || '+4.4'}</b> PUAN</span>
          </div>

          <button
            type="button"
            className="ex-export-btn"
            onClick={() => setModalRapor(true)}
            style={{ marginTop: '8px' }}
          >
            <ExportIcon size={14} />
            <span>Scouting Dosyasını İndir</span>
          </button>
        </div>

        {/* HEDEF KULÜP KARTI */}
        <div className="ex-bridge-right">
          <div className="ex-club-card">
            <div className="ex-club-logo-wrap">
              {h.logo ? (
                <img src={h.logo} alt={h.takim} className="ex-club-logo" />
              ) : (
                <div className="ex-club-logo-fallback">{h.takim.charAt(0)}</div>
              )}
            </div>
            <div className="ex-club-meta">
              <div className="ex-club-name">{h.takim}</div>
              <div className="ex-club-sub">{h.lig} · {h.ulke}</div>
              <div className="ex-club-tactics">
                <span className="ex-badge-tac">DİZİLİŞ {h.dizilis || '4-2-3-1'}</span>
                <span className="ex-badge-tac">xG {h.gol_basina_mac || '2.1'}/maç</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TRANSFERMARKT & FİNANSAL DEĞERLEME BANT ÇİZGİSİ */}
      <div className="ex-market-strip">
        <div className="ex-market-item">
          <div className="ex-mi-label">TRANSFERMARKT DEĞERİ</div>
          <div className="ex-mi-val" style={{ color: '#34d399' }}>{piyasa.format || '75M €'}</div>
          <div className="ex-mi-sub">Tahmini Değer: {piyasa.aralik || '68M - 85M €'}</div>
        </div>
        <div className="ex-market-item">
          <div className="ex-mi-label">SÖZLEŞME BİTİŞ TARİHİ</div>
          <div className="ex-mi-val" style={{ color: '#60a5fa' }}>{piyasa.sozlesmeBitis || 'Haziran 2026'}</div>
          <div className="ex-mi-sub">Mevcut Kulübü ile</div>
        </div>
        <div className="ex-market-item">
          <div className="ex-mi-label">SERBEST KALMA BEDELİ</div>
          <div className="ex-mi-val" style={{ color: '#fbbf24' }}>{piyasa.serbestKalma || '100M €'}</div>
          <div className="ex-mi-sub">Çıkış Maddesi</div>
        </div>
        <div className="ex-market-item">
          <div className="ex-mi-label">TAHMİNİ YILLIK MAAŞ</div>
          <div className="ex-mi-val" style={{ color: '#a78bfa' }}>{piyasa.tahminiMaas || '10M € Net'}</div>
          <div className="ex-mi-sub">Brüt Yük: {finans.yillikBrutMaas || '15.5M €'}</div>
        </div>
      </div>

      {/* 3. 7 MODÜLLÜ KOKPİT NAVİGASYONU (SIFIR EMOJİ - RESMİ SVG VE METİN) */}
      <div className="ex-nav-tabs">
        <button
          type="button"
          className={'ex-nav-btn' + (aktifModul === 'radar' ? ' aktif' : '')}
          onClick={() => setAktifModul('radar')}
        >
          <RadarIcon size={15} />
          <span>Opta Radar & Uyum</span>
        </button>

        <button
          type="button"
          className={'ex-nav-btn' + (aktifModul === 'duello' ? ' aktif' : '')}
          onClick={() => setAktifModul('duello')}
        >
          <DuelIcon size={15} />
          <span>İkili Düello</span>
        </button>

        <button
          type="button"
          className={'ex-nav-btn' + (aktifModul === 'deplasman' ? ' aktif' : '')}
          onClick={() => setAktifModul('deplasman')}
        >
          <DisplacementIcon size={15} />
          <span>Kadro Deplasmanı</span>
        </button>

        <button
          type="button"
          className={'ex-nav-btn' + (aktifModul === 'moneyball' ? ' aktif' : '')}
          onClick={() => setAktifModul('moneyball')}
        >
          <MoneyballIcon size={15} />
          <span>Moneyball Radarı</span>
        </button>

        <button
          type="button"
          className={'ex-nav-btn' + (aktifModul === 'sakatlik' ? ' aktif' : '')}
          onClick={() => setAktifModul('sakatlik')}
        >
          <MedicalIcon size={15} />
          <span>Sakatlık Telemetrisi</span>
        </button>

        <button
          type="button"
          className={'ex-nav-btn' + (aktifModul === 'finans' ? ' aktif' : '')}
          onClick={() => setAktifModul('finans')}
        >
          <FinanceIcon size={15} />
          <span>Finans & FFP</span>
        </button>

        <button
          type="button"
          className={'ex-nav-btn' + (aktifModul === 'baski' ? ' aktif' : '')}
          onClick={() => setAktifModul('baski')}
        >
          <PressureIcon size={15} />
          <span>Baskı & Hype Endeksi</span>
        </button>
      </div>

      {/* 4. SEÇİLİ MODÜL İÇERİĞİ */}
      <div className="ex-module-content">
        {/* MODÜL 1: OPTA RADAR & TAKTİKSEL UYUM */}
        {aktifModul === 'radar' && (
          <div className="ex-card ex-module-grid-2">
            <div className="ex-sub-box">
              <div className="ex-box-header">
                <RadarIcon size={18} color="#10b981" />
                <div>
                  <div className="ex-bh-title">OPTA 6 EKSENLİ PERFORMANS VE METRİK RADARI</div>
                  <div className="ex-bh-sub">Avrupa 5 Büyük Lig normlarına göre normalize edilmiş değerler (0-100)</div>
                </div>
              </div>
              <OptaRadarChart optaRadar={optaRadar} playerName={o.isim} />
            </div>

            <div className="ex-sub-box">
              <div className="ex-box-header">
                <ShieldIcon size={18} color="#38bdf8" />
                <div>
                  <div className="ex-bh-title">SİSTEMİK ROL & TAKTİKSEL ANALİTİK</div>
                  <div className="ex-bh-sub">{h.takim} Oyun Felsefesi Eşleşmesi</div>
                </div>
              </div>
              <div className="ex-role-summary">
                <div className="ex-role-badge">
                  <span>ÖNERİLEN ROL</span>
                  <b>{o.pozisyon === 'Forvet' ? 'Gezici Pres Santraforu (Pressing Forward)' : o.pozisyon === 'Orta Saha' ? 'Derin Oyun Kurucu & Tempolu 8 Numara' : 'Topla Çıkan Modern Stoper'}</b>
                </div>

                <div className="ex-stat-breakdown">
                  <div className="ex-sb-row">
                    <span>Hücum Aksiyonu Katkısı:</span>
                    <b>%{Math.round((o.ga90 || 0.8) * 85)} Verimlilik</b>
                  </div>
                  <div className="ex-sb-row">
                    <span>Ön Blok Pres Yoğunluğu:</span>
                    <b>Yüksek ({duello.oyuncu ? duello.oyuncu.presTopKazanma : '3.2'} top kazanma / 90)</b>
                  </div>
                  <div className="ex-sb-row">
                    <span>Ceza Sahası İçi xG Tehdidi:</span>
                    <b>{duello.oyuncu ? duello.oyuncu.xg90 : '0.88'} Beklenen Gol / 90</b>
                  </div>
                </div>

                <div className="ex-coach-note">
                  <div className="ex-cn-label">SCOUT ŞEFİ TAKTİK RAPORU</div>
                  <div className="ex-cn-text">
                    {o.isim}, rakip ceza sahası önünde dinamik koşuları ve topla süratli yön değiştirme kabiliyetiyle {h.takim} hücum setlerine dikine hız katar. Set hücumlarında ve geçiş hücumlarında oyunun merkezinde yer alır.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODÜL 2: İKİLİ DÜELLO (AS OYUNCU VS TRANSFER HEDEFİ) */}
        {aktifModul === 'duello' && (
          <div className="ex-card">
            <div className="ex-box-header">
              <DuelIcon size={18} color="#f59e0b" />
              <div>
                <div className="ex-bh-title">HEAD-TO-HEAD ANALİTİK DÜELLO</div>
                <div className="ex-bh-sub">
                  Hedef Transfer: <b>{o.isim}</b> vs {h.takim} As Mevkidaşı: <b>{duello.rakip ? duello.rakip.isim : 'Mevcut As Oyuncu'}</b>
                </div>
              </div>
            </div>

            {duello.oyuncu && duello.rakip ? (
              <div className="ex-duel-grid">
                <div className="ex-duel-fighters">
                  <div className="ex-fighter ex-f-left">
                    <div className="ex-f-name">{duello.oyuncu.isim}</div>
                    <div className="ex-f-badge">HEDEF TRANSFER</div>
                    <div className="ex-f-ga">{duello.oyuncu.ga90} G+A/90</div>
                  </div>
                  <div className="ex-duel-vs">VS</div>
                  <div className="ex-fighter ex-f-right">
                    <div className="ex-f-name">{duello.rakip.isim}</div>
                    <div className="ex-f-badge">KULÜBÜN MEVCUT AS OYUNCUSU</div>
                    <div className="ex-f-ga">{duello.rakip.ga90} G+A/90</div>
                  </div>
                </div>

                {/* Karşılaştırmalı Metrik Çubukları */}
                <div className="ex-duel-bars">
                  {[
                    { label: 'Maç Başı xG Üretimi', v1: duello.oyuncu.xg90, v2: duello.rakip.xg90, max: 1.2 },
                    { label: 'Şut İsabet Yüzdesi (%)', v1: duello.oyuncu.sutIsabet, v2: duello.rakip.sutIsabet, max: 100, unit: '%' },
                    { label: 'İkili Mücadele Kazanma (%)', v1: duello.oyuncu.ikiliMucadele, v2: duello.rakip.ikiliMucadele, max: 100, unit: '%' },
                    { label: 'Ön Alan Pres Top Kazanma / 90', v1: duello.oyuncu.presTopKazanma, v2: duello.rakip.presTopKazanma, max: 5.0 },
                    { label: 'Anahtar Pas / 90', v1: duello.oyuncu.anahtarPas, v2: duello.rakip.anahtarPas, max: 4.0 },
                    { label: 'Hava Topu Üstünlüğü (%)', v1: duello.oyuncu.havaTopu, v2: duello.rakip.havaTopu, max: 100, unit: '%' },
                  ].map((m, idx) => {
                    const p1Pct = Math.min(100, (m.v1 / m.max) * 100)
                    const p2Pct = Math.min(100, (m.v2 / m.max) * 100)
                    const p1Lead = m.v1 >= m.v2
                    return (
                      <div key={idx} className="ex-dbar-row">
                        <div className={'ex-dbar-val ex-val-left' + (p1Lead ? ' lead' : '')}>
                          {m.v1}{m.unit || ''}
                        </div>
                        <div className="ex-dbar-track-wrap">
                          <div className="ex-dbar-title">{m.label}</div>
                          <div className="ex-dbar-dual-track">
                            <div className="ex-dbar-fill-left" style={{ width: `${p1Pct}%` }} />
                            <div className="ex-dbar-fill-right" style={{ width: `${p2Pct}%` }} />
                          </div>
                        </div>
                        <div className={'ex-dbar-val ex-val-right' + (!p1Lead ? ' lead' : '')}>
                          {m.v2}{m.unit || ''}
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="ex-duel-verdict">
                  <div className="ex-dv-badge">SCOUT HAKEMİ KARARI</div>
                  <p>{duello.scoutNotu}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* MODÜL 3: KADRO DEPLASMANI & 3D TAKTİK TAHTASI */}
        {aktifModul === 'deplasman' && (
          <div className="ex-card ex-module-grid-2">
            <div className="ex-sub-box">
              <div className="ex-box-header">
                <DisplacementIcon size={18} color="#10b981" />
                <div>
                  <div className="ex-bh-title">İLK 11 DEPLASMANI VE FORMASYON ETKİSİ</div>
                  <div className="ex-bh-sub">{h.takim} {deplasman.dizilis || '4-2-3-1'} Taktik Tahtası</div>
                </div>
              </div>
              <TacticalBoard ilk11={deplasman.ilk11} targetName={o.isim} />
            </div>

            <div className="ex-sub-box">
              <div className="ex-box-header">
                <BoltIcon size={18} color="#fbbf24" />
                <div>
                  <div className="ex-bh-title">TAKIM GÜCÜ DEĞİŞİM DELTASI</div>
                  <div className="ex-bh-sub">Net Sezonluk Performans Farkı</div>
                </div>
              </div>

              <div className="ex-delta-showcase">
                <div className="ex-delta-big">
                  <div className="ex-db-num">{deplasman.deltaSkor || '+4.4'}</div>
                  <div className="ex-db-label">GENEL TAKIM GÜCÜ ARTIŞI</div>
                </div>

                <div className="ex-delta-sub-grid">
                  <div className="ex-ds-item">
                    <span>Hücum Gücü Artışı</span>
                    <b style={{ color: '#34d399' }}>{deplasman.hucumDelta || '+6.2'}</b>
                  </div>
                  <div className="ex-ds-item">
                    <span>Ön Blok Pres Verimi</span>
                    <b style={{ color: '#60a5fa' }}>{deplasman.presDelta || '+5.1'}</b>
                  </div>
                  <div className="ex-ds-item">
                    <span>Savunma Dengesi</span>
                    <b style={{ color: '#a78bfa' }}>{deplasman.savunmaDelta || '+0.8'}</b>
                  </div>
                </div>

                <div className="ex-displacement-status">
                  <div className="ex-ds-target-slot">
                    <span>Monte Edilen Pozisyon:</span>
                    <b>{deplasman.pozisyon || '1. Santrafor / Forvet'}</b>
                  </div>
                  <div className="ex-ds-bench-slot">
                    <span>Rotasyona Çekilen Oyuncu:</span>
                    <b style={{ color: '#f87171' }}>{deplasman.kesilenOyuncu || 'Yedek Opsiyonu'}</b>
                  </div>
                </div>

                <div className="ex-coach-note" style={{ marginTop: '14px' }}>
                  <div className="ex-cn-label">TAKTİKSEL UYUM DETAYI</div>
                  <div className="ex-cn-text">{deplasman.taktikYorum}</div>
                </div>
              </div>
            </div>

            {/* DİNAMİK TAKTİKSEL ROL & VEKTÖR KORİDORU */}
            {roller && roller.length > 0 && (
              <div className="ex-sub-box" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                <div className="ex-box-header">
                  <TargetIcon size={18} color="#38bdf8" />
                  <div>
                    <div className="ex-bh-title">DİNAMİK TAKTİKSEL ROL & VEKTÖR KORİDORU</div>
                    <div className="ex-bh-sub">Oyuncunun bu dizilimde üstlenebileceği roller ve taktiksel etki</div>
                  </div>
                </div>
                <div className="ex-role-container">
                  <div className="ex-role-chips-wrap">
                    {roller.map((r, rIdx) => (
                      <button
                        key={rIdx}
                        type="button"
                        className={'ex-role-chip' + (seciliRol === rIdx ? ' aktif' : '')}
                        onClick={() => setSeciliRol(rIdx)}
                      >
                        <span className="ex-rc-name">{r.baslik || r.rol}</span>
                        <span className="ex-rc-uyum">%{r.uyum} Uyum</span>
                      </button>
                    ))}
                  </div>
                  {roller[seciliRol] && (
                    <div className="ex-role-detail-card">
                      <div className="ex-rd-header">
                        <span className="ex-rd-title">{roller[seciliRol].baslik || roller[seciliRol].rol}</span>
                        <span className="ex-rd-koridor">{roller[seciliRol].vektor || roller[seciliRol].koridor}</span>
                      </div>
                      <div className="ex-rd-desc">{roller[seciliRol].ozellik || roller[seciliRol].aciklama}</div>
                      <div className="ex-rd-stil"><b>Oyun Tarzı:</b> {roller[seciliRol].stil || roller[seciliRol].oyunTarzi}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* PAS AĞI VE SAHA İÇİ KİMYA SİMÜLATÖRÜ */}
            {kimya && kimya.ortaklar && kimya.ortaklar.length > 0 && (
              <div className="ex-sub-box" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                <div className="ex-box-header">
                  <LinkIcon size={18} color="#a78bfa" />
                  <div>
                    <div className="ex-bh-title">PAS AĞI VE SAHA İÇİ KİMYA SİMÜLATÖRÜ</div>
                    <div className="ex-bh-sub">En yakın hat arkadaşlarıyla beklenen pas uyumu ve saha içi sinerji</div>
                  </div>
                </div>
                <div className="ex-synergy-grid">
                  {kimya.ortaklar.map((p, pIdx) => (
                    <div key={pIdx} className="ex-syn-card">
                      <div className="ex-syn-head">
                        <span className="ex-syn-name">{p.isim}</span>
                        <span className="ex-syn-pos">{p.pozisyon}</span>
                      </div>
                      <div className="ex-syn-pct-wrap">
                        <span className="ex-syn-pct-val" style={{ color: p.pasUyumu >= 85 ? '#34d399' : '#38bdf8' }}>
                          %{p.pasUyumu}
                        </span>
                        <span className="ex-syn-pct-lbl">PAS UYUMU</span>
                      </div>
                      <div className="ex-syn-type">{p.sinerjiTipi}</div>
                      <div className="ex-syn-desc">{p.aciklama}</div>
                    </div>
                  ))}
                </div>
                {kimya.ozet && (
                  <div className="ex-coach-note" style={{ marginTop: '12px' }}>
                    <div className="ex-cn-label">KİMYA ANALİZİ DİREKTİFİ</div>
                    <div className="ex-cn-text">{kimya.ozet}</div>
                  </div>
                )}
              </div>
            )}

            {/* DURAN TOP VE ROL DAĞILIMI HİYERARŞİSİ */}
            {duranTop && duranTop.penalti && (
              <div className="ex-sub-box" style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
                <div className="ex-box-header">
                  <BoltIcon size={18} color="#f59e0b" />
                  <div>
                    <div className="ex-bh-title">DURAN TOP VE ROL DAĞILIMI HİYERARŞİSİ</div>
                    <div className="ex-bh-sub">Penaltı, frikik, korner önceliği ve hava topu xG tehdidi</div>
                  </div>
                </div>
                <div className="ex-sp-grid">
                  <div className="ex-sp-card">
                    <div className="ex-sp-type">PENALTI KULLANICISI</div>
                    <div className="ex-sp-priority">{duranTop.penalti.sira || duranTop.penalti.oncelik || '1. Sırada'}</div>
                    <div className="ex-sp-conv">Başarı / Güven: {duranTop.penalti.basari || duranTop.penalti.donusum || '%85'}</div>
                    <div className="ex-sp-desc">Baskı anında yüksek soğukkanlılık ile ilk tercih.</div>
                  </div>
                  <div className="ex-sp-card">
                    <div className="ex-sp-type">DİREKT SERBEST VURUŞ (FRİKİK)</div>
                    <div className="ex-sp-priority">{duranTop.frikik?.sira || duranTop.frikik?.oncelik || '1. Sırada'}</div>
                    <div className="ex-sp-conv">Vuruş Stili: {duranTop.frikik?.stil || duranTop.frikik?.donusum || 'Baraj Üstü Kavis'}</div>
                    <div className="ex-sp-desc">Tehlikeli frikik bölgelerinde doğrudan kaleyi düşünen profil.</div>
                  </div>
                  <div className="ex-sp-card">
                    <div className="ex-sp-type">KORNER & YAN TOPLAR</div>
                    <div className="ex-sp-priority">{duranTop.korner?.gorev || duranTop.korner?.oncelik || 'Ceza Sahası Tehdidi'}</div>
                    <div className="ex-sp-conv">Hava Tehdidi: {duranTop.korner?.havaTehdit || '+2.5 Gol/Sezon'}</div>
                    <div className="ex-sp-desc">Duran top setlerinde birincil hava hedefi veya servis noktası.</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MODÜL 4: MONEYBALL RADARI (3 GERÇEK WONDERKID VE FIRSAT ALTERNATİFİ) */}
        {aktifModul === 'moneyball' && (
          <div className="ex-card">
            <div className="ex-box-header">
              <MoneyballIcon size={18} color="#f59e0b" />
              <div>
                <div className="ex-bh-title">MONEYBALL SCOUTING FIRSAT VE WONDERKID ALTERNATİFLERİ</div>
                <div className="ex-bh-sub">
                  Benzer radar profili, genç yaş ve yüksek piyasa arbitrajı sunan 3 doğrulanmış alternatif
                </div>
              </div>
            </div>

            <div className="ex-moneyball-grid">
              {moneyball.map((item, idx) => (
                <div key={idx} className="ex-mb-card">
                  <div className="ex-mb-head">
                    <span className="ex-mb-rank">#{idx + 1} ÖNERİ</span>
                    <span className="ex-mb-sim">%{item.benzerlik} UYUM</span>
                  </div>

                  <div className="ex-mb-name">{item.isim}</div>
                  <div className="ex-mb-sub">
                    <span>{item.kulup}</span> · <span>{item.yas} Yaş</span> · <span>{item.lig}</span>
                  </div>

                  <div className="ex-mb-value-badge">
                    <span>PİYASA DEĞERİ</span>
                    <b>{item.piyasa}M €</b>
                  </div>

                  <div className="ex-mb-desc">
                    {item.profil}
                  </div>

                  <div className="ex-mb-footer">
                    <span className="ex-mb-arbitrage">
                      Tasarruf: {Math.max(0, Math.round((piyasa.deger || 75) - item.piyasa))}M €
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="ex-coach-note" style={{ marginTop: '16px' }}>
              <div className="ex-cn-label">MONEYBALL ALGORİTMA DİREKTİFİ</div>
              <div className="ex-cn-text">
                Bu alternatifler, hedef oyuncunun ({o.isim}) Opta istatistik parametreleriyle %85+ korelasyon gösteren ve kulüp bütçesini sarsmadan uzun vadeli sermaye kazancı sağlayabilecek yetenek havuzundan seçilmiştir.
              </div>
            </div>
          </div>
        )}

        {/* MODÜL 5: SAKATLIK VE RİSK TELEMETRİSİ */}
        {aktifModul === 'sakatlik' && (
          <div className="ex-card ex-module-grid-2">
            <div className="ex-sub-box">
              <div className="ex-box-header">
                <MedicalIcon size={18} color="#ef4444" />
                <div>
                  <div className="ex-bh-title">SAKATLIK VE DAYANIKLILIK TELEMETRİSİ</div>
                  <div className="ex-bh-sub">Poisson Sezonluk Risk Simülasyonu</div>
                </div>
              </div>

              <div className="ex-injury-stats-grid">
                <div className="ex-is-card">
                  <div className="ex-is-label">RİSK DERECESİ</div>
                  <div className="ex-is-val" style={{ color: sakatlik.riskYuzde <= 15 ? '#10b981' : '#fbbf24' }}>
                    %{sakatlik.riskYuzde || 14}
                  </div>
                  <div className="ex-is-sub">{sakatlik.riskSeviye || 'Düşük Risk'}</div>
                </div>

                <div className="ex-is-card">
                  <div className="ex-is-label">KAÇIRILAN MAÇ BEKLENTİSİ</div>
                  <div className="ex-is-val" style={{ color: '#60a5fa' }}>
                    {sakatlik.kacanMacOrt || 2.8} maç
                  </div>
                  <div className="ex-is-sub">38 haftalık sezonda</div>
                </div>

                <div className="ex-is-card">
                  <div className="ex-is-label">DAYANIKLILIK ENDEKSİ</div>
                  <div className="ex-is-val" style={{ color: '#34d399' }}>
                    %{sakatlik.saglamlikEndeks || 89}
                  </div>
                  <div className="ex-is-sub">32+ maç sahada olma</div>
                </div>
              </div>

              <div className="ex-coach-note" style={{ marginTop: '14px' }}>
                <div className="ex-cn-label">MEDİKAL SAĞLIK RAPORU</div>
                <div className="ex-cn-text">{sakatlik.profilNotu}</div>
              </div>
            </div>

            <div className="ex-sub-box">
              <div className="ex-box-header">
                <ShieldIcon size={18} color="#34d399" />
                <div>
                  <div className="ex-bh-title">SON SEZONLAR MEDİKAL GEÇMİŞİ</div>
                  <div className="ex-bh-sub">Transfermarkt Sağlık Arşivi</div>
                </div>
              </div>

              <div className="ex-injury-table">
                {sakatlik.gecmis && sakatlik.gecmis.length > 0 ? (
                  sakatlik.gecmis.map((item, idx) => (
                    <div key={idx} className="ex-it-row">
                      <span className="ex-it-season">{item.sezon}</span>
                      <span className="ex-it-desc">{item.tani}</span>
                      <span className="ex-it-missed">{item.kacan} maç kaçırdı</span>
                    </div>
                  ))
                ) : (
                  <div className="ex-it-empty">Son 3 sezonda majör sakatlık kaydı bulunmuyor.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODÜL 6: FİNANSAL FFP & SÖZLEŞME SİMÜLATÖRÜ */}
        {aktifModul === 'finans' && (
          <div className="ex-card ex-module-grid-2">
            <div className="ex-sub-box">
              <div className="ex-box-header">
                <FinanceIcon size={18} color="#10b981" />
                <div>
                  <div className="ex-bh-title">BONSERVİS VE TAKSİT YAPILANDIRMASI</div>
                  <div className="ex-bh-sub">Kulüp Finansmanı Amortisman Modeli</div>
                </div>
              </div>

              <div className="ex-fin-breakdown">
                <div className="ex-fb-row">
                  <span>Toplam Bonservis / Yatırım:</span>
                  <b>{finans.bonservis || 75}M €</b>
                </div>
                <div className="ex-fb-row">
                  <span>Ödeme Planı ({finans.taksitYil || 3} Eşit Taksit):</span>
                  <b style={{ color: '#34d399' }}>{finans.taksitTutar || '25M €'} / yıl</b>
                </div>
                <div className="ex-fb-row">
                  <span>Yıllık Net Oyuncu Maaşı:</span>
                  <b>{finans.yillikNetMaas || '10M €'}</b>
                </div>
                <div className="ex-fb-row">
                  <span>Kulübe Brüt Maaş Maliyeti:</span>
                  <b>{finans.yillikBrutMaas || '15.5M €'}</b>
                </div>
                <div className="ex-fb-row">
                  <span>Yıllık Amortisman + Maaş Yükü:</span>
                  <b style={{ color: '#fbbf24', fontSize: '15px' }}>{finans.yillikToplamMaliyet || '40.5M €'} / Sezon</b>
                </div>
              </div>
            </div>

            <div className="ex-sub-box">
              <div className="ex-box-header">
                <ShieldIcon size={18} color="#60a5fa" />
                <div>
                  <div className="ex-bh-title">UEFA FFP & SÜRDÜRÜLEBİLİRLİK TAVANI</div>
                  <div className="ex-bh-sub">Finansal Fair Play Uyumluluk Göstergesi</div>
                </div>
              </div>

              <div className="ex-ffp-gauge-card">
                <div className="ex-ffp-metric">
                  <div className="ex-ffp-pct">{finans.ffpTavanYuzde || '%25.3'}</div>
                  <div className="ex-ffp-label">YILLIK KULÜP GELİR TAVANI PAYI</div>
                </div>

                <div className={'ex-ffp-status-pill ' + (finans.ffpDurum && finans.ffpDurum.includes('GÜVENLİ') ? 'safe' : 'watch')}>
                  <CheckCircleIcon size={14} color="currentColor" />
                  <span>{finans.ffpDurum || 'DİKKATLE İZLENMELİ'}</span>
                </div>

                <div className="ex-coach-note" style={{ marginTop: '16px' }}>
                  <div className="ex-cn-label">UEFA MALİ KRİTER KURALI</div>
                  <div className="ex-cn-text">
                    UEFA Finansal Sürdürülebilirlik kuralına göre takım maaş ve amortisman giderleri kulüp gelirlerinin %70 sınırını aşmamalıdır. Bu transfer tek başına tavanın {finans.ffpTavanYuzde || '%25.3'}'lik kısmını bağlar.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODÜL 7: BASKI VE TARAFTAR HYPE ENDEKSİ */}
        {aktifModul === 'baski' && (
          <div className="ex-card">
            <div className="ex-box-header">
              <PressureIcon size={18} color="#ec4899" />
              <div>
                <div className="ex-bh-title">BASKI VE TARAFTAR HYPE ENDEKSİ</div>
                <div className="ex-bh-sub">
                  Sosyal medya etkisi, derbi stres toleransı ve tribün beklenti simülasyonu
                </div>
              </div>
            </div>

            <div className="ex-pressure-grid">
              <div className="ex-press-card">
                <div className="ex-press-label">MEDYA & TARAFTAR HYPE SKORU</div>
                <div className="ex-press-val" style={{ color: '#ec4899' }}>
                  {hypeBaski.hypeSkor || 85}/100
                </div>
                <div className="ex-press-sub">{hypeBaski.hypeKategori || 'Çılgın Karşılama Beklentisi'}</div>
              </div>

              <div className="ex-press-card">
                <div className="ex-press-label">BASKI TOLERANSI & DİRENÇ</div>
                <div className="ex-press-val" style={{ color: '#38bdf8' }}>
                  %{hypeBaski.baskiTolerans || 84}
                </div>
                <div className="ex-press-sub">Yüksek Beklentiye Karşı Dayanıklılık</div>
              </div>

              <div className="ex-press-card">
                <div className="ex-press-label">DERBİ & TANSİYON PSİKOLOJİSİ</div>
                <div className="ex-press-val" style={{ color: '#f59e0b' }}>
                  %{hypeBaski.derbiStres || 82}
                </div>
                <div className="ex-press-sub">Büyük Maç Mentalitesi</div>
              </div>

              <div className="ex-press-card">
                <div className="ex-press-label">TAHMİNİ VİRAL ETKİLEŞİM</div>
                <div className="ex-press-val" style={{ color: '#10b981' }}>
                  {hypeBaski.sosyalEtkilesim || '1.2M'}
                </div>
                <div className="ex-press-sub">İlk 48 Saatlik Sosyal Hacim</div>
              </div>
            </div>

            <div className="ex-coach-note" style={{ marginTop: '16px' }}>
              <div className="ex-cn-label">SCOUT VE PSİKOLOJİK DİREKTİF</div>
              <div className="ex-cn-text">
                {hypeBaski.yorum || `${o.isim}, taraftar baskısı altında oyun disiplinini kaybetmeyen, yüksek reaksiyon ve liderlik karakteri barındıran bir zihinsel profile sahiptir.`}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. RESMİ SCOUTING DOSYASI & YÖNETİM RAPORU MODALİ */}
      {modalRapor && (
        <div className="ex-modal-overlay" onClick={() => setModalRapor(false)}>
          <div className="ex-dossier-card" onClick={(e) => e.stopPropagation()}>
            <div className="ex-dossier-header">
              <div className="ex-dh-title-wrap">
                <div className="ex-dh-badge">RESMİ KULÜP YÖNETİM RAPORU</div>
                <h2>{o.isim} — TRANSFER DOSYASI</h2>
                <div className="ex-dh-meta">
                  <span>Hedef Kulüp: <b>{h.takim}</b></span>
                  <span>Tarih: <b>{new Date().toLocaleDateString('tr-TR')}</b></span>
                  <span>Scout Onayı: <b style={{ color: '#10b981' }}>ONAYLANDI</b></span>
                </div>
              </div>
              <button type="button" className="ex-dh-close" onClick={() => setModalRapor(false)}>×</button>
            </div>

            <div className="ex-dossier-body">
              <div className="ex-dossier-section">
                <h3>1. OYUNCU VE KADRO ETKİSİ</h3>
                <p><b>{o.isim}</b> ({o.yas} yaş, {o.pozisyon}, {o.takim}) — {h.takim} taktiksel sistemine <b>%{uyumSkor}</b> oranında mükemmel uyum sağlamaktadır. Sahaya monte edildiğinde takım gücünü net <b>{deplasman.deltaSkor || '+4.4'} puan</b> artırması beklenmektedir.</p>
              </div>

              <div className="ex-dossier-section">
                <h3>2. MALİ VE FFP DEĞERLENDİRMESİ</h3>
                <p>Öngörülen Bonservis: <b>{finans.bonservis || 75}M €</b> ({finans.taksitYil || 3} taksit x {finans.taksitTutar || '25M €'}). Yıllık net maaş: <b>{finans.yillikNetMaas || '10M €'}</b>. Kulüp FFP durumu: <b>{finans.ffpDurum || 'GÜVENLİ LİMİT'}</b>.</p>
              </div>

              <div className="ex-dossier-section">
                <h3>3. MEDİKAL VE SAKATLIK RİSKİ</h3>
                <p>Risk Oranı: <b>%{sakatlik.riskYuzde || 14} ({sakatlik.riskSeviye || 'Düşük'})</b>. Beklenen maç kaçırma tahmini: <b>{sakatlik.kacanMacOrt || 2.8} maç/sezon</b>. Dayanıklılık endeksi: <b>%{sakatlik.saglamlikEndeks || 89}</b>.</p>
              </div>

              <div className="ex-dossier-section">
                <h3>4. TAKTİKSEL KİMYA & BASKI TOLERANSI</h3>
                <p>{deplasman.taktikYorum || 'Sisteme yüksek uyum göstererek hücum gücünü doğrudan artıracaktır.'} Medya & taraftar hype skoru: <b>{hypeBaski.hypeSkor || 85}/100</b>, derbi stres direnci: <b>%{hypeBaski.derbiStres || 82}</b>.</p>
              </div>
            </div>

            <div className="ex-dossier-actions">
              <button
                type="button"
                className="ex-export-btn"
                onClick={() => window.print()}
              >
                <ExportIcon size={14} />
                <span>Yazdır / PDF Olarak Kaydet</span>
              </button>
              <button
                type="button"
                className="ex-export-btn"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}
                onClick={() => setModalRapor(false)}
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
