import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid
} from "recharts";

const LOK = { cigli: "Çiğli", esbas: "ESBAŞ", karaman: "Karaman" };

const HATA_TIPLERI = [
  "kabarık","delik","lak kalması","bakır atması","titreme",
  "ek kaplama","çizik","yumuşak","atlama","sertlik hatası",
  "cfm izi","vuruk","el kırılması","grvr mak.hatası","diğer"
];

function OranCell({ hedef, gercek }) {
  if (!hedef || gercek == null) return <span>—</span>;
  const oran = Math.round(gercek / hedef * 100);
  const cls = oran >= 90 ? "yesil" : oran >= 70 ? "amber" : "kirmizi";
  return <span className={`rozet ${cls}`}>%{oran}</span>;
}

export default function UretimPage({ lokasyon }) {
  const [sekme, setSekme] = useState("gunluk");
  const [data, setData] = useState([]);
  const [bozulan, setBozulan] = useState([]);
  const [haftalik, setHaftalik] = useState([]);
  const [filtre, setFiltre] = useState({ baslangic: "", bitis: "", hata: "" });
  const [form, setForm] = useState({ tarih: new Date().toISOString().slice(0,10), hedef:"", gercek:"", sapma_nedeni:"", prova_sonrasi_red:"", flex_sevk:"", tobacco_sevk:"" });
  const [bForm, setBForm] = useState({ tarih: new Date().toISOString().slice(0,10), adet:"", hata_tipi:"", sapma_nedeni:"", silindir_no:"" });
  const [mesaj, setMesaj] = useState("");

  const yukle = () => {
    const p = new URLSearchParams({ lokasyon });
    if (filtre.baslangic) p.append("baslangic", filtre.baslangic);
    if (filtre.bitis) p.append("bitis", filtre.bitis);
    fetch(`/api/uretim/liste?${p}`).then(r=>r.json()).then(d=>setData(d.data||[]));
    const bp = new URLSearchParams({ lokasyon });
    if (filtre.hata) bp.append("hata_tipi", filtre.hata);
    fetch(`/api/uretim/bozulan?${bp}`).then(r=>r.json()).then(d=>setBozulan(d.data||[]));
    fetch(`/api/uretim/liste?${p}&haftalik=true`).then(r=>r.json()).then(d=>setHaftalik(d.data||[]));
  };

  useEffect(yukle, [lokasyon]);

  const kaydet = async () => {
    const res = await fetch("/api/uretim/kaydet", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...form, lokasyon,
        hedef: form.hedef ? +form.hedef : null,
        gercek: form.gercek ? +form.gercek : null,
        prova_sonrasi_red: form.prova_sonrasi_red ? +form.prova_sonrasi_red : null,
        flex_sevk: form.flex_sevk ? +form.flex_sevk : null,
        tobacco_sevk: form.tobacco_sevk ? +form.tobacco_sevk : null,
      })
    });
    if (res.ok) { setMesaj("✓ Kaydedildi"); yukle(); setTimeout(()=>setMesaj(""),3000); }
  };

  const bozulanKaydet = async () => {
    const res = await fetch("/api/uretim/bozulan/kaydet", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...bForm, lokasyon, adet: bForm.adet ? +bForm.adet : null })
    });
    if (res.ok) { setMesaj("✓ Bozulan kaydedildi"); yukle(); setTimeout(()=>setMesaj(""),3000); }
  };

  const grafik = [...data].reverse().map(r => ({
    tarih: r.tarih?.slice(5),
    Hedef: r.hedef, Gerçek: r.gercek, Bozulan: r.bozulan_adet
  }));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Üretim — {LOK[lokasyon]}</div>
          <div className="page-sub">Günlük hedef / gerçek takibi</div>
        </div>
        {mesaj && <span className="rozet yesil">{mesaj}</span>}
      </div>

      {/* Sekme */}
      <div className="sekme-bar">
        {["gunluk","haftalik","bozulan","grafik","yeni-kayit"].map(s=>(
          <button key={s} className={sekme===s?"sekme aktif":"sekme"} onClick={()=>setSekme(s)}>
            {{gunluk:"Günlük",haftalik:"Haftalık",bozulan:"Bozulan Silindir",grafik:"Grafik","yeni-kayit":"+ Kayıt"}[s]}
          </button>
        ))}
      </div>

      {/* FİLTRE */}
      {sekme !== "yeni-kayit" && (
        <div className="filtre-bar">
          <label>Başlangıç</label>
          <input type="date" value={filtre.baslangic} onChange={e=>setFiltre({...filtre,baslangic:e.target.value})} />
          <label>Bitiş</label>
          <input type="date" value={filtre.bitis} onChange={e=>setFiltre({...filtre,bitis:e.target.value})} />
          {sekme==="bozulan" && <>
            <label>Hata Tipi</label>
            <select value={filtre.hata} onChange={e=>setFiltre({...filtre,hata:e.target.value})}>
              <option value="">Tümü</option>
              {HATA_TIPLERI.map(h=><option key={h}>{h}</option>)}
            </select>
          </>}
          <button className="btn btn-primary btn-sm" onClick={yukle}>Filtrele</button>
        </div>
      )}

      {/* GÜNLÜK TABLO */}
      {sekme==="gunluk" && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Günlük Üretim ({data.length} kayıt)</h3></div>
          <table>
            <thead>
              <tr>
                <th>Tarih</th><th>Hedef</th><th>Gerçek</th><th>Oran</th>
                <th>Flex Sevk</th><th>Tobacco Sevk</th>
                <th>Onaya Geçen</th><th>Prova Red</th>
                <th>Bozulan</th><th>Sapma Nedeni</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r,i) => (
                <tr key={i}>
                  <td>{r.tarih}</td>
                  <td>{r.hedef ?? "—"}</td>
                  <td>{r.gercek ?? "—"}</td>
                  <td><OranCell hedef={r.hedef} gercek={r.gercek}/></td>
                  <td>{r.flex_sevk ?? "—"}</td>
                  <td>{r.tobacco_sevk ?? "—"}</td>
                  <td>{r.onaya_gecen ?? "—"}</td>
                  <td>{r.prova_sonrasi_red ? <span className="rozet kirmizi">{r.prova_sonrasi_red}</span> : "—"}</td>
                  <td>{r.bozulan_adet ? <span className="rozet amber">{r.bozulan_adet}</span> : "—"}</td>
                  <td style={{maxWidth:200,fontSize:11,color:"#94a3b8"}}>{r.sapma_nedeni ?? "—"}</td>
                </tr>
              ))}
              {!data.length && <tr><td colSpan="10" className="yukleniyor">Kayıt bulunamadı</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* HAFTALIK */}
      {sekme==="haftalik" && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Haftalık Özet</h3></div>
          <table>
            <thead>
              <tr><th>Hafta</th><th>Gün</th><th>Hedef</th><th>Gerçek</th><th>Oran</th><th>Bozulan</th><th>Prova Red</th></tr>
            </thead>
            <tbody>
              {haftalik.map((r,i)=>(
                <tr key={i}>
                  <td>{r.hafta}</td><td>{r.gun_sayisi}</td>
                  <td>{r.hedef_toplam}</td><td>{r.gercek_toplam}</td>
                  <td><OranCell hedef={r.hedef_toplam} gercek={r.gercek_toplam}/></td>
                  <td>{r.bozulan_toplam ? <span className="rozet amber">{r.bozulan_toplam}</span> : 0}</td>
                  <td>{r.prova_red_toplam ?? 0}</td>
                </tr>
              ))}
              {!haftalik.length && <tr><td colSpan="7" className="yukleniyor">Kayıt bulunamadı</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* BOZULAN SİLİNDİR */}
      {sekme==="bozulan" && (
        <>
          <div className="tablo-kap" style={{marginBottom:14}}>
            <div className="tablo-baslik"><h3>Yeni Bozulan Kaydı</h3></div>
            <div style={{padding:"16px"}}>
              <div className="form-grid">
                <div className="form-grup"><label>Tarih</label><input type="date" value={bForm.tarih} onChange={e=>setBForm({...bForm,tarih:e.target.value})} /></div>
                <div className="form-grup"><label>Adet</label><input type="number" value={bForm.adet} onChange={e=>setBForm({...bForm,adet:e.target.value})} /></div>
                <div className="form-grup"><label>Silindir No</label><input type="text" value={bForm.silindir_no} onChange={e=>setBForm({...bForm,silindir_no:e.target.value})} /></div>
                <div className="form-grup"><label>Hata Tipi</label>
                  <select value={bForm.hata_tipi} onChange={e=>setBForm({...bForm,hata_tipi:e.target.value})}>
                    <option value="">Seçiniz</option>
                    {HATA_TIPLERI.map(h=><option key={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-grup" style={{gridColumn:"span 2"}}><label>Sapma Nedeni</label><input type="text" value={bForm.sapma_nedeni} onChange={e=>setBForm({...bForm,sapma_nedeni:e.target.value})} /></div>
              </div>
              <button className="btn btn-primary" style={{marginTop:12}} onClick={bozulanKaydet}>Kaydet</button>
            </div>
          </div>
          <div className="tablo-kap">
            <div className="tablo-baslik"><h3>Bozulan Silindir Kayıtları ({bozulan.length})</h3></div>
            <table>
              <thead><tr><th>Tarih</th><th>Adet</th><th>Silindir No</th><th>Hata Tipi</th><th>Sapma Nedeni</th></tr></thead>
              <tbody>
                {bozulan.map((r,i)=>(
                  <tr key={i}>
                    <td>{r.tarih}</td>
                    <td><span className="rozet kirmizi">{r.adet}</span></td>
                    <td>{r.silindir_no ?? "—"}</td>
                    <td>{r.hata_tipi ? <span className="rozet amber">{r.hata_tipi}</span> : "—"}</td>
                    <td style={{fontSize:12,color:"#94a3b8"}}>{r.sapma_nedeni ?? "—"}</td>
                  </tr>
                ))}
                {!bozulan.length && <tr><td colSpan="5" className="yukleniyor">Kayıt bulunamadı</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* GRAFİK */}
      {sekme==="grafik" && (
        <div className="grafik-kap">
          <h3>Hedef vs Gerçek (Son {grafik.length} gün)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={grafik}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2f42" />
              <XAxis dataKey="tarih" tick={{fill:"#64748b",fontSize:11}} />
              <YAxis tick={{fill:"#64748b",fontSize:11}} />
              <Tooltip contentStyle={{background:"#181c27",border:"1px solid #2a2f42",borderRadius:8}} />
              <Legend />
              <Line type="monotone" dataKey="Hedef" stroke="#3b82f6" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Gerçek" stroke="#22c55e" dot={false} strokeWidth={2} />
              <Line type="monotone" dataKey="Bozulan" stroke="#ef4444" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* YENİ KAYIT */}
      {sekme==="yeni-kayit" && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Günlük Üretim Girişi — {LOK[lokasyon]}</h3></div>
          <div style={{padding:"20px"}}>
            <div className="form-grid">
              <div className="form-grup"><label>Tarih</label><input type="date" value={form.tarih} onChange={e=>setForm({...form,tarih:e.target.value})} /></div>
              <div className="form-grup"><label>Hedef</label><input type="number" value={form.hedef} onChange={e=>setForm({...form,hedef:e.target.value})} /></div>
              <div className="form-grup"><label>Gerçek</label><input type="number" value={form.gercek} onChange={e=>setForm({...form,gercek:e.target.value})} /></div>
              <div className="form-grup"><label>Flex Sevk</label><input type="number" value={form.flex_sevk} onChange={e=>setForm({...form,flex_sevk:e.target.value})} /></div>
              <div className="form-grup"><label>Tobacco Sevk</label><input type="number" value={form.tobacco_sevk} onChange={e=>setForm({...form,tobacco_sevk:e.target.value})} /></div>
              <div className="form-grup"><label>Prova Sonrası Red</label><input type="number" value={form.prova_sonrasi_red} onChange={e=>setForm({...form,prova_sonrasi_red:e.target.value})} /></div>
              <div className="form-grup" style={{gridColumn:"span 3"}}><label>Sapma Nedeni</label><input type="text" value={form.sapma_nedeni} onChange={e=>setForm({...form,sapma_nedeni:e.target.value})} /></div>
            </div>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={kaydet}>Kaydet</button>
          </div>
        </div>
      )}
    </div>
  );
}
