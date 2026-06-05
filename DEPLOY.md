# 🚀 Futbol Dijital İkiz — Web Sitesi Olarak Yayınlama

## ❗ Önce: Neden Vercel değil?
**Streamlit, Vercel'de çalışmaz.** Vercel; Next.js / statik siteler ve kısa süreli "serverless"
fonksiyonlar içindir. Streamlit ise **sürekli açık kalan bir Python sunucusu** (Tornado + WebSocket)
gerektirir. Bu yüzden aşağıdaki **ücretsiz** ve Streamlit için yapılmış servisi kullan.

---

## ✅ Önerilen: Streamlit Community Cloud (ücretsiz, en kolay)

Sonuçta `https://<kullanıcı-adın>-<repo>.streamlit.app` gibi gerçek bir web sitesi linkin olur.

### 1. Projeyi GitHub'a yükle
Yeni bir GitHub deposu (repo) oluştur ve şu iki dosyayı içine koy (yeterli):
```
app.py
requirements.txt
```
Terminalden:
```bash
cd /Users/Ethem/Desktop/colab
git init
git add app.py requirements.txt .gitignore
git commit -m "Futbol Dijital Ikiz web app"
git branch -M main
git remote add origin https://github.com/<kullanıcı-adın>/<repo-adı>.git
git push -u origin main
```

### 2. Streamlit Cloud'a bağlan
1. **share.streamlit.io** adresine gir, GitHub ile giriş yap.
2. **"Create app" / "New app"** → deponu, `main` dalını ve **Main file path = app.py** seç.

### 3. API anahtarını SECRET olarak ekle  ⭐ (en önemli adım)
Dağıtım ekranında **"Advanced settings → Secrets"** kutusuna şunu yapıştır:
```toml
API_KEY = "SENIN_API_FOOTBALL_ANAHTARIN"
```
> Kod, anahtarı bu secret'tan otomatik okur (`st.secrets["API_KEY"]`). Kullanıcıya hiç sorulmaz,
> kimse anahtarı göremez.

### 4. Deploy'a bas
Birkaç dakikada site yayında olur. Linki paylaşabilirsin. 🎉

---

## 🖥️ Yerel test (kendi bilgisayarında)
İki yoldan biri:

**A) Ortam değişkeniyle:**
```bash
API_KEY="senin_anahtarin" python3 -m streamlit run app.py
```

**B) Secrets dosyasıyla:**
`.streamlit/secrets.toml.example` dosyasını `.streamlit/secrets.toml` olarak kopyala, anahtarını yaz, sonra:
```bash
python3 -m streamlit run app.py
```

---

## 🔁 Alternatif servisler (istersen)
| Servis | Not |
|--------|-----|
| **Hugging Face Spaces** | "Streamlit" template seç, secret olarak `API_KEY` ekle |
| **Render.com** | Web Service, Start command: `streamlit run app.py --server.port $PORT` |
| **Railway** | Benzer; ortam değişkeni `API_KEY` |

> Hepsinde mantık aynı: `API_KEY` adında bir **ortam değişkeni / secret** tanımla, gerisini kod halleder.

---

## 📝 Notlar
- **Geçmiş Futbolcular** listesi artık her ziyaretçiye özeldir (oturum bazlı); sayfa yenilenince sıfırlanır.
  Bu, public sitede ziyaretçilerin geçmişlerinin karışmaması için bilinçli bir tercihtir.
- Ücretsiz API planı **günde 100 istek** ile sınırlıdır; çok sayıda ziyaretçi olursa kota dolabilir.
  Yoğun kullanım için API planını yükseltmen gerekir.
