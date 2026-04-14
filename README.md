# Asakai Hedef Takip Sistemi

## Kurulum (Tek seferlik)

```bash
# 1. Python sanal ortam oluştur
python -m venv venv

# 2. Aktive et
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 3. Bağımlılıkları yükle
pip install -r requirements.txt
```

## Çalıştırma

```bash
# Sanal ortamı aktive et (her seferinde)
venv\Scripts\activate

# Sunucuyu başlat
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Tarayıcıda aç: **http://localhost:8000**

## Klasör Yapısı

```
asakai/
├── backend/
│   ├── main.py          ← FastAPI uygulaması (tüm API)
│   ├── database.py      ← SQLite veritabanı ve tablolar
│   └── asakai.db        ← Otomatik oluşturulur
├── frontend/
│   ├── index.html       ← Dashboard
│   ├── uretim.html      ← Üretim girişi (Çiğli/ESBAŞ/Karaman)
│   ├── bozulan.html     ← Bozulan silindir takibi
│   ├── planlama.html    ← Takvim görünümlü planlama
│   ├── kalite.html      ← Kalite takibi
│   ├── haftalik.html    ← Haftalık rapor
│   ├── css/style.css    ← Tüm stiller
│   └── js/app.js        ← Ortak fonksiyonlar
└── requirements.txt
```

## Modüller

| Sayfa | Açıklama |
|-------|----------|
| Dashboard | Günlük özet, tüm lokasyonlar |
| Üretim | Hedef/gerçek giriş, Çiğli/ESBAŞ/Karaman sekmeli |
| Bozulan Silindir | Hata tipi filtreli, etkilenen silindir kaydı |
| Planlama | Takvim görünümü, günlük plan/gerçek |
| Kalite | Sevk adet, hata tiplerine göre bozulan |
| Haftalık Rapor | Bar grafik, 7 günlük özet |

## API Endpointleri

- GET/POST `/api/uretim`
- GET/POST `/api/bozulan`
- GET/POST `/api/kalite`
- GET/POST `/api/emboss`
- GET/POST `/api/repro`
- GET/POST `/api/planlama`
- GET `/api/dashboard`
- GET `/api/dashboard/haftalik`
- GET `/api/lokasyonlar`
