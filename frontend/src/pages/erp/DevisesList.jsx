import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Plus, Edit2, Trash2, X, Check, Star, ToggleLeft, ToggleRight } from "lucide-react";

const EMPTY = { code: "", nom: "", symbole: "", taux_change: "", est_defaut: false, est_actif: true };

export default function DevisesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [editCode, setEditCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [error, setError] = useState(null);
  const [inlineEdit, setInlineEdit] = useState(null); // { id, value }

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/devises");
      setData(res.data?.data || res.data || []);
    } catch { setData([]); } finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setEditCode(""); setError(null); setShowModal(true); };
  const openEdit = (d) => {
    setForm({ code: d.code, nom: d.nom, symbole: d.symbole, taux_change: d.taux_change, est_defaut: d.est_defaut, est_actif: d.est_actif });
    setEditId(d.id); setEditCode(d.code); setError(null); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.nom || !form.symbole || form.taux_change === "") { setError("Tous les champs sont obligatoires."); return; }
    setSaving(true); setError(null);
    try {
      if (editId) await api.put(`/devises/${editId}`, form);
      else await api.post("/devises", form);
      await fetchData();
      setShowModal(false);
    } catch (e) { setError(e.response?.data?.message || "Erreur."); }
    finally { setSaving(false); }
  };

  const handleToggleActif = async (devise) => {
    try {
      await api.put(`/devises/${devise.id}`, { est_actif: !devise.est_actif });
      setData(data.map(d => d.id === devise.id ? { ...d, est_actif: !d.est_actif } : d));
    } catch (e) { alert(e.response?.data?.message || "Erreur"); }
  };

  const handleSetDefault = async (devise) => {
    if (devise.est_defaut) return;
    try {
      await api.put(`/devises/${devise.id}`, { est_defaut: true });
      await fetchData();
    } catch (e) { alert(e.response?.data?.message || "Erreur"); }
  };

  const handleInlineSave = async (devise) => {
    if (!inlineEdit) return;
    try {
      await api.put(`/devises/${devise.id}`, { taux_change: inlineEdit.value });
      setData(data.map(d => d.id === devise.id ? { ...d, taux_change: inlineEdit.value } : d));
      setInlineEdit(null);
    } catch (e) { alert(e.response?.data?.message || "Erreur"); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/devises/${id}`);
      setData(data.filter(d => d.id !== id));
      setDelConfirm(null);
    } catch (e) { alert(e.response?.data?.message || "Erreur suppression"); }
  };

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Devises</h1>
          <p className="erp-page-subtitle">Gérez les devises et taux de change de l'application.</p>
        </div>
        <button onClick={openAdd} className="erp-btn-primary">
          <Plus size={16} /> Ajouter une devise
        </button>
      </header>

      {loading ? (
        <div className="text-center py-8 text-muted">Chargement...</div>
      ) : (
        <div className="erp-card">
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Symbole</th>
                  <th>Taux de change (par rapport au MAD)</th>
                  <th>Défaut</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted">Aucune devise configurée.</td>
                  </tr>
                ) : data.map(devise => (
                  <tr key={devise.id}>
                    <td>
                      <span className={`status-badge ${devise.est_defaut ? "warning" : "neutral"}`}>{devise.code}</span>
                      {devise.est_defaut && <span style={{ fontSize: "0.7rem", color: "#f59e0b", marginLeft: 6, fontWeight: 700 }}>DEFAUT</span>}
                    </td>
                    <td className="font-semibold">{devise.nom}</td>
                    <td style={{ fontFamily: "monospace", fontSize: "1rem" }}>{devise.symbole}</td>
                    <td>
                      {inlineEdit?.id === devise.id ? (
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <input 
                            type="number" 
                            step="0.0001" 
                            value={inlineEdit.value}
                            onChange={e => setInlineEdit({ ...inlineEdit, value: e.target.value })}
                            style={{ width: '120px', padding: '6px 10px', height: 'auto', border: '1px solid var(--card-border)', borderRadius: '6px' }} 
                            autoFocus 
                          />
                          <button onClick={() => handleInlineSave(devise)} className="erp-btn-primary" style={{ padding: '6px 10px' }}><Check size={14} /></button>
                          <button onClick={() => setInlineEdit(null)} className="erp-btn-secondary" style={{ padding: '6px 10px' }}><X size={14} /></button>
                        </div>
                      ) : (
                        <span 
                          onDoubleClick={() => setInlineEdit({ id: devise.id, value: devise.taux_change })}
                          style={{ cursor: "pointer", padding: "4px 8px", borderRadius: 4, background: 'rgba(0,0,0,0.02)' }}
                          title="Double-cliquer pour modifier"
                        >
                          {devise.taux_change} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>MAD</span>
                        </span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => handleSetDefault(devise)} style={{ background: "none", border: "none", cursor: devise.est_defaut ? "default" : "pointer", padding: 0 }}>
                        <Star size={18} fill={devise.est_defaut ? "#f59e0b" : "none"} color={devise.est_defaut ? "#f59e0b" : "var(--text-muted)"} />
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => !devise.est_defaut && handleToggleActif(devise)}
                        disabled={devise.est_defaut}
                        style={{ background: "none", border: "none", cursor: devise.est_defaut ? "not-allowed" : "pointer", padding: 0, display: "flex", alignItems: "center", gap: 6, color: devise.est_actif ? "#10b981" : "var(--text-muted)", opacity: devise.est_defaut ? 0.5 : 1 }}
                      >
                        {devise.est_actif ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-muted" />}
                        <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{devise.est_actif ? "Actif" : "Inactif"}</span>
                      </button>
                    </td>
                    <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(devise)} className="erp-action-btn edit" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      {!devise.est_defaut && devise.code !== "MAD" && (
                        <button onClick={() => setDelConfirm(devise.id)} className="erp-action-btn delete" title="Supprimer">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {delConfirm && (
        <div className="erp-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="erp-modal p-6" style={{ width: '360px' }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 'bold', marginBottom: "8px" }}>Confirmer la suppression ?</h3>
            <p className="text-muted" style={{ marginBottom: "20px", fontSize: "0.9rem" }}>Cette action est irréversible.</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button onClick={() => setDelConfirm(null)} className="erp-btn-secondary">Annuler</button>
              <button onClick={() => handleDelete(delConfirm)} className="erp-btn-primary" style={{ background: 'var(--danger-color)', boxShadow: 'none' }}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '420px', padding: '2rem', position: 'relative', margin: 'auto', background: '#FFFFFF', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', margin: 0, fontWeight: 'bold' }}>{editId ? "Modifier la devise" : "Nouvelle devise"}</h2>
            
            {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid var(--danger-color)", borderRadius: 8, padding: "10px 14px", color: "var(--danger-color)", fontSize: "0.85rem" }}>{error}</div>}
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="erp-form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="erp-form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Code *</label>
                  <input maxLength={3} value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} required style={{ padding: '8px 12px' }} />
                </div>
                <div className="erp-form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Symbole *</label>
                  <input maxLength={5} value={form.symbole} onChange={e => setForm({ ...form, symbole: e.target.value })} required style={{ padding: '8px 12px' }} />
                </div>
                <div className="erp-form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Taux/MAD *</label>
                  <input type="number" step="0.0001" min="0.0001" value={form.taux_change} onChange={e => setForm({ ...form, taux_change: e.target.value })} required style={{ padding: '8px 12px' }} />
                </div>
              </div>

              <div className="erp-form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nom *</label>
                <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required style={{ padding: '8px 12px' }} />
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={form.est_defaut} onChange={e => setForm({ ...form, est_defaut: e.target.checked })} />
                  <span>Devise par défaut</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={form.est_actif} onChange={e => setForm({ ...form, est_actif: e.target.checked })} />
                  <span>Active</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="erp-btn-secondary" style={{ padding: '8px 16px' }}>Annuler</button>
                <button type="submit" disabled={saving} className="erp-btn-primary" style={{ padding: '8px 20px' }}>
                  {saving ? "Sauvegarde..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
