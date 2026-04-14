# Asakai Hedef Takip Sistemi

Saueressig Türkiye — OPEX Departmanı için geliştirilmiş günlük üretim hedef takip sistemi.

---

## Kurulum

### Gereksinimler
- Python 3.10+
- Node.js 18+
- pip

---

### 1. Repoyu İndir

```bash
git clone https://github.com/bahadirgokturk/Asaka-_Project.git
cd Asaka-_Project
```

---

### 2. Backend Kurulumu

```bash
cd backend
pip install -r requirements.txt
python migrate_users.py
```

---

### 3. Frontend Kurulumu

```bash
cd ../frontend
npm install
```

---

### 4. Çalıştırma

İki ayrı terminal aç:

**Terminal 1 — Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start
```

Tarayıcıda `http://localhost:3000` adresini aç.

---

## Giriş Bilgileri

| Kullanıcı | Şifre | Rol |
|-----------|-------|-----|
| `admin` | `admin123` | Admin — her şeyi görür |
| `cigli` | `cigli123` | Sorumlu — sadece Çiğli |
| `esbas` | `esbas123` | Sorumlu — sadece ESBAŞ |
| `karaman` | `karaman123` | Sorumlu — sadece Karaman |

---

## Özellikler

- **Dashboard** — günlük ve haftalık özet
- **Planlama** — aylık takvim, GRV/Bakır/Sevk plan girişi
- **Üretim** — günlük hedef/gerçek takibi, bozulan silindir kaydı
- **Kalite** — sevk ve hata tipi takibi
- **Repro** — silindir üretim takibi
- **Emboss** — Emboss & Cellaxy takibi
- **Sipariş** — kategori bazlı sipariş takibi
- **Kullanıcı Yönetimi** — admin paneli, rol tabanlı erişim

---

## Notlar

- Sistem tamamen lokaldir, internet bağlantısı gerekmez
- Veriler `backend/asakai.db` SQLite dosyasında saklanır
- Yeni kullanıcı eklemek için admin panelini kullan
