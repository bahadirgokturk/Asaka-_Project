import React, { useEffect, useState } from "react";

const SORUMLULAR = [
  "Emrah Arslantaş",
  "Ufuktan Şavkı",
  "Derya Çakır",
  "Ali Aydın",
  "Serpil Turfan",
  "Ergün Kocabaş",
];

const DURUMLAR = [
  { value: "devam", label: "Devam Ediyor", renk: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
  { value: "tamamlandi", label: "Tamamlandı", renk: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  { value: "gecikti", label: "Gecikti", renk: "#ef4444", bg: "rgba(239,68,68,0.15)" },
];

function getDurumStyle(durum) {
  return DURUMLAR.find(d => d.value === durum) || DURUMLAR[0];
}

function isGecikti(deadline, durum) {
  if (!deadline || durum === "tamamlandi") return false;
  return new Date(deadline) < new Date();
}

export default function AksiyonPage() {
  const [aksiyonlar, setAksiyonlar] = useState(() => {
    try { return JSON.parse(localStorage.getItem("aksiyonlar")) || []; }
    catch { return []; }
  });
  const [form, setForm] = useState({
    detay: "", sorumlu: "", deadline: "", durum: "devam"
  });
  const [goster, setGoster] = useState(false);
  const [filtre, setFiltre] = useState("hepsi");
  const [duzenle, setDuzenle] = useState(null);

  const kaydet = () => {
    if (!aksiyonlar) return;
    localStorage.setItem("aksiyonlar", JSON.stringify(aksiyonlar));
  };

  useEffect(() => { kaydet(); }, [aksiyonlar]);

  // Gecikmiş olanları otomatik güncelle
  useEffect(() => {
    setAksiyonlar(prev => prev.map(a => {
      if (isGecikti(a.deadline, a.durum) && a.durum === "devam") {
        return { ...a, durum: "gecikti" };
      }
      return a;
    }));
  }, []);

  const ekle = () => {
    if (!form.detay) return;
    const yeni = {
      id: Date.now(),
      ...form,
      olusturma: new Date().toISOString().slice(0, 10),
    };
    setAksiyonlar(prev => [yeni, ...prev]);
    setForm({ detay: "", sorumlu: "", deadline: "", durum: "devam" });
    setGoster(false);
  };

  const sil = (id) => {
    setAksiyonlar(prev => prev.filter(a => a.id !== id));
  };

  const durumGuncelle = (id, yeniDurum) => {
    setAksiyonlar(prev => prev.map(a => a.id === id ? { ...a, durum: yeniDurum } : a));
  };

  const filtrelenmis = aksiyonlar.filter(a => {
    if (filtre === "hepsi") return true;
    return a.durum === filtre;
  });

  const ozet = {
    toplam: aksiyonlar.length,
    devam: aksiyonlar.filter(a => a.durum === "devam").length,
    tamamlandi: aksiyonlar.filter(a => a.durum === "tamamlandi").length,
    gecikti: aksiyonlar.filter(a => a.durum === "gecikti").length,
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Aksiyon Takip</div>
          <div className="page-sub">Günlük aksiyon yönetimi ve takibi</div>
        </div>
        <button className="btn btn-primary" onClick={() => setGoster(!goster)}>
          {goster ? "İptal" : "+ Yeni Aksiyon"}
        </button>
      </div>

      {/* Özet kartlar */}
      <div className="kart-grid" style={{ marginBottom: 16 }}>
        <div className="kart" onClick={() => setFiltre("hepsi")} style={{ cursor: "pointer", border: filtre === "hepsi" ? "1px solid #3b82f6" : undefined }}>
          <div className="kart-label">Toplam</div>
          <div className="kart-deger">{ozet.toplam}</div>
        </div>
        <div className="kart amber" onClick={() => setFiltre("devam")} style={{ cursor: "pointer", border: filtre === "devam" ? "1px solid #f59e0b" : undefined }}>
          <div className="kart-label">Devam Ediyor</div>
          <div className="kart-deger">{ozet.devam}</div>
        </div>
        <div className="kart yesil" onClick={() => setFiltre("tamamlandi")} style={{ cursor: "pointer", border: filtre === "tamamlandi" ? "1px solid #22c55e" : undefined }}>
          <div className="kart-label">Tamamlandı</div>
          <div className="kart-deger">{ozet.tamamlandi}</div>
        </div>
        <div className="kart kirmizi" onClick={() => setFiltre("gecikti")} style={{ cursor: "pointer", border: filtre === "gecikti" ? "1px solid #ef4444" : undefined }}>
          <div className="kart-label">Gecikti</div>
          <div className="kart-deger">{ozet.gecikti}</div>
        </div>
      </div>

      {/* Yeni Aksiyon Formu */}
      {goster && (
        <div className="tablo-kap" style={{ marginBottom: 16 }}>
          <div className="tablo-baslik"><h3>Yeni Aksiyon Ekle</h3></div>
          <div style={{ padding: 20 }}>
            <div className="form-grid">
              <div className="form-grup" style={{ gridColumn: "span 3" }}>
                <label>Aksiyon Detayı</label>
                <input
                  type="text"
                  placeholder="Ne yapılacak?"
                  value={form.detay}
                  onChange={e => setForm({ ...form, detay: e.target.value })}
                />
              </div>
              <div className="form-grup">
                <label>Sorumlu</label>
                <select value={form.sorumlu} onChange={e => setForm({ ...form, sorumlu: e.target.value })}>
                  <option value="">Seçiniz</option>
                  {SORUMLULAR.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-grup">
                <label>Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                />
              </div>
              <div className="form-grup">
                <label>Durum</label>
                <select value={form.durum} onChange={e => setForm({ ...form, durum: e.target.value })}>
                  {DURUMLAR.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={ekle}>Kaydet</button>
          </div>
        </div>
      )}

      {/* Filtre bar */}
      <div className="sekme-bar" style={{ marginBottom: 12 }}>
        {[
          { value: "hepsi", label: `Hepsi (${ozet.toplam})` },
          { value: "devam", label: `Devam Ediyor (${ozet.devam})` },
          { value: "tamamlandi", label: `Tamamlandı (${ozet.tamamlandi})` },
          { value: "gecikti", label: `Gecikti (${ozet.gecikti})` },
        ].map(f => (
          <button
            key={f.value}
            className={filtre === f.value ? "sekme aktif" : "sekme"}
            onClick={() => setFiltre(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Aksiyon Tablosu */}
      <div className="tablo-kap">
        <div className="tablo-baslik">
          <h3>Aksiyonlar ({filtrelenmis.length})</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Aksiyon Detayı</th>
              <th style={{ width: 160 }}>Sorumlu</th>
              <th style={{ width: 110 }}>Deadline</th>
              <th style={{ width: 80 }}>Oluşturma</th>
              <th style={{ width: 160 }}>Durum</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtrelenmis.map((a, i) => {
              const ds = getDurumStyle(a.durum);
              const gecikmisMi = isGecikti(a.deadline, a.durum);
              return (
                <tr key={a.id} style={{ opacity: a.durum === "tamamlandi" ? 0.7 : 1 }}>
                  <td style={{ color: "#64748b", fontSize: 12 }}>{i + 1}</td>
                  <td style={{ fontWeight: a.durum !== "tamamlandi" ? 500 : 400 }}>
                    {a.detay}
                  </td>
                  <td>
                    {a.sorumlu
                      ? <span style={{
                          display: "inline-block", padding: "2px 10px",
                          background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
                          borderRadius: 4, fontSize: 12, color: "#60a5fa"
                        }}>{a.sorumlu}</span>
                      : <span style={{ color: "#475569", fontSize: 12 }}>—</span>}
                  </td>
                  <td>
                    {a.deadline
                      ? <span style={{
                          color: gecikmisMi ? "#ef4444" : "#94a3b8",
                          fontSize: 12, fontWeight: gecikmisMi ? 600 : 400
                        }}>
                          {gecikmisMi ? "⚠ " : ""}{a.deadline}
                        </span>
                      : <span style={{ color: "#475569", fontSize: 12 }}>—</span>}
                  </td>
                  <td style={{ color: "#64748b", fontSize: 12 }}>{a.olusturma}</td>
                  <td>
                    <select
                      value={a.durum}
                      onChange={e => durumGuncelle(a.id, e.target.value)}
                      style={{
                        background: ds.bg,
                        border: `1px solid ${ds.renk}`,
                        borderRadius: 4, padding: "3px 8px",
                        color: ds.renk, fontSize: 12,
                        cursor: "pointer", outline: "none",
                        fontWeight: 600,
                      }}
                    >
                      {DURUMLAR.map(d => (
                        <option key={d.value} value={d.value}>{d.label}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      onClick={() => sil(a.id)}
                      style={{
                        background: "transparent", border: "1px solid #374151",
                        borderRadius: 4, color: "#6b7280", cursor: "pointer",
                        padding: "3px 8px", fontSize: 12,
                      }}
                      onMouseEnter={e => { e.target.style.borderColor = "#ef4444"; e.target.style.color = "#ef4444"; }}
                      onMouseLeave={e => { e.target.style.borderColor = "#374151"; e.target.style.color = "#6b7280"; }}
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              );
            })}
            {!filtrelenmis.length && (
              <tr>
                <td colSpan="7" className="yukleniyor">
                  {filtre === "hepsi" ? "Henüz aksiyon eklenmedi" : "Bu kategoride aksiyon yok"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}