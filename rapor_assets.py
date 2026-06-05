# -*- coding: utf-8 -*-
"""Bitirme raporu için: simülasyonu çalıştırır, istatistikleri ve grafikleri üretir."""
import numpy as np, json
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
from datetime import date

plt.rcParams.update({"font.size":11,"axes.titlesize":13,"axes.titleweight":"bold",
                     "figure.dpi":150,"axes.spines.top":False,"axes.spines.right":False,
                     "font.family":"DejaVu Sans"})
YESIL="#10b981"; KOYU="#0f766e"; SARI="#f59e0b"; KIRMIZI="#ef4444"; MAVI="#3b82f6"; GRI="#64748b"
OUT="/Users/Ethem/Desktop/colab/rapor_gorseller"
import os; os.makedirs(OUT, exist_ok=True)

# ===================== GERÇEK VERİ (API-Football'dan çekildi) =====================
ratings=[9.3,7.0,7.2,6.7,8.9,8.0,7.2,8.3,7.2]
ort_rating=7.737931; ga90=1.217
gol,asist,oynanan,dakika=26,5,29,2292
fb_gol_mac=2.5
# Sakatlık epizodları (sadece gerçek sakatlıklar): (etiket, kaçan maç, tip)
epizotlar=[("Eyl-Eki 2022",5,"Uyluk"),("Nis 2023",2,"Uyluk"),("Eki-Kas 2023",6,"Uyluk"),
           ("May 2024",1,"Kas"),("Eki 2024",2,"Kas"),("Ara 2024",1,"Sırt")]
sakatlik_episode=len(epizotlar); sakatlik_kacan=sum(e[1] for e in epizotlar); toplam_mac=108

# ===================== PARAMETRELER =====================
S_base=ort_rating/10
sig=float(np.std([r/10 for r in ratings])); sigma_form,sigma_mac=sig*0.8,sig*0.6
p_sak=sakatlik_episode/toplam_mac; lam_sak=sakatlik_kacan/sakatlik_episode
kalite=S_base; verim=min(ga90/1.0,1.0); stil=min(fb_gol_mac/2.6,1.0)
UYUM=0.50*kalite+0.25*verim+0.25*stil

# ===================== MONTE CARLO =====================
def sim(mac_sayisi=38,N=10000,p=p_sak,lam=lam_sak,base=S_base,g90=ga90,sf=sigma_form,sm=sigma_mac,seed=42):
    rng=np.random.default_rng(seed); P=[];K=[];G=[]
    for _ in range(N):
        sk=[];kc=0;rem=0;gas=0
        for m in range(mac_sayisi):
            if rem>0: rem-=1;kc+=1;continue
            if rng.random()<p: rem=max(1,int(rng.poisson(lam)))-1;kc+=1;continue
            s=min(1.0,max(0.0,base+rng.normal(0,sf)+rng.normal(0,sm)))
            sk.append(s); gas+=rng.poisson(max(g90*(s/base),0))
        P.append(np.mean(sk) if sk else 0);K.append(kc);G.append(gas)
    return np.array(P),np.array(K),np.array(G)
P,K,G=sim()
stat=dict(S_base=S_base,sigma_form=sigma_form,sigma_mac=sigma_mac,p_sak=p_sak,lam_sak=lam_sak,
          kalite=kalite,verim=verim,stil=stil,UYUM=UYUM,ga90=ga90,ort_rating=ort_rating,
          gol=gol,asist=asist,oynanan=oynanan,dakika=dakika,fb_gol_mac=fb_gol_mac,
          sakatlik_episode=sakatlik_episode,sakatlik_kacan=sakatlik_kacan,toplam_mac=toplam_mac,
          perf_med=float(np.median(P)),kacan_ort=float(np.mean(K)),
          ga_med=int(np.median(G)),ga_lo=int(np.percentile(G,10)),ga_hi=int(np.percentile(G,90)),
          p20=float(np.mean(G>=20)),p30=float(np.mean(G>=30)),
          saglam=float(np.mean((38-K)>=32)),ga_mean=float(np.mean(G)),ga_std=float(np.std(G)))
json.dump(stat,open(f"{OUT}/stats.json","w"),indent=2)
print("UYUM=%.3f  G+A med=%d (%d-%d)  kacan=%.1f  saglam=%.1f%%"%(UYUM,stat["ga_med"],stat["ga_lo"],stat["ga_hi"],stat["kacan_ort"],stat["saglam"]*100))

