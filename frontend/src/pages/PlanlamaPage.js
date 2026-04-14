import React, { useEffect, useState } from "react";

const AYLAR = ["","Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const GUNLER = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];

const OZET_SATIRLAR = [
  { key:"izmir_grv",   label:"İZMİR GRV PLAN",  isPlan:true  },
  { key:"izmir_sevk",  label:"İZMİR GRV SEVK",  isPlan:false },
  { key:"ispak_grv",   label:"İSPAK GRV PLAN",  isPlan:true  },
  { key:"ispak_sevk",  label:"İSPAK GRV SEVK",  isPlan:false },
  { key:"esbas_plan",  label:"ESBAŞ ÇELİK PLAN",isPlan:true  },
  { key:"esbas_sevk",  label:"ESBAŞ ÇELİK SEVK",isPlan:false },
];

const bosluk = () => ({ top:"", gun:"21", ort:"", planli:"", br_saat:"" });

export default function PlanlamaPage({ lokasyon }) {
  const bugun = new Date();
  const [yil, setYil] = useState(bugun.getFullYear());
  const [ay, setAy]   = useState(bugun.getMonth()+1);
  const [gunler, setGunler]       = useState([]);
  const [seciliGun, setSeciliGun] = useState(null);
  const [form, setForm] = useState({ grv_plan:"", bakir_plan:"", sevk_plan:"" });
  const [mesaj, setMesaj] = useState("");
  const [ozet, setOzet]   = useState(Object.fromEntries(OZET_SATIRLAR.map(r=>[r.key, bosluk()])));

  const yukle = () => {
    fetch(`/api/planlama/takvim?yil=${yil}&ay=${ay}&lokasyon=${lokasyon}`)
      .then(r=>r.json()).then(d=>setGunler(d.gunler||[]));
  };
  useEffect(yukle, [yil, ay, lokasyon]);

  const ilkGun = new Date(yil, ay-1, 1).getDay();
  const offset  = ilkGun === 0 ? 6 : ilkGun - 1;
  const sonGun  = new Date(yil, ay, 0).getDate();
  const gunMap  = Object.fromEntries(gunler.map(g=>[g.tarih, g]));

  const kaydet = async () => {
    if (!seciliGun) return;
    const tarih = `${yil}-${String(ay).padStart(2,"0")}-${String(seciliGun).padStart(2,"0")}`;
    await fetch("/api/planlama/kaydet", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ tarih, lokasyon,
        grv_plan:   form.grv_plan   ? +form.grv_plan   : null,
        bakir_plan: form.bakir_plan ? +form.bakir_plan : null,
        sevk_plan:  form.sevk_plan  ? +form.sevk_plan  : null,
      })
    });
    setMesaj("✓ Kaydedildi"); yukle();
    setTimeout(()=>setMesaj(""), 2000);
  };

  const gunSec = (n) => {
    setSeciliGun(n);
    const tarih = `${yil}-${String(ay).padStart(2,"0")}-${String(n).padStart(2,"0")}`;
    const g = gunMap[tarih];
    setForm(g ? { grv_plan:g.grv_plan??"", bakir_plan:g.bakir_plan??"", sevk_plan:g.sevk_plan??"" }
               : { grv_plan:"", bakir_plan:"", sevk_plan:"" });
  };

  const ozetGuncelle = (key, alan, val) => {
    setOzet(prev => {
      const yeni = { ...prev, [key]: { ...prev[key], [alan]: val } };
      const t = parseFloat(yeni[key].top);
      const g = parseFloat(yeni[key].gun);
      if (!isNaN(t) && !isNaN(g) && g > 0) yeni[key].ort = (t/g).toFixed(1);
      else yeni[key].ort = "";
      return yeni;
    });
  };

  const bugunStr = bugun.toISOString().slice(0,10);

  const hucre = (n) => {
    const tarih = `${yil}-${String(ay).padStart(2,"0")}-${String(n).padStart(2,"0")}`;
    const g = gunMap[tarih];
    const aktif = seciliGun === n;
    const bugunku = tarih === bugunStr;
    return (
      <div key={n} onClick={()=>gunSec(n)} style={{
        minHeight:56, borderRadius:5, padding:"4px 5px", cursor:"pointer",
        background: aktif ? "#1d4ed8" : "var(--bg2)",
        border:`1px solid ${bugunku?"#3b82f6": aktif?"#1d4ed8":"var(--border)"}`,
        transition:"border-color 0.15s",
      }}>
        <div style={{fontSize:10, color: aktif?"#bfdbfe":"var(--text3)", marginBottom:2}}>{n}</div>
        {g && <div style={{fontSize:10, lineHeight:1.4}}>
          {g.grv_plan   && <div style={{color:"#4ade80"}}>G:{g.grv_plan}</div>}
          {g.bakir_plan && <div style={{color:"#fbbf24"}}>B:{g.bakir_plan}</div>}
          {g.sevk_plan  && <div style={{color:"#60a5fa"}}>S:{g.sevk_plan}</div>}
          {g.gercek!=null && <div style={{color:"#f87171"}}>↑{g.gercek}</div>}
        </div>}
      </div>
    );
  };

  const grid = [
    ...Array(offset).fill(null).map((_,i)=><div key={`b${i}`} style={{minHeight:56}}/>),
    ...Array.from({length:sonGun},(_,i)=>hucre(i+1))
  ];

  const inp = (key, alan, w=70) => (
    <input type="number" value={ozet[key][alan]}
      onChange={e=>ozetGuncelle(key, alan, e.target.value)}
      style={{
        width:w, background:"var(--bg3)", border:"1px solid var(--border)",
        borderRadius:4, padding:"4px 6px", color:"var(--text)", fontSize:13,
        outline:"none"
      }}
    />
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Planlama</div>
          <div className="page-sub">Güne tıkla → plan gir &nbsp;·&nbsp; Altta özet tablo</div>
        </div>
        {mesaj && <span className="rozet yesil">{mesaj}</span>}
      </div>

      {/* Navigasyon */}
      <div className="filtre-bar" style={{marginBottom:12}}>
        <button className="btn btn-outline btn-sm"
          onClick={()=>{if(ay===1){setAy(12);setYil(y=>y-1);}else setAy(a=>a-1);}}>← Önceki</button>
        <b style={{fontSize:15, minWidth:130, textAlign:"center"}}>{AYLAR[ay]} {yil}</b>
        <button className="btn btn-outline btn-sm"
          onClick={()=>{if(ay===12){setAy(1);setYil(y=>y+1);}else setAy(a=>a+1);}}>Sonraki →</button>
        <div style={{marginLeft:"auto", fontSize:11, color:"var(--text3)", display:"flex", gap:10}}>
          <span><span style={{color:"#4ade80"}}>■</span> GRV</span>
          <span><span style={{color:"#fbbf24"}}>■</span> Bakır</span>
          <span><span style={{color:"#60a5fa"}}>■</span> Sevk</span>
          <span><span style={{color:"#f87171"}}>■</span> Gerçek</span>
        </div>
      </div>

      {/* TAKVİM + DETAY yan yana */}
      <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3}}>
            {GUNLER.map(g=>(
              <div key={g} style={{textAlign:"center",padding:"4px 0",
                fontSize:10,color:"var(--text3)",fontWeight:600,textTransform:"uppercase"}}>{g}</div>
            ))}
            {grid}
          </div>
        </div>

        {seciliGun && (
          <div style={{width:190, flexShrink:0}}>
            <div className="tablo-kap">
              <div className="tablo-baslik" style={{padding:"10px 14px"}}>
                <h3 style={{fontSize:13}}>{seciliGun} {AYLAR[ay]} {yil}</h3>
              </div>
              <div style={{padding:"12px", display:"flex", flexDirection:"column", gap:8}}>
                {[["grv_plan","GRV Plan"],["bakir_plan","Bakır Plan"],["sevk_plan","Sevk Plan"]].map(([k,l])=>(
                  <div key={k} className="form-grup">
                    <label>{l}</label>
                    <input type="number" value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />
                  </div>
                ))}
                <button className="btn btn-primary" style={{fontSize:12,padding:"6px 10px"}} onClick={kaydet}>Kaydet</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ÖZET TABLO */}
      <div className="tablo-kap" style={{marginTop:18}}>
        <div className="tablo-baslik">
          <h3>Plan & Sevk Özet — {AYLAR[ay]} {yil}</h3>
          <span style={{fontSize:11,color:"var(--text3)"}}>ORT. otomatik hesaplanır (TOP ÷ GÜN)</span>
        </div>
        <table>
          <thead>
            <tr>
              <th style={{width:180}}>Kategori</th>
              <th>TOP</th>
              <th>GÜN</th>
              <th>ORT.</th>
              <th>PLANLI</th>
              <th>BR / SAAT</th>
            </tr>
          </thead>
          <tbody>
            {OZET_SATIRLAR.map(({key, label, isPlan})=>{
              const d = ozet[key];
              return (
                <tr key={key}>
                  <td>
                    <span style={{
                      display:"inline-block", padding:"2px 10px", borderRadius:4, fontSize:11,
                      fontWeight:600, background: isPlan?"#166534":"#14532d", color:"#bbf7d0"
                    }}>{label}</span>
                  </td>
                  <td>{inp(key,"top",68)}</td>
                  <td>{inp(key,"gun",50)}</td>
                  <td style={{fontWeight:700, color:"#4ade80", fontSize:14, minWidth:50}}>
                    {d.ort || "—"}
                  </td>
                  <td>{inp(key,"planli",60)}</td>
                  <td>
                    <input type="number" value={d.br_saat}
                      onChange={e=>ozetGuncelle(key,"br_saat",e.target.value)}
                      style={{
                        width:60, background:"var(--bg3)", border:"1px solid var(--border)",
                        borderRadius:4, padding:"4px 6px", color:"#4ade80",
                        fontSize:13, fontWeight:700, outline:"none"
                      }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}

