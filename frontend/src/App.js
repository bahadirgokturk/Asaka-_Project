import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UretimPage from "./pages/UretimPage";
import KalitePage from "./pages/KalitePage";
import { ReproPage, EmbossPage, SiparisPage } from "./pages/OtherPages";
import PlanlamaPage from "./pages/PlanlamaPage";
import LoginPage from "./pages/LoginPage";
import AksiyonPage from "./pages/AksiyonPage";
import "./App.css";

const LOK_LABEL = { cigli: "Çiğli", esbas: "ESBAŞ", karaman: "Karaman" };

export const UserContext = createContext(null);
export const useUser = () => useContext(UserContext);

function AdminOnly({ children }) {
  const { user } = useUser();
  if (user?.rol !== "admin") {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", height: "60vh", gap: 12,
      }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ color: "#8b949e", fontSize: 14 }}>
          Bu sayfaya erişim için admin yetkisi gerekiyor.
        </div>
      </div>
    );
  }
  return children;
}

function Sidebar({ lokasyon, setLokasyon }) {
  const { user, cikisYap } = useUser();
  const isAdmin = user?.rol === "admin";

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">⬡</span>
        <span className="logo-text">Asakai</span>
      </div>

      <div className="lok-secici">
        {Object.entries(LOK_LABEL)
          .filter(([k]) => isAdmin || user?.lokasyon === k)
          .map(([k, v]) => (
            <button
              key={k}
              className={lokasyon === k ? "lok-btn aktif" : "lok-btn"}
              onClick={() => setLokasyon(k)}
            >
              {v}
            </button>
          ))}
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? "nav-item aktif" : "nav-item"}>
          <span className="nav-icon">◈</span> Dashboard
        </NavLink>
        <NavLink to="/planlama" className={({ isActive }) => isActive ? "nav-item aktif" : "nav-item"}>
          <span className="nav-icon">◷</span> Planlama
        </NavLink>
        <NavLink to="/uretim" className={({ isActive }) => isActive ? "nav-item aktif" : "nav-item"}>
          <span className="nav-icon">◉</span> Üretim
        </NavLink>
        <NavLink to="/kalite" className={({ isActive }) => isActive ? "nav-item aktif" : "nav-item"}>
          <span className="nav-icon">◎</span> Kalite
        </NavLink>
        <NavLink to="/repro" className={({ isActive }) => isActive ? "nav-item aktif" : "nav-item"}>
          <span className="nav-icon">◌</span> Repro
        </NavLink>
        <NavLink to="/emboss" className={({ isActive }) => isActive ? "nav-item aktif" : "nav-item"}>
          <span className="nav-icon">◍</span> Emboss
        </NavLink>
        <NavLink to="/siparis" className={({ isActive }) => isActive ? "nav-item aktif" : "nav-item"}>
          <span className="nav-icon">◑</span> Sipariş
        </NavLink>
        <NavLink to="/aksiyon" className={({ isActive }) => isActive ? "nav-item aktif" : "nav-item"}>
          <span className="nav-icon">◆</span> Aksiyon
        </NavLink>
        {isAdmin && (
          <NavLink to="/kullanicilar" className={({ isActive }) => isActive ? "nav-item aktif" : "nav-item"}>
            <span className="nav-icon">◐</span> Kullanıcılar
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: 11, color: "#8b949e", marginBottom: 6 }}>
          <span style={{
            display: "inline-block", padding: "2px 8px",
            background: user?.rol === "admin" ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
            border: `1px solid ${user?.rol === "admin" ? "rgba(34,197,94,0.3)" : "rgba(59,130,246,0.3)"}`,
            borderRadius: 4, fontSize: 10,
            color: user?.rol === "admin" ? "#22c55e" : "#3b82f6",
            marginBottom: 4,
          }}>
            {user?.rol === "admin" ? "ADMİN" : "SORUMLU"}
          </span>
          <div style={{ marginTop: 4 }}>{user?.ad_soyad}</div>
        </div>
        <button
          onClick={cikisYap}
          style={{
            width: "100%", padding: "7px", background: "transparent",
            border: "1px solid #21262d", borderRadius: 6,
            color: "#8b949e", fontSize: 11, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.target.style.borderColor = "#ef4444"; e.target.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#21262d"; e.target.style.color = "#8b949e"; }}
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}

function KullanicilarPage() {
  const [liste, setListe] = useState([]);
  const [form, setForm] = useState({ ad_soyad: "", kullanici_adi: "", sifre: "", rol: "sorumlu", lokasyon: "cigli" });
  const [mesaj, setMesaj] = useState("");

  const yukle = () => fetch("/api/auth/kullanicilar").then(r => r.json()).then(setListe);
  useEffect(() => { yukle(); }, []);

  const ekle = async () => {
    const res = await fetch("/api/auth/kullanici-ekle", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { setMesaj("✓ Kullanıcı eklendi"); yukle(); setForm({ ad_soyad: "", kullanici_adi: "", sifre: "", rol: "sorumlu", lokasyon: "cigli" }); setTimeout(() => setMesaj(""), 3000); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Kullanıcı Yönetimi</div>
          <div className="page-sub">Admin paneli — kullanıcı ekle ve yönet</div>
        </div>
        {mesaj && <span className="rozet yesil">{mesaj}</span>}
      </div>

      <div className="tablo-kap" style={{ marginBottom: 20 }}>
        <div className="tablo-baslik"><h3>Yeni Kullanıcı Ekle</h3></div>
        <div style={{ padding: 20 }}>
          <div className="form-grid">
            <div className="form-grup">
              <label>Ad Soyad</label>
              <input type="text" value={form.ad_soyad} onChange={e => setForm({ ...form, ad_soyad: e.target.value })} />
            </div>
            <div className="form-grup">
              <label>Kullanıcı Adı</label>
              <input type="text" value={form.kullanici_adi} onChange={e => setForm({ ...form, kullanici_adi: e.target.value })} />
            </div>
            <div className="form-grup">
              <label>Şifre</label>
              <input type="text" value={form.sifre} onChange={e => setForm({ ...form, sifre: e.target.value })} />
            </div>
            <div className="form-grup">
              <label>Rol</label>
              <select value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="sorumlu">Sorumlu</option>
              </select>
            </div>
            <div className="form-grup">
              <label>Lokasyon</label>
              <select value={form.lokasyon} onChange={e => setForm({ ...form, lokasyon: e.target.value })}>
                <option value="cigli">Çiğli</option>
                <option value="esbas">ESBAŞ</option>
                <option value="karaman">Karaman</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={ekle}>Kullanıcı Ekle</button>
        </div>
      </div>

      <div className="tablo-kap">
        <div className="tablo-baslik"><h3>Mevcut Kullanıcılar ({liste.length})</h3></div>
        <table>
          <thead>
            <tr><th>Ad Soyad</th><th>Kullanıcı Adı</th><th>Rol</th><th>Lokasyon</th></tr>
          </thead>
          <tbody>
            {liste.map((u, i) => (
              <tr key={i}>
                <td>{u.ad_soyad}</td>
                <td style={{ fontFamily: "monospace", color: "#22c55e" }}>{u.kullanici_adi}</td>
                <td>
                  <span className={`rozet ${u.rol === "admin" ? "yesil" : "mavi"}`}>
                    {u.rol === "admin" ? "Admin" : "Sorumlu"}
                  </span>
                </td>
                <td>{LOK_LABEL[u.lokasyon] || u.lokasyon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("asakai_user")); }
    catch { return null; }
  });
  const [lokasyon, setLokasyon] = useState("cigli");

  const cikisYap = () => {
    localStorage.removeItem("asakai_user");
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={(u) => { setUser(u); setLokasyon(u.lokasyon || "cigli"); }} />;
  }

  const aktifLokasyon = user.rol === "admin" ? lokasyon : user.lokasyon;

  return (
    <UserContext.Provider value={{ user, cikisYap }}>
      <BrowserRouter>
        <div className="app">
          <Sidebar lokasyon={aktifLokasyon} setLokasyon={setLokasyon} />
          <main className="main-content">
            <Routes>
              <Route path="/"             element={<Dashboard    lokasyon={aktifLokasyon} />} />
              <Route path="/planlama"     element={<PlanlamaPage lokasyon={aktifLokasyon} />} />
              <Route path="/uretim"       element={<UretimPage   lokasyon={aktifLokasyon} />} />
              <Route path="/kalite"       element={<KalitePage   lokasyon={aktifLokasyon} />} />
              <Route path="/repro"        element={<ReproPage />} />
              <Route path="/emboss"       element={<EmbossPage />} />
              <Route path="/siparis"      element={<SiparisPage />} />
              <Route path="/aksiyon"      element={<AksiyonPage />} />
              <Route path="/kullanicilar" element={<AdminOnly><KullanicilarPage /></AdminOnly>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}