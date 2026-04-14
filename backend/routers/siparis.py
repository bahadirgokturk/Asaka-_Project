from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()

class SiparisGiris(BaseModel):
    tarih: str
    kategori: str
    hedef: Optional[int] = None
    gercek: Optional[int] = None

@router.get("/liste")
def siparis_liste(baslangic: Optional[str] = None, bitis: Optional[str] = None, kategori: Optional[str] = None):
    conn = get_db()
    sorgu = "SELECT * FROM siparis WHERE 1=1"
    params = []
    if baslangic:
        sorgu += " AND tarih >= ?"; params.append(baslangic)
    if bitis:
        sorgu += " AND tarih <= ?"; params.append(bitis)
    if kategori:
        sorgu += " AND kategori = ?"; params.append(kategori)
    sorgu += " ORDER BY tarih DESC"
    rows = conn.execute(sorgu, params).fetchall()
    conn.close()
    return {"data": [dict(r) for r in rows]}

@router.post("/kaydet")
def siparis_kaydet(giris: SiparisGiris):
    conn = get_db()
    conn.execute("""
        INSERT INTO siparis (tarih, kategori, hedef, gercek)
        VALUES (?,?,?,?)
        ON CONFLICT(tarih, kategori) DO UPDATE SET
            hedef=excluded.hedef, gercek=excluded.gercek
    """, (giris.tarih, giris.kategori, giris.hedef, giris.gercek))
    conn.commit()
    conn.close()
    return {"ok": True}

@router.get("/kategoriler")
def kategoriler():
    return {"kategoriler": [
        "izmir_gravur", "ispak_gravur", "celik", "bakir",
        "tobacco_gravur", "tobacco_tipping", "tobacco_gtp",
        "tobacco_celik", "tobacco_sleeve", "tobacco_dekrom",
        "barrel", "emboss", "export_celik", "export_bakir",
        "export_gravurlu", "dekrom"
    ]}
