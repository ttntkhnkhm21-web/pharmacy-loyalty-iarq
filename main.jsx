import { useState, useEffect } from "react";

const CATEGORIES = [
  { id: "high", label: "🟢 هامش عالي", examples: "فيتامينات، مستحضرات، OTC", discountPct: 5, color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
  { id: "mid", label: "🟡 هامش متوسط", examples: "مضادات حيوية، مسكنات", discountPct: 3, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  { id: "low", label: "🔴 هامش محدود", examples: "أدوية مزمنة، ضغط، سكر", discountPct: 1, color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" }
];

function calcPoints(amount, categoryId) {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? Math.floor(amount * (cat.discountPct / 100)) : 0;
}

// ===== Supabase Client =====
function createSupabase(url, key) {
  const headers = { "Content-Type": "application/json", "apikey": key, "Authorization": `Bearer ${key}` };
  return {
    from: (table) => ({
      select: (cols = "*") => ({
        eq: (col, val) => fetch(`${url}/rest/v1/${table}?select=${cols}&${col}=eq.${val}`, { headers }).then(r => r.json()),
        then: (fn) => fetch(`${url}/rest/v1/${table}?select=${cols}`, { headers }).then(r => r.json()).then(fn)
      }),
      insert: (data) => fetch(`${url}/rest/v1/${table}`, { method: "POST", headers: { ...headers, "Prefer": "return=representation" }, body: JSON.stringify(data) }).then(r => r.json()),
      update: (data) => ({
        eq: (col, val) => fetch(`${url}/rest/v1/${table}?${col}=eq.${val}`, { method: "PATCH", headers: { ...headers, "Prefer": "return=representation" }, body: JSON.stringify(data) }).then(r => r.json())
      }),
      delete: () => ({
        eq: (col, val) => fetch(`${url}/rest/v1/${table}?${col}=eq.${val}`, { method: "DELETE", headers }).then(r => r.json())
      })
    })
  };
}

// ===== إعداد Supabase =====
function SetupScreen({ onSave }) {
  const [form, setForm] = useState({ url: "", key: "" });
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.url || !form.key) return setError("أكمل جميع الحقول");
    setTesting(true);
    setError("");
    try {
      const res = await fetch(`${form.url}/rest/v1/pharmacies?select=id&limit=1`, {
        headers: { "apikey": form.key, "Authorization": `Bearer ${form.key}` }
      });
      if (res.ok) {
        onSave(form);
      } else {
        setError("فشل الاتصال — تحقق من المفاتيح");
      }
    } catch {
      setError("خطأ بالاتصال — تحقق من الـ URL");
    }
    setTesting(false);
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e, #0d1b2a)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', Tahoma, sans-serif"
    }}>
      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 70, height: 70, borderRadius: 20,
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, margin: "0 auto 14px", boxShadow: "0 16px 48px rgba(59,130,246,0.3)"
          }}>💊</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>إعداد قاعدة البيانات</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>أدخل مفاتيح Supabase لتفعيل النظام</div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24, padding: 28
        }}>
          {[
            { label: "Project URL", key: "url", placeholder: "https://xxxx.supabase.co" },
            { label: "Anon Key", key: "key", placeholder: "eyJhbGciOiJIUzI1NiIsInR5cCI6..." },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, display: "block" }}>{f.label}</label>
              <input value={form[f.key]} onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setError(""); }}
                placeholder={f.placeholder} type="text"
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 13,
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.12)"}`,
                  color: "#fff", boxSizing: "border-box", fontFamily: "monospace"
                }} />
            </div>
          ))}

          {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>❌ {error}</div>}

          <button onClick={handleSave} disabled={testing} style={{
            width: "100%", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700,
            background: testing ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg, #3b82f6, #06b6d4)",
            color: "#fff", border: "none", cursor: testing ? "not-allowed" : "pointer"
          }}>
            {testing ? "⏳ جاري الاتصال..." : "🔌 اتصال وحفظ"}
          </button>

          <div style={{
            marginTop: 16, padding: "12px", borderRadius: 10,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)",
            fontSize: 12, color: "#f59e0b"
          }}>
            💡 المفاتيح تُحفظ بجهازك فقط ولا تُرسل لأي مكان آخر
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== تسجيل صيدلية جديدة =====
function RegisterScreen({ supabase, onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) return setError("أكمل جميع الحقول");
    if (form.password !== form.confirm) return setError("كلمة السر غير متطابقة");
    if (form.password.length < 6) return setError("كلمة السر 6 أحرف على الأقل");
    setLoading(true);
    setError("");
    try {
      const hash = btoa(form.password);
      const res = await supabase.from("pharmacies").insert({ name: form.name, email: form.email, password_hash: hash });
      if (res.error || (Array.isArray(res) && res[0]?.code)) {
        setError("الإيميل مسجل مسبقاً أو حدث خطأ");
      } else {
        const pharmacy = Array.isArray(res) ? res[0] : res;
        onLogin(pharmacy);
      }
    } catch {
      setError("خطأ بالاتصال");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>تسجيل صيدلية جديدة 🏥</div>
      <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>أنشئ حساباً خاصاً بصيدليتك</div>

      {[
        { label: "اسم الصيدلية", key: "name", placeholder: "صيدلية الشفاء", type: "text" },
        { label: "الإيميل", key: "email", placeholder: "pharmacy@email.com", type: "email" },
        { label: "كلمة السر", key: "password", placeholder: "6 أحرف على الأقل", type: "password" },
        { label: "تأكيد كلمة السر", key: "confirm", placeholder: "أعد كتابة كلمة السر", type: "password" },
      ].map(f => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 5, display: "block" }}>{f.label}</label>
          <input value={form[f.key]} onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setError(""); }}
            placeholder={f.placeholder} type={f.type}
            style={{
              width: "100%", padding: "11px 14px", borderRadius: 10, fontSize: 14,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              color: "#fff", boxSizing: "border-box"
            }} />
        </div>
      ))}

      {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>❌ {error}</div>}

      <button onClick={handleRegister} disabled={loading} style={{
        width: "100%", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700,
        background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", border: "none", cursor: "pointer"
      }}>
        {loading ? "⏳ جاري التسجيل..." : "✅ تسجيل الصيدلية"}
      </button>
    </div>
  );
}

