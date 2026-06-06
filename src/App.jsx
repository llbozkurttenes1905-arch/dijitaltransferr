import { useState, useEffect } from 'react'

/* sayı sayma animasyonu */
function CountUp({ value, dec = 0 }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, start = null
    const to = Number(value) || 0, dur = 950
    const tick = t => { if (start === null) start = t; const p = Math.min(1, (t - start) / dur); setV(to * (1 - Math.pow(1 - p, 3))); if (p < 1) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{v.toFixed(dec)}</>
}

/* animasyonlu gauge */
function Gauge({ value, anim }) {
  const r = 72, c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value))
  const color = pct >= 0.75 ? '#10b981' : pct >= 0.55 ? '#fbbf24' : '#ef4444'
  return (
    <div className="gauge">
      <svg viewBox="0 0 170 170">
        <circle className="g-bg" cx="85" cy="85" r={r} />
        <circle className="g-fg" cx="85" cy="85" r={r} style={{ stroke: color, color, strokeDasharray: c, strokeDashoffset: anim ? c * (1 - pct) : c }} />
      </svg>
      <div className="g-val" style={{ color }}><CountUp value={pct * 100} dec={1} />%</div>
    </div>
  )
}

/* uyum bileşen barları (Kalite · Gol Üretimi · Stil Uyumu) */
function Bars({ bilesen, anim }) {
  const items = [
    { k: 'Kalite', v: bilesen.kalite, c: '#10b981' },
    { k: 'Gol Üretimi', v: bilesen.verim, c: '#14b8a6' },
    { k: 'Stil Uyumu', v: bilesen.stil, c: '#3b82f6' },
  ]
  if (bilesen.rol != null) items.push({ k: 'Rol Uyumu', v: bilesen.rol, c: '#a78bfa' })
  return (
    <div className="chart">
      <h4>🧩 Uyum Bileşenleri</h4>
      {items.map((it, i) => (
        <div className="bar" key={it.k}>
          <div className="bl"><span>{it.k}</span><b style={{ color: it.c }}>%{Math.round(it.v * 100)}</b></div>
          <div className="track"><div className="fill" style={{ width: anim ? it.v * 100 + '%' : '0%', background: it.c, transitionDelay: i * 0.12 + 's' }} /></div>
        </div>
      ))}
    </div>
  )
}

/* gelişmiş Monte Carlo alan grafiği */
function MonteCarlo({ hist, med, lo, hi, anim }) {
  const counts = hist.counts, labels = hist.labels, n = counts.length
  const maxC = Math.max(...counts, 1)
  const W = 320, H = 150, b = 20
  const X = i => (i / (n - 1)) * W
  const Y = c => (H - b) - (c / maxC) * (H - b - 8)
  let top = ''
  counts.forEach((c, i) => { top += (i === 0 ? 'M' : ' L') + ' ' + X(i).toFixed(1) + ' ' + Y(c).toFixed(1) })
  const area = top + ` L ${W} ${H - b} L 0 ${H - b} Z`
  const minL = labels[0], maxL = labels[n - 1]
  const vx = val => ((val - minL) / Math.max(maxL - minL, 1)) * W
  const medX = vx(med), loX = vx(lo), hiX = vx(hi)
  return (
    <div className="chart">
      <h4>📈 Sezonluk Gol + Asist Olasılık Dağılımı</h4>
      <svg className="mc" viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <linearGradient id="mcg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
          </linearGradient>
        </defs>
        <rect x={loX} y="2" width={Math.max(hiX - loX, 0)} height={H - b - 2} fill="#fbbf24" opacity="0.10" rx="2" />
        <path d={area} fill="url(#mcg)" style={{ opacity: anim ? 1 : 0, transition: 'opacity .9s ease' }} />
        <path d={top} fill="none" stroke="#34d399" strokeWidth="2.4" strokeLinejoin="round" pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: anim ? 0 : 1, transition: 'stroke-dashoffset 1.3s ease' }} />
        <line x1={medX} y1="4" x2={medX} y2={H - b} stroke="#fbbf24" strokeWidth="1.6" strokeDasharray="4 3"
          style={{ opacity: anim ? 1 : 0, transition: 'opacity .5s .7s ease' }} />
      </svg>
      <div className="mc-x">
        <span>{lo}<small> (%10)</small></span>
        <span className="mc-med">◆ medyan {med}</span>
        <span>{hi}<small> (%90)</small></span>
      </div>
    </div>
  )
}

