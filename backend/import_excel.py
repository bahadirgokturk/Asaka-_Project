"""
Excel'deki mevcut verileri SQLite'a aktarır.
Kullanım: python import_excel.py dosya.xlsx
"""
import sys
import pandas as pd
from database import get_db, init_db
from datetime import datetime

def temiz_int(val):
    try:
        if pd.isna(val): return None
        return int(val)
    except:
        return None

def temiz_str(val):
    if pd.isna(val): return None
    s = str(val).strip()
    return s if s else None

def import_uretim_cigli(xl):
    """ÜRETİM sayfası → uretim tablosu (lokasyon: Çiğli=1)"""
    df = pd.read_excel(xl, sheet_name="ÜRETİM", header=None)
    conn = get_db()
    kayit = 0
    for _, row in df.iterrows():
        try:
            tarih_val = row.iloc[0]
            if pd.isna(tarih_val): continue
            if isinstance(tarih_val, str):
                tarih = tarih_val[:10]
            else:
                tarih = pd.to_datetime(tarih_val).strftime("%Y-%m-%d")
            hedef       = temiz_int(row.iloc[1])
            gercek_raw  = row.iloc[2]
            # "39-10 onay" gibi değerleri temizle
            gercek = None
            try:
                gercek = int(str(gercek_raw).split("-")[0].split(" ")[0])
            except: pass
            onaya_gecen       = temiz_int(row.iloc[3])
            toplam_onaylanan  = temiz_int(row.iloc[4])
            prova_red         = temiz_int(row.iloc[5])
            sapma             = temiz_str(row.iloc[6])
            bozulan_adet      = temiz_int(row.iloc[9])
            bozulan_neden     = temiz_str(row.iloc[10])

            conn.execute("""
                INSERT INTO uretim (tarih, lokasyon_id, hedef, gercek,
                    onaya_gecen, toplam_onaylanan, prova_sonrasi_red, sapma_nedeni)
                VALUES (?,1,?,?,?,?,?,?)
                ON CONFLICT(tarih, lokasyon_id) DO UPDATE SET
                    hedef=excluded.hedef, gercek=excluded.gercek,
                    onaya_gecen=excluded.onaya_gecen,
                    toplam_onaylanan=excluded.toplam_onaylanan,
                    prova_sonrasi_red=excluded.prova_sonrasi_red,
                    sapma_nedeni=excluded.sapma_nedeni
            """, (tarih, hedef, gercek, onaya_gecen, toplam_onaylanan, prova_red, sapma))

            if bozulan_adet:
                conn.execute("""
                    INSERT INTO bozulan_silindir (tarih, lokasyon_id, adet, sapma_nedeni)
                    VALUES (?,1,?,?)
                """, (tarih, bozulan_adet, bozulan_neden))
            kayit += 1
        except Exception as e:
            continue
    conn.commit()
    conn.close()
    print(f"ÜRETİM: {kayit} kayıt aktarıldı.")

