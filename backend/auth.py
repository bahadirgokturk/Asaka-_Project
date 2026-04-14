"""
Kullanıcı sistemi — login, kullanıcı listesi
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_db

router = APIRouter()

class LoginReq(BaseModel):
    kullanici_adi: str
    sifre: str

@router.post("/login")
def login(req: LoginReq):
    db = get_db()
    user = db.execute(
        "SELECT * FROM kullanicilar WHERE kullanici_adi=? AND sifre=? AND aktif=1",
        (req.kullanici_adi, req.sifre)
    ).fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Kullanıcı adı veya şifre hatalı")
    return {
        "id": user["id"],
        "ad_soyad": user["ad_soyad"],
        "kullanici_adi": user["kullanici_adi"],
        "rol": user["rol"],
        "lokasyon": user["lokasyon"],
    }

@router.get("/kullanicilar")
def kullanici_listesi():
    db = get_db()
    rows = db.execute(
        "SELECT id, ad_soyad, kullanici_adi, rol, lokasyon FROM kullanicilar WHERE aktif=1"
    ).fetchall()
    return [dict(r) for r in rows]

@router.post("/kullanici-ekle")
def kullanici_ekle(data: dict):
    db = get_db()
    db.execute(
        "INSERT INTO kullanicilar (ad_soyad, kullanici_adi, sifre, rol, lokasyon) VALUES (?,?,?,?,?)",
        (data["ad_soyad"], data["kullanici_adi"], data["sifre"], data["rol"], data.get("lokasyon","cigli"))
    )
    db.commit()
    return {"ok": True}