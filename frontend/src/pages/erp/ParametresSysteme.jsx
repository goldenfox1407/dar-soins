import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import {
  Building2, Scale, HeartPulse, Receipt, Upload, Save, Check, AlertTriangle
} from "lucide-react";

const TABS = [
  { id: "entreprise", label: "Entreprise", icon: Building2 },
  { id: "legal",      label: "Legal & Fiscal", icon: Scale },
  { id: "soins",      label: "Soins",          icon: HeartPulse },
  { id: "facturation",label: "Facturation",    icon: Receipt },
];

const inputStyle = {
  width: "100%",
  padding: "0.6rem 0.9rem",
  background: "#FFFFFF",
  border: "1px solid var(--card-border)",
  borderRadius: "8px",
  color: "var(--text-main)",
  fontSize: "0.9rem",
  outline: "none",
  transition: "all 0.2s",
};

const labelStyle = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "var(--text-muted)",
  marginBottom: "0.35rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

function Field({ label, sublabel, children }) {
  return (
    <div style={{ marginBottom: "1.2rem" }}>
      <label style={labelStyle}>{label}{sublabel && <span style={{ fontWeight: 400, textTransform: "none", marginLeft: 6, opacity: 0.7 }}>— {sublabel}</span>}</label>
      {children}
    </div>
  );
}

function Row({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
      {children}
    </div>
  );
}

