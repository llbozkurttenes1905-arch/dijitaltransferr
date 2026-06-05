# -*- coding: utf-8 -*-
"""
Vercel Serverless Function — Futbol Dijital İkiz analiz motoru.
API_KEY ortam değişkeninden okunur (koda yazılmaz).
Sadece Python standart kütüphanesi kullanır (numpy/requests YOK).
Uç nokta:  GET /api/analyze?oyuncu=...&hedef=...
"""
from http.server import BaseHTTPRequestHandler
import os, json, math, random, difflib, unicodedata
import urllib.request, urllib.parse
from datetime import date

API_KEY = os.environ.get("API_KEY", "")
BASE = "https://v3.football.api-sports.io"

# ----------------------------------------------------------- API yardımcı
def api_get(path, params):
    url = f"{BASE}/{path}?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"x-apisports-key": API_KEY})
    try:
        with urllib.request.urlopen(req, timeout=12) as r:
            return json.loads(r.read().decode("utf-8")).get("response", [])
    except Exception:
        return []

def sade(t):
    return ''.join(c for c in unicodedata.normalize('NFKD', t) if not unicodedata.combining(c))

def benzerlik(aday, isim):
    p = aday["player"]; h = sade(isim).lower()
    adlar = [p.get("name") or "", p.get("lastname") or "", p.get("firstname") or ""]
    return max((difflib.SequenceMatcher(None, h, sade(x).lower()).ratio() for x in adlar if x), default=0)

def ga90(s):
    dk = s["games"]["minutes"] or 0
    return ((s["goals"]["total"] or 0) + (s["goals"]["assists"] or 0)) * 90 / dk if dk > 0 else 0

# ----------------------------------------------------------- oyuncu bulma (az istekli)
def oyuncu_bul(isim):
    kokler = []
    if " " in isim:
        son = isim.split()[-1]; kokler += [son, sade(son)]
    kokler += [isim, sade(isim)]
    kokler = [k for k in dict.fromkeys(kokler) if len(k) >= 3]
    havuz = {}
    for kok in kokler:
        sorgular = [kok] if " " in kok else [kok[:n] for n in range(len(kok), 3, -1)]
        for q in sorgular[:2]:                  # istek bütçesi için sınırlı
            res = api_get("players/profiles", {"search": q})
            if res:
                for a in res:
                    havuz[a["player"]["id"]] = a
                break
        if havuz:
            break
    if not havuz:
        return None
    adaylar = sorted(havuz.values(), key=lambda a: benzerlik(a, isim), reverse=True)
    for aday in adaylar[:1]:                     # en benzer aday
        cid = aday["player"]["id"]
        cs = sorted(api_get("players/seasons", {"player": cid}), reverse=True)
        for sez in cs[:2]:
            res = api_get("players", {"id": cid, "season": sez})
            if res and res[0]["statistics"]:
                return cid, res[0], sez, cs
    return None

# ----------------------------------------------------------- model + simülasyon
NON_INJURY = {"Red Card", "Yellow Cards", "Yellow Card", "National selection", "International duty",
              "Rest", "Inactive", "Suspended", "Coach's decision", "Personal reasons", "Other"}

def poisson(lam):
    if lam <= 0:
        return 0
    L = math.exp(-min(lam, 30.0)); k = 0; p = 1.0
    while True:
        k += 1; p *= random.random()
        if p <= L:
            return k - 1

def analyze(oyuncu_adi, hedef_adi):
    bul = oyuncu_bul(oyuncu_adi)
    if not bul:
        raise ValueError(f"'{oyuncu_adi}' bulunamadı. Soyadıyla ve doğruya yakın yaz.")
    pid, hit, SEZON, seasons = bul
    stats = [s for s in hit["statistics"] if (s["games"]["appearences"] or 0) > 0] or hit["statistics"]
    main = max(stats, key=lambda s: s["games"]["appearences"] or 0)
    oyuncu = {
        "isim": hit["player"]["name"], "yas": hit["player"].get("age"),
        "foto": hit["player"].get("photo"), "uyruk": hit["player"].get("nationality"),
        "pozisyon": main["games"]["position"], "gol": main["goals"]["total"] or 0,
        "asist": main["goals"]["assists"] or 0,
        "ort_rating": float(main["games"]["rating"]) if main["games"].get("rating") else 7.0,
        "ga90": round(ga90(main), 3), "lig": main["league"]["name"],
        "takim": main["team"]["name"], "sezon": SEZON,
    }
    # Sakatlık (son 2 sezon)
    sakatliklar = []
    for yil in seasons[:2]:
        for rec in api_get("injuries", {"player": pid, "season": yil}):
            sakatliklar.append({"tarih": rec["fixture"]["date"][:10],
                                "tip": rec["player"]["type"], "neden": rec["player"]["reason"]})
    toplam_mac = 38 * max(len(seasons[:2]), 1)
    # Hedef takım
    tt = api_get("teams", {"search": hedef_adi}) or api_get("teams", {"search": sade(hedef_adi)})
    if not tt:
        raise ValueError(f"'{hedef_adi}' takımı bulunamadı.")
    htid = tt[0]["team"]["id"]; ulke = tt[0]["team"].get("country", ""); logo = tt[0]["team"].get("logo")
    ligler = api_get("leagues", {"team": htid})
    ls = [(s["year"], l["league"]["id"], l["league"]["name"])
          for l in ligler if l["league"]["type"] == "League" for s in l["seasons"]]
    if not ls:
        ls = [(s["year"], l["league"]["id"], l["league"]["name"]) for l in ligler for s in l["seasons"]]
    ls.sort(reverse=True)
    ts = hlig = hsez = None
    for yil, lid, lad in ls[:3]:
        r = api_get("teams/statistics", {"team": htid, "league": lid, "season": yil})
        if isinstance(r, dict) and (r.get("fixtures", {}).get("played", {}).get("total") or 0) > 0:
            ts, hlig, hsez = r, lad, yil; break
    if ts is None:
        raise ValueError("Hedef takımın istatistik verisi bulunamadı.")
    mac = ts["fixtures"]["played"]["total"]; atilan = ts["goals"]["for"]["total"]["total"] or 0
    hedef = {"takim": ts["team"]["name"], "logo": logo, "ulke": ulke, "lig": hlig, "sezon": hsez,
             "atilan_gol": atilan, "gol_basina_mac": round(atilan / max(mac, 1), 2),
             "dizilis": (ts["lineups"][0]["formation"] if ts.get("lineups") else "—")}
    return run_model(oyuncu, sakatliklar, toplam_mac, hedef)

