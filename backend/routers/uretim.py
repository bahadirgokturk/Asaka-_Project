from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from database import get_db
from datetime import date, timedelta

router = APIRouter()

LOKASYON_MAP = {"cigli": 1, "esbas": 2, "karaman": 3}

class UretimGiris(BaseModel):
    tarih: str
    lokasyon: str  # 'cigli' | 'esbas' | 'karaman'
    hedef: Optional[int] = None
    gercek: Optional[int] = None
    flex_sevk: Optional[int] = None
    tobacco_sevk: Optional[int] = None
    gravure_hazir_sevk: Optional[int] = None
    bakir_kapli_sevk: Optional[int] = None
    toplam_onaylanan: Optional[int] = None
    onaya_gecen: Optional[int] = None
    onayda_olan: Optional[int] = None
    prova_sonrasi_red: Optional[int] = None
    sapma_nedeni: Optional[str] = None

class BozulanGiris(BaseModel):
    tarih: str
    lokasyon: str
    adet: Optional[int] = None
    silindir_no: Optional[str] = None
    hata_tipi: Optional[str] = None
    sapma_nedeni: Optional[str] = None
    sorumlu: Optional[str] = None

@router.get("/liste")
def uretim_liste(
    lokasyon: str = Query("cigli"),
    baslangic: Optional[str] = None,
    bitis: Optional[str] = None,
    haftalik: bool = False
):
    lok_id = LOKASYON_MAP.get(lokasyon)
    if not lok_id:
        raise HTTPException(400, "Geçersiz lokasyon. cigli | esbas | karaman")

    conn = get_db()
    sorgu = """
        SELECT u.*, b.adet as bozulan_adet, b.hata_tipi, b.sapma_nedeni as bozulan_neden
        FROM uretim u
        LEFT JOIN bozulan_silindir b ON u.tarih = b.tarih AND u.lokasyon_id = b.lokasyon_id
        WHERE u.lokasyon_id = ?
    """
    params = [lok_id]

    if baslangic:
        sorgu += " AND u.tarih >= ?"
        params.append(baslangic)
    if bitis:
        sorgu += " AND u.tarih <= ?"
        params.append(bitis)

    sorgu += " ORDER BY u.tarih DESC"
    rows = conn.execute(sorgu, params).fetchall()
    conn.close()

    data = [dict(r) for r in rows]

    if haftalik:
        data = _haftalik_ozet(data)

    return {"lokasyon": lokasyon, "data": data, "toplam": len(data)}

def _haftalik_ozet(data: list) -> list:
    from collections import defaultdict
    haftalar = defaultdict(lambda: {
        "gun_sayisi": 0, "hedef_toplam": 0, "gercek_toplam": 0,
        "bozulan_toplam": 0, "prova_red_toplam": 0
    })
    for row in data:
        t = date.fromisoformat(row["tarih"])
        hafta_no = t.isocalendar()[1]
        yil = t.isocalendar()[0]
        key = f"{yil}-H{hafta_no:02d}"
        h = haftalar[key]
        h["hafta"] = key
        h["gun_sayisi"] += 1
        h["hedef_toplam"] += row.get("hedef") or 0
        h["gercek_toplam"] += row.get("gercek") or 0
        h["bozulan_toplam"] += row.get("bozulan_adet") or 0
        h["prova_red_toplam"] += row.get("prova_sonrasi_red") or 0
    for h in haftalar.values():
        t = h["hedef_toplam"]
        g = h["gercek_toplam"]
        h["gerceklesmesi"] = round(g / t * 100, 1) if t else None
    return sorted(haftalar.values(), key=lambda x: x["hafta"], reverse=True)

@router.post("/kaydet")
def uretim_kaydet(giris: UretimGiris):
    lok_id = LOKASYON_MAP.get(giris.lokasyon)
    if not lok_id:
        raise HTTPException(400, "Geçersiz lokasyon")
    conn = get_db()
    conn.execute("""
        INSERT INTO uretim (
            tarih, lokasyon_id, hedef, gercek,
            flex_sevk, tobacco_sevk, gravure_hazir_sevk, bakir_kapli_sevk,
            toplam_onaylanan, onaya_gecen, onayda_olan,
            prova_sonrasi_red, sapma_nedeni
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(tarih, lokasyon_id) DO UPDATE SET
            hedef=excluded.hedef, gercek=excluded.gercek,
            flex_sevk=excluded.flex_sevk, tobacco_sevk=excluded.tobacco_sevk,
            gravure_hazir_sevk=excluded.gravure_hazir_sevk,
            bakir_kapli_sevk=excluded.bakir_kapli_sevk,
            toplam_onaylanan=excluded.toplam_onaylanan,
            onaya_gecen=excluded.onaya_gecen,
            onayda_olan=excluded.onayda_olan,
            prova_sonrasi_red=excluded.prova_sonrasi_red,
            sapma_nedeni=excluded.sapma_nedeni
    """, (
        giris.tarih, lok_id, giris.hedef, giris.gercek,
        giris.flex_sevk, giris.tobacco_sevk, giris.gravure_hazir_sevk,
        giris.bakir_kapli_sevk, giris.toplam_onaylanan, giris.onaya_gecen,
        giris.onayda_olan, giris.prova_sonrasi_red, giris.sapma_nedeni
    ))
    conn.commit()
    conn.close()
    return {"ok": True}

@router.get("/bozulan")
def bozulan_liste(
    lokasyon: str = Query("cigli"),
    baslangic: Optional[str] = None,
    bitis: Optional[str] = None,
    hata_tipi: Optional[str] = None
):
    lok_id = LOKASYON_MAP.get(lokasyon)
    if not lok_id:
        raise HTTPException(400, "Geçersiz lokasyon")
    conn = get_db()
    sorgu = "SELECT * FROM bozulan_silindir WHERE lokasyon_id = ?"
    params = [lok_id]
    if baslangic:
        sorgu += " AND tarih >= ?"
        params.append(baslangic)
    if bitis:
        sorgu += " AND tarih <= ?"
        params.append(bitis)
    if hata_tipi:
        sorgu += " AND hata_tipi = ?"
        params.append(hata_tipi)
    sorgu += " ORDER BY tarih DESC"
    rows = conn.execute(sorgu, params).fetchall()
    conn.close()
    return {"data": [dict(r) for r in rows]}

@router.post("/bozulan/kaydet")
def bozulan_kaydet(giris: BozulanGiris):
    lok_id = LOKASYON_MAP.get(giris.lokasyon)
    if not lok_id:
        raise HTTPException(400, "Geçersiz lokasyon")
    conn = get_db()
    conn.execute("""
        INSERT INTO bozulan_silindir
            (tarih, lokasyon_id, adet, silindir_no, hata_tipi, sapma_nedeni, sorumlu)
        VALUES (?,?,?,?,?,?,?)
    """, (giris.tarih, lok_id, giris.adet, giris.silindir_no,
          giris.hata_tipi, giris.sapma_nedeni, giris.sorumlu))
    conn.commit()
    conn.close()
    return {"ok": True}

@router.get("/hata-tipleri")
def hata_tipleri():
    return {"tipler": [
        "kabarık", "delik", "lak kalması", "bakır atması", "titreme",
        "ek kaplama", "çizik", "yumuşak", "atlama", "sertlik hatası",
        "cfm izi", "vuruk", "el kırılması", "grvr mak.hatası", "ovallik",
        "çatlak", "torna izi", "krom op.hatası", "shoe izi", "diğer"
    ]}
