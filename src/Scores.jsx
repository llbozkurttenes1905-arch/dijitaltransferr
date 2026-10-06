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

function Kadro11({ takim, takimAdi, logo, teamId }) {
  if (!takim || !takim.ilk11 || takim.ilk11.length === 0) {
    return <div className="kadro-yok">Kadro bilgisi henüz girilmedi.</div>
  }
  return (
    <div className="kadro-col">
      <div className="kadro-h">
        <TeamBadge logo={takim.takimLogo || logo} name={takim.takim || takimAdi} teamId={teamId} size={18} />
        {takim.takim || takimAdi}
        {takim.dizilis ? <span className="kadro-diz">{takim.dizilis}</span> : null}
      </div>
      <div className="kadro-alt-baslik">İlk 11</div>
      <ul className="kadro-liste">
        {takim.ilk11.map((p, i) => (
          <li key={i}>
            <span className="kadro-no">{p.no && p.no !== 0 ? p.no : (i + 1)}</span>
            {p.isim}
            {p.poz ? <span className="kadro-poz">{p.poz}</span> : null}
          </li>
        ))}
      </ul>
      {takim.yedekler && takim.yedekler.length > 0 && (
        <>
          <div className="kadro-alt-baslik" style={{ marginTop: '14px' }}>Yedekler</div>
          <ul className="kadro-liste">
            {takim.yedekler.map((p, i) => (
              <li key={i}>
                <span className="kadro-no">{p.no && p.no !== 0 ? p.no : '–'}</span>
                {p.isim}
              </li>
            ))}
          </ul>
        </>
      )}
      {takim.teknikDirektor && <div className="kadro-td">Teknik Direktör: {takim.teknikDirektor}</div>}
    </div>
  )
}

function OlayIkon({ tip, detay }) {
  if (tip === 'Goal') return <span>⚽</span>
  if (tip === 'Card') {
    return (detay && detay.includes('Red')) ? <span className="kart-kirmizi" title="Kırmızı Kart" /> : <span className="kart-sari" title="Sarı Kart" />
  }
  if (tip === 'subst') return <span>⇄</span>
  return <span>•</span>
}

function MacDetay({ mac, onClose }) {
  const [veri, setVeri] = useState(null)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [sekme, setSekme] = useState('ozet')

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

    // Canlı maç ise her 12 saniyede bir skoru ve olayları güncelle
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

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}>✕</button>
        <div className="modal-baslik">
          <div className="mb-lig">{mac.lig.ad}{mac.lig.tur ? ' · ' + mac.lig.tur : ''}</div>
          <div className="mb-mac">
            <div className="mb-t">
              <TeamBadge logo={mac.evSahibi.logo} name={mac.evSahibi.ad} teamId={mac.evSahibi.id} size={44} />
              <span>{mac.evSahibi.ad}</span>
            </div>
            <div className="mb-skor">
              <div className="mb-skor-n">{evSkor} : {depSkor}</div>
              <div className="mb-durum"><DurumRozeti m={{ durum: guncelDurum, dakika: guncelDakika, tarih: mac.tarih }} /></div>
            </div>
            <div className="mb-t">
              <TeamBadge logo={mac.deplasman.logo} name={mac.deplasman.ad} teamId={mac.deplasman.id} size={44} />
              <span>{mac.deplasman.ad}</span>
            </div>
          </div>
        </div>

        <div className="modal-sekmeler">
          {[['ozet', 'Özet'], ['istatistik', 'İstatistik'], ['kadro', 'Kadrolar']].map(([k, t]) => (
            <button key={k} className={'msek' + (sekme === k ? ' aktif' : '')} onClick={() => setSekme(k)}>{t}</button>
          ))}
        </div>

        {yukleniyor ? <div className="modal-yukleniyor">Maç verileri getiriliyor...</div> : (
          <div className="modal-govde">
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
                  <Kadro11 takim={kadroEv} takimAdi={mac.evSahibi.ad} logo={mac.evSahibi.logo} teamId={mac.evSahibi.id} />
                  <Kadro11 takim={kadroDep} takimAdi={mac.deplasman.ad} logo={mac.deplasman.logo} teamId={mac.deplasman.id} />
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