/* taktiksel ısı haritası (pozisyona göre) */
function HeatMap({ pozisyon, isim }) {
  const zones = {
    'Forvet': [[80, 50, 1], [88, 38, .9], [90, 60, .85], [70, 52, .6], [60, 44, .45]],
    'Orta Saha': [[52, 50, 1], [62, 40, .8], [44, 60, .75], [66, 55, .6], [38, 46, .5]],
    'Defans': [[26, 50, 1], [30, 35, .8], [22, 62, .8], [40, 50, .5]],
    'Kaleci': [[9, 50, 1], [13, 42, .7], [13, 58, .7]],
  }
  const pts = zones[pozisyon] || zones['Forvet']
  const hot = pts[0]
  const bolge = pozisyon === 'Forvet' ? 'Hücum üçlüsü / Ceza sahası önü'
    : pozisyon === 'Orta Saha' ? 'Orta saha / Hücum geçiş bölgesi'
      : pozisyon === 'Defans' ? 'Kendi yarı sahası / Stoper bölgesi'
        : pozisyon === 'Kaleci' ? 'Ceza sahası' : 'Hücum bölgesi'
  return (
    <div className="chart">
      <h4>🔥 Taktiksel Konum ve Isı Haritası</h4>
      <svg className="pitch" viewBox="0 0 100 64">
        <defs>
          <radialGradient id="heat">
            <stop offset="0%" stopColor="#ff2d2d" stopOpacity=".9" />
            <stop offset="35%" stopColor="#ff8c00" stopOpacity=".7" />
            <stop offset="62%" stopColor="#ffe600" stopOpacity=".4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
          <filter id="hb"><feGaussianBlur stdDeviation="2.4" /></filter>
        </defs>
        <rect x="1" y="1" width="98" height="62" rx="2" fill="#0c241b" stroke="#2dd4bf" strokeWidth=".4" opacity=".9" />
        <line x1="50" y1="1" x2="50" y2="63" stroke="#2dd4bf" strokeWidth=".35" opacity=".5" />
        <circle cx="50" cy="32" r="8" fill="none" stroke="#2dd4bf" strokeWidth=".35" opacity=".5" />
        <rect x="1" y="20" width="12" height="24" fill="none" stroke="#2dd4bf" strokeWidth=".35" opacity=".5" />
        <rect x="87" y="20" width="12" height="24" fill="none" stroke="#2dd4bf" strokeWidth=".35" opacity=".5" />
        <g filter="url(#hb)">
          {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1] * 0.64} r={7 + 7 * p[2]} fill="url(#heat)" opacity={p[2]} />)}
        </g>
        <text x={hot[0]} y={hot[1] * 0.64 - 9} textAnchor="middle" fontSize="5" fontWeight="800" fill="#fff" stroke="#000" strokeWidth=".3" paintOrder="stroke">{isim.split(' ').pop()}</text>
      </svg>
      <div className="heat-tag">Yüksek Etkinlik Bölgeleri: <b>{bolge}</b></div>
    </div>
  )
}