# ===================== GRAFİKLER =====================
def kaydet(ad): plt.tight_layout(); plt.savefig(f"{OUT}/{ad}",bbox_inches="tight"); plt.close()

# 1) Maç rating dağılımı
plt.figure(figsize=(7,3.4))
x=range(1,len(ratings)+1)
plt.bar(x,ratings,color=YESIL,alpha=.85,width=.6)
plt.axhline(np.mean(ratings),color=SARI,ls="--",lw=2,label=f"Ortalama = {np.mean(ratings):.2f}")
plt.ylim(0,10); plt.xlabel("Maç (kronolojik)"); plt.ylabel("Maç Reytingi (0-10)")
plt.title("Şekil: Son 9 Maç Performans Reytingi Dağılımı"); plt.legend()
kaydet("fig_ratings.png")

# 2) Uyum bileşenleri
plt.figure(figsize=(7,3))
et=["Kalite\n(reyting)","Verim\n(gol+asist)","Stil Uyumu\n(takım hücumu)"]
vl=[kalite*100,verim*100,stil*100]; col=[YESIL,KOYU,MAVI]
b=plt.barh(et,vl,color=col,alpha=.9)
for i,v in enumerate(vl): plt.text(v+1,i,f"%{v:.1f}",va="center",fontweight="bold")
plt.xlim(0,115); plt.xlabel("Katkı (%)"); plt.title(f"Şekil: Uyum Skoru Bileşenleri (Toplam = %{UYUM*100:.1f})")
kaydet("fig_components.png")

# 3) Gol+Asist dağılımı
plt.figure(figsize=(7,3.6))
plt.hist(G,bins=30,color=YESIL,alpha=.85,edgecolor="white",linewidth=.4)
plt.axvline(stat["ga_med"],color=SARI,ls="--",lw=2,label=f"Medyan = {stat['ga_med']}")
plt.axvspan(stat["ga_lo"],stat["ga_hi"],color=SARI,alpha=.12,label=f"%80 aralık = {stat['ga_lo']}-{stat['ga_hi']}")
plt.xlabel("Sezonluk Gol + Asist"); plt.ylabel("Frekans (10.000 sezon)")
plt.title("Şekil: Monte Carlo - Sezonluk Gol+Asist Olasılık Dağılımı"); plt.legend()
kaydet("fig_ga_dist.png")

# 4) Kaçırılan maç dağılımı
plt.figure(figsize=(7,3.2))
vals,counts=np.unique(K,return_counts=True)
plt.bar(vals,counts/len(K)*100,color=SARI,alpha=.85)
plt.axvline(stat["kacan_ort"],color=KIRMIZI,ls="--",lw=2,label=f"Ortalama = {stat['kacan_ort']:.1f} maç")
plt.xlabel("Sakatlıktan Kaçırılan Maç Sayısı"); plt.ylabel("Olasılık (%)")
plt.title("Şekil: Sezon Başına Kaçırılan Maç Dağılımı"); plt.legend()
kaydet("fig_missed_dist.png")

# 5) Sakatlık epizodları
plt.figure(figsize=(7,3.2))
tip_renk={"Uyluk":KIRMIZI,"Kas":SARI,"Sırt":MAVI}
etk=[e[0] for e in epizotlar]; mac=[e[1] for e in epizotlar]; renk=[tip_renk[e[2]] for e in epizotlar]
plt.bar(etk,mac,color=renk,alpha=.9)
plt.ylabel("Kaçırılan Maç"); plt.title("Şekil: Sakatlık Geçmişi - Epizotlar (3 Sezon)")
import matplotlib.patches as mp
plt.legend(handles=[mp.Patch(color=c,label=t) for t,c in tip_renk.items()])
plt.xticks(rotation=20,ha="right")
kaydet("fig_injury.png")

