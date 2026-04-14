from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional
from database import get_db

router = APIRouter()
LOKASYON_MAP = {"cigli": 1, "esbas": 2, "karaman": 3}

class PlanlamaGiris(BaseModel):
    tarih: str
    lokasyon: str = "cigli"
    grv_plan: Optional[int] = None
    bakir_plan: Optional[int] = None
    sevk_plan: Optional[int] = None

@router.get("/takvim")
def takvim(yil: int, ay: int, lokasyon: str = Query("cigli")):
    lok_id = LOKASYON_MAP.get(lokasyon, 1)
    conn = get_db()
    rows = conn.execute("""
        SELECT p.tarih, p.grv_plan, p.bakir_plan, p.sevk_plan,
               u.gercek, u.hedef
        FROM planlama p
        LEFT JOIN uretim u ON p.tarih = u.tarih AND u.lokasyon_id = p.lokasyon_id
        WHERE p.lokasyon_id = ?
          AND strftime('%Y', p.tarih) = ?
          AND strftime('%m', p.tarih) = ?
        ORDER BY p.tarih
    """, [lok_id, str(yil), f"{ay:02d}"]).fetchall()
    conn.close()
    return {"yil": yil, "ay": ay, "lokasyon": lokasyon, "gunler": [dict(r) for r in rows]}

@router.post("/kaydet")
def planlama_kaydet(giris: PlanlamaGiris):
    lok_id = LOKASYON_MAP.get(giris.lokasyon, 1)
    conn = get_db()
    conn.execute("""
        INSERT INTO planlama (tarih, lokasyon_id, grv_plan, bakir_plan, sevk_plan)
        VALUES (?,?,?,?,?)
        ON CONFLICT(tarih, lokasyon_id) DO UPDATE SET
            grv_plan=excluded.grv_plan,
            bakir_plan=excluded.bakir_plan,
            sevk_plan=excluded.sevk_plan
    """, (giris.tarih, lok_id, giris.grv_plan, giris.bakir_plan, giris.sevk_plan))
    conn.commit()
    conn.close()
    return {"ok": True}