/* çok boyutlu performans radarı (gerçek istatistikler) */
function Radar({ radar, isim, anim }) {
  const cx = 125, cy = 105, R = 70, n = radar.labels.length
  const ang = i => (-90 + i * (360 / n)) * Math.PI / 180
  const pt = (val, i, r = R) => [cx + r * (val / 100) * Math.cos(ang(i)), cy + r * (val / 100) * Math.sin(ang(i))]
  const lblPt = i => [cx + (R + 16) * Math.cos(ang(i)), cy + (R + 16) * Math.sin(ang(i))]
  const poly = arr => arr.map((v, i) => pt(v, i).join(',')).join(' ')
  const ringPts = f => radar.labels.map((_, i) => pt(100 * f, i).join(',')).join(' ')
  return (
    <div className="chart">
      <h4>📡 Çok Boyutlu Performans Analizi</h4>
      <svg className="radar" viewBox="0 0 250 210">
        {[0.25, 0.5, 0.75, 1].map((f, k) => <polygon key={k} points={ringPts(f)} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1" />)}
        {radar.labels.map((_, i) => { const [x, y] = pt(100, i); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,.08)" /> })}
        <polygon points={poly(radar.ortalama)} fill="rgba(148,163,184,.12)" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="3 3" />
        <polygon points={poly(radar.oyuncu)} fill="rgba(251,191,36,.28)" stroke="#fbbf24" strokeWidth="2"
          style={{ opacity: anim ? 1 : 0, transform: anim ? 'scale(1)' : 'scale(.5)', transformOrigin: cx + 'px ' + cy + 'px', transition: 'all .8s cubic-bezier(.2,.7,.2,1)' }} />
        {radar.labels.map((lab, i) => { const [x, y] = lblPt(i); return <text key={i} x={x} y={y} fontSize="7.5" fill="#cbd5e1" textAnchor={x < cx - 4 ? 'end' : x > cx + 4 ? 'start' : 'middle'} dominantBaseline="middle">{lab}</text> })}
      </svg>
      <div className="radar-leg"><span><i style={{ background: '#fbbf24' }} />{isim.split(' ').pop()}</span><span><i style={{ background: '#94a3b8' }} />Ortalama Atakçı</span></div>
    </div>
  )
}

/* takıma kattığı değer */
function Katki({ data }) {
  if (data.katki == null || !data.incumbent) return null
  const k = data.katki, pos = k >= 0
  return (
    <div className={'katki ' + (pos ? 'pos' : 'neg')}>
      <div className="katki-ic">
        <span className="katki-n">{pos ? '+' : ''}{k}</span>
        <span className="katki-u">gol+asist / sezon</span>
      </div>
      <div className="katki-t">
        <b>Takıma Kattığı Değer</b> — {data.oyuncu.isim}, hedef takımın mevcut en iyi forveti
        <b> {data.incumbent.isim}</b> ({data.incumbent.ga90} G+A/90) ile kıyaslandığında sezonda
        <b> {pos ? '+' : ''}{k} gol+asist</b> {pos ? 'fazla' : 'fark'} üretmesi beklenir.
      </div>
    </div>
  )
}

function Metric({ t, v, s, c }) { return <div className="metric"><div className="mt">{t}</div><div className="mv" style={{ color: c }}>{v}</div><div className="ms">{s}</div></div> }

/* dashboard */
function Dashboard({ data }) {
  const [anim, setAnim] = useState(false)
  useEffect(() => { setAnim(false); const t = setTimeout(() => setAnim(true), 60); return () => clearTimeout(t) }, [data])
  const o = data.oyuncu, h = data.hedef, s = data.sim, U = data.uyum
  const v = U >= 0.80 ? ['MÜKEMMEL UYUM', '#10b981'] : U >= 0.65 ? ['İYİ UYUM', '#34d399'] : U >= 0.50 ? ['ORTA DÜZEY', '#fbbf24'] : ['RİSKLİ', '#ef4444']
  return (
    <>
      <div className="g3">
        <div className="card">
          <div className="idrow">
            {o.foto && <img src={o.foto} alt="" />}
            <div>
              <div className="nm">{o.isim}</div>
              <div className="mt">{o.uyruk || ''} · {o.yas || '?'} yaş · {o.pozisyon || ''}</div>
              <div className="mt">{o.takim || ''} · {o.lig || ''} {o.sezon || ''}</div>
            </div>
          </div>
          <div className="pills">
            <span className="pill">⚽ {o.gol} gol</span>
            <span className="pill">🅰️ {o.asist} asist</span>
            <span className="pill">⭐ {Number(o.ort_rating).toFixed(2)} reyting</span>
            <span className="pill">🎯 {o.ga90} G+A/90</span>
          </div>
        </div>
        <div className="card gaugeCard">
          <Gauge value={U} anim={anim} />
          <span className="badge" style={{ background: v[1] + '22', color: v[1], border: '1px solid ' + v[1] + '55' }}>{v[0]}</span>
        </div>
        <div className="card">
          <div className="idrow">
            {h.logo && <img src={h.logo} alt="" />}
            <div>
              <div className="nm">{h.takim}</div>
              <div className="mt">{h.ulke || ''} · {h.lig || ''} {h.sezon || ''}</div>
              <div className="mt">Diziliş: {h.dizilis || '—'}</div>
            </div>
          </div>
          <div className="pills">
            <span className="pill">🥅 {h.atilan_gol} gol</span>
            <span className="pill">📈 {h.gol_basina_mac} gol/maç</span>
          </div>
        </div>
      </div>

      <div className="g4">
        <Metric t="Beklenen Gol+Asist" v={<CountUp value={s.ga_med} />} s={'aralık ' + s.ga_lo + '–' + s.ga_hi} c="#10b981" />
        <Metric t="Sakatlık Riski" v={<><CountUp value={s.kacan_ort} dec={1} /> maç</>} s="sezonda (ortalama)" c="#fbbf24" />
        <Metric t="20+ Gol+Asist İhtimali" v={<>%<CountUp value={s.p20 * 100} /></>} s={'30+ için %' + Math.round(s.p30 * 100)} c="#34d399" />
        <Metric t="Sağlamlık" v={<>%<CountUp value={s.saglam * 100} /></>} s="32+ maç oynama" c="#60a5fa" />
      </div>

      <Katki data={data} />

      <div className="g2">
        <HeatMap pozisyon={o.pozisyon} isim={o.isim} />
        <Radar radar={data.radar} isim={o.isim} anim={anim} />
      </div>

      <div className="g2">
        <Bars bilesen={data.bilesen} anim={anim} />
        <MonteCarlo hist={s.hist} med={s.ga_med} lo={s.ga_lo} hi={s.ga_hi} anim={anim} />
      </div>

      <details className="params">
        <summary>🔬 Hesaplanan parametreler (gerçek veriden)</summary>
        <p>Temel performans: {data.param.S.toFixed(3)} · dalgalanma: {data.param.sigma[0]}/{data.param.sigma[1]} ·
          Sakatlık: {data.param.episode} dönem / {data.param.toplam_mac} maç → maç başı %{(data.param.p * 100).toFixed(1)},
          dönem başına {data.param.lam.toFixed(1)} maç · Medyan performans %{Math.round(s.perf * 100)}</p>
      </details>
    </>
  )
}

/* aday seçim ekranı */
function Picker({ list, onPick }) {
  return (
    <div className="picker">
      <h3>🔎 Birden fazla oyuncu bulundu — hangisi?</h3>
      <div className="pick-grid">
        {list.map((a, i) => (
          <button className="pick-card" key={a.id} style={{ animationDelay: i * 0.05 + 's' }} onClick={() => onPick(a.id)}>
            {a.foto ? <img src={a.foto} alt="" /> : <div className="pick-ph">⚽</div>}
            <div className="pick-n">{a.isim}</div>
            <div className="pick-m">{a.uyruk || '—'}{a.yas ? ' · ' + a.yas + ' yaş' : ''}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* uygulama */
export default function App() {
  const [oyuncu, setOyuncu] = useState('Lautaro Martinez')
  const [hedef, setHedef] = useState('Fenerbahce')
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [candidates, setCandidates] = useState(null)
  const [hist, setHist] = useState(() => { try { return JSON.parse(localStorage.getItem('dt_hist') || '[]') } catch (e) { return [] } })

  const persist = h => { setHist(h); try { localStorage.setItem('dt_hist', JSON.stringify(h)) } catch (e) {} }
  const addHist = d => { const key = (d.oyuncu.isim + '|' + d.hedef.takim).toLowerCase(); persist([{ key, d }, ...hist.filter(x => x.key !== key)].slice(0, 12)) }

  async function analiz() {
    if (!oyuncu.trim() || !hedef.trim()) { setError('Lütfen oyuncu ve hedef takım yaz.'); return }
    setLoading(true); setLoadMsg('Oyuncu aranıyor...'); setError(''); setCandidates(null); setData(null)
    try {
      const r = await fetch('/api/analyze?ara=' + encodeURIComponent(oyuncu))
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Bir hata oluştu')
      const list = d.adaylar || []
      if (list.length === 0) throw new Error("'" + oyuncu + "' bulunamadı. Soyadıyla veya doğru yazımla dene.")
      if (list.length === 1) { await runAnalyze(list[0].id) }
      else { setCandidates(list); setLoading(false) }
    } catch (e) { setError(e.message); setLoading(false) }
  }
  async function runAnalyze(pid) {
    setLoading(true); setLoadMsg('Veri çekiliyor ve simülasyon çalışıyor...'); setError(''); setCandidates(null)
    try {
      const r = await fetch('/api/analyze?pid=' + pid + '&hedef=' + encodeURIComponent(hedef))
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Bir hata oluştu')
      setData(d); addHist(d)
    } catch (e) { setError(e.message); setData(null) }
    finally { setLoading(false) }
  }
  const openHist = d => { setData(d); setCandidates(null); setOyuncu(d.oyuncu.isim); setHedef(d.hedef.takim); setError('') }

  return (
    <>
      <div className="bg" /><div className="grain" />
      <div className="wrap">
        <div className="shell">
          <aside className="panel">
            <div className="brand"><span className="dot">⚽</span> Dijital İkiz</div>
            <div className="brand-sub">Transfer Uyum Simülatörü</div>
            <div className="field">
              <label>OYUNCU</label>
              <input value={oyuncu} onChange={e => setOyuncu(e.target.value)} onKeyDown={e => e.key === 'Enter' && analiz()} placeholder="ör. Lautaro Martinez" />
            </div>
            <div className="field">
              <label>HEDEF TAKIM</label>
              <input value={hedef} onChange={e => setHedef(e.target.value)} onKeyDown={e => e.key === 'Enter' && analiz()} placeholder="ör. Fenerbahçe" />
            </div>
            <button className="btn" onClick={analiz} disabled={loading}>
              <span className="shine" />
              {loading ? <><span className="spin" />İşleniyor...</> : '🚀 ANALİZ ET'}
            </button>
            <div className="sep" />
            <div className="hist-h">
              <span>📋 Geçmiş Futbolcular</span>
              {hist.length > 0 && <button className="clr" onClick={() => persist([])}>temizle</button>}
            </div>
            {hist.length === 0
              ? <div className="empty-h">Henüz analiz yok.</div>
              : hist.map((it, i) => {
                const u = it.d.uyum, dot = u >= 0.8 ? '#10b981' : u >= 0.55 ? '#fbbf24' : '#ef4444'
                return (
                  <button className="hist-item" key={it.key} style={{ animationDelay: i * 0.04 + 's' }} onClick={() => openHist(it.d)}>
                    {it.d.oyuncu.foto ? <img src={it.d.oyuncu.foto} alt="" /> : <span style={{ width: 30, height: 30, flexShrink: 0 }} />}
                    <span><span className="hi-n">{it.d.oyuncu.isim}</span><br /><span className="hi-s">→ {it.d.hedef.takim}</span></span>
                    <span className="hi-u" style={{ color: dot }}>%{Math.round(u * 100)}</span>
                  </button>
                )
              })}
          </aside>

          <main>
            <div className="hero">
              <h1>Futbol Dijital İkiz</h1>
              <p>Gerçek veriler ve Monte Carlo simülasyonu ile bir futbolcunun hedef takımdaki uyumunu, beklenen katkısını ve sakatlık riskini öngör.</p>
            </div>
            {loading
              ? <div className="state"><span className="spin" /> {loadMsg}</div>
              : error
                ? <div className="state err">⚠️ {error}</div>
                : candidates
                  ? <Picker list={candidates} onPick={runAnalyze} />
                  : data
                    ? <Dashboard data={data} />
                    : <div className="state">Soldan bir <b>oyuncu</b> ve <b>hedef takım</b> yaz, <b>Analiz Et</b>'e bas. Sonuçların geçmişe kaydedilir.</div>}
          </main>
        </div>
      </div>
      <div className="imza">⚽ by <b>Enes Bozkurt</b></div>
    </>
  )
}