// ===== تسجيل الدخول =====
function LoginScreen({ supabase, onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const handleLogin = async () => {
    if (!form.email || !form.password) return setError("أكمل الحقول");
    setLoading(true); setError("");
    try {
      const hash = btoa(form.password);
      const res = await supabase.from("pharmacies").select("*").eq("email", form.email);
      const pharmacy = Array.isArray(res) ? res.find(p => p.password_hash === hash) : null;
      if (pharmacy) {
        onLogin(pharmacy);
      } else {
        setError("إيميل أو كلمة سر غير صحيحة");
        setShake(true); setTimeout(() => setShake(false), 500);
      }
    } catch { setError("خطأ بالاتصال"); }
    setLoading(false);
  };

  return (
    <div dir="rtl" style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e, #0d1b2a)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', Tahoma, sans-serif"
    }}>
      <style>{`
        @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-8px)}80%{transform:translateX(8px)}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        input,select{outline:none;}
        input:focus{border-color:#3b82f6!important;box-shadow:0 0 0 3px rgba(59,130,246,0.15)!important;}
        .tab-btn{transition:all 0.2s;cursor:pointer;border:none;}
        .row-hover:hover{background:rgba(59,130,246,0.08)!important;}
        .cat-card{transition:all 0.2s;cursor:pointer;}
        .cat-card:hover{transform:translateY(-2px);}
      `}</style>

      <div style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 70, height: 70, borderRadius: 20,
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, margin: "0 auto 14px"
          }}>💊</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>نظام الولاء الصيدلاني</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>منصة متعددة الصيدليات</div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 24, overflow: "hidden",
          animation: shake ? "shake 0.4s ease" : "none"
        }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {[{ key: "login", label: "دخول" }, { key: "register", label: "تسجيل جديد" }].map(t => (
              <button key={t.key} onClick={() => { setTab(t.key); setError(""); }} className="tab-btn"
                style={{
                  flex: 1, padding: "14px", fontSize: 14, fontWeight: 600,
                  background: tab === t.key ? "rgba(59,130,246,0.15)" : "transparent",
                  color: tab === t.key ? "#3b82f6" : "#64748b",
                  borderBottom: tab === t.key ? "2px solid #3b82f6" : "2px solid transparent"
                }}>{t.label}</button>
            ))}
          </div>

          <div style={{ padding: 24 }}>
            {tab === "login" ? (
              <>
                {[
                  { label: "الإيميل", key: "email", type: "email", placeholder: "pharmacy@email.com" },
                  { label: "كلمة السر", key: "password", type: "password", placeholder: "••••••••" },
                ].map(f => (
                  <div key={f.key} style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 5, display: "block" }}>{f.label}</label>
                    <input value={form[f.key]} onChange={e => { setForm({ ...form, [f.key]: e.target.value }); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && handleLogin()}
                      type={f.type} placeholder={f.placeholder}
                      style={{
                        width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                        color: "#fff", boxSizing: "border-box"
                      }} />
                  </div>
                ))}
                {error && <div style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>❌ {error}</div>}
                <button onClick={handleLogin} disabled={loading} style={{
                  width: "100%", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                  background: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "#fff", border: "none", cursor: "pointer"
                }}>{loading ? "⏳ جاري الدخول..." : "دخول ←"}</button>
              </>
            ) : (
              <RegisterScreen supabase={supabase} onLogin={onLogin} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== النظام الرئيسي =====
export default function PharmacyLoyalty() {
  const [supabaseConfig, setSupabaseConfig] = useState(null);
  const [supabase, setSupabase] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [patients, setPatients] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newPatient, setNewPatient] = useState({ name: "", phone: "" });
  const [purchase, setPurchase] = useState({ patientId: "", amount: "", categoryId: "" });
  const [redeemId, setRedeemId] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [foundPatient, setFoundPatient] = useState(null);
  const [toast, setToast] = useState(null);
  const [showLogout, setShowLogout] = useState(false);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadPatients = async (sb, pharmacyId) => {
    const res = await sb.from("patients").select("*").eq("pharmacy_id", pharmacyId);
    if (Array.isArray(res)) setPatients(res);
  };

  useEffect(() => {
    if (supabase && pharmacy) loadPatients(supabase, pharmacy.id);
  }, [supabase, pharmacy]);

  const handleSetup = (config) => {
    const sb = createSupabase(config.url, config.key);
    setSupabaseConfig(config);
    setSupabase(sb);
  };

  const handleLogin = (ph) => setPharmacy(ph);

  const addPatient = async () => {
    if (!newPatient.name || !newPatient.phone) return showToast("أكمل البيانات", "error");
    if (patients.find(p => p.phone === newPatient.phone)) return showToast("الرقم موجود مسبقاً", "error");
    setLoading(true);
    const res = await supabase.from("patients").insert({ ...newPatient, pharmacy_id: pharmacy.id, points: 0, total_spent: 0, visits: 0 });
    if (Array.isArray(res) && res[0]?.id) {
      setPatients([...patients, res[0]]);
      setNewPatient({ name: "", phone: "" });
      showToast(`تم تسجيل ${res[0].name} ✓`);
    } else showToast("خطأ بالتسجيل", "error");
    setLoading(false);
  };

  const recordPurchase = async () => {
    const amt = parseInt(purchase.amount);
    if (!purchase.patientId || !amt || amt < 1000 || !purchase.categoryId) return showToast("أكمل جميع الحقول", "error");
    const earned = calcPoints(amt, purchase.categoryId);
    const cat = CATEGORIES.find(c => c.id === purchase.categoryId);
    const patient = patients.find(p => p.id === purchase.patientId);
    setLoading(true);
    await supabase.from("purchases").insert({ patient_id: patient.id, pharmacy_id: pharmacy.id, amount: amt, category: cat.label, points_earned: earned });
    await supabase.from("patients").update({ points: patient.points + earned, total_spent: patient.total_spent + amt, visits: patient.visits + 1 }).eq("id", patient.id);
    await loadPatients(supabase, pharmacy.id);
    showToast(`${patient.name} كسب ${earned.toLocaleString()} دينار خصم ✓`);
    setPurchase({ patientId: "", amount: "", categoryId: "" });
    setLoading(false);
  };

  const redeemPoints = async () => {
    const p = patients.find(pt => pt.id === redeemId);
    if (!p) return showToast("اختر مريضاً", "error");
    if (p.points <= 0) return showToast("لا يوجد رصيد", "error");
    setLoading(true);
    await supabase.from("patients").update({ points: 0 }).eq("id", p.id);
    await loadPatients(supabase, pharmacy.id);
    showToast(`✅ تم منح ${p.name} خصم ${p.points.toLocaleString()} دينار`);
    setRedeemId("");
    setLoading(false);
  };

  const tierColor = (pts) => pts >= 50000 ? "#FFD700" : pts >= 20000 ? "#C0C0C0" : "#CD7F32";
  const tierName = (pts) => pts >= 50000 ? "ذهبي 👑" : pts >= 20000 ? "فضي ⭐" : "برونزي 🥉";
  const selectedCat = CATEGORIES.find(c => c.id === purchase.categoryId);
  const previewPoints = purchase.amount && purchase.categoryId ? calcPoints(parseInt(purchase.amount) || 0, purchase.categoryId) : 0;

  const inputStyle = {
    width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 14,
    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
    color: "#fff", boxSizing: "border-box"
  };
  const btnPrimary = {
    width: "100%", padding: "13px", borderRadius: 12, fontSize: 15, fontWeight: 700,
    background: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "#fff", border: "none", cursor: "pointer"
  };

  if (!supabaseConfig) return <SetupScreen onSave={handleSetup} />;
  if (!pharmacy) return <LoginScreen supabase={supabase} onLogin={handleLogin} />;

  return (
    <div dir="rtl" style={{
      minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1e, #0d1b2a)",
      fontFamily: "'Segoe UI', Tahoma, sans-serif", color: "#e8f0fe"
    }}>
      <style>{`
        @keyframes fadeDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        input,select{outline:none;}
        input:focus,select:focus{border-color:#3b82f6!important;box-shadow:0 0 0 3px rgba(59,130,246,0.15)!important;}
        .tab-btn{transition:all 0.2s;cursor:pointer;border:none;}
        .tab-btn:hover{transform:translateY(-1px);}
        .row-hover:hover{background:rgba(59,130,246,0.08)!important;}
        .cat-card{transition:all 0.2s;cursor:pointer;}
        .cat-card:hover{transform:translateY(-2px);}
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "error" ? "#c0392b" : "#1a7a4a",
          color: "#fff", padding: "12px 28px", borderRadius: 12,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 9999,
          fontSize: 14, fontWeight: 600, animation: "fadeDown 0.3s", whiteSpace: "nowrap"
        }}>{toast.msg}</div>
      )}

      {showLogout && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998
        }}>
          <div style={{
            background: "#0d1b2a", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 20, padding: 28, maxWidth: 300, width: "90%", textAlign: "center"
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚪</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 6 }}>تسجيل الخروج؟</div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setPharmacy(null); setPatients([]); setShowLogout(false); setActiveTab("dashboard"); }} style={{
                flex: 1, padding: "11px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                background: "linear-gradient(135deg, #ef4444, #dc2626)", color: "#fff", border: "none", cursor: "pointer"
              }}>نعم</button>
              <button onClick={() => setShowLogout(false)} style={{
                flex: 1, padding: "11px", borderRadius: 10, fontSize: 14,
                background: "rgba(255,255,255,0.05)", color: "#94a3b8",
                border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer"
              }}>إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 11,
            background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
          }}>💊</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{pharmacy.name}</div>
            <div style={{ fontSize: 11, color: "#64748b" }}>نظام الولاء الصيدلاني</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
            background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)"
          }}>✓ Supabase متصل</div>
          <button onClick={() => setShowLogout(true)} style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: "rgba(239,68,68,0.1)", color: "#ef4444",
            border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer"
          }}>خروج 🚪</button>
        </div>
      </div>

      <div style={{ padding: "24px", maxWidth: 960, margin: "0 auto" }}>

        {/* فئات الخصم */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {CATEGORIES.map(cat => (
            <div key={cat.id} style={{
              background: cat.bg, border: `1px solid ${cat.border}`,
              borderRadius: 14, padding: "12px 16px"
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: cat.color }}>{cat.label}</div>
              <div style={{ fontSize: 11, color: "#64748b", margin: "3px 0 6px" }}>{cat.examples}</div>
              <div style={{ fontSize: 13, color: "#fff", fontWeight: 700 }}>{cat.discountPct}% خصم</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
          {[
            { label: "إجمالي المرضى", value: patients.length, icon: "👥", color: "#3b82f6" },
            { label: "رصيد الخصوم (دينار)", value: patients.reduce((a, p) => a + p.points, 0).toLocaleString(), icon: "⭐", color: "#f59e0b" },
            { label: "إجمالي المبيعات", value: (patients.reduce((a, p) => a + p.total_spent, 0) / 1000).toLocaleString() + " ألف", icon: "💰", color: "#10b981" },
          ].map((s, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14, padding: "16px", textAlign: "center"
            }}>
              <div style={{ fontSize: 26, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {[
            { key: "dashboard", label: "📊 المرضى" },
            { key: "add", label: "➕ تسجيل مريض" },
            { key: "purchase", label: "🛒 تسجيل شراء" },
            { key: "redeem", label: "🎁 استبدال نقاط" },
            { key: "search", label: "🔍 بحث" },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className="tab-btn"
              style={{
                padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                background: activeTab === t.key ? "linear-gradient(135deg, #3b82f6, #06b6d4)" : "rgba(255,255,255,0.05)",
                color: activeTab === t.key ? "#fff" : "#94a3b8",
                border: "1px solid " + (activeTab === t.key ? "transparent" : "rgba(255,255,255,0.08)")
              }}>{t.label}</button>
          ))}
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 20, padding: 24
        }}>

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: "#fff" }}>
                مرضى {pharmacy.name} ({patients.length})
              </div>
              {patients.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                  <div>لا يوجد مرضى مسجلين بعد</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {patients.map(p => (
                    <div key={p.id} className="row-hover" style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12, padding: "14px 18px",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      flexWrap: "wrap", gap: 10, transition: "background 0.2s"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 11,
                          background: `linear-gradient(135deg, ${tierColor(p.points)}33, ${tierColor(p.points)}11)`,
                          border: `2px solid ${tierColor(p.points)}44`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
                        }}>👤</div>
                        <div>
                          <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: "#64748b" }}>{p.phone} • {p.visits} زيارة</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748b" }}>المستوى</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: tierColor(p.points) }}>{tierName(p.points)}</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748b" }}>رصيد الخصم</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#f59e0b" }}>{p.points.toLocaleString()} د</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#64748b" }}>المصروف</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981" }}>{p.total_spent.toLocaleString()} د</div>
                      </div>
                      <div style={{
                        padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                        background: p.points > 0 ? "rgba(16,185,129,0.15)" : "rgba(100,116,139,0.15)",
                        color: p.points > 0 ? "#10b981" : "#64748b",
                      }}>
                        {p.points > 0 ? `✓ خصم ${p.points.toLocaleString()} د` : "لا يوجد رصيد"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add */}
          {activeTab === "add" && (
            <div style={{ maxWidth: 420, margin: "0 auto" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "#fff" }}>تسجيل مريض جديد</div>
              {[
                { label: "الاسم الكامل", key: "name", placeholder: "أحمد محمد علي", type: "text" },
                { label: "رقم الهاتف", key: "phone", placeholder: "07XXXXXXXXX", type: "tel" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, display: "block" }}>{f.label}</label>
                  <input value={newPatient[f.key]} onChange={e => setNewPatient({ ...newPatient, [f.key]: e.target.value })}
                    placeholder={f.placeholder} type={f.type} style={inputStyle} />
                </div>
              ))}
              <button onClick={addPatient} disabled={loading} style={btnPrimary}>
                {loading ? "⏳ جاري التسجيل..." : "➕ تسجيل المريض"}
              </button>
            </div>
          )}

          {/* Purchase */}
          {activeTab === "purchase" && (
            <div style={{ maxWidth: 500, margin: "0 auto" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "#fff" }}>تسجيل عملية شراء</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, display: "block" }}>المريض</label>
                <select value={purchase.patientId} onChange={e => setPurchase({ ...purchase, patientId: e.target.value })} style={inputStyle}>
                  <option value="" style={{ background: "#0d1b2a" }}>-- اختر المريض --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id} style={{ background: "#0d1b2a" }}>
                      {p.name} — رصيده {p.points.toLocaleString()} دينار
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, display: "block" }}>المبلغ (دينار)</label>
                <input value={purchase.amount} onChange={e => setPurchase({ ...purchase, amount: e.target.value })}
                  placeholder="25000" type="number" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 10, display: "block" }}>فئة الدواء</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {CATEGORIES.map(cat => (
                    <div key={cat.id} className="cat-card"
                      onClick={() => setPurchase({ ...purchase, categoryId: cat.id })}
                      style={{
                        padding: "12px 16px", borderRadius: 12,
                        background: purchase.categoryId === cat.id ? cat.bg : "rgba(255,255,255,0.03)",
                        border: `2px solid ${purchase.categoryId === cat.id ? cat.color : "rgba(255,255,255,0.08)"}`,
                        display: "flex", justifyContent: "space-between", alignItems: "center"
                      }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: purchase.categoryId === cat.id ? cat.color : "#e2e8f0" }}>{cat.label}</div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{cat.examples}</div>
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: cat.color }}>{cat.discountPct}%</div>
                    </div>
                  ))}
                </div>
              </div>
              {previewPoints > 0 && (
                <div style={{
                  background: selectedCat?.bg, border: `1px solid ${selectedCat?.border}`,
                  borderRadius: 12, padding: 14, marginBottom: 16
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "#64748b" }}>يُضاف لرصيد الخصم</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#f59e0b" }}>+{previewPoints.toLocaleString()} دينار</span>
                  </div>
                </div>
              )}
              <button onClick={recordPurchase} disabled={loading} style={{ ...btnPrimary, background: "linear-gradient(135deg, #10b981, #059669)" }}>
                {loading ? "⏳ جاري التسجيل..." : "✅ تسجيل الشراء"}
              </button>
            </div>
          )}

          {/* Redeem */}
          {activeTab === "redeem" && (
            <div style={{ maxWidth: 440, margin: "0 auto" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "#fff" }}>استبدال رصيد الخصم</div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6, display: "block" }}>اختر المريض</label>
                <select value={redeemId} onChange={e => setRedeemId(e.target.value)} style={inputStyle}>
                  <option value="" style={{ background: "#0d1b2a" }}>-- اختر --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id} style={{ background: "#0d1b2a" }}>
                      {p.name} — {p.points.toLocaleString()} دينار {p.points > 0 ? "✓" : "✗"}
                    </option>
                  ))}
                </select>
              </div>
              {redeemId && (() => {
                const p = patients.find(pt => pt.id === redeemId);
                return p ? (
                  <div style={{
                    background: p.points > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                    border: `1px solid ${p.points > 0 ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                    borderRadius: 12, padding: 18, marginBottom: 16, textAlign: "center"
                  }}>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 30, fontWeight: 900, color: p.points > 0 ? "#10b981" : "#ef4444" }}>
                      {p.points.toLocaleString()} دينار
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                      {p.points > 0 ? "رصيد خصم متاح" : "لا يوجد رصيد"}
                    </div>
                  </div>
                ) : null;
              })()}
              <button onClick={redeemPoints} disabled={loading} style={{ ...btnPrimary, background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                {loading ? "⏳..." : "🎁 تطبيق الخصم على الفاتورة"}
              </button>
            </div>
          )}

          {/* Search */}
          {activeTab === "search" && (
            <div style={{ maxWidth: 440, margin: "0 auto" }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "#fff" }}>البحث عن مريض</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                <input value={searchPhone} onChange={e => setSearchPhone(e.target.value)}
                  placeholder="رقم الهاتف" style={{ ...inputStyle, flex: 1 }} />
                <button onClick={() => {
                  const p = patients.find(pt => pt.phone === searchPhone);
                  setFoundPatient(p || null);
                  if (!p) showToast("رقم غير موجود", "error");
                }} style={{
                  padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 700,
                  background: "linear-gradient(135deg, #3b82f6, #06b6d4)", color: "#fff", border: "none", cursor: "pointer"
                }}>بحث</button>
              </div>
              {foundPatient && (
                <div style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 16, padding: 20
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{foundPatient.name}</div>
                    <div style={{ color: tierColor(foundPatient.points), fontWeight: 700 }}>{tierName(foundPatient.points)}</div>
                  </div>
                  {[
                    { label: "الهاتف", value: foundPatient.phone },
                    { label: "رصيد الخصم", value: `${foundPatient.points.toLocaleString()} دينار`, color: "#f59e0b" },
                    { label: "إجمالي المصروف", value: `${foundPatient.total_spent.toLocaleString()} دينار`, color: "#10b981" },
                    { label: "الزيارات", value: `${foundPatient.visits} زيارة` },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ color: "#64748b", fontSize: 13 }}>{item.label}</span>
                      <span style={{ fontWeight: 700, color: item.color || "#e2e8f0" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
