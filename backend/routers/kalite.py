from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()

LOKASYON_MAP = {"cigli": 1, "esbas": 2, "karaman": 3}

class KaliteGiris(BaseModel):
    tarih: str
    lokasyon: str = "cigli"
    hedef: Optional[int] = None
    gercek: Optional[int] = None
    onayda: Optional[int] = None
    toplam_bozulan: Optional[int] = None
    delik: int = 0
    krom_atmasi: int = 0
    radus_catlak: int = 0
    shoe_izi: int = 0
    lak_kalmasi: int = 0
    elmas_asinmasi: int = 0
    bakir_atmasi: int = 0
    ek_kaplama: int = 0
    kabarik: int = 0
    titreme: int = 0
    cizik: int = 0
    yumusak: int = 0
    atlama: int = 0
    cfm_izi: int = 0
    vuruk: int = 0
    sertlik_hatasi: int = 0
    diger: int = 0

@router.get("/liste")
def kalite_liste(
    lokasyon: str = Query("cigli"),
    baslangic: Optional[str] = None,
    bitis: Optional[str] = None
):
    lok_id = LOKASYON_MAP.get(lokasyon, 1)
    conn = get_db()
    sorgu = "SELECT * FROM kalite WHERE lokasyon_id = ?"
    params = [lok_id]
    if baslangic:
        sorgu += " AND tarih >= ?"; params.append(baslangic)
    if bitis:
        sorgu += " AND tarih <= ?"; params.append(bitis)
    sorgu += " ORDER BY tarih DESC"
    rows = conn.execute(sorgu, params).fetchall()
    conn.close()
    return {"data": [dict(r) for r in rows]}

@router.post("/kaydet")
def kalite_kaydet(giris: KaliteGiris):
    lok_id = LOKASYON_MAP.get(giris.lokasyon, 1)
    conn = get_db()
    conn.execute("""
        INSERT INTO kalite (
            tarih, lokasyon_id, hedef, gercek, onayda, toplam_bozulan,
            delik, krom_atmasi, radus_catlak, shoe_izi, lak_kalmasi,
            elmas_asinmasi, bakir_atmasi, ek_kaplama, kabarik, titreme,
            cizik, yumusak, atlama, cfm_izi, vuruk, sertlik_hatasi, diger
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(tarih, lokasyon_id) DO UPDATE SET
            hedef=excluded.hedef, gercek=excluded.gercek,
            onayda=excluded.onayda, toplam_bozulan=excluded.toplam_bozulan,
            delik=excluded.delik, krom_atmasi=excluded.krom_atmasi,
            radus_catlak=excluded.radus_catlak, lak_kalmasi=excluded.lak_kalmasi,
            bakir_atmasi=excluded.bakir_atmasi, kabarik=excluded.kabarik,
            titreme=excluded.titreme, diger=excluded.diger
    """, (
        giris.tarih, lok_id, giris.hedef, giris.gercek, giris.onayda,
        giris.toplam_bozulan, giris.delik, giris.krom_atmasi, giris.radus_catlak,
        giris.shoe_izi, giris.lak_kalmasi, giris.elmas_asinmasi, giris.bakir_atmasi,
        giris.ek_kaplama, giris.kabarik, giris.titreme, giris.cizik, giris.yumusak,
        giris.atlama, giris.cfm_izi, giris.vuruk, giris.sertlik_hatasi, giris.diger
    ))
    conn.commit()
    conn.close()
    return {"ok": True}

@router.get("/haftalik-hata-ozet")
def haftalik_hata_ozet(lokasyon: str = Query("cigli")):
    lok_id = LOKASYON_MAP.get(lokasyon, 1)
    conn = get_db()
    rows = conn.execute("""
        SELECT
            strftime('%Y-H%W', tarih) as hafta,
            SUM(delik) as delik, SUM(krom_atmasi) as krom_atmasi,
            SUM(lak_kalmasi) as lak_kalmasi, SUM(bakir_atmasi) as bakir_atmasi,
            SUM(kabarik) as kabarik, SUM(titreme) as titreme,
            SUM(ek_kaplama) as ek_kaplama, SUM(diger) as diger,
            SUM(toplam_bozulan) as toplam
        FROM kalite WHERE lokasyon_id = ?
        GROUP BY hafta ORDER BY hafta DESC LIMIT 12
    """, [lok_id]).fetchall()
    conn.close()
    return {"data": [dict(r) for r in rows]}
