import React, { useState } from "react";

export default function LoginPage({ onLogin }) {
  const [kullanici_adi, setKullaniciAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  const girisYap = async () => {
    if (!kullanici_adi || !sifre) { setHata("Lütfen tüm alanları doldurun"); return; }
    setYukleniyor(true);
    setHata("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kullanici_adi, sifre }),
      });
      if (res.ok) {
        const user = await res.json();
        localStorage.setItem("asakai_user", JSON.stringify(user));
        onLogin(user);
      } else {
        setHata("Kullanıcı adı veya şifre hatalı");
      }
    } catch {
      setHata("Sunucuya bağlanılamadı");
    } finally {
      setYukleniyor(false);
    }
  };

  const handleKeyDown = (e) => { if (e.key === "Enter") girisYap(); };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#0d1117",
      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    }}>
      {/* Arka plan grid */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        backgroundImage: "linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div style={{
        width: 380,
        background: "#161b22",
        border: "1px solid #21262d",
        borderRadius: 12,
        padding: "40px 36px",
        position: "relative",
        boxShadow: "0 0 40px rgba(34,197,94,0.08)",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52,
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24, margin: "0 auto 12px",
            boxShadow: "0 0 20px rgba(34,197,94,0.3)",
          }}>⬡</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#e6edf3", letterSpacing: 2 }}>
            ASAKAI
          </div>
          <div style={{ fontSize: 11, color: "#484f58", marginTop: 4, letterSpacing: 1 }}>
            HEDEF TAKİP SİSTEMİ
          </div>
        </div>

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: "#8b949e", letterSpacing: 1, display: "block", marginBottom: 6 }}>
              KULLANICI ADI
            </label>
            <input
              type="text"
              value={kullanici_adi}
              onChange={e => setKullaniciAdi(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#0d1117", border: "1px solid #30363d",
                borderRadius: 8, padding: "10px 14px",
                color: "#e6edf3", fontSize: 14,
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#22c55e"}
              onBlur={e => e.target.style.borderColor = "#30363d"}
            />
          </div>

          <div>
            <label style={{ fontSize: 11, color: "#8b949e", letterSpacing: 1, display: "block", marginBottom: 6 }}>
              ŞİFRE
            </label>
            <input
              type="password"
              value={sifre}
              onChange={e => setSifre(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#0d1117", border: "1px solid #30363d",
                borderRadius: 8, padding: "10px 14px",
                color: "#e6edf3", fontSize: 14,
                outline: "none", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "#22c55e"}
              onBlur={e => e.target.style.borderColor = "#30363d"}
            />
          </div>

          {hata && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "10px 14px",
              color: "#f87171", fontSize: 12, textAlign: "center",
            }}>
              {hata}
            </div>
          )}

          <button
            onClick={girisYap}
            disabled={yukleniyor}
            style={{
              width: "100%", padding: "12px",
              background: yukleniyor ? "#166534" : "linear-gradient(135deg, #22c55e, #16a34a)",
              border: "none", borderRadius: 8,
              color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: yukleniyor ? "not-allowed" : "pointer",
              letterSpacing: 1, marginTop: 4,
              transition: "opacity 0.2s",
              fontFamily: "inherit",
            }}
          >
            {yukleniyor ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
          </button>
        </div>

        {/* Alt bilgi */}
        <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "#484f58" }}>
          Saueressig Türkiye · OPEX Departmanı
        </div>
      </div>
    </div>
  );
}
