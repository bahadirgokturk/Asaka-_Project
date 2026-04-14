import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "asakai.db")

SCHEMA = """
-- Lokasyonlar: Çiğli, ESBAŞ, Karaman
CREATE TABLE IF NOT EXISTS lokasyon (
    id   INTEGER PRIMARY KEY,
    ad   TEXT NOT NULL UNIQUE  -- 'cigli', 'esbas', 'karaman'
);

-- Üretim günlük kayıtları
CREATE TABLE IF NOT EXISTS uretim (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih               TEXT NOT NULL,
    lokasyon_id         INTEGER NOT NULL REFERENCES lokasyon(id),
    hedef               INTEGER,
    gercek              INTEGER,
    flex_sevk           INTEGER,
    tobacco_sevk        INTEGER,
    gravure_hazir_sevk  INTEGER,
    bakir_kapli_sevk    INTEGER,
    toplam_onaylanan    INTEGER,
    onaya_gecen         INTEGER,
    onayda_olan         INTEGER,
    prova_sonrasi_red   INTEGER,
    sapma_nedeni        TEXT,
    UNIQUE(tarih, lokasyon_id)
);

-- Bozulan silindir kayıtları (üretimden ayrı, detaylı)
CREATE TABLE IF NOT EXISTS bozulan_silindir (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih           TEXT NOT NULL,
    lokasyon_id     INTEGER NOT NULL REFERENCES lokasyon(id),
    adet            INTEGER,
    silindir_no     TEXT,
    hata_tipi       TEXT,   -- 'kabarık','delik','lak kalması','bakır atması','titreme','ek kaplama','çizik','yumuşak','atlama','sertlik hatası',...
    sapma_nedeni    TEXT,
    sorumlu         TEXT
);

-- Kalite günlük kayıtları
CREATE TABLE IF NOT EXISTS kalite (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih           TEXT NOT NULL,
    lokasyon_id     INTEGER NOT NULL REFERENCES lokasyon(id),
    hedef           INTEGER,
    gercek          INTEGER,
    onayda          INTEGER,
    toplam_bozulan  INTEGER,
    -- Hata tipleri (detay kolonlar)
    delik           INTEGER DEFAULT 0,
    krom_atmasi     INTEGER DEFAULT 0,
    radus_catlak    INTEGER DEFAULT 0,
    shoe_izi        INTEGER DEFAULT 0,
    lak_kalmasi     INTEGER DEFAULT 0,
    elmas_asinmasi  INTEGER DEFAULT 0,
    bakir_atmasi    INTEGER DEFAULT 0,
    ek_kaplama      INTEGER DEFAULT 0,
    kabarik         INTEGER DEFAULT 0,
    titreme         INTEGER DEFAULT 0,
    cizik           INTEGER DEFAULT 0,
    yumusak         INTEGER DEFAULT 0,
    atlama          INTEGER DEFAULT 0,
    cfm_izi         INTEGER DEFAULT 0,
    vuruk           INTEGER DEFAULT 0,
    sertlik_hatasi  INTEGER DEFAULT 0,
    diger           INTEGER DEFAULT 0,
    UNIQUE(tarih, lokasyon_id)
);

-- Repro günlük kayıtları
CREATE TABLE IF NOT EXISTS repro (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih                   TEXT NOT NULL,
    flex_hedef_dosya        INTEGER,
    flex_calisir_silindir   INTEGER,
    tobacco_hedef           INTEGER,
    tobacco_gercek          INTEGER,
    uretim_cigli            INTEGER,
    uretim_tobacco          INTEGER,
    uretim_ispak            INTEGER,
    tobacco_gtp             INTEGER,
    flex_gtp                INTEGER,
    numune                  INTEGER,
    onayda                  INTEGER,
    plotter                 INTEGER,
    bilgi_bek               INTEGER,
    bozulan_sayi            INTEGER DEFAULT 0,
    basilmayan_sayi         INTEGER DEFAULT 0,
    UNIQUE(tarih)
);

-- Emboss günlük kayıtları
CREATE TABLE IF NOT EXISTS emboss (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih           TEXT NOT NULL,
    emboss_hedef    INTEGER,
    emboss_gercek   INTEGER,
    cellaxy_hedef   INTEGER,
    cellaxy_gercek  INTEGER,
    sapma_nedeni    TEXT,
    bozulan_aciklama TEXT,
    UNIQUE(tarih)
);

-- Planlama (takvim verisi)
CREATE TABLE IF NOT EXISTS planlama (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih       TEXT NOT NULL,
    lokasyon_id INTEGER NOT NULL REFERENCES lokasyon(id),
    grv_plan    INTEGER,
    bakir_plan  INTEGER,
    sevk_plan   INTEGER,
    UNIQUE(tarih, lokasyon_id)
);

-- Sipariş
CREATE TABLE IF NOT EXISTS siparis (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    tarih           TEXT NOT NULL,
    kategori        TEXT NOT NULL,  -- 'izmir_gravur','ispak_gravur','celik','bakir','tobacco_gravur','tobacco_tipping','tobacco_gtp','emboss','export_celik','export_bakir',...
    hedef           INTEGER,
    gercek          INTEGER,
    UNIQUE(tarih, kategori)
);
"""

LOKASYONLAR = [
    (1, "cigli"),
    (2, "esbas"),
    (3, "karaman"),
]

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    conn.executescript(SCHEMA)
    for lid, lad in LOKASYONLAR:
        conn.execute("INSERT OR IGNORE INTO lokasyon(id, ad) VALUES (?,?)", (lid, lad))
    conn.commit()
    conn.close()
