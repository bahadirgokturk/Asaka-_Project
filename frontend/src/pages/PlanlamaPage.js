import React, { useEffect, useState } from "react";

const AYLAR = ["","Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const GUNLER = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];

export default function PlanlamaPage({ lokasyon }) {
  const bugun = new Date();
  const [yil, setYil] = useState(bugun.getFullYear());
  const [ay, setAy] = useState(bugun.getMonth()+1);
  const [gunler, setGunler] = useState([]);
  const [seciliGun, setSeciliGun] = useState(null);
  const [form, setForm] = useState({ grv_plan:"", bakir_plan:"", sevk_plan:"" });
  const [mesaj, setMesaj] = useState("");

  const yukle = () => {
    fetch(`/api/planlama/takvim?yil=${yil}&ay=${ay}&lokasyon=${lokasyon}`)
      .then(r=>r.json()).then(d=>setGunler(d.gunler||[]));
  };

  useEffect(yukle, [yil, ay, lokasyon]);

  // Takvim grid oluştur
  const ilkGun = new Date(yil, ay-1, 1).getDay(); // 0=Pazar
  const offset = ilkGun === 0 ? 6 : ilkGun - 1; // Pazartesi başlasın
  const sonGun = new Date(yil, ay, 0).getDate();

  const gunMap = {};
  gunler.forEach(g => { gunMap[g.tarih] = g; });

  const kaydet = async () => {
    if (!seciliGun) return;
    const tarih = `${yil}-${String(ay).padStart(2,"0")}-${String(seciliGun).padStart(2,"0")}`;
    await fetch("/api/planlama/kaydet", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ tarih, lokasyon,
        grv_plan: form.grv_plan ? +form.grv_plan : null,
        bakir_plan: form.bakir_plan ? +form.bakir_plan : null,
        sevk_plan: form.sevk_plan ? +form.sevk_plan : null,
      })
    });
    setMesaj("✓ Kaydedildi");
    yukle();
    setTimeout(()=>setMesaj(""),2000);
  };

  const gunSec = (gunNo) => {
    setSeciliGun(gunNo);
    const tarih = `${yil}-${String(ay).padStart(2,"0")}-${String(gunNo).padStart(2,"0")}`;
    const g = gunMap[tarih];
    if (g) setForm({ grv_plan: g.grv_plan??"", bakir_plan: g.bakir_plan??"", sevk_plan: g.sevk_plan??"" });
    else setForm({ grv_plan:"", bakir_plan:"", sevk_plan:"" });
  };

  const hucre = (gunNo) => {
    const tarih = `${yil}-${String(ay).padStart(2,"0")}-${String(gunNo).padStart(2,"0")}`;
    const g = gunMap[tarih];
    const bugunStr = bugun.toISOString().slice(0,10);
    const cls = ["takvim-gun", tarih===bugunStr?"bugun":"", seciliGun===gunNo?"aktif-gun":""].join(" ");
    return (
      <div key={gunNo} className={cls} onClick={()=>gunSec(gunNo)}>
        <div className="takvim-gun-no">{gunNo}</div>
        {g && <div className="takvim-deger">
          {g.grv_plan && <div><span className="hedef">GRV: </span><span className="gercek">{g.grv_plan}</span></div>}
          {g.bakir_plan && <div><span className="hedef">BKR: </span><span className="gercek">{g.bakir_plan}</span></div>}
          {g.sevk_plan && <div><span className="hedef">SVK: </span><span className="gercek">{g.sevk_plan}</span></div>}
          {g.gercek != null && <div><span className="bozulan">↑{g.gercek}</span></div>}
        </div>}
      </div>
    );
  };

  const grid = [];
  for (let i=0; i<offset; i++) grid.push(<div key={`b${i}`} className="takvim-gun bos" />);
  for (let g=1; g<=sonGun; g++) grid.push(hucre(g));

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Planlama Takvimi</div>
          <div className="page-sub">Güne tıklayarak plan girin</div>
        </div>
        {mesaj && <span className="rozet yesil">{mesaj}</span>}
      </div>

      {/* Ay navigasyon */}
      <div className="filtre-bar">
        <button className="btn btn-outline btn-sm" onClick={()=>{ if(ay===1){setAy(12);setYil(y=>y-1);}else setAy(a=>a-1); }}>← Önceki</button>
        <b style={{fontSize:16}}>{AYLAR[ay]} {yil}</b>
        <button className="btn btn-outline btn-sm" onClick={()=>{ if(ay===12){setAy(1);setYil(y=>y+1);}else setAy(a=>a+1); }}>Sonraki →</button>
        <span style={{marginLeft:"auto",fontSize:12,color:"#64748b"}}>Lokasyon: {lokasyon}</span>
      </div>

      <div style={{display:"flex",gap:20}}>
        {/* TAKVİM */}
        <div style={{flex:1}}>
          <div className="takvim-grid">
            {GUNLER.map(g=><div key={g} className="takvim-gun-baslik">{g}</div>)}
            {grid}
          </div>
        </div>

        {/* GÜN DETAYI */}
        {seciliGun && (
          <div style={{width:240}}>
            <div className="tablo-kap">
              <div className="tablo-baslik">
                <h3>{seciliGun} {AYLAR[ay]} {yil}</h3>
              </div>
              <div style={{padding:"16px"}}>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <div className="form-grup">
                    <label>GRV Plan</label>
                    <input type="number" value={form.grv_plan} onChange={e=>setForm({...form,grv_plan:e.target.value})} />
                  </div>
                  <div className="form-grup">
                    <label>Bakır Plan</label>
                    <input type="number" value={form.bakir_plan} onChange={e=>setForm({...form,bakir_plan:e.target.value})} />
                  </div>
                  <div className="form-grup">
                    <label>Sevk Plan</label>
                    <input type="number" value={form.sevk_plan} onChange={e=>setForm({...form,sevk_plan:e.target.value})} />
                  </div>
                  <button className="btn btn-primary" onClick={kaydet}>Kaydet</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
