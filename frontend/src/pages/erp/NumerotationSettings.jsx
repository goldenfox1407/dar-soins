import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Save, Check, RefreshCcw, AlertTriangle } from "lucide-react";

const TYPES = [
  { key: "facture", label: "Facture",  prefix: "prefix_facture", compteur: "compteur_facture" },
  { key: "devis",   label: "Devis",    prefix: "prefix_devis",   compteur: "compteur_devis" },
  { key: "achat",   label: "Achat",    prefix: "prefix_achat",   compteur: "compteur_achat" },
  { key: "vente",   label: "Vente",    prefix: "prefix_vente",   compteur: "compteur_vente" },
  { key: "avoir",   label: "Avoir",    prefix: "prefix_avoir",   compteur: "compteur_avoir" },
];

const FORMATS = [
  { value: "PREFIX-YYYYMMDD-NNNN", label: "PREFIX-AAAAMMJJ-NNNN (ex: FAC-20260714-0042)" },
  { value: "PREFIX-YYYY-NNNN",     label: "PREFIX-AAAA-NNNN (ex: FAC-2026-0042)" },
  { value: "PREFIX-NNNNNN",        label: "PREFIX-NNNNNN (ex: FAC-000042)" },
];

function buildPreview(prefix, compteur, format) {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const d = String(today.getDate()).padStart(2, "0");
  const n4 = String(compteur).padStart(4, "0");
  const n6 = String(compteur).padStart(6, "0");
  switch (format) {
    case "PREFIX-YYYY-NNNN": return `${prefix}-${y}-${n4}`;
    case "PREFIX-NNNNNN":    return `${prefix}-${n6}`;
    default:                 return `${prefix}-${y}${m}${d}-${n4}`;
  }
}

const inputStyle = {
  width: "100%", padding: "0.5rem 0.8rem",
  background: "#FFFFFF", border: "1px solid var(--card-border)",
  borderRadius: "7px", color: "var(--text-main)", fontSize: "0.88rem", outline: "none",
};

export default function NumerotationSettings() {
  const [form, setForm]       = useState({});
  const [original, setOriginal] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState(null);
  const [resetConfirm, setResetConfirm] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/parametres");
      const data = res.data?.data || res.data;
      setForm(data); setOriginal(data);
    } catch { setError("Impossible de charger."); }
    finally { setLoading(false); }
  };

  const isDirty = JSON.stringify(form) !== JSON.stringify(original);

  const handleSave = async () => {
    setSaving(true); setError(null);
    try {
      const res = await api.put("/parametres", form);
      const data = res.data?.data || res.data;
      setForm(data); setOriginal(data);
      setSaved(true); setTimeout(() => setSaved(false), 2500);
    } catch (e) { setError(e.response?.data?.message || "Erreur."); }
    finally { setSaving(false); }
  };

  const handleReset = async (type) => {
    const compteurKey = `compteur_${type}`;
    const newForm = { ...form, [compteurKey]: 1 };
    setForm(newForm);
    setResetConfirm(null);
    try {
      await api.put("/parametres", { [compteurKey]: 1 });
      setOriginal({ ...original, [compteurKey]: 1 });
    } catch (e) { setError("Erreur reinitialisation."); }
  };

  if (loading) return <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-muted)" }}>Chargement...</div>;

  return (
    <div className="animate-fade-in" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--primary-color)", marginBottom: "0.3rem" }}>Numerotation</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Configurez les prefixes et formats de vos references de documents.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {isDirty && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f59e0b", fontSize: "0.85rem", fontWeight: 600 }}><AlertTriangle size={16} />Non sauvegarde</div>}
          <button onClick={handleSave} disabled={saving || !isDirty}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: saved ? "#10b981" : "var(--primary-color)", color: "white", border: "none", borderRadius: 8, padding: "0.65rem 1.3rem", fontWeight: 600, cursor: isDirty ? "pointer" : "not-allowed", opacity: isDirty ? 1 : 0.5 }}>
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? "Sauvegarde !" : saving ? "En cours..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {error && <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid #f87171", borderRadius: 8, padding: "0.8rem 1.2rem", marginBottom: "1.5rem", color: "#f87171" }}>{error}</div>}

      {/* Format global */}
      <div className="glass-panel" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
        <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Format de numerotation global</label>
        <select
          value={form.format_numero || "PREFIX-YYYYMMDD-NNNN"}
          onChange={e => setForm({ ...form, format_numero: e.target.value })}
          style={{ ...inputStyle, maxWidth: 500 }}>
          {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {/* Tableau des types */}
      <div className="glass-panel" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--glass-border)" }}>
              {["Type", "Prefixe", "Prochain N°", "Apercu live", "Action"].map(h => (
                <th key={h} style={{ padding: "1rem 1.2rem", textAlign: "left", fontSize: "0.78rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TYPES.map(type => {
              const prefix   = form[type.prefix]   || type.key.slice(0, 3).toUpperCase();
              const compteur = parseInt(form[type.compteur] || 1);
              const preview  = buildPreview(prefix, compteur, form.format_numero || "PREFIX-YYYYMMDD-NNNN");
              return (
                <tr key={type.key} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "1rem 1.2rem", fontWeight: 700 }}>{type.label}</td>
                  <td style={{ padding: "1rem 1.2rem" }}>
                    <input
                      maxLength={10}
                      value={form[type.prefix] || ""}
                      onChange={e => setForm({ ...form, [type.prefix]: e.target.value.toUpperCase() })}
                      style={{ ...inputStyle, width: 120, textTransform: "uppercase", fontWeight: 700 }}
                    />
                  </td>
                  <td style={{ padding: "1rem 1.2rem" }}>
                    <input
                      type="number" min={1}
                      value={form[type.compteur] || 1}
                      onChange={e => setForm({ ...form, [type.compteur]: parseInt(e.target.value) })}
                      style={{ ...inputStyle, width: 100 }}
                    />
                  </td>
                  <td style={{ padding: "1rem 1.2rem" }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.95rem", background: "rgba(37,99,235,0.08)", color: "var(--primary-color)", padding: "4px 10px", borderRadius: 6, letterSpacing: "0.05em" }}>
                      {preview}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.2rem" }}>
                    <button
                      onClick={() => setResetConfirm(type.key)}
                      title="Reinitialiser le compteur a 1"
                      style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 6, padding: "0.4rem 0.8rem", fontSize: "0.82rem", cursor: "pointer" }}>
                      <RefreshCcw size={13} /> Reset
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirm Reset */}
      {resetConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "var(--bg-secondary)", borderRadius: 12, padding: "2rem", minWidth: 360, border: "1px solid var(--glass-border)" }}>
            <h3 style={{ marginBottom: "0.8rem", fontSize: "1.1rem" }}>Reinitialiser le compteur ?</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
              Le compteur <strong>{resetConfirm}</strong> sera remis a <strong>1</strong>.
            </p>
            <p style={{ color: "#f87171", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
              ⚠️ Attention : des doublons de references peuvent apparaitre si des documents ont deja ete crees.
            </p>
            <div style={{ display: "flex", gap: "0.8rem", justifyContent: "flex-end" }}>
              <button onClick={() => setResetConfirm(null)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid var(--glass-border)", borderRadius: 7, padding: "0.5rem 1rem", cursor: "pointer" }}>Annuler</button>
              <button onClick={() => handleReset(resetConfirm)} style={{ background: "#ef4444", border: "none", borderRadius: 7, padding: "0.5rem 1rem", color: "white", fontWeight: 600, cursor: "pointer" }}>Reinitialiser</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
