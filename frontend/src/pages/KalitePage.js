import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const HATA_KOLONLAR = [
  ["delik","Delik"],["krom_atmasi","Krom Atması"],["radus_catlak","Radüs Çatlak"],
  ["shoe_izi","Shoe İzi"],["lak_kalmasi","Lak Kalması"],["elmas_asinmasi","Elmas Aşınması"],
  ["bakir_atmasi","Bakır Atması"],["ek_kaplama","Ek Kaplama"],["kabarik","Kabarık"],
  ["titreme","Titreme"],["cizik","Çizik"],["yumusak","Yumuşak"],
  ["atlama","Atlama"],["cfm_izi","CFM İzi"],["vuruk","Vuruk"],
  ["sertlik_hatasi","Sertlik Hatası"],["diger","Diğer"]
];

export default function KalitePage({ lokasyon }) {
  const [sekme, setSekme] = useState("liste");
  const [data, setData] = useState([]);
  const [haftalik, setHaftalik] = useState([]);
  const [filtre, setFiltre] = useState({ baslangic:"", bitis:"" });
  const [form, setForm] = useState({
    tarih: new Date().toISOString().slice(0,10),
    hedef:"", gercek:"", onayda:"", toplam_bozulan:"",
    ...Object.fromEntries(HATA_KOLONLAR.map(([k])=>[k,""]))
  });
  const [mesaj, setMesaj] = useState("");

  const yukle = () => {
    const p = new URLSearchParams({ lokasyon });
    if (filtre.baslangic) p.append("baslangic", filtre.baslangic);
    if (filtre.bitis) p.append("bitis", filtre.bitis);
    fetch(`/api/kalite/liste?${p}`).then(r=>r.json()).then(d=>setData(d.data||[]));
    fetch(`/api/kalite/haftalik-hata-ozet?lokasyon=${lokasyon}`)
      .then(r=>r.json()).then(d=>setHaftalik(d.data||[]));
  };

  useEffect(yukle, [lokasyon]);

  const kaydet = async () => {
    const body = { ...form, lokasyon };
    HATA_KOLONLAR.forEach(([k]) => { body[k] = body[k] ? +body[k] : 0; });
    ["hedef","gercek","onayda","toplam_bozulan"].forEach(k => { body[k] = body[k] ? +body[k] : null; });
    const res = await fetch("/api/kalite/kaydet", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    if (res.ok) { setMesaj("✓ Kaydedildi"); yukle(); setTimeout(()=>setMesaj(""),3000); }
  };

  const grafik = haftalik.map(h => ({
    hafta: h.hafta,
    Delik: h.delik||0, "Krom Atması": h.krom_atmasi||0,
    Kabarık: h.kabarik||0, "Bakır Atması": h.bakir_atmasi||0,
    "Lak Kalması": h.lak_kalmasi||0, Titreme: h.titreme||0,
  })).reverse();

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Kalite</div><div className="page-sub">Sevk & hata tipi takibi</div></div>
        {mesaj && <span className="rozet yesil">{mesaj}</span>}
      </div>

      <div className="sekme-bar">
        {["liste","haftalik-hata","yeni-kayit"].map(s=>(
          <button key={s} className={sekme===s?"sekme aktif":"sekme"} onClick={()=>setSekme(s)}>
            {{liste:"Liste","haftalik-hata":"Haftalık Hata Dağılımı","yeni-kayit":"+ Kayıt"}[s]}
          </button>
        ))}
      </div>

      {sekme!=="yeni-kayit" && (
        <div className="filtre-bar">
          <label>Başlangıç</label>
          <input type="date" value={filtre.baslangic} onChange={e=>setFiltre({...filtre,baslangic:e.target.value})} />
          <label>Bitiş</label>
          <input type="date" value={filtre.bitis} onChange={e=>setFiltre({...filtre,bitis:e.target.value})} />
          <button className="btn btn-primary btn-sm" onClick={yukle}>Filtrele</button>
        </div>
      )}

      {sekme==="liste" && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Kalite Kayıtları ({data.length})</h3></div>
          <div style={{overflowX:"auto"}}>
            <table>
              <thead>
                <tr>
                  <th>Tarih</th><th>Hedef</th><th>Gerçek</th><th>Onayda</th>
                  <th>Top.Bozulan</th>
                  {HATA_KOLONLAR.slice(0,8).map(([k,l])=><th key={k}>{l}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.map((r,i)=>(
                  <tr key={i}>
                    <td>{r.tarih}</td>
                    <td>{r.hedef??'—'}</td>
                    <td>{r.gercek??'—'}</td>
                    <td>{r.onayda??'—'}</td>
                    <td>{r.toplam_bozulan ? <span className="rozet kirmizi">{r.toplam_bozulan}</span> : '—'}</td>
                    {HATA_KOLONLAR.slice(0,8).map(([k])=>(
                      <td key={k}>{r[k]||'—'}</td>
                    ))}
                  </tr>
                ))}
                {!data.length && <tr><td colSpan="14" className="yukleniyor">Kayıt bulunamadı</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sekme==="haftalik-hata" && (
        <>
          <div className="grafik-kap">
            <h3>Haftalık Hata Trendi</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={grafik}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2f42" />
                <XAxis dataKey="hafta" tick={{fill:"#64748b",fontSize:10}} />
                <YAxis tick={{fill:"#64748b",fontSize:11}} />
                <Tooltip contentStyle={{background:"#181c27",border:"1px solid #2a2f42",borderRadius:8}} />
                <Legend />
                <Bar dataKey="Delik" fill="#ef4444" />
                <Bar dataKey="Krom Atması" fill="#f59e0b" />
                <Bar dataKey="Kabarık" fill="#8b5cf6" />
                <Bar dataKey="Bakır Atması" fill="#14b8a6" />
                <Bar dataKey="Lak Kalması" fill="#3b82f6" />
                <Bar dataKey="Titreme" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="tablo-kap">
            <div className="tablo-baslik"><h3>Haftalık Hata Özeti</h3></div>
            <table>
              <thead>
                <tr><th>Hafta</th><th>Delik</th><th>Krom</th><th>Kabarık</th><th>Bakır Atm.</th><th>Lak Kal.</th><th>Titreme</th><th>Diğer</th><th>Toplam</th></tr>
              </thead>
              <tbody>
                {haftalik.map((r,i)=>(
                  <tr key={i}>
                    <td>{r.hafta}</td>
                    <td>{r.delik||0}</td><td>{r.krom_atmasi||0}</td>
                    <td>{r.kabarik||0}</td><td>{r.bakir_atmasi||0}</td>
                    <td>{r.lak_kalmasi||0}</td><td>{r.titreme||0}</td>
                    <td>{r.diger||0}</td>
                    <td><span className="rozet amber">{r.toplam||0}</span></td>
                  </tr>
                ))}
                {!haftalik.length && <tr><td colSpan="9" className="yukleniyor">Kayıt yok</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {sekme==="yeni-kayit" && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Kalite Girişi</h3></div>
          <div style={{padding:"20px"}}>
            <div className="form-grid">
              <div className="form-grup"><label>Tarih</label><input type="date" value={form.tarih} onChange={e=>setForm({...form,tarih:e.target.value})} /></div>
              <div className="form-grup"><label>Hedef</label><input type="number" value={form.hedef} onChange={e=>setForm({...form,hedef:e.target.value})} /></div>
              <div className="form-grup"><label>Gerçek</label><input type="number" value={form.gercek} onChange={e=>setForm({...form,gercek:e.target.value})} /></div>
              <div className="form-grup"><label>Onayda</label><input type="number" value={form.onayda} onChange={e=>setForm({...form,onayda:e.target.value})} /></div>
              <div className="form-grup"><label>Toplam Bozulan</label><input type="number" value={form.toplam_bozulan} onChange={e=>setForm({...form,toplam_bozulan:e.target.value})} /></div>
            </div>
            <div style={{marginTop:16,marginBottom:8,fontSize:12,color:"#64748b",fontWeight:600,textTransform:"uppercase"}}>Hata Tipleri</div>
            <div className="form-grid">
              {HATA_KOLONLAR.map(([k,l])=>(
                <div key={k} className="form-grup">
                  <label>{l}</label>
                  <input type="number" min="0" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={kaydet}>Kaydet</button>
          </div>
        </div>
      )}
    </div>
  );
}
