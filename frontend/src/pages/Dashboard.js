import React, { useEffect, useState } from "react";

const LOK = { cigli: "Çiğli", esbas: "ESBAŞ", karaman: "Karaman" };

function OranBadge({ hedef, gercek }) {
  if (!hedef || !gercek) return <span className="rozet amber">—</span>;
  const oran = Math.round((gercek / hedef) * 100);
  const cls = oran >= 90 ? "yesil" : oran >= 70 ? "amber" : "kirmizi";
  return <span className={`rozet ${cls}`}>%{oran}</span>;
}

export default function Dashboard({ lokasyon }) {
  const [ozet, setOzet] = useState(null);
  const [haftalik, setHaftalik] = useState(null);
  const [tarih] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    fetch(`/api/ozet/gunluk?tarih=${tarih}&lokasyon=${lokasyon}`)
      .then(r => r.json()).then(setOzet).catch(() => {});
    fetch(`/api/ozet/haftalik?lokasyon=${lokasyon}`)
      .then(r => r.json()).then(setHaftalik).catch(() => {});
  }, [lokasyon, tarih]);

  const u = ozet?.uretim;
  const k = ozet?.kalite;
  const b = ozet?.bozulan;
  const hw = haftalik?.uretim;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard — {LOK[lokasyon]}</div>
          <div className="page-sub">Bugün: {tarih}</div>
        </div>
      </div>

      {/* Günlük kartlar */}
      <div className="kart-grid">
        <div className="kart mavi">
          <div className="kart-label">Üretim Hedef</div>
          <div className="kart-deger">{u?.hedef ?? "—"}</div>
          <div className="kart-alt">adet</div>
        </div>
        <div className={`kart ${u?.gercek >= u?.hedef ? "yesil" : "kirmizi"}`}>
          <div className="kart-label">Üretim Gerçek</div>
          <div className="kart-deger">{u?.gercek ?? "—"}</div>
          <div className="kart-alt">
            <OranBadge hedef={u?.hedef} gercek={u?.gercek} />
          </div>
        </div>
        <div className="kart amber">
          <div className="kart-label">Bozulan Silindir</div>
          <div className="kart-deger">{b?.toplam ?? 0}</div>
          <div className="kart-alt">adet</div>
        </div>
        <div className="kart">
          <div className="kart-label">Kalite Sevk</div>
          <div className="kart-deger">{k?.gercek ?? "—"}</div>
          <div className="kart-alt">onaylı</div>
        </div>
        <div className="kart">
          <div className="kart-label">Prova Sonrası Red</div>
          <div className="kart-deger kirmizi">{u?.prova_sonrasi_red ?? 0}</div>
          <div className="kart-alt">adet</div>
        </div>
      </div>

      {/* Haftalık özet */}
      {haftalik && (
        <div className="tablo-kap">
          <div className="tablo-baslik">
            <h3>Bu Hafta — {haftalik.hafta}</h3>
          </div>
          <div style={{ padding: "16px 20px" }}>
            <div className="kart-grid">
              <div className="kart mavi">
                <div className="kart-label">Haftalık Hedef</div>
                <div className="kart-deger">{hw?.hedef_toplam ?? "—"}</div>
              </div>
              <div className="kart yesil">
                <div className="kart-label">Haftalık Gerçek</div>
                <div className="kart-deger">{hw?.gercek_toplam ?? "—"}</div>
                <div className="kart-alt">
                  <OranBadge hedef={hw?.hedef_toplam} gercek={hw?.gercek_toplam} />
                </div>
              </div>
              <div className="kart amber">
                <div className="kart-label">Toplam Bozulan</div>
                <div className="kart-deger">{hw?.bozulan_toplam ?? 0}</div>
              </div>
              <div className="kart">
                <div className="kart-label">Çalışılan Gün</div>
                <div className="kart-deger">{hw?.gun_sayisi ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sapma nedeni */}
      {u?.sapma_nedeni && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Bugünün Sapma Nedeni</h3></div>
          <div style={{ padding: "14px 18px", color: "#94a3b8", fontSize: "13px" }}>
            {u.sapma_nedeni}
          </div>
        </div>
      )}

      {/* Haftalık bozulan dağılım */}
      {haftalik?.bozulan_hata_dagilim?.length > 0 && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Bu Hafta Bozulan — Hata Dağılımı</h3></div>
          <table>
            <thead>
              <tr><th>Hata Tipi</th><th>Adet</th><th>Kayıt Sayısı</th></tr>
            </thead>
            <tbody>
              {haftalik.bozulan_hata_dagilim.map((r, i) => (
                <tr key={i}>
                  <td>{r.hata_tipi || "—"}</td>
                  <td><span className="rozet kirmizi">{r.toplam}</span></td>
                  <td>{r.kayit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
