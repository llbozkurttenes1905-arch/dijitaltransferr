# 🚀 Futbol Dijital İkiz — Vercel'de Yayınlama

Bu proje artık **Streamlit kullanmıyor**. Mimari Vercel'e uygundur:

```
index.html          → sitenin görünen yüzü (statik)
api/analyze.py      → Vercel Serverless Function (veri çekme + simülasyon)
vercel.json         → fonksiyon ayarı (maxDuration)
requirements.txt    → boş (fonksiyon sadece Python stdlib kullanır)
```

API anahtarı **koda yazılmaz**; Vercel'de **ortam değişkeni (env)** olarak eklenir.

---

## 1) GitHub'a yükle
(Aşağıdaki git komutlarını çalıştır — repo: `dijitaltransferr`.)

## 2) Vercel'e bağla
1. **vercel.com** → giriş yap (GitHub ile) → **Add New… → Project**
2. `dijitaltransferr` deposunu **Import** et
3. **Framework Preset:** *Other* (otomatik algılar; değiştirme)
4. **Deploy**'a basmadan önce ↓ ortam değişkenini ekle

## 3) ⭐ API anahtarını env olarak ekle (en önemli adım)
**Settings → Environment Variables** (veya import ekranındaki Environment Variables bölümü):

| Name | Value |
|------|-------|
| `API_KEY` | `senin_api_football_anahtarın` |

Kaydet. (Kod bunu `os.environ["API_KEY"]` ile okur; tarayıcıya hiç gitmez.)

## 4) Deploy
Birkaç dakikada site yayında: `https://dijitaltransferr.vercel.app` gibi. 🎉

> Env değişkenini Deploy'dan **sonra** eklediysen: **Deployments → ... → Redeploy** yap ki yeni değişkeni alsın.

---

## 🖥️ Yerel test (isteğe bağlı)
```bash
npm i -g vercel
# proje klasöründe .env dosyası oluştur:  API_KEY=senin_anahtarin
vercel dev
```
Tarayıcıda `http://localhost:3000` açılır.

---

## 📝 Notlar
- **Geçmiş Futbolcular** listesi tarayıcıda (localStorage) tutulur → her ziyaretçiye özel, kalıcı.
- **Ücretsiz API limiti:** dakikada ~10 istek. Bir analiz ~8 istek harcar; arka arkaya çok hızlı analiz yapma.
- Hız sınırı nedeniyle maç-maç reyting çekimi yapılmaz; performans dalgalanması tipik bir varsayılan değerle modellenir.
  Çekirdek çıktılar (uyum skoru, gol+asist projeksiyonu, sakatlık riski) gerçek veriyle hesaplanır.
- `Bitirme_Projesi_Raporu.docx` ve `rapor_*` dosyaları siteyle ilgisizdir; `.vercelignore` ile dağıtıma dahil edilmez.
