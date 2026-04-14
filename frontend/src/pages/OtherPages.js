import React, { useEffect, useState } from "react";

// ─── REPRO ───────────────────────────────────────────────
export function ReproPage() {
  const [data, setData] = useState([]);
  const [sekme, setSekme] = useState("liste");
  const [filtre, setFiltre] = useState({ baslangic:"", bitis:"" });
  const [form, setForm] = useState({
    tarih: new Date().toISOString().slice(0,10),
    flex_hedef_dosya:"", flex_calisir_silindir:"",
    tobacco_hedef:"", tobacco_gercek:"",
    uretim_cigli:"", uretim_tobacco:"", uretim_ispak:"",
    tobacco_gtp:"", flex_gtp:"", numune:"",
    onayda:"", plotter:"", bilgi_bek:"",
    bozulan_sayi:"", basilmayan_sayi:""
  });
  const [mesaj, setMesaj] = useState("");

  const yukle = () => {
    const p = new URLSearchParams();
    if (filtre.baslangic) p.append("baslangic", filtre.baslangic);
    if (filtre.bitis) p.append("bitis", filtre.bitis);
    fetch(`/api/repro/liste?${p}`).then(r=>r.json()).then(d=>setData(d.data||[]));
  };
  useEffect(yukle, []);

  const kaydet = async () => {
    const body = {...form};
    Object.keys(body).forEach(k => { if(k!=="tarih") body[k] = body[k]!="" ? +body[k] : null; });
    const res = await fetch("/api/repro/kaydet", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    if (res.ok) { setMesaj("✓ Kaydedildi"); yukle(); setTimeout(()=>setMesaj(""),3000); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Repro</div><div className="page-sub">Silindir üretim takibi</div></div>
        {mesaj && <span className="rozet yesil">{mesaj}</span>}
      </div>
      <div className="sekme-bar">
        {["liste","yeni-kayit"].map(s=>(
          <button key={s} className={sekme===s?"sekme aktif":"sekme"} onClick={()=>setSekme(s)}>
            {s==="liste"?"Liste":"+ Kayıt"}
          </button>
        ))}
      </div>

      {sekme==="liste" && (
        <>
          <div className="filtre-bar">
            <label>Başlangıç</label>
            <input type="date" value={filtre.baslangic} onChange={e=>setFiltre({...filtre,baslangic:e.target.value})} />
            <label>Bitiş</label>
            <input type="date" value={filtre.bitis} onChange={e=>setFiltre({...filtre,bitis:e.target.value})} />
            <button className="btn btn-primary btn-sm" onClick={yukle}>Filtrele</button>
          </div>
          <div className="tablo-kap" style={{overflowX:"auto"}}>
            <div className="tablo-baslik"><h3>Repro Kayıtları ({data.length})</h3></div>
            <table>
              <thead>
                <tr>
                  <th>Tarih</th><th>Flex Hedef</th><th>Flex Çalışır</th>
                  <th>Tob. Hedef</th><th>Tob. Gerçek</th>
                  <th>Ürt. Çiğli</th><th>Ürt. Tobacco</th><th>Ürt. İspak</th>
                  <th>Onayda</th><th>Bozulan</th><th>Basılmayan</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r,i)=>(
                  <tr key={i}>
                    <td>{r.tarih}</td>
                    <td>{r.flex_hedef_dosya??'—'}</td><td>{r.flex_calisir_silindir??'—'}</td>
                    <td>{r.tobacco_hedef??'—'}</td><td>{r.tobacco_gercek??'—'}</td>
                    <td>{r.uretim_cigli??'—'}</td><td>{r.uretim_tobacco??'—'}</td><td>{r.uretim_ispak??'—'}</td>
                    <td>{r.onayda??'—'}</td>
                    <td>{r.bozulan_sayi ? <span className="rozet kirmizi">{r.bozulan_sayi}</span> : '—'}</td>
                    <td>{r.basilmayan_sayi ? <span className="rozet amber">{r.basilmayan_sayi}</span> : '—'}</td>
                  </tr>
                ))}
                {!data.length && <tr><td colSpan="11" className="yukleniyor">Kayıt bulunamadı</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {sekme==="yeni-kayit" && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Repro Girişi</h3></div>
          <div style={{padding:"20px"}}>
            <div className="form-grid">
              {[
                ["tarih","Tarih","date"],
                ["flex_hedef_dosya","Flex Hedef Dosya","number"],
                ["flex_calisir_silindir","Flex Çalışır Silindir","number"],
                ["tobacco_hedef","Tobacco Hedef","number"],
                ["tobacco_gercek","Tobacco Gerçek","number"],
                ["uretim_cigli","Üretim Çiğli","number"],
                ["uretim_tobacco","Üretim Tobacco","number"],
                ["uretim_ispak","Üretim İspak","number"],
                ["tobacco_gtp","Tobacco GTP","number"],
                ["flex_gtp","Flex GTP","number"],
                ["numune","Numune","number"],
                ["onayda","Onayda","number"],
                ["plotter","Plotter","number"],
                ["bilgi_bek","Bilgi Bek.","number"],
                ["bozulan_sayi","Bozulan Sayısı","number"],
                ["basilmayan_sayi","Basılmayan Sayısı","number"],
              ].map(([k,l,t])=>(
                <div key={k} className="form-grup">
                  <label>{l}</label>
                  <input type={t} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
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

// ─── EMBOSS ───────────────────────────────────────────────
export function EmbossPage() {
  const [data, setData] = useState([]);
  const [sekme, setSekme] = useState("liste");
  const [form, setForm] = useState({
    tarih: new Date().toISOString().slice(0,10),
    emboss_hedef:"", emboss_gercek:"",
    cellaxy_hedef:"", cellaxy_gercek:"",
    sapma_nedeni:"", bozulan_aciklama:""
  });
  const [mesaj, setMesaj] = useState("");

  const yukle = () => fetch("/api/emboss/liste").then(r=>r.json()).then(d=>setData(d.data||[]));
  useEffect(yukle, []);

  const kaydet = async () => {
    const body = {...form,
      emboss_hedef: form.emboss_hedef?+form.emboss_hedef:null,
      emboss_gercek: form.emboss_gercek?+form.emboss_gercek:null,
      cellaxy_hedef: form.cellaxy_hedef?+form.cellaxy_hedef:null,
      cellaxy_gercek: form.cellaxy_gercek?+form.cellaxy_gercek:null,
    };
    const res = await fetch("/api/emboss/kaydet", {
      method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body)
    });
    if (res.ok) { setMesaj("✓ Kaydedildi"); yukle(); setTimeout(()=>setMesaj(""),3000); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Emboss</div><div className="page-sub">Emboss & Cellaxy üretim takibi</div></div>
        {mesaj && <span className="rozet yesil">{mesaj}</span>}
      </div>
      <div className="sekme-bar">
        {["liste","yeni-kayit"].map(s=>(
          <button key={s} className={sekme===s?"sekme aktif":"sekme"} onClick={()=>setSekme(s)}>
            {s==="liste"?"Liste":"+ Kayıt"}
          </button>
        ))}
      </div>

      {sekme==="liste" && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Emboss Kayıtları ({data.length})</h3></div>
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Emboss Hedef</th><th>Emboss Gerçek</th>
                <th>Cellaxy Hedef</th><th>Cellaxy Gerçek</th>
                <th>Sapma Nedeni</th><th>Bozulan Açıklama</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r,i)=>(
                <tr key={i}>
                  <td>{r.tarih}</td>
                  <td>{r.emboss_hedef??'—'}</td>
                  <td>{r.emboss_gercek??'—'}</td>
                  <td>{r.cellaxy_hedef??'—'}</td>
                  <td>{r.cellaxy_gercek??'—'}</td>
                  <td style={{fontSize:11,color:"#94a3b8",maxWidth:200}}>{r.sapma_nedeni??'—'}</td>
                  <td style={{fontSize:11,color:"#ef4444",maxWidth:200}}>{r.bozulan_aciklama??'—'}</td>
                </tr>
              ))}
              {!data.length && <tr><td colSpan="7" className="yukleniyor">Kayıt bulunamadı</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {sekme==="yeni-kayit" && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Emboss Girişi</h3></div>
          <div style={{padding:"20px"}}>
            <div className="form-grid">
              <div className="form-grup"><label>Tarih</label><input type="date" value={form.tarih} onChange={e=>setForm({...form,tarih:e.target.value})} /></div>
              <div className="form-grup"><label>Emboss Hedef</label><input type="number" value={form.emboss_hedef} onChange={e=>setForm({...form,emboss_hedef:e.target.value})} /></div>
              <div className="form-grup"><label>Emboss Gerçek</label><input type="number" value={form.emboss_gercek} onChange={e=>setForm({...form,emboss_gercek:e.target.value})} /></div>
              <div className="form-grup"><label>Cellaxy Hedef</label><input type="number" value={form.cellaxy_hedef} onChange={e=>setForm({...form,cellaxy_hedef:e.target.value})} /></div>
              <div className="form-grup"><label>Cellaxy Gerçek</label><input type="number" value={form.cellaxy_gercek} onChange={e=>setForm({...form,cellaxy_gercek:e.target.value})} /></div>
              <div className="form-grup" style={{gridColumn:"span 2"}}><label>Sapma Nedeni</label><input type="text" value={form.sapma_nedeni} onChange={e=>setForm({...form,sapma_nedeni:e.target.value})} /></div>
              <div className="form-grup" style={{gridColumn:"span 2"}}><label>Bozulan Açıklama</label><input type="text" value={form.bozulan_aciklama} onChange={e=>setForm({...form,bozulan_aciklama:e.target.value})} /></div>
            </div>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={kaydet}>Kaydet</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SİPARİŞ ───────────────────────────────────────────────
const KATEGORILER = [
  "izmir_gravur","ispak_gravur","celik","bakir",
  "tobacco_gravur","tobacco_tipping","tobacco_gtp",
  "tobacco_celik","tobacco_sleeve","tobacco_dekrom",
  "barrel","emboss","export_celik","export_bakir","dekrom"
];

export function SiparisPage() {
  const [data, setData] = useState([]);
  const [filtre, setFiltre] = useState({ baslangic:"", bitis:"", kategori:"" });
  const [form, setForm] = useState({ tarih:new Date().toISOString().slice(0,10), kategori:"izmir_gravur", hedef:"", gercek:"" });
  const [sekme, setSekme] = useState("liste");
  const [mesaj, setMesaj] = useState("");

  const yukle = () => {
    const p = new URLSearchParams();
    if (filtre.baslangic) p.append("baslangic", filtre.baslangic);
    if (filtre.bitis) p.append("bitis", filtre.bitis);
    if (filtre.kategori) p.append("kategori", filtre.kategori);
    fetch(`/api/siparis/liste?${p}`).then(r=>r.json()).then(d=>setData(d.data||[]));
  };
  useEffect(yukle, []);

  const kaydet = async () => {
    const res = await fetch("/api/siparis/kaydet", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ ...form, hedef:form.hedef?+form.hedef:null, gercek:form.gercek?+form.gercek:null })
    });
    if (res.ok) { setMesaj("✓ Kaydedildi"); yukle(); setTimeout(()=>setMesaj(""),3000); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div><div className="page-title">Sipariş</div><div className="page-sub">Kategori bazlı sipariş takibi</div></div>
        {mesaj && <span className="rozet yesil">{mesaj}</span>}
      </div>
      <div className="sekme-bar">
        {["liste","yeni-kayit"].map(s=>(
          <button key={s} className={sekme===s?"sekme aktif":"sekme"} onClick={()=>setSekme(s)}>
            {s==="liste"?"Liste":"+ Kayıt"}
          </button>
        ))}
      </div>

      {sekme==="liste" && (
        <>
          <div className="filtre-bar">
            <label>Başlangıç</label>
            <input type="date" value={filtre.baslangic} onChange={e=>setFiltre({...filtre,baslangic:e.target.value})} />
            <label>Bitiş</label>
            <input type="date" value={filtre.bitis} onChange={e=>setFiltre({...filtre,bitis:e.target.value})} />
            <label>Kategori</label>
            <select value={filtre.kategori} onChange={e=>setFiltre({...filtre,kategori:e.target.value})}>
              <option value="">Tümü</option>
              {KATEGORILER.map(k=><option key={k}>{k}</option>)}
            </select>
            <button className="btn btn-primary btn-sm" onClick={yukle}>Filtrele</button>
          </div>
          <div className="tablo-kap">
            <div className="tablo-baslik"><h3>Sipariş Kayıtları ({data.length})</h3></div>
            <table>
              <thead>
                <tr><th>Tarih</th><th>Kategori</th><th>Hedef</th><th>Gerçek</th><th>Fark</th></tr>
              </thead>
              <tbody>
                {data.map((r,i)=>{
                  const fark = (r.gercek??0) - (r.hedef??0);
                  return (
                    <tr key={i}>
                      <td>{r.tarih}</td>
                      <td><span className="rozet mavi">{r.kategori}</span></td>
                      <td>{r.hedef??'—'}</td>
                      <td>{r.gercek??'—'}</td>
                      <td>
                        {r.hedef && r.gercek
                          ? <span className={`rozet ${fark>=0?"yesil":"kirmizi"}`}>{fark>0?"+":""}{fark}</span>
                          : '—'}
                      </td>
                    </tr>
                  );
                })}
                {!data.length && <tr><td colSpan="5" className="yukleniyor">Kayıt bulunamadı</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {sekme==="yeni-kayit" && (
        <div className="tablo-kap">
          <div className="tablo-baslik"><h3>Sipariş Girişi</h3></div>
          <div style={{padding:"20px"}}>
            <div className="form-grid">
              <div className="form-grup"><label>Tarih</label><input type="date" value={form.tarih} onChange={e=>setForm({...form,tarih:e.target.value})} /></div>
              <div className="form-grup">
                <label>Kategori</label>
                <select value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})}>
                  {KATEGORILER.map(k=><option key={k}>{k}</option>)}
                </select>
              </div>
              <div className="form-grup"><label>Hedef</label><input type="number" value={form.hedef} onChange={e=>setForm({...form,hedef:e.target.value})} /></div>
              <div className="form-grup"><label>Gerçek</label><input type="number" value={form.gercek} onChange={e=>setForm({...form,gercek:e.target.value})} /></div>
            </div>
            <button className="btn btn-primary" style={{marginTop:16}} onClick={kaydet}>Kaydet</button>
          </div>
        </div>
      )}
    </div>
  );
}