# 6) Duyarlılık analizi (2 panel)
fig,ax=plt.subplots(1,2,figsize=(9,3.4))
# 6a UYUM vs takım gol/maç
gm=np.linspace(1.0,3.0,40); uy=[0.50*kalite+0.25*verim+0.25*min(g/2.6,1.0) for g in gm]
ax[0].plot(gm,np.array(uy)*100,color=YESIL,lw=2.5)
ax[0].axvline(fb_gol_mac,color=SARI,ls="--",lw=1.5); ax[0].scatter([fb_gol_mac],[UYUM*100],color=KIRMIZI,zorder=5,s=50)
ax[0].set_xlabel("Hedef Takım Gol/Maç"); ax[0].set_ylabel("Uyum Skoru (%)"); ax[0].set_title("(a) Stil Uyumuna Duyarlılık")
# 6b Beklenen G+A vs sakatlık olasılığı
ps=np.linspace(0.0,0.20,12); ga_exp=[np.median(sim(N=2000,p=pp,seed=7)[2]) for pp in ps]
ax[1].plot(ps*100,ga_exp,color=MAVI,lw=2.5,marker="o",ms=4)
ax[1].axvline(p_sak*100,color=SARI,ls="--",lw=1.5)
ax[1].set_xlabel("Maç Başına Sakatlık Olasılığı (%)"); ax[1].set_ylabel("Medyan Gol+Asist"); ax[1].set_title("(b) Sakatlık Riskine Duyarlılık")
plt.suptitle("Şekil: Duyarlılık (Hassasiyet) Analizi",fontweight="bold")
plt.tight_layout(); plt.savefig(f"{OUT}/fig_sensitivity.png",bbox_inches="tight"); plt.close()

# 7) Uyum göstergesi (gauge / donut)
fig,ax=plt.subplots(figsize=(4.2,3.0),subplot_kw={"aspect":"equal"})
val=UYUM*100
ax.pie([val,100-val],startangle=90,counterclock=False,colors=[YESIL,"#e5e7eb"],
       wedgeprops=dict(width=0.32,edgecolor="white"))
ax.text(0,0,f"%{val:.1f}",ha="center",va="center",fontsize=30,fontweight="bold",color=KOYU)
ax.text(0,-0.45,"UYUM SKORU",ha="center",va="center",fontsize=10,color=GRI)
ax.set_title("Şekil: Genel Uyum Skoru")
plt.savefig(f"{OUT}/fig_gauge.png",bbox_inches="tight"); plt.close()

# 8) Sistem mimarisi diyagramı
fig,ax=plt.subplots(figsize=(8.2,4.6)); ax.set_xlim(0,10); ax.set_ylim(0,10); ax.axis("off")
def kutu(x,y,w,h,t,c):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle="round,pad=0.08,rounding_size=0.15",
                fc=c,ec="#334155",lw=1.3,alpha=.95))
    ax.text(x+w/2,y+h/2,t,ha="center",va="center",fontsize=9.5,fontweight="bold",color="white",wrap=True)
def ok(x1,y1,x2,y2):
    ax.add_patch(FancyArrowPatch((x1,y1),(x2,y2),arrowstyle="-|>",mutation_scale=16,lw=1.6,color="#334155"))
kutu(0.3,8,3,1.4,"KULLANICI ARAYÜZÜ\n(Streamlit Web)",MAVI)
kutu(0.3,5.5,3,1.4,"VERİ ÇEKME KATMANI\nAPI-Football İstemcisi",KOYU)
kutu(0.3,3,3,1.4,"VERİ ÖN İŞLEME\nFiltreleme & Parametre\nTahmini",YESIL)
kutu(6.7,5.5,3,1.4,"MONTE CARLO\nSimülasyon Motoru",KIRMIZI)
kutu(6.7,3,3,1.4,"UYUM MODELİ\n(Kalite+Verim+Stil)",SARI)
kutu(6.7,8,3,1.4,"DASHBOARD\nGauge · Grafik · Metrik",MAVI)
kutu(3.7,0.6,2.6,1.1,"API-Football\n(Bulut Veritabanı)","#7c3aed")
ok(1.8,8,1.8,6.9); ok(1.8,5.5,1.8,4.4); ok(3.3,3.7,6.7,3.7); ok(8.2,4.4,8.2,5.5)
ok(8.2,6.9,8.2,8); ok(6.7,8.7,3.3,8.7); ok(5,1.7,1.8,3)
ax.text(3.4,2.2,"gerçek veri",fontsize=8,color=GRI,style="italic")
ax.set_title("Şekil: Sistem Mimarisi (Dijital İkiz İş Akışı)",fontweight="bold",fontsize=12)
plt.savefig(f"{OUT}/fig_arch.png",bbox_inches="tight"); plt.close()

print("Tüm grafikler üretildi →",OUT)
