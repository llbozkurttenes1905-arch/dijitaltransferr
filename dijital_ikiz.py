import numpy as np

# ================= API'DEN GELEN GERÇEK VERİLER =================
# --- Oyuncu: V. Osimhen (Galatasaray 2024-25) ---
ort_rating = 7.737931
ga90       = 1.217
ratings    = [9.3, 7.0, 7.2, 6.7, 8.9, 8.0, 7.2, 8.3, 7.2]
oynanan_gercek = 29

# --- Hedef takım: Fenerbahçe ---
hedef_adi            = "Fenerbahçe"
hedef_gol_basina_mac = 2.5

# --- Sakatlık (SADECE gerçek sakatlıklar: Thigh/Muscle/Back) ---
sakatlik_episode   = 6     # ayrı sakatlık dönemi
sakatlik_kacan_mac = 17    # bu dönemlerde kaçan maç
toplam_mac_3sezon  = 108

# ================= PARAMETRE HESAPLAMA =================
S_base      = ort_rating / 10
sigma_total = float(np.std([r/10 for r in ratings]))
sigma_form  = sigma_total * 0.8          # form² + mac² = total²
sigma_mac   = sigma_total * 0.6
p_sakatlik  = sakatlik_episode / toplam_mac_3sezon
lam_sakatlik= sakatlik_kacan_mac / sakatlik_episode

# --- Uyum skoru (3 bileşen) ---
kalite   = ort_rating / 10
verim    = min(ga90 / 1.0, 1.0)          # ga90>=1.0 = elit forvet
stil_fit = min(hedef_gol_basina_mac / 2.6, 1.0)
UYUM     = 0.50*kalite + 0.25*verim + 0.25*stil_fit

# ================= MONTE CARLO =================
mac_sayisi = 38
iterasyon  = 10000
rng = np.random.default_rng(42)

perf_list, kacan_list, ga_list = [], [], []
for _ in range(iterasyon):
    skorlar=[]; kacan=0; sakat_kalan=0; ga_sezon=0
    for m in range(mac_sayisi):
        if sakat_kalan > 0:
            sakat_kalan -= 1; kacan += 1; continue
        if rng.random() < p_sakatlik:
            sakat_kalan = max(1, int(rng.poisson(lam_sakatlik)))
            sakat_kalan -= 1; kacan += 1; continue
        s = S_base + rng.normal(0, sigma_form) + rng.normal(0, sigma_mac)
        s = min(1.0, max(0.0, s))
        skorlar.append(s)
        lam_match = ga90 * (s / S_base)          # o maçta beklenen gol+asist
        ga_sezon += rng.poisson(max(lam_match, 0))
    avg = np.mean(skorlar) if skorlar else 0
    perf_list.append(avg); kacan_list.append(kacan); ga_list.append(ga_sezon)

perf = np.array(perf_list); kacan = np.array(kacan_list); ga = np.array(ga_list)

# ================= DASHBOARD =================
print("="*55)
print(f"  DİJİTAL İKİZ — V. Osimhen  →  {hedef_adi}")
print("="*55)
print("\n[HESAPLANAN PARAMETRELER (gerçek veriden)]")
print(f"  S_base (perf. temeli)   : {S_base:.3f}  (rating {ort_rating:.2f}/10)")
print(f"  sigma_form / sigma_mac  : {sigma_form:.3f} / {sigma_mac:.3f}")
print(f"  Sakatlanma olasılığı/maç: {p_sakatlik:.3f}  ({sakatlik_episode} dönem/{toplam_mac_3sezon} maç)")
print(f"  Sakatlık başına kaçan   : {lam_sakatlik:.2f} maç")
print(f"  Gerçek gol+asist / 90'  : {ga90:.3f}")

print("\n[UYUM SKORU BİLEŞENLERİ]")
print(f"  Kalite (rating)         : {kalite*100:.1f}%  (ağırlık %50)")
print(f"  Verim (gol+asist üretimi): {verim*100:.1f}%  (ağırlık %25)")
print(f"  Stil Fit ({hedef_adi} 2.5 gol/maç): {stil_fit*100:.1f}%  (ağırlık %25)")
print(f"  ►► UYUM SKORU           : %{UYUM*100:.1f}")

print("\n[SİMÜLASYON SONUÇLARI — 10.000 sezon @ Fenerbahçe]")
print(f"  Sezonluk ort. performans (medyan): %{np.median(perf)*100:.1f}")
print(f"  Sakatlıktan kaçırılan maç (ort.) : {np.mean(kacan):.1f} maç")
print(f"  Beklenen GOL+ASİST (medyan)      : {int(np.median(ga))}")
print(f"  Gol+asist %80 aralığı            : {int(np.percentile(ga,10))} - {int(np.percentile(ga,90))}")
print(f"  20+ gol+asist yapma olasılığı    : %{np.mean(ga>=20)*100:.1f}")
print(f"  30+ gol+asist yapma olasılığı    : %{np.mean(ga>=30)*100:.1f}")
print(f"  En az 32 maç oynama (sağlamlık)  : %{np.mean((mac_sayisi-kacan)>=32)*100:.1f}")
print("="*55)
