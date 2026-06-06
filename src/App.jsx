import { useState, useEffect } from 'react'

/* ---------- sayı sayma animasyonu ---------- */
function CountUp({ value, dec = 0 }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, start = null
    const to = Number(value) || 0, dur = 950
    const tick = t => {
      if (start === null) start = t
      const p = Math.min(1, (t - start) / dur)
      setV(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{v.toFixed(dec)}</>
}

/* ---------- animasyonlu gauge ---------- */
function Gauge({ value, anim }) {
  const r = 72, c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(1, value))
  const color = pct >= 0.75 ? '#10b981' : pct >= 0.55 ? '#fbbf24' : '#ef4444'
  return (
    <div className="gauge">
      <svg viewBox="0 0 170 170">
        <circle className="g-bg" cx="85" cy="85" r={r} />
        <circle className="g-fg" cx="85" cy="85" r={r}
          style={{ stroke: color, color, strokeDasharray: c, strokeDashoffset: anim ? c * (1 - pct) : c }} />
      </svg>
      <div className="g-val" style={{ color }}><CountUp value={pct * 100} dec={1} />%</div>
    </div>
  )
}

/* ---------- uyum bileşen barları ---------- */
function Bars({ bilesen, anim }) {
  const items = [
    { k: 'Kalite', v: bilesen.kalite, c: '#10b981' },
    { k: 'Gol Üretimi', v: bilesen.verim, c: '#14b8a6' },
    { k: 'Stil Uyumu', v: bilesen.stil, c: '#3b82f6' },
  ]
  return (
    <div className="chart">
      <h4>🧩 Uyum Bileşenleri</h4>
      {items.map((it, i) => (
        <div className="bar" key={it.k}>
          <div className="bl"><span>{it.k}</span><b>%{Math.round(it.v * 100)}</b></div>
          <div className="track">
            <div className="fill" style={{ width: anim ? it.v * 100 + '%' : '0%', background: it.c, transitionDelay: i * 0.12 + 's' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ---------- histogram ---------- */
function Histogram({ hist, anim }) {
  const max = Math.max(...hist.counts, 1)
  return (
    <div className="chart">
      <h4>📊 Gol+Asist Dağılımı (Monte Carlo)</h4>
      <div className="hist">
        {hist.counts.map((cnt, i) => (
          <div className="col" key={i} title={cnt}
            style={{ height: anim ? (cnt / max) * 100 + '%' : '0%', transitionDelay: i * 0.02 + 's' }} />
        ))}
      </div>
      <div className="hist-x"><span>{hist.labels[0]}</span><span>{hist.labels[hist.labels.length - 1]}</span></div>
    </div>
  )
}

function Metric({ t, v, s, c }) {
  return <div className="metric"><div className="mt">{t}</div><div className="mv" style={{ color: c }}>{v}</div><div className="ms">{s}</div></div>
}

/* ---------- dashboard ---------- */
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
            <span className="pill">⭐ {Number(o.ort_rating).toFixed(2)}</span>
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
        <Metric t="Sakatlık Riski" v={<><CountUp value={s.kacan_ort} dec={1} /> maç</>} s="sezonda (ort.)" c="#fbbf24" />
        <Metric t="20+ G+A Olasılığı" v={<>%<CountUp value={s.p20 * 100} /></>} s={'30+ için %' + Math.round(s.p30 * 100)} c="#34d399" />
        <Metric t="Sağlamlık" v={<>%<CountUp value={s.saglam * 100} /></>} s="32+ maç oynama" c="#60a5fa" />
      </div>

      <div className="g2">
        <Bars bilesen={data.bilesen} anim={anim} />
        <Histogram hist={s.hist} anim={anim} />
      </div>

      <details className="params">
        <summary>🔬 Hesaplanan parametreler (gerçek veriden)</summary>
        <p>S_base: {data.param.S.toFixed(3)} · sigma: {data.param.sigma[0]}/{data.param.sigma[1]} (varsayılan) ·
          Sakatlık: {data.param.episode} dönem / {data.param.toplam_mac} maç → %{(data.param.p * 100).toFixed(1)}/maç,
          dönem başına {data.param.lam.toFixed(1)} maç · Medyan performans %{Math.round(s.perf * 100)}</p>
      </details>
    </>
  )
}

/* ---------- uygulama ---------- */
export default function App() {
  const [oyuncu, setOyuncu] = useState('Lautaro Martinez')
  const [hedef, setHedef] = useState('Fenerbahce')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)
  const [hist, setHist] = useState(() => { try { return JSON.parse(localStorage.getItem('dt_hist') || '[]') } catch (e) { return [] } })

  const persist = h => { setHist(h); try { localStorage.setItem('dt_hist', JSON.stringify(h)) } catch (e) {} }
  const addHist = d => {
    const key = (d.oyuncu.isim + '|' + d.hedef.takim).toLowerCase()
    persist([{ key, d }, ...hist.filter(x => x.key !== key)].slice(0, 12))
  }

  async function analiz() {
    if (!oyuncu.trim() || !hedef.trim()) { setError('Oyuncu ve hedef takımı gir.'); return }
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/analyze?oyuncu=' + encodeURIComponent(oyuncu) + '&hedef=' + encodeURIComponent(hedef))
      const d = await r.json()
      if (!d.ok) throw new Error(d.error || 'Bilinmeyen hata')
      setData(d); addHist(d)
    } catch (e) { setError(e.message); setData(null) }
    finally { setLoading(false) }
  }
  const openHist = d => { setData(d); setOyuncu(d.oyuncu.isim); setHedef(d.hedef.takim); setError('') }

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
              <input value={hedef} onChange={e => setHedef(e.target.value)} onKeyDown={e => e.key === 'Enter' && analiz()} placeholder="ör. Fenerbahce" />
            </div>
            <button className="btn" onClick={analiz} disabled={loading}>
              <span className="shine" />
              {loading ? <><span className="spin" />Analiz ediliyor...</> : '🚀 ANALİZ ET'}
            </button>
            <div className="hint">Veri API-Football'dan gerçek zamanlı çekilir.</div>
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
              <p>Gerçek API verisi + Monte Carlo simülasyonu ile bir futbolcunun hedef takımdaki uyumunu, beklenen katkısını ve sakatlık riskini öngör.</p>
            </div>
            {loading
              ? <div className="state"><span className="spin" /> Veri çekiliyor ve simülasyon çalışıyor...</div>
              : error
                ? <div className="state err">⚠️ {error}</div>
                : data
                  ? <Dashboard data={data} />
                  : <div className="state">Soldan bir <b>oyuncu</b> ve <b>hedef takım</b> seç, <b>Analiz Et</b>'e bas. Analizlerin geçmişe kaydedilir.</div>}
          </main>
        </div>
      </div>
      <div className="imza">⚽ by <b>Enes Bozkurt</b></div>
    </>
  )
}
