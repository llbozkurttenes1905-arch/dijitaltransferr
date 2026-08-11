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

function MacSatiri({ m, onClick }) {
  const oynandi = m.skor.ev != null
  return (
    <button className="mac-row" onClick={() => onClick(m)}>
      <div className="mac-durum"><DurumRozeti m={m} /></div>
      <div className="mac-takimlar">
        <div className={'mac-t' + (m.evSahibi.kazandi ? ' kazandi' : '')}>
          <img src={m.evSahibi.logo} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
          <span>{m.evSahibi.ad}</span>
        </div>
        <div className={'mac-t' + (m.deplasman.kazandi ? ' kazandi' : '')}>
          <img src={m.deplasman.logo} alt="" onError={e => e.currentTarget.style.visibility = 'hidden'} />
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
  const num = v => { if (v == null) return 0; const n = parseFloat(String(v).replace('%', '')); return isNaN(n) ? 0 : n }
  const a = num(evVal), b = num(depVal), tot = a + b || 1
  const pa = (a / tot) * 100, pb = (b / tot) * 100
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

function Kadro11({ takim }) {
  if (!takim) return <div className="kadro-yok">Kadro bilgisi henüz yok.</div>
  return (
    <div className="kadro-col">
      <div className="kadro-h"><img src={takim.takimLogo} alt="" />{takim.takim}<span className="kadro-diz">{takim.dizilis}</span></div>
      <ul className="kadro-liste">
        {takim.ilk11.map((p, i) => (
          <li key={i}><span className="kadro-no">{p.no ?? '–'}</span>{p.isim}<span className="kadro-poz">{p.poz}</span></li>
        ))}
      </ul>
      {takim.teknikDirektor && <div className="kadro-td">Teknik Direktör: {takim.teknikDirektor}</div>}
    </div>
  )
}

function OlayIkon({ tip, detay }) {
  if (tip === 'Goal') return <>{detay === 'Own Goal' ? '⚽️🔴' : detay === 'Penalty' ? '⚽️🥅' : '⚽️'}</>
  if (tip === 'Card') return <>{detay === 'Red Card' ? '🟥' : '🟨'}</>
  if (tip === 'subst') return <>🔄</>
  if (tip === 'Var') return <>📺</>
  return <>•</>
}

function MacDetay({ mac, onClose }) {
  const [veri, setVeri] = useState(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [sekme, setSekme] = useState('ozet')

  useEffect(() => {
    let iptal = false
    setYukleniyor(true); setVeri(null)
    fetch('/api/scores?fixture=' + mac.id).then(r => r.json()).then(d => { if (!iptal) { setVeri(d.ok ? d : null); setYukleniyor(false) } })
      .catch(() => { if (!iptal) setYukleniyor(false) })
    return () => { iptal = true }
  }, [mac.id])

  const ev = veri?.istatistik?.[0], dep = veri?.istatistik?.[1]
  const kadroEv = veri?.kadrolar?.[0], kadroDep = veri?.kadrolar?.[1]

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>✕</button>
        <div className="modal-baslik">
          <div className="mb-lig">{mac.lig.ad}{mac.lig.tur ? ' · ' + mac.lig.tur : ''}</div>
          <div className="mb-mac">
            <div className="mb-t"><img src={mac.evSahibi.logo} alt="" /><span>{mac.evSahibi.ad}</span></div>
            <div className="mb-skor">
              <div className="mb-skor-n">{mac.skor.ev ?? '–'} : {mac.skor.dep ?? '–'}</div>
              <div className="mb-durum"><DurumRozeti m={mac} /></div>
            </div>
            <div className="mb-t"><img src={mac.deplasman.logo} alt="" /><span>{mac.deplasman.ad}</span></div>
          </div>
        </div>

        <div className="modal-sekmeler">
          {[['ozet', 'Özet'], ['istatistik', 'İstatistik'], ['kadro', 'Kadrolar']].map(([k, t]) => (
            <button key={k} className={'msek' + (sekme === k ? ' aktif' : '')} onClick={() => setSekme(k)}>{t}</button>
          ))}
        </div>

        {yukleniyor ? <div className="modal-yukleniyor">Maç verileri getiriliyor...</div> : !veri ? (
          <div className="modal-yukleniyor">Bu maç için henüz istatistik/kadro verisi yok.</div>
        ) : (
          <div className="modal-govde">
            {sekme === 'ozet' && (
              veri.olaylar.length === 0 ? <div className="modal-yukleniyor">Henüz kayda değer bir olay yok.</div> :
              <ul className="olay-liste">
                {veri.olaylar.map((o, i) => (
                  <li key={i} className={o.takim === mac.deplasman.ad ? 'sag' : ''}>
                    <span className="olay-dk">{o.dakika}{o.ekDakika ? '+' + o.ekDakika : ''}'</span>
                    <span className="olay-ikon"><OlayIkon tip={o.tip} detay={o.detay} /></span>
                    <span className="olay-oyuncu">{o.oyuncu}{o.yardimci ? <small> ({o.yardimci})</small> : null}</span>
                  </li>
                ))}
              </ul>
            )}

            {sekme === 'istatistik' && (
              !ev || !dep ? <div className="modal-yukleniyor">İstatistik verisi henüz yayınlanmadı.</div> :
              <div className="stat-liste">
                {ev.kalemler.map((s, i) => (
                  <StatBar key={i} ad={s.tip} evVal={s.deger} depVal={dep.kalemler[i]?.deger} />
                ))}
              </div>
            )}

            {sekme === 'kadro' && (
              <div className="kadro-grid">
                <Kadro11 takim={kadroEv} />
                <Kadro11 takim={kadroDep} />
              </div>
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
    zamanlayici.current = setInterval(getir, 20000)
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
              {g.bayrak && <img className="lig-bayrak" src={g.bayrak} alt="" />}
              <img src={g.logo} alt="" />
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
