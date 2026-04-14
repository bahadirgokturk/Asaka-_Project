"""
Kullanıcılar tablosunu mevcut database.py'ye eklemek için çalıştır:
python migrate_users.py
"""
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), "asakai.db")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
c = conn.cursor()

c.execute("""
CREATE TABLE IF NOT EXISTS kullanicilar (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    ad_soyad        TEXT NOT NULL,
    kullanici_adi   TEXT NOT NULL UNIQUE,
    sifre           TEXT NOT NULL,
    rol             TEXT NOT NULL DEFAULT 'sorumlu',  -- 'admin' veya 'sorumlu'
    lokasyon        TEXT DEFAULT 'cigli',
    aktif           INTEGER DEFAULT 1,
    olusturma_tarihi TEXT DEFAULT (datetime('now','localtime'))
)
""")

# Varsayılan admin kullanıcısı
c.execute("""
INSERT OR IGNORE INTO kullanicilar (ad_soyad, kullanici_adi, sifre, rol, lokasyon)
VALUES 
    ('Sistem Admin', 'admin', 'admin123', 'admin', 'cigli'),
    ('Çiğli Sorumlu', 'cigli', 'cigli123', 'sorumlu', 'cigli'),
    ('ESBAŞ Sorumlu', 'esbas', 'esbas123', 'sorumlu', 'esbas'),
    ('Karaman Sorumlu', 'karaman', 'karaman123', 'sorumlu', 'karaman')
""")

conn.commit()
conn.close()
print("✓ kullanicilar tablosu oluşturuldu ve varsayılan kullanıcılar eklendi")
print("  Admin: admin / admin123")
print("  Çiğli: cigli / cigli123")
print("  ESBAŞ: esbas / esbas123")
print("  Karaman: karaman / karaman123")