export default function ParametresSysteme() {
  const [activeTab, setActiveTab] = useState("entreprise");
  const [form, setForm] = useState({});
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileRef = useRef();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/parametres");
      const data = res.data?.data || res.data;
      setForm(data);
      setOriginal(data);
      if (data?.logo_path) setLogoPreview(`http://127.0.0.1:8000/storage/${data.logo_path}`);
    } catch (e) {
      setError("Impossible de charger les parametres.");
    } finally {
      setLoading(false);
    }
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSlider = (name, value) => {
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await api.put("/parametres", form);
      const data = res.data?.data || res.data;
      setForm(data);
      setOriginal(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setError(e.response?.data?.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("logo", file);
    setLogoPreview(URL.createObjectURL(file));
    try {
      const res = await api.post("/parametres/logo", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(f => ({ ...f, logo_path: res.data.logo_url }));
    } catch (e) {
      setError("Erreur upload logo.");
    }
  };

  if (loading) return (
    <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>
      <div className="animate-spin" style={{ width: 36, height: 36, border: "3px solid var(--primary-color)", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 1rem" }} />
      Chargement des parametres...
    </div>
  );

  const tabContentStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid var(--glass-border)",
    borderRadius: "0 12px 12px 12px",
    padding: "2rem",
  };

  return (
    <div className="animate-fade-in" style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--primary-color)", marginBottom: "0.3rem" }}>
            Parametres Systeme
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Configurez l''identite, les informations legales et les regles metier de l''entreprise.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {isDirty && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f59e0b", fontSize: "0.85rem", fontWeight: 600 }}>
              <AlertTriangle size={16} />
              Modifications non sauvegardees
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: saved ? "#10b981" : "var(--primary-color)",
              color: "white", border: "none", borderRadius: "8px",
              padding: "0.65rem 1.4rem", fontWeight: 600, cursor: isDirty ? "pointer" : "not-allowed",
              opacity: isDirty ? 1 : 0.5, transition: "all .2s"
            }}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Sauvegarde !" : saving ? "En cours..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid #f87171", borderRadius: 8, padding: "0.8rem 1.2rem", marginBottom: "1.5rem", color: "#f87171", fontSize: "0.9rem" }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--glass-border)", marginBottom: 0 }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.75rem 1.4rem",
                background: active ? "rgba(255,255,255,0.03)" : "transparent",
                border: "1px solid",
                borderColor: active ? "var(--glass-border)" : "transparent",
                borderBottom: active ? "1px solid rgba(255,255,255,0.03)" : "transparent",
                borderRadius: "10px 10px 0 0",
                color: active ? "var(--primary-color)" : "var(--text-muted)",
                fontWeight: active ? 700 : 500,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all .2s",
                marginBottom: active ? -1 : 0,
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={tabContentStyle}>

        {/* ── ENTREPRISE ── */}
        {activeTab === "entreprise" && (
          <div>
            {/* Logo upload */}
            <div style={{ marginBottom: "1.8rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div
                onClick={() => fileRef.current.click()}
                style={{
                  width: 100, height: 100, borderRadius: 14,
                  background: logoPreview ? "transparent" : "rgba(255,255,255,0.05)",
                  border: "2px dashed var(--glass-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", overflow: "hidden", flexShrink: 0,
                  transition: "border-color .2s"
                }}
              >
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  : <Upload size={28} style={{ color: "var(--text-muted)" }} />
                }
              </div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>Logo de l''entreprise</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: 8 }}>PNG, JPG — max 2 Mo</div>
                <button
                  onClick={() => fileRef.current.click()}
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid var(--glass-border)", borderRadius: 6, padding: "0.4rem 0.9rem", color: "var(--text-primary)", fontSize: "0.82rem", cursor: "pointer" }}
                >
                  Choisir un fichier
                </button>
              </div>
              <input
                ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => handleLogoUpload(e.target.files[0])}
              />
            </div>

            <Row>
              <Field label="Nom de l''entreprise">
                <input name="nom_entreprise" value={form.nom_entreprise || ""} onChange={handleChange} style={inputStyle} placeholder="Dar Soins Medicaux SARL" />
              </Field>
              <Field label="Slogan">
                <input name="slogan" value={form.slogan || ""} onChange={handleChange} style={inputStyle} placeholder="Soins infirmiers a domicile" />
              </Field>
            </Row>
            <Row>
              <Field label="Email de contact">
                <input name="email_contact" type="email" value={form.email_contact || ""} onChange={handleChange} style={inputStyle} placeholder="contact@darsoins.ma" />
              </Field>
              <Field label="Telephone">
                <input name="telephone" value={form.telephone || ""} onChange={handleChange} style={inputStyle} placeholder="+212 522 123 456" />
              </Field>
            </Row>
            <Field label="Adresse">
              <input name="adresse" value={form.adresse || ""} onChange={handleChange} style={inputStyle} placeholder="123 Avenue de la Sante, Maarif" />
            </Field>
            <Row>
              <Field label="Ville">
                <input name="ville" value={form.ville || ""} onChange={handleChange} style={inputStyle} placeholder="Casablanca" />
              </Field>
              <Field label="Code Postal">
                <input name="code_postal" value={form.code_postal || ""} onChange={handleChange} style={inputStyle} placeholder="20100" />
              </Field>
            </Row>
            <Row>
              <Field label="Pays">
                <input name="pays" value={form.pays || ""} onChange={handleChange} style={inputStyle} placeholder="Maroc" />
              </Field>
              <Field label="Site web">
                <input name="site_web" value={form.site_web || ""} onChange={handleChange} style={inputStyle} placeholder="https://www.darsoins.ma" />
              </Field>
            </Row>
          </div>
        )}

        {/* ── LEGAL ── */}
        {activeTab === "legal" && (
          <div>
            <div style={{ background: "rgba(37,99,235,0.07)", border: "1px solid rgba(37,99,235,0.2)", borderRadius: 8, padding: "0.9rem 1.2rem", marginBottom: "1.5rem", fontSize: "0.85rem", color: "var(--primary-color)" }}>
              Ces informations apparaissent sur vos factures, devis et documents officiels.
            </div>
            <Row>
              <Field label="RC" sublabel="Registre de Commerce">
                <input name="rc" value={form.rc || ""} onChange={handleChange} style={inputStyle} placeholder="456789" />
              </Field>
              <Field label="ICE" sublabel="Identifiant Commun Entreprise">
                <input name="ice" value={form.ice || ""} onChange={handleChange} style={inputStyle} placeholder="002847561000083" />
              </Field>
            </Row>
            <Row>
              <Field label="IF" sublabel="Identifiant Fiscal">
                <input name="if_fiscal" value={form.if_fiscal || ""} onChange={handleChange} style={inputStyle} placeholder="12345678" />
              </Field>
              <Field label="Patente">
                <input name="patente" value={form.patente || ""} onChange={handleChange} style={inputStyle} placeholder="12345678" />
              </Field>
            </Row>
            <Field label="CNSS" sublabel="Caisse Nationale de Securite Sociale">
              <input name="cnss" value={form.cnss || ""} onChange={handleChange} style={{ ...inputStyle, maxWidth: "50%" }} placeholder="1234567" />
            </Field>
          </div>
        )}

        {/* ── SOINS ── */}
        {activeTab === "soins" && (
          <div>
            <Row>
              <Field label="Tarif kilometrique" sublabel="MAD/km">
                <input name="tkmf_sm" type="number" min="0" step="0.1" value={form.tkmf_sm || ""} onChange={handleChange} style={inputStyle} placeholder="2.5" />
              </Field>
              <Field label="TVA" sublabel="%">
                <input name="tva" type="number" min="0" max="100" step="0.5" value={form.tva || ""} onChange={handleChange} style={inputStyle} placeholder="20" />
              </Field>
            </Row>
            <Field label={`Rayon d''intervention — ${form.rayon_intervention_km || 30} km`}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input
                  type="range" min="5" max="200" step="5"
                  value={form.rayon_intervention_km || 30}
                  onChange={e => handleSlider("rayon_intervention_km", e.target.value)}
                  style={{ flex: 1, accentColor: "var(--primary-color)" }}
                />
                <input
                  name="rayon_intervention_km" type="number" min="5" max="200"
                  value={form.rayon_intervention_km || 30} onChange={handleChange}
                  style={{ ...inputStyle, width: 90 }}
                />
              </div>
            </Field>
            <Row>
              <Field label="Delai reponse devis" sublabel="heures">
                <input name="delai_reponse_devis_h" type="number" min="1" value={form.delai_reponse_devis_h || ""} onChange={handleChange} style={inputStyle} placeholder="24" />
              </Field>
              <Field label="Validite du devis" sublabel="jours">
                <input name="delai_validite_devis_j" type="number" min="1" value={form.delai_validite_devis_j || ""} onChange={handleChange} style={inputStyle} placeholder="30" />
              </Field>
            </Row>
            <Field label={`Commission infirmier — ${form.commission_infirmier || 70}%`}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input
                  type="range" min="0" max="100" step="1"
                  value={form.commission_infirmier || 70}
                  onChange={e => handleSlider("commission_infirmier", e.target.value)}
                  style={{ flex: 1, accentColor: "var(--primary-color)" }}
                />
                <input
                  name="commission_infirmier" type="number" min="0" max="100"
                  value={form.commission_infirmier || 70} onChange={handleChange}
                  style={{ ...inputStyle, width: 90 }}
                />
              </div>
            </Field>
          </div>
        )}

        {/* ── FACTURATION ── */}
        {activeTab === "facturation" && (
          <div>
            <Row>
              <Field label="Devise par defaut">
                <select name="devise_defaut" value={form.devise_defaut || "MAD"} onChange={handleChange} style={inputStyle}>
                  <option value="MAD">MAD — Dirham Marocain</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="USD">USD — Dollar</option>
                  <option value="GBP">GBP — Livre sterling</option>
                </select>
              </Field>
              <Field label="Format de date">
                <select name="format_date" value={form.format_date || "d/m/Y"} onChange={handleChange} style={inputStyle}>
                  <option value="d/m/Y">14/07/2026 (JJ/MM/AAAA)</option>
                  <option value="Y-m-d">2026-07-14 (AAAA-MM-JJ)</option>
                  <option value="d M Y">14 Jul 2026</option>
                </select>
              </Field>
            </Row>
            <Field label="Mentions legales (factures)">
              <textarea name="mentions_facture" rows={3} value={form.mentions_facture || ""} onChange={handleChange}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                placeholder="Paiement exigible a la fin de l''intervention..." />
            </Field>
            <Field label="Conditions de paiement">
              <textarea name="conditions_paiement" rows={3} value={form.conditions_paiement || ""} onChange={handleChange}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                placeholder="Paiement comptant a reception..." />
            </Field>
            <Field label="Pied de page (factures)">
              <textarea name="pied_facture" rows={2} value={form.pied_facture || ""} onChange={handleChange}
                style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                placeholder="Merci de votre confiance — www.darsoins.ma" />
            </Field>
          </div>
        )}

      </div>
    </div>
  );
}
