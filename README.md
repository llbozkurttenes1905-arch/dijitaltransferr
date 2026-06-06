# ⚽ Futbol Dijital İkiz — Transfer Uyum Simülatörü

Gerçek API verisi (API-Football) + Monte Carlo simülasyonu ile bir futbolcunun hedef takımdaki
**uyum skorunu**, **beklenen gol+asist** katkısını ve **sakatlık riskini** öngören modern web uygulaması.

**Teknoloji:** React (Vite) arayüz · Node.js serverless API · saf CSS animasyonlar.

## Yapı
```
index.html          → giriş
src/                → React arayüz (App.jsx, styles.css, main.jsx)
api/analyze.js      → Vercel serverless fonksiyonu (veri çekme + simülasyon)
package.json        → bağımlılıklar (react, vite)
```

## 🚀 Vercel'de yayınlama
1. Bu repoyu **vercel.com → Add New → Project** ile içe aktar (Vite otomatik algılanır).
2. **Settings → Environment Variables** bölümüne ekle:
   - `API_KEY` = *(API-Football anahtarın)*
3. **Deploy**. (Env'i sonradan eklersen **Redeploy** yap.)

API anahtarı koda yazılmaz; yalnızca Vercel ortam değişkeni olarak okunur (`process.env.API_KEY`).

## 💻 Yerel geliştirme (isteğe bağlı, Node gerekir)
```bash
npm install
echo "API_KEY=senin_anahtarin" > .env
npx vercel dev      # api/ fonksiyonuyla birlikte çalıştırır
```

---
by **Enes Bozkurt**
