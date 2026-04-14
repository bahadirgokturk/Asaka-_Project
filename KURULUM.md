# Asakai Hedef Takip — Kurulum Kılavuzu

## Klasör Yapısı
```
asakai/
├── backend/
│   ├── main.py              ← FastAPI uygulaması
│   ├── database.py          ← SQLite şema ve bağlantı
│   ├── import_excel.py      ← Mevcut Excel verilerini içe aktar
│   ├── requirements.txt     ← Python kütüphaneleri
│   └── routers/
│       ├── uretim.py        ← Çiğli / ESBAŞ / Karaman üretim
│       ├── kalite.py        ← Kalite & hata tipleri
│       ├── repro.py         ← Repro üretim
│       ├── emboss.py        ← Emboss & Cellaxy
│       ├── siparis.py       ← Sipariş takip
│       ├── planlama.py      ← Takvim planlama
│       └── ozet.py          ← Dashboard özet
└── frontend/
    ├── package.json
    └── src/
        ├── App.js / App.css
        └── pages/
            ├── Dashboard.js
            ├── UretimPage.js
            ├── KalitePage.js
            ├── PlanlamaPage.js
            └── OtherPages.js  ← Repro, Emboss, Sipariş

## 1. BACKEND KURULUM

### Gereksinimler
- Python 3.10+

### Adımlar
```bash
cd asakai/backend

# Sanal ortam (önerilen)
python -m venv venv
venv\Scripts\activate          # Windows
# veya: source venv/bin/activate  # Mac/Linux

# Kütüphaneleri yükle
pip install -r requirements.txt

# Sunucuyu başlat
uvicorn main:app --reload --port 8000
```

Tarayıcıda aç: http://localhost:8000/api/health → {"status":"ok"} görürsen çalışıyor.
API dökümantasyonu: http://localhost:8000/docs

## 2. MEVCUT EXCELİ AKTAR (opsiyonel)

```bash
# Excel dosyasını backend klasörüne kopyala, sonra:
python import_excel.py Copy_ASAKAI_HEDEF_TAKİP.xlsx
```

## 3. FRONTEND KURULUM

### Gereksinimler
- Node.js 18+ (https://nodejs.org)

### Adımlar
```bash
cd asakai/frontend

# Paketleri yükle (ilk seferde 2-3 dk sürer)
npm install

# Geliştirme sunucusunu başlat
npm start
```

Tarayıcı otomatik açılır: http://localhost:3000

## 4. GÜNLÜK KULLANIM

Backend ve frontend'i aynı anda çalıştırman gerekiyor:
- Terminal 1: `cd backend && uvicorn main:app --reload --port 8000`
- Terminal 2: `cd frontend && npm start`

## 5. LOKASYON SEÇME

Sol menüdeki Çiğli / ESBAŞ / Karaman butonlarıyla lokasyon değiştirilir.
Tüm veriler lokasyon bazlı ayrı tutulur.

## 6. ESBAŞ VERİSİ AKTARIMI

ESBAŞ Excel'i gelince:
```bash
python import_excel.py ESBAS_DOSYASI.xlsx --lokasyon esbas
```

## API ENDPOINTLERİ

| Endpoint | Açıklama |
|---|---|
| GET /api/uretim/liste?lokasyon=cigli | Üretim listesi |
| POST /api/uretim/kaydet | Üretim kaydı ekle |
| GET /api/uretim/bozulan?lokasyon=cigli | Bozulan silindir listesi |
| POST /api/uretim/bozulan/kaydet | Bozulan silindir ekle |
| GET /api/kalite/liste | Kalite listesi |
| GET /api/kalite/haftalik-hata-ozet | Haftalık hata dağılımı |
| GET /api/ozet/gunluk?tarih=2025-11-01 | Günlük özet |
| GET /api/ozet/haftalik | Haftalık özet |
| GET /api/planlama/takvim?yil=2025&ay=11 | Takvim görünümü |
| GET /api/repro/liste | Repro listesi |
| GET /api/emboss/liste | Emboss listesi |
| GET /api/siparis/liste | Sipariş listesi |
