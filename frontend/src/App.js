import React, { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, useNavigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import UretimPage from "./pages/UretimPage";
import KalitePage from "./pages/KalitePage";
import { ReproPage, EmbossPage, SiparisPage } from "./pages/OtherPages";
import PlanlamaPage from "./pages/PlanlamaPage";
import "./App.css";

const LOK_LABEL = { cigli: "Çiğli", esbas: "ESBAŞ", karaman: "Karaman" };

export default function App() {
  const [lokasyon, setLokasyon] = useState("cigli");

  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">Asakai</span>
          </div>

          <div className="lok-secici">
            {Object.entries(LOK_LABEL).map(([k, v]) => (
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
            <NavLink to="/" end className={({isActive}) => isActive ? "nav-item aktif" : "nav-item"}>
              <span className="nav-icon">◈</span> Dashboard
            </NavLink>
            <NavLink to="/planlama" className={({isActive}) => isActive ? "nav-item aktif" : "nav-item"}>
              <span className="nav-icon">◷</span> Planlama
            </NavLink>
            <NavLink to="/uretim" className={({isActive}) => isActive ? "nav-item aktif" : "nav-item"}>
              <span className="nav-icon">◉</span> Üretim
            </NavLink>
            <NavLink to="/kalite" className={({isActive}) => isActive ? "nav-item aktif" : "nav-item"}>
              <span className="nav-icon">◎</span> Kalite
            </NavLink>
            <NavLink to="/repro" className={({isActive}) => isActive ? "nav-item aktif" : "nav-item"}>
              <span className="nav-icon">◌</span> Repro
            </NavLink>
            <NavLink to="/emboss" className={({isActive}) => isActive ? "nav-item aktif" : "nav-item"}>
              <span className="nav-icon">◍</span> Emboss
            </NavLink>
            <NavLink to="/siparis" className={({isActive}) => isActive ? "nav-item aktif" : "nav-item"}>
              <span className="nav-icon">◑</span> Sipariş
            </NavLink>
          </nav>

          <div className="sidebar-footer">
            <span>Lokasyon: <b>{LOK_LABEL[lokasyon]}</b></span>
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/"          element={<Dashboard   lokasyon={lokasyon} />} />
            <Route path="/planlama"  element={<PlanlamaPage lokasyon={lokasyon} />} />
            <Route path="/uretim"    element={<UretimPage  lokasyon={lokasyon} />} />
            <Route path="/kalite"    element={<KalitePage  lokasyon={lokasyon} />} />
            <Route path="/repro"     element={<ReproPage />} />
            <Route path="/emboss"    element={<EmbossPage />} />
            <Route path="/siparis"   element={<SiparisPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
