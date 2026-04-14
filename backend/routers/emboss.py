from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()

class EmbossGiris(BaseModel):
    tarih: str
    emboss_hedef: Optional[int] = None
    emboss_gercek: Optional[int] = None
    cellaxy_hedef: Optional[int] = None
    cellaxy_gercek: Optional[int] = None
    sapma_nedeni: Optional[str] = None
    bozulan_aciklama: Optional[str] = None

@router.get("/liste")
def emboss_liste(baslangic: Optional[str] = None, bitis: Optional[str] = None):
    conn = get_db()
    sorgu = "SELECT * FROM emboss WHERE 1=1"
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
def emboss_kaydet(giris: EmbossGiris):
    conn = get_db()
    conn.execute("""
        INSERT INTO emboss (
            tarih, emboss_hedef, emboss_gercek,
            cellaxy_hedef, cellaxy_gercek,
            sapma_nedeni, bozulan_aciklama
        ) VALUES (?,?,?,?,?,?,?)
        ON CONFLICT(tarih) DO UPDATE SET
            emboss_hedef=excluded.emboss_hedef,
            emboss_gercek=excluded.emboss_gercek,
            cellaxy_hedef=excluded.cellaxy_hedef,
            cellaxy_gercek=excluded.cellaxy_gercek,
            sapma_nedeni=excluded.sapma_nedeni,
            bozulan_aciklama=excluded.bozulan_aciklama
    """, (
        giris.tarih, giris.emboss_hedef, giris.emboss_gercek,
        giris.cellaxy_hedef, giris.cellaxy_gercek,
        giris.sapma_nedeni, giris.bozulan_aciklama
    ))
    conn.commit()
    conn.close()
    return {"ok": True}
