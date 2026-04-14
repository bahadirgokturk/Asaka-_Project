from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()

class ReproGiris(BaseModel):
    tarih: str
    flex_hedef_dosya: Optional[int] = None
    flex_calisir_silindir: Optional[int] = None
    tobacco_hedef: Optional[int] = None
    tobacco_gercek: Optional[int] = None
    uretim_cigli: Optional[int] = None
    uretim_tobacco: Optional[int] = None
    uretim_ispak: Optional[int] = None
    tobacco_gtp: Optional[int] = None
    flex_gtp: Optional[int] = None
    numune: Optional[int] = None
    onayda: Optional[int] = None
    plotter: Optional[int] = None
    bilgi_bek: Optional[int] = None
    bozulan_sayi: int = 0
    basilmayan_sayi: int = 0

@router.get("/liste")
def repro_liste(baslangic: Optional[str] = None, bitis: Optional[str] = None):
    conn = get_db()
    sorgu = "SELECT * FROM repro WHERE 1=1"
    params = []
    if baslangic:
        sorgu += " AND tarih >= ?"; params.append(baslangic)
    if bitis:
        sorgu += " AND tarih <= ?"; params.append(bitis)
    sorgu += " ORDER BY tarih DESC"
    rows = conn.execute(sorgu, params).fetchall()
    conn.close()
    return {"data": [dict(r) for r in rows]}

@router.post("/kaydet")
def repro_kaydet(giris: ReproGiris):
    conn = get_db()
    conn.execute("""
        INSERT INTO repro (
            tarih, flex_hedef_dosya, flex_calisir_silindir,
            tobacco_hedef, tobacco_gercek,
            uretim_cigli, uretim_tobacco, uretim_ispak,
            tobacco_gtp, flex_gtp, numune, onayda,
            plotter, bilgi_bek, bozulan_sayi, basilmayan_sayi
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(tarih) DO UPDATE SET
            flex_hedef_dosya=excluded.flex_hedef_dosya,
            flex_calisir_silindir=excluded.flex_calisir_silindir,
            tobacco_hedef=excluded.tobacco_hedef,
            tobacco_gercek=excluded.tobacco_gercek,
            uretim_cigli=excluded.uretim_cigli,
            uretim_tobacco=excluded.uretim_tobacco,
            uretim_ispak=excluded.uretim_ispak,
            tobacco_gtp=excluded.tobacco_gtp,
            flex_gtp=excluded.flex_gtp,
            numune=excluded.numune, onayda=excluded.onayda,
            plotter=excluded.plotter, bilgi_bek=excluded.bilgi_bek,
            bozulan_sayi=excluded.bozulan_sayi,
            basilmayan_sayi=excluded.basilmayan_sayi
    """, (
        giris.tarih, giris.flex_hedef_dosya, giris.flex_calisir_silindir,
        giris.tobacco_hedef, giris.tobacco_gercek,
        giris.uretim_cigli, giris.uretim_tobacco, giris.uretim_ispak,
        giris.tobacco_gtp, giris.flex_gtp, giris.numune, giris.onayda,
        giris.plotter, giris.bilgi_bek, giris.bozulan_sayi, giris.basilmayan_sayi
    ))
    conn.commit()
    conn.close()
    return {"ok": True}
