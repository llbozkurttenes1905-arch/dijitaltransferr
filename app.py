# -*- coding: utf-8 -*-
"""
⚽ FUTBOL DİJİTAL İKİZ — Transfer Uyum Simülatörü
Streamlit arayüzü | API-Football + Monte Carlo
Çalıştır:  python3 -m streamlit run app.py
"""
import streamlit as st
import numpy as np
import requests, time, unicodedata, difflib, json, os
import plotly.graph_objects as go

# ============================================================== SAYFA
st.set_page_config(page_title="Futbol Dijital İkiz", page_icon="⚽",
                   layout="wide", initial_sidebar_state="expanded")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
html, body, [class*="css"]  { font-family:'Inter',sans-serif; }
.stApp { background:radial-gradient(1200px 600px at 20% -10%, #15323b 0%, #0b0f14 55%); }
#MainMenu, footer, header {visibility:hidden;}
.block-container{padding-top:1.6rem; max-width:1250px;}
.hero-title{font-size:clamp(26px,5vw,46px);font-weight:900;letter-spacing:-1px;
  background:linear-gradient(90deg,#10b981,#34d399,#fbbf24);-webkit-background-clip:text;
  -webkit-text-fill-color:transparent;margin-bottom:0;}
.hero-sub{color:#94a3b8;font-size:clamp(13px,2.5vw,16px);margin-top:4px;}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
  border-radius:18px;padding:18px 20px;backdrop-filter:blur(6px);}
.metric-title{color:#94a3b8;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
.metric-value{font-size:clamp(24px,4vw,34px);font-weight:900;line-height:1.1;margin-top:4px;}
.metric-sub{color:#64748b;font-size:12px;margin-top:2px;}
.badge{display:inline-block;padding:8px 18px;border-radius:999px;font-weight:800;font-size:15px;letter-spacing:.4px;}
.pill{display:inline-block;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  border-radius:999px;padding:4px 12px;font-size:12px;color:#cbd5e1;margin:2px 4px 2px 0;}
.name-big{font-size:clamp(20px,3.5vw,26px);font-weight:800;color:#f1f5f9;}
.muted{color:#94a3b8;font-size:13px;}
.stButton>button{background:linear-gradient(90deg,#10b981,#059669);color:#fff;border:0;
  border-radius:12px;padding:.55rem .8rem;font-weight:700;width:100%;font-size:13.5px;}
.stButton>button:hover{filter:brightness(1.08);}
section[data-testid="stSidebar"]{background:rgba(8,12,16,.7);border-right:1px solid rgba(255,255,255,.06);}

/* ---- Sidebar HER ZAMAN AÇIK (masaüstü): katlama butonunu gizle ---- */
@media (min-width:769px){
  [data-testid="stSidebarCollapseButton"], div[data-testid="collapsedControl"]{display:none !important;}
  section[data-testid="stSidebar"]{
     min-width:340px !important; max-width:340px !important;
     transform:none !important; visibility:visible !important;}
}
/* ---- MOBİL: sıkı yerleşim ---- */
@media (max-width:768px){
  .block-container{padding-left:.6rem;padding-right:.6rem;padding-top:1rem;}
  .card{padding:14px 14px;border-radius:14px;}
  .pill{font-size:11px;padding:3px 9px;}
}
/* Geçmiş listesi butonları sola dayalı */
.gecmis .stButton>button{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);
  color:#e2e8f0;text-align:left;font-weight:600;}
.gecmis .stButton>button:hover{background:rgba(16,185,129,.18);filter:none;}
/* İmza - sağ alt köşe */
.imza{position:fixed;right:14px;bottom:12px;z-index:1000;font-size:12.5px;color:#cbd5e1;
  background:rgba(8,12,16,.65);padding:5px 14px;border-radius:999px;
  border:1px solid rgba(16,185,129,.35);backdrop-filter:blur(6px);box-shadow:0 4px 16px rgba(0,0,0,.3);}
.imza b{background:linear-gradient(90deg,#10b981,#fbbf24);-webkit-background-clip:text;
  -webkit-text-fill-color:transparent;font-weight:800;}
@media (max-width:768px){.imza{font-size:11px;right:8px;bottom:8px;padding:4px 10px;}}
</style>
""", unsafe_allow_html=True)

MAX_HIST = 12

# API anahtarı: barındırma servisinin secret'ı / ortam değişkeninden (kullanıcıya sorulmaz)
try:
    API_KEY = st.secrets["API_KEY"]
except Exception:
    API_KEY = os.environ.get("API_KEY", "")

# ============================================================== API
class API:
    def __init__(self, key, throttle=7):
        self.base="https://v3.football.api-sports.io"
        self.h={"x-apisports-key":key}; self.t=throttle
    def _req(self, path, params):
        for _ in range(6):
            r=requests.get(f"{self.base}/{path}", headers=self.h, params=params)
            if r.status_code==429: time.sleep(30); continue
            r.raise_for_status(); time.sleep(self.t); return r.json()
        raise RuntimeError("API limiti doldu (günlük 100 hak bitmiş olabilir).")
    def get(self, path, **p):
        try: return self._req(path,p)["response"]
        except requests.HTTPError: return []
    def get_all(self, path, **p):
        out=[]; page=1
        while True:
            try: j=self._req(path,{**p,"page":page})
            except requests.HTTPError: break
            out+=j["response"]
            if page>=j["paging"]["total"]: break
            page+=1
        return out

def ga90(s):
    dk=s["games"]["minutes"] or 0
    return ((s["goals"]["total"] or 0)+(s["goals"]["assists"] or 0))*90/dk if dk>0 else 0
def sade(t): return ''.join(c for c in unicodedata.normalize('NFKD',t) if not unicodedata.combining(c))
def benzerlik(a, isim):
    p=a["player"]; h=sade(isim).lower()
    adlar=[p.get("name") or "", p.get("lastname") or "", p.get("firstname") or ""]
    return max((difflib.SequenceMatcher(None,h,sade(x).lower()).ratio() for x in adlar if x), default=0)

# ============================================================== VERİ ÇEKME
def oyuncu_bul(api, isim):
    kokler=[]
    if " " in isim:
        son=isim.split()[-1]; kokler+=[son, sade(son)]
    kokler+=[isim, sade(isim)]
    kokler=[k for k in dict.fromkeys(kokler) if len(k)>=3]
    havuz={}
    for kok in kokler:
        sorgular=[kok] if " " in kok else [kok[:n] for n in range(len(kok),3,-1)]
        for q in sorgular:
            res=api.get("players/profiles",search=q)
            if res:
                for a in res: havuz[a["player"]["id"]]=a
                break
        if havuz: break
    if not havuz: return None,[]
    adaylar=sorted(havuz.values(), key=lambda a:benzerlik(a,isim), reverse=True)
    for aday in adaylar[:5]:
        cid=aday["player"]["id"]
        cs=sorted(api.get("players/seasons",player=cid),reverse=True)
        for sez in cs[:5]:
            res=api.get("players",id=cid,season=sez)
            if res and res[0]["statistics"]:
                return (cid,res[0],sez,cs), adaylar
    return None, adaylar

def fetch(api, oyuncu_adi, hedef_adi, max_mac, log):
    log("🔎 Oyuncu aranıyor...")
    bul,adaylar=oyuncu_bul(api, oyuncu_adi)
    if not bul: raise RuntimeError(f"'{oyuncu_adi}' bulunamadı. Soyadıyla dene.")
    pid,hit,SEZON,seasons=bul
    stats=[s for s in hit["statistics"] if (s["games"]["appearences"] or 0)>0] or hit["statistics"]
    main=max(stats,key=lambda s:s["games"]["appearences"] or 0)
    lig_id=main["league"]["id"]; ptid=main["team"]["id"]
    oyuncu={"isim":hit["player"]["name"],"yas":hit["player"]["age"],
            "foto":hit["player"].get("photo"),"uyruk":hit["player"].get("nationality"),
            "pozisyon":main["games"]["position"],"oynanan_mac":main["games"]["appearences"],
            "dakika":main["games"]["minutes"],"gol":main["goals"]["total"] or 0,
            "asist":main["goals"]["assists"] or 0,"ort_rating":main["games"]["rating"],
            "ga90":round(ga90(main),3),"lig":main["league"]["name"],
            "takim":main["team"]["name"],"sezon":SEZON,"adaylar":[a["player"]["name"] for a in adaylar[:5]]}
    log(f"⭐ Son {max_mac} maçın reytingi çekiliyor...")
    allfix=[f for f in api.get("fixtures",team=ptid,league=lig_id,season=SEZON)
            if f["fixture"]["status"]["short"]=="FT"]
    sezon_mac=len(allfix) or 38; ratings=[]
    for f in sorted(allfix,key=lambda f:f["fixture"]["timestamp"])[-max_mac:]:
        for tm in api.get("fixtures/players",fixture=f["fixture"]["id"]):
            for pl in tm["players"]:
                if pl["player"]["id"]==pid:
                    rt=pl["statistics"][0]["games"]["rating"]
                    if rt: ratings.append(round(float(rt),2))
    if oyuncu["ort_rating"] is None and ratings:
        oyuncu["ort_rating"]=round(float(np.mean(ratings)),2)
    log("🏥 Sakatlık geçmişi çekiliyor...")
    sakatliklar=[]
    for yil in seasons[:3]:
        for rec in api.get("injuries",player=pid,season=yil):
            sakatliklar.append({"tarih":rec["fixture"]["date"][:10],
                                "tip":rec["player"]["type"],"neden":rec["player"]["reason"]})
    toplam_mac=sezon_mac*max(len(seasons[:3]),1)
    log("🛡️ Hedef takım analiz ediliyor...")
    tt=api.get("teams",search=hedef_adi) or api.get("teams",search=sade(hedef_adi))
    if not tt: raise RuntimeError(f"'{hedef_adi}' takımı bulunamadı.")
    htid=tt[0]["team"]["id"]; ulke=tt[0]["team"].get("country",""); logo=tt[0]["team"].get("logo")
    ligler=api.get("leagues",team=htid)
    ls=[(s["year"],l["league"]["id"],l["league"]["name"])
        for l in ligler if l["league"]["type"]=="League" for s in l["seasons"]]
    if not ls: ls=[(s["year"],l["league"]["id"],l["league"]["name"]) for l in ligler for s in l["seasons"]]
    ls.sort(reverse=True)
    ts=hl=hlig=hsez=None
    for yil,lid,lad in ls[:6]:
        r=api.get("teams/statistics",team=htid,league=lid,season=yil)
        if isinstance(r,dict) and (r.get("fixtures",{}).get("played",{}).get("total") or 0)>0:
            ts,hl,hlig,hsez=r,lid,lad,yil; break
    if ts is None: raise RuntimeError("Hedef takımın istatistik verisi bulunamadı.")
    hedef={"takim":ts["team"]["name"],"logo":logo,"ulke":ulke,"lig":hlig,"sezon":hsez,
           "mac":ts["fixtures"]["played"]["total"],"atilan_gol":ts["goals"]["for"]["total"]["total"],
           "gol_basina_mac":round((ts["goals"]["for"]["total"]["total"] or 0)/max(ts["fixtures"]["played"]["total"] or 1,1),2),
           "dizilis":(ts["lineups"][0]["formation"] if ts.get("lineups") else "—")}
    forvetler=[]
    for pl in api.get_all("players",team=htid,league=hl,season=hsez):
        s=pl["statistics"][0]
        if s["games"]["position"] in ("Attacker","Forward") and (s["games"]["minutes"] or 0)>=300:
            forvetler.append({"isim":pl["player"]["name"],"ga90":round(ga90(s),3)})
    forvetler=sorted(forvetler,key=lambda x:x["ga90"] or 0,reverse=True)[:4]
    return dict(oyuncu=oyuncu, ratings=ratings, sakatliklar=sakatliklar,
                toplam_mac=toplam_mac, hedef=hedef, forvetler=forvetler)

# ============================================================== SİMÜLASYON
NON_INJURY={"Red Card","Yellow Cards","Yellow Card","National selection","International duty",
            "Rest","Inactive","Suspended","Coach's decision","Personal reasons","Other"}
def simule(d, mac_sayisi=38, N=10000):
    from datetime import date
    o,h=d["oyuncu"],d["hedef"]
    inj=[r for r in d["sakatliklar"] if r["tip"]=="Missing Fixture" and r["neden"] not in NON_INJURY]
    gunler=sorted(date.fromisoformat(r["tarih"]) for r in inj)
    kacan=len(gunler); episode=0; prev=None
    for dt in gunler:
        if prev is None or (dt-prev).days>30: episode+=1
        prev=dt
    episode=max(episode,1)
    ort=float(o["ort_rating"] or 7.0); g90=o["ga90"] or 0.3
    S=ort/10
    sig=float(np.std([r/10 for r in d["ratings"]])) if len(d["ratings"])>1 else 0.07
    sf,sm=sig*0.8,sig*0.6
    p=episode/max(d["toplam_mac"],1); lam=kacan/episode
    kal=S; ver=min(g90/1.0,1.0); stil=min(h["gol_basina_mac"]/2.6,1.0)
    if d["forvetler"]:
        inc=d["forvetler"][0]["ga90"] or 0.1; rol=min(g90/max(inc,0.1),1.25)/1.25
        UYUM=0.40*kal+0.20*ver+0.20*stil+0.20*rol
    else:
        rol=None; UYUM=0.50*kal+0.25*ver+0.25*stil
    rng=np.random.default_rng(42); P=[];K=[];G=[]
    for _ in range(N):
        sk=[];kc=0;rem=0;gas=0
        for m in range(mac_sayisi):
            if rem>0: rem-=1;kc+=1;continue
            if rng.random()<p: rem=max(1,int(rng.poisson(lam)))-1;kc+=1;continue
            s=min(1.0,max(0.0,S+rng.normal(0,sf)+rng.normal(0,sm)))
            sk.append(s); gas+=rng.poisson(max(g90*(s/S),0))
        P.append(np.mean(sk) if sk else 0);K.append(kc);G.append(gas)
    P,G=np.array(P),np.array(G)
    return dict(UYUM=UYUM, bilesen=dict(Kalite=kal,Verim=ver,Stil=stil,RolFit=rol),
                S=S, sigma=[sf,sm], p=p, lam=lam, episode=episode, kacan=kacan,
                perf=float(np.median(P)), kacan_ort=float(np.mean(K)),
                ga_med=int(np.median(G)), ga_lo=int(np.percentile(G,10)), ga_hi=int(np.percentile(G,90)),
                p20=float(np.mean(G>=20)), p30=float(np.mean(G>=30)),
                saglam=float(np.mean((mac_sayisi-np.array(K))>=32)), G=[int(x) for x in G], mac_sayisi=mac_sayisi)

# ============================================================== GEÇMİŞ (oturum bazlı, ziyaretçiye özel)
def hist_ekle(d, r):
    o=d["oyuncu"]; key=f"{o['isim']}|{d['hedef']['takim']}".lower()
    item={"key":key,"isim":o["isim"],"takim":d["hedef"]["takim"],
          "foto":o.get("foto"),"uyum":r["UYUM"],"d":d,"r":r}
    g=[x for x in st.session_state["gecmis"] if x["key"]!=key]
    g.insert(0,item); g=g[:MAX_HIST]
    st.session_state["gecmis"]=g; st.session_state["aktif_key"]=key

# ============================================================== GRAFİKLER
def gauge(v):
    renk = "#10b981" if v>=0.75 else "#fbbf24" if v>=0.55 else "#ef4444"
    fig=go.Figure(go.Indicator(mode="gauge+number", value=v*100,
        number={'suffix':"%",'font':{'size':54,'color':'#f1f5f9'}},
        gauge={'axis':{'range':[0,100],'tickcolor':'#475569'},
               'bar':{'color':renk,'thickness':.28},'bgcolor':'rgba(0,0,0,0)','borderwidth':0,
               'steps':[{'range':[0,55],'color':'rgba(239,68,68,.18)'},
                        {'range':[55,75],'color':'rgba(251,191,36,.18)'},
                        {'range':[75,100],'color':'rgba(16,185,129,.18)'}]}))
    fig.update_layout(height=250,margin=dict(l=24,r=24,t=10,b=4),
                      paper_bgcolor='rgba(0,0,0,0)',font={'color':'#f1f5f9'})
    return fig
def bilesen_bar(b):
    et=[];vl=[]
    for k,v in b.items():
        if v is None: continue
        et.append({"Kalite":"Kalite","Verim":"Gol Üretimi","Stil":"Stil Uyumu","RolFit":"Rol Uyumu"}[k]); vl.append(v*100)
    fig=go.Figure(go.Bar(x=vl,y=et,orientation='h',
        marker=dict(color=vl,colorscale=[[0,'#ef4444'],[.5,'#fbbf24'],[1,'#10b981']],cmin=0,cmax=100),
        text=[f"%{x:.0f}" for x in vl],textposition='outside',textfont={'color':'#e2e8f0'}))
    fig.update_layout(height=240,margin=dict(l=10,r=30,t=10,b=10),paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',xaxis=dict(range=[0,112],showgrid=False,color='#64748b'),
        yaxis=dict(color='#e2e8f0'),font={'color':'#e2e8f0'})
    return fig
def dagilim(G,med):
    fig=go.Figure(go.Histogram(x=G,nbinsx=30,marker_color='#10b981',opacity=.85))
    fig.add_vline(x=med,line_dash="dash",line_color="#fbbf24",
                  annotation_text=f"medyan {med}",annotation_font_color="#fbbf24")
    fig.update_layout(height=250,margin=dict(l=10,r=10,t=10,b=10),paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',bargap=.05,
        xaxis=dict(title="Sezonluk Gol + Asist",color='#64748b',showgrid=False),
        yaxis=dict(title="Sıklık",color='#64748b',gridcolor='rgba(255,255,255,.05)'),font={'color':'#94a3b8'})
    return fig
def kart(t,v,s="",renk="#f1f5f9"):
    return f'<div class="card"><div class="metric-title">{t}</div><div class="metric-value" style="color:{renk}">{v}</div><div class="metric-sub">{s}</div></div>'

# ============================================================== DASHBOARD ÇİZİMİ
def render_dashboard(d, r):
    o=d["oyuncu"]; h=d["hedef"]; U=r["UYUM"]
    verdict=("MÜKEMMEL UYUM","#10b981") if U>=0.80 else ("İYİ UYUM","#34d399") if U>=0.65 \
            else ("ORTA DÜZEY","#fbbf24") if U>=0.50 else ("RİSKLİ","#ef4444")
    c1,c2,c3=st.columns([1.1,1,1.1])
    with c1:
        st.markdown('<div class="card">',unsafe_allow_html=True)
        cols=st.columns([1,2])
        if o.get("foto"): cols[0].image(o["foto"],width=72)
        cols[1].markdown(f'<div class="name-big">{o["isim"]}</div>'
                         f'<div class="muted">{o.get("uyruk","")} · {o.get("yas","?")} yaş · {o.get("pozisyon","")}</div>'
                         f'<div class="muted">{o.get("takim","")} · {o.get("lig","")} {o.get("sezon","")}</div>',unsafe_allow_html=True)
        st.markdown(f'<div style="margin-top:10px">'
                    f'<span class="pill">⚽ {o["gol"]} gol</span>'
                    f'<span class="pill">🅰️ {o["asist"]} asist</span>'
                    f'<span class="pill">⭐ {float(o["ort_rating"] or 0):.2f} reyting</span>'
                    f'<span class="pill">🎯 {o["ga90"]} G+A/90</span></div>',unsafe_allow_html=True)
        st.markdown('</div>',unsafe_allow_html=True)
    with c2:
        st.plotly_chart(gauge(U),use_container_width=True,config={'displayModeBar':False})
        st.markdown(f'<div style="text-align:center;margin-top:-18px">'
                    f'<span class="badge" style="background:{verdict[1]}22;color:{verdict[1]};border:1px solid {verdict[1]}55">{verdict[0]}</span></div>',
                    unsafe_allow_html=True)
    with c3:
        st.markdown('<div class="card">',unsafe_allow_html=True)
        cols=st.columns([1,2])
        if h.get("logo"): cols[0].image(h["logo"],width=64)
        cols[1].markdown(f'<div class="name-big">{h["takim"]}</div>'
                         f'<div class="muted">{h.get("ulke","")} · {h.get("lig","")} {h.get("sezon","")}</div>'
                         f'<div class="muted">Diziliş: {h.get("dizilis","—")}</div>',unsafe_allow_html=True)
        st.markdown(f'<div style="margin-top:10px">'
                    f'<span class="pill">🥅 {h["atilan_gol"]} gol</span>'
                    f'<span class="pill">📈 {h["gol_basina_mac"]} gol/maç</span>'
                    f'<span class="pill">🧤 {len(d["forvetler"])} forvet</span></div>',unsafe_allow_html=True)
        st.markdown('</div>',unsafe_allow_html=True)
    st.write("")
    m1,m2,m3,m4=st.columns(4)
    m1.markdown(kart("Beklenen Gol+Asist",f'{r["ga_med"]}',f'aralık {r["ga_lo"]}–{r["ga_hi"]}',"#10b981"),unsafe_allow_html=True)
    m2.markdown(kart("Sakatlık Riski",f'{r["kacan_ort"]:.1f} maç','sezonda (ort.)',"#fbbf24"),unsafe_allow_html=True)
    m3.markdown(kart("20+ G+A Olasılığı",f'%{r["p20"]*100:.0f}',f'30+ için %{r["p30"]*100:.0f}',"#34d399"),unsafe_allow_html=True)
    m4.markdown(kart("Sağlamlık",f'%{r["saglam"]*100:.0f}','32+ maç oynama','#60a5fa'),unsafe_allow_html=True)
    st.write("")
    g1,g2=st.columns([1,1.1])
    with g1:
        st.markdown("##### 🧩 Uyum Bileşenleri")
        st.plotly_chart(bilesen_bar(r["bilesen"]),use_container_width=True,config={'displayModeBar':False})
    with g2:
        st.markdown("##### 📊 Gol+Asist Dağılımı (Monte Carlo)")
        st.plotly_chart(dagilim(r["G"],r["ga_med"]),use_container_width=True,config={'displayModeBar':False})
    with st.expander("🔬 Hesaplanan parametreler (gerçek veriden)"):
        st.write(f"**S_base:** {r['S']:.3f} · **sigma_form/mac:** {r['sigma'][0]:.3f}/{r['sigma'][1]:.3f}")
        st.write(f"**Sakatlık:** {r['episode']} dönem / {d['toplam_mac']} maç → %{r['p']*100:.1f}/maç · dönem başına {r['lam']:.1f} maç")
        st.write(f"**Reyting örneklemi:** {d['ratings']}")
        st.caption(f"Aday eşleşmeler: {', '.join(o.get('adaylar',[]))}")

# ============================================================== DURUM (state)
if "gecmis" not in st.session_state: st.session_state["gecmis"]=[]
if "aktif_key" not in st.session_state:
    st.session_state["aktif_key"]=st.session_state["gecmis"][0]["key"] if st.session_state["gecmis"] else None

# ============================================================== SIDEBAR — GİRDİLER
with st.sidebar:
    st.markdown("### ⚽ Dijital İkiz")
    st.caption("Transfer Uyum Simülatörü")
    oyuncu_adi=st.text_input("Oyuncu", "Lautaro Martinez")
    hedef_adi=st.text_input("Hedef Takım", "Fenerbahce")
    with st.expander("⚙️ Gelişmiş"):
        max_mac=st.slider("Reyting için maç sayısı", 5, 20, 10)
        N=st.select_slider("Simülasyon sezon sayısı", [2000,5000,10000,20000], 10000)
        throttle=st.slider("İstek arası bekleme (sn)", 1, 10, 7)
    calistir=st.button("🚀 ANALİZ ET")

# ============================================================== ANALİZİ ÇALIŞTIR
if calistir:
    if not API_KEY:
        st.error("Sunucuda API anahtarı tanımlı değil. Yönetici, barındırma servisinde **API_KEY** "
                 "secret'ını / ortam değişkenini ayarlamalıdır.")
    else:
        try:
            api=API(API_KEY, throttle)
            with st.status("Veriler çekiliyor...", expanded=True) as s:
                d=fetch(api, oyuncu_adi, hedef_adi, max_mac, lambda m: s.write(m))
                s.write("🎲 Monte Carlo simülasyonu çalışıyor...")
                r=simule(d, N=N)
                s.update(label="✅ Analiz tamamlandı!", state="complete", expanded=False)
            hist_ekle(d, r)
        except Exception as e:
            st.error(f"Hata: {e}")

# ============================================================== SIDEBAR — GEÇMİŞ
with st.sidebar:
    st.markdown("---")
    st.markdown("#### 📋 Geçmiş Futbolcular")
    if st.session_state["gecmis"]:
        st.markdown('<div class="gecmis">',unsafe_allow_html=True)
        for it in st.session_state["gecmis"]:
            etk=f"{'🟢' if it['uyum']>=0.8 else '🟡' if it['uyum']>=0.55 else '🔴'} {it['isim']} → {it['takim']}  ·  %{it['uyum']*100:.0f}"
            if st.button(etk, key="h_"+it["key"], use_container_width=True):
                st.session_state["aktif_key"]=it["key"]; st.rerun()
        st.markdown('</div>',unsafe_allow_html=True)
        if st.button("🗑️ Geçmişi temizle", use_container_width=True):
            st.session_state["gecmis"]=[]; st.session_state["aktif_key"]=None
            st.rerun()
    else:
        st.caption("Henüz analiz yok. Yukarıdan bir oyuncu analiz et.")

# ============================================================== ANA ALAN
st.markdown('<div class="hero-title">⚽ Futbol Dijital İkiz</div>', unsafe_allow_html=True)
st.markdown('<div class="hero-sub">Gerçek API verisi + Monte Carlo ile transfer uyum & performans projeksiyonu</div>', unsafe_allow_html=True)
st.write("")

aktif=next((x for x in st.session_state["gecmis"] if x["key"]==st.session_state.get("aktif_key")), None)
if aktif:
    render_dashboard(aktif["d"], aktif["r"])
else:
    st.info("👈 Sol panelden **oyuncu** ve **hedef takımı** gir, **ANALİZ ET**'e bas. "
            "Analiz ettiğin oyuncular sol altta **Geçmiş Futbolcular** listesine eklenir; tıklayınca anında tekrar açılır.")

# ============================================================== İMZA (sağ alt)
st.markdown('<div class="imza">⚽ by <b>Enes Bozkurt</b></div>', unsafe_allow_html=True)
