from fastapi import APIRouter, Query
from database import get_db
from datetime import date, timedelta

router = APIRouter()
LOKASYON_MAP = {"cigli": 1, "esbas": 2, "karaman": 3}

@router.get("/gunluk")
def gunluk_ozet(tarih: str = None, lokasyon: str = Query("cigli")):
    if not tarih:
        tarih = str(date.today())
    lok_id = LOKASYON_MAP.get(lokasyon, 1)
    conn = get_db()

    uretim = conn.execute(
        "SELECT * FROM uretim WHERE tarih=? AND lokasyon_id=?", [tarih, lok_id]
    ).fetchone()

    bozulan = conn.execute(
        "SELECT COUNT(*) as kayit, SUM(adet) as toplam FROM bozulan_silindir WHERE tarih=? AND lokasyon_id=?",
        [tarih, lok_id]
    ).fetchone()

    kalite = conn.execute(
        "SELECT * FROM kalite WHERE tarih=? AND lokasyon_id=?", [tarih, lok_id]
    ).fetchone()

    repro = conn.execute("SELECT * FROM repro WHERE tarih=?", [tarih]).fetchone()
    emboss = conn.execute("SELECT * FROM emboss WHERE tarih=?", [tarih]).fetchone()

    conn.close()
    return {
        "tarih": tarih,
        "lokasyon": lokasyon,
        "uretim": dict(uretim) if uretim else None,
        "bozulan": dict(bozulan) if bozulan else None,
        "kalite": dict(kalite) if kalite else None,
        "repro": dict(repro) if repro else None,
        "emboss": dict(emboss) if emboss else None,
    }

@router.get("/haftalik")
def haftalik_ozet(lokasyon: str = Query("cigli")):
    lok_id = LOKASYON_MAP.get(lokasyon, 1)
    bugun = date.today()
    hafta_basi = bugun - timedelta(days=bugun.weekday())
    hafta_sonu = hafta_basi + timedelta(days=6)
    conn = get_db()

    uretim = conn.execute("""
        SELECT SUM(hedef) as hedef, SUM(gercek) as gercek,
               COUNT(*) as gun_sayisi
        FROM uretim
        WHERE lokasyon_id=? AND tarih BETWEEN ? AND ?
    """, [lok_id, str(hafta_basi), str(hafta_sonu)]).fetchone()

    bozulan = conn.execute("""
        SELECT SUM(adet) as toplam, hata_tipi, COUNT(*) as kayit
        FROM bozulan_silindir
        WHERE lokasyon_id=? AND tarih BETWEEN ? AND ?
        GROUP BY hata_tipi ORDER BY toplam DESC
    """, [lok_id, str(hafta_basi), str(hafta_sonu)]).fetchall()

    kalite = conn.execute("""
        SELECT SUM(gercek) as gercek, SUM(toplam_bozulan) as bozulan
        FROM kalite WHERE lokasyon_id=? AND tarih BETWEEN ? AND ?
    """, [lok_id, str(hafta_basi), str(hafta_sonu)]).fetchone()

    conn.close()
    u = dict(uretim) if uretim else {}
    ger = u.get("gercek") or 0
    hed = u.get("hedef") or 0
    return {
        "hafta": f"{hafta_basi} / {hafta_sonu}",
        "lokasyon": lokasyon,
        "uretim": {**u, "gerceklesme_orani": round(ger/hed*100, 1) if hed else None},
        "bozulan_hata_dagilim": [dict(r) for r in bozulan],
        "kalite": dict(kalite) if kalite else None,
    }