def import_uretim_izmir(xl):
    """ÜRETİM İZMİR sayfası → uretim tablosu (detaylı sevk sütunları)"""
    df = pd.read_excel(xl, sheet_name="ÜRETİM İZMİR.", header=None)
    conn = get_db()
    kayit = 0
    for _, row in df.iterrows():
        try:
            tarih_val = row.iloc[0]
            if pd.isna(tarih_val): continue
            tarih = pd.to_datetime(tarih_val).strftime("%Y-%m-%d")
            hedef  = temiz_int(row.iloc[1])
            gercek = temiz_int(row.iloc[2])
            flex_sevk         = temiz_int(row.iloc[3])
            tobacco_sevk      = temiz_int(row.iloc[4])
            gravure_sevk      = temiz_int(row.iloc[5])
            bakir_sevk        = temiz_int(row.iloc[6])
            toplam_onaylanan  = temiz_int(row.iloc[7])
            onaya_gecen       = temiz_int(row.iloc[8])
            onayda_olan       = temiz_int(row.iloc[9])
            prova_red         = temiz_int(row.iloc[10])
            sapma             = temiz_str(row.iloc[11])
            bozulan_adet      = temiz_int(row.iloc[13])
            bozulan_neden     = temiz_str(row.iloc[15])

            conn.execute("""
                INSERT INTO uretim (tarih, lokasyon_id, hedef, gercek,
                    flex_sevk, tobacco_sevk, gravure_hazir_sevk, bakir_kapli_sevk,
                    toplam_onaylanan, onaya_gecen, onayda_olan,
                    prova_sonrasi_red, sapma_nedeni)
                VALUES (?,1,?,?,?,?,?,?,?,?,?,?,?)
                ON CONFLICT(tarih, lokasyon_id) DO UPDATE SET
                    hedef=excluded.hedef, gercek=excluded.gercek,
                    flex_sevk=excluded.flex_sevk,
                    tobacco_sevk=excluded.tobacco_sevk,
                    gravure_hazir_sevk=excluded.gravure_hazir_sevk,
                    bakir_kapli_sevk=excluded.bakir_kapli_sevk,
                    toplam_onaylanan=excluded.toplam_onaylanan,
                    onaya_gecen=excluded.onaya_gecen,
                    onayda_olan=excluded.onayda_olan,
                    prova_sonrasi_red=excluded.prova_sonrasi_red,
                    sapma_nedeni=excluded.sapma_nedeni
            """, (tarih, hedef, gercek, flex_sevk, tobacco_sevk,
                  gravure_sevk, bakir_sevk, toplam_onaylanan,
                  onaya_gecen, onayda_olan, prova_red, sapma))

            if bozulan_adet:
                conn.execute("""
                    INSERT INTO bozulan_silindir (tarih, lokasyon_id, adet, sapma_nedeni)
                    VALUES (?,1,?,?)
                """, (tarih, bozulan_adet, bozulan_neden))
            kayit += 1
        except: continue
    conn.commit()
    conn.close()
    print(f"ÜRETİM İZMİR: {kayit} kayıt aktarıldı.")

def import_emboss(xl):
    df = pd.read_excel(xl, sheet_name="EMBOSS", header=None)
    conn = get_db()
    kayit = 0
    for _, row in df.iterrows():
        try:
            tarih_val = row.iloc[3]
            if pd.isna(tarih_val): continue
            tarih = pd.to_datetime(tarih_val).strftime("%Y-%m-%d")
            conn.execute("""
                INSERT INTO emboss (tarih, emboss_hedef, emboss_gercek,
                    cellaxy_hedef, cellaxy_gercek, sapma_nedeni, bozulan_aciklama)
                VALUES (?,?,?,?,?,?,?)
                ON CONFLICT(tarih) DO UPDATE SET
                    emboss_hedef=excluded.emboss_hedef,
                    emboss_gercek=excluded.emboss_gercek,
                    cellaxy_hedef=excluded.cellaxy_hedef,
                    cellaxy_gercek=excluded.cellaxy_gercek,
                    sapma_nedeni=excluded.sapma_nedeni,
                    bozulan_aciklama=excluded.bozulan_aciklama
            """, (tarih,
                  temiz_int(row.iloc[4]), temiz_int(row.iloc[5]),
                  temiz_int(row.iloc[6]), temiz_int(row.iloc[7]),
                  temiz_str(row.iloc[8]), temiz_str(row.iloc[9])))
            kayit += 1
        except: continue
    conn.commit()
    conn.close()
    print(f"EMBOSS: {kayit} kayıt aktarıldı.")

if __name__ == "__main__":
    xl = sys.argv[1] if len(sys.argv) > 1 else "Copy_ASAKAI_HEDEF_TAKİP.xlsx"
    print(f"Dosya: {xl}")
    init_db()
    import_uretim_cigli(xl)
    import_uretim_izmir(xl)
    import_emboss(xl)
    print("Aktarım tamamlandı.")