def run_model(oyuncu, sakatliklar, toplam_mac, hedef, N=5000, mac_sayisi=38):
    inj = [r for r in sakatliklar if r["tip"] == "Missing Fixture" and r["neden"] not in NON_INJURY]
    gunler = sorted(date.fromisoformat(r["tarih"]) for r in inj)
    kacan = len(gunler); episode = 0; prev = None
    for d in gunler:
        if prev is None or (d - prev).days > 30:
            episode += 1
        prev = d
    episode = max(episode, 1)
    S = float(oyuncu["ort_rating"] or 7.0) / 10
    g90 = oyuncu["ga90"] or 0.3
    sf, sm = 0.060, 0.045                       # varsayılan performans dalgalanması
    p = episode / max(toplam_mac, 1); lam = (kacan / episode) if episode else 0
    kal = S; ver = min(g90 / 1.0, 1.0); stil = min(hedef["gol_basina_mac"] / 2.6, 1.0)
    UYUM = 0.50 * kal + 0.25 * ver + 0.25 * stil
    random.seed(42)
    Pl = []; Kl = []; G = []
    for _ in range(N):
        sk = []; kc = 0; rem = 0; gas = 0
        for _m in range(mac_sayisi):
            if rem > 0:
                rem -= 1; kc += 1; continue
            if random.random() < p:
                rem = max(1, poisson(lam)) - 1; kc += 1; continue
            s = S + random.gauss(0, sf) + random.gauss(0, sm)
            s = min(1.0, max(0.0, s)); sk.append(s)
            gas += poisson(g90 * (s / S) if S > 0 else 0)
        Pl.append(sum(sk) / len(sk) if sk else 0); Kl.append(kc); G.append(gas)
    G.sort()
    def pctl(a, q): return a[min(len(a) - 1, max(0, int(q * len(a))))]
    ga_med, ga_lo, ga_hi = pctl(G, 0.5), pctl(G, 0.10), pctl(G, 0.90)
    p20 = sum(1 for x in G if x >= 20) / len(G)
    p30 = sum(1 for x in G if x >= 30) / len(G)
    saglam = sum(1 for k in Kl if (mac_sayisi - k) >= 32) / len(Kl)
    kacan_ort = sum(Kl) / len(Kl)
    perf = sorted(Pl)[len(Pl) // 2]
    lo, hi = min(G), max(G)
    if hi == lo: hi = lo + 1
    nb = 24; w = (hi - lo) / nb
    labels = [int(round(lo + w * (i + 0.5))) for i in range(nb)]
    counts = [0] * nb
    for x in G:
        idx = int((x - lo) / w); idx = nb - 1 if idx >= nb else (0 if idx < 0 else idx)
        counts[idx] += 1
    return {
        "oyuncu": oyuncu, "hedef": hedef, "uyum": UYUM,
        "bilesen": {"kalite": kal, "verim": ver, "stil": stil},
        "sim": {"ga_med": ga_med, "ga_lo": ga_lo, "ga_hi": ga_hi, "kacan_ort": kacan_ort,
                "p20": p20, "p30": p30, "saglam": saglam, "perf": perf,
                "hist": {"labels": labels, "counts": counts}},
        "param": {"S": S, "sigma": [sf, sm], "p": p, "lam": lam, "episode": episode,
                  "kacan": kacan, "toplam_mac": toplam_mac},
    }

# ----------------------------------------------------------- Vercel handler
class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        oyuncu = (q.get("oyuncu", [""])[0]).strip()
        hedef = (q.get("hedef", [""])[0]).strip()
        try:
            if not API_KEY:
                raise ValueError("Sunucuda API_KEY tanımlı değil (Vercel → Settings → Environment Variables).")
            if not oyuncu or not hedef:
                raise ValueError("Oyuncu ve hedef takım gerekli.")
            out = {"ok": True}; out.update(analyze(oyuncu, hedef))
        except Exception as e:
            out = {"ok": False, "error": str(e)}
        body = json.dumps(out, ensure_ascii=False).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)
