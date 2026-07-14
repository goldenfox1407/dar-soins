import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Plus, Edit2, Trash2, X, Check, ToggleLeft, ToggleRight } from "lucide-react";

const EMPTY = { nom: "", taux: "", type: "percent", description: "", est_defaut: false, est_actif: true };

export default function TaxesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [delConfirm, setDelConfirm] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/taxes");
      setData(res.data?.data || res.data || []);
    } catch { setData([]); } finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setError(null); setShowModal(true); };
  const openEdit = (t) => {
    setForm({ nom: t.nom, taux: t.taux, type: t.type, description: t.description || "", est_defaut: t.est_defaut, est_actif: t.est_actif });
    setEditId(t.id); setError(null); setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setForm(EMPTY); setEditId(null); setError(null); };

  const handleSave = async () => {
    if (!form.nom || form.taux === "") { setError("Le nom et le taux sont obligatoires."); return; }
    setSaving(true); setError(null);
    try {
      if (editId) await api.put(`/taxes/${editId}`, form);
      else await api.post("/taxes", form);
      await fetchData();
      closeModal();
    } catch (e) { setError(e.response?.data?.message || "Erreur sauvegarde."); }
    finally { setSaving(false); }
  };

  const handleToggleActif = async (taxe) => {
    try {
      await api.put(`/taxes/${taxe.id}`, { est_actif: !taxe.est_actif });
      setData(data.map(t => t.id === taxe.id ? { ...t, est_actif: !t.est_actif } : t));
    } catch (e) { alert(e.response?.data?.message || "Erreur modification statut"); }
  };

  const handleSetDefault = async (taxe) => {
    if (taxe.est_defaut) return;
    try {
      await api.put(`/taxes/${taxe.id}`, { est_defaut: true });
      await fetchData();
    } catch (e) { alert(e.response?.data?.message || "Erreur modification par défaut"); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/taxes/${id}`);
      setData(data.filter(t => t.id !== id));
      setDelConfirm(null);
    } catch (e) { alert(e.response?.data?.message || "Erreur suppression"); }
  };

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Taxes</h1>
          <p className="erp-page-subtitle">Gérez les taux de TVA et taxes applicables.</p>
        </div>
        <button onClick={openAdd} className="erp-btn-primary">
          <Plus size={16} /> Ajouter une taxe
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
                  <th>Nom</th>
                  <th>Taux</th>
                  <th>Type</th>
                  <th>Par défaut</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted">Aucune taxe configurée.</td>
                  </tr>
                ) : data.map(taxe => (
                  <tr key={taxe.id}>
                    <td className="font-semibold">{taxe.nom}</td>
                    <td className="font-semibold">{taxe.taux} {taxe.type === "percent" ? "%" : "MAD"}</td>
                    <td>
                      <span className={`status-badge ${taxe.type === "percent" ? "info" : "neutral"}`}>
                        {taxe.type === "percent" ? "Pourcentage" : "Fixe"}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleSetDefault(taxe)}
                        style={{ background: "none", border: "none", cursor: taxe.est_defaut ? "default" : "pointer" }}
                        className={taxe.est_defaut ? "text-amber-500 font-semibold" : "text-muted hover:text-amber-500"}
                      >
                        {taxe.est_defaut ? "✓ Par défaut" : "Définir par défaut"}
                      </button>
                    </td>
                    <td>
                      <button 
                        onClick={() => !taxe.est_defaut && handleToggleActif(taxe)}
                        disabled={taxe.est_defaut}
                        style={{ background: "none", border: "none", cursor: taxe.est_defaut ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 6, color: taxe.est_actif ? "#10b981" : "var(--text-muted)", opacity: taxe.est_defaut ? 0.5 : 1 }}
                      >
                        {taxe.est_actif ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-muted" />}
                        <span style={{ fontSize: "0.82rem", fontWeight: 600 }}>{taxe.est_actif ? "Actif" : "Inactif"}</span>
                      </button>
                    </td>
                    <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(taxe)} className="erp-action-btn edit" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      {!taxe.est_defaut && (
                        <button onClick={() => setDelConfirm(taxe.id)} className="erp-action-btn delete" title="Supprimer">
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

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '420px', padding: '2rem', position: 'relative', margin: 'auto', background: '#FFFFFF', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', margin: 0, fontWeight: 'bold' }}>{editId ? "Modifier la taxe" : "Nouvelle taxe"}</h2>
            
            {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid var(--danger-color)", borderRadius: 8, padding: "10px 14px", color: "var(--danger-color)", fontSize: "0.85rem" }}>{error}</div>}
            
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="erp-form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nom *</label>
                <input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required style={{ padding: '8px 12px' }} />
              </div>
              
              <div className="erp-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="erp-form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Taux *</label>
                  <input type="number" min="0" max="100" step="0.5" value={form.taux} onChange={e => setForm({ ...form, taux: e.target.value })} required style={{ padding: '8px 12px' }} />
                </div>
                <div className="erp-form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ padding: '8px 12px' }}>
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Fixe (MAD)</option>
                  </select>
                </div>
              </div>

              <div className="erp-form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
                <textarea rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ padding: '8px 12px' }} />
              </div>

              <div style={{ display: "flex", gap: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={form.est_defaut} onChange={e => setForm({ ...form, est_defaut: e.target.checked })} />
                  <span>Taxe par défaut</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}>
                  <input type="checkbox" checked={form.est_actif} onChange={e => setForm({ ...form, est_actif: e.target.checked })} />
                  <span>Active</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={closeModal} className="erp-btn-secondary" style={{ padding: '8px 16px' }}>Annuler</button>
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
