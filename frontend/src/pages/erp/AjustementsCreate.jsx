import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2, ArrowRightLeft, PlusCircle, MinusCircle } from 'lucide-react';
import api from '../../services/api';

export default function AjustementsCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [entrepots, setEntrepots] = useState([]);
  const [produits, setProduits] = useState([]);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entrepotId, setEntrepotId] = useState('');
  const [notes, setNotes] = useState('');

  const [lignes, setLignes] = useState([
    { produit_id: '', type: 'add', quantite: 1 }
  ]);

  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      const [entRes, prodRes] = await Promise.all([
        api.get('/entrepots'),
        api.get('/produits')
      ]);
      setEntrepots(entRes.data?.data || entRes.data || []);
      setProduits(prodRes.data?.data || prodRes.data || []);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const handleAddLine = () => {
    setLignes([...lignes, { produit_id: '', type: 'add', quantite: 1 }]);
  };

  const handleRemoveLine = (index) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter((_, i) => i !== index));
    }
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lignes];
    updated[index][field] = value;
    setLignes(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const validLines = lignes.filter(l => l.produit_id && l.quantite > 0);
    if (validLines.length === 0) {
      alert("Veuillez ajouter au moins un produit valide.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/ajustements', {
        date,
        entrepot_id: entrepotId || null,
        notes,
        lignes: validLines
      });
      navigate('/gestionnaire/ajustements');
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de l'enregistrement de l'ajustement";
      alert(msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Nouvel Ajustement de Stock</h1>
          <p className="erp-page-subtitle">Régulez les quantités de stock de vos produits (+ / -).</p>
        </div>
        <div className="erp-page-actions">
          <button onClick={() => navigate('/gestionnaire/ajustements')} className="erp-btn-secondary">
            <X size={16} /> Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading} className="erp-btn-primary">
            <Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Informations Générales */}
        <div className="erp-card p-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Date d'ajustement *
            </label>
            <input 
              type="date" 
              className="glass-input" 
              required 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              style={{ color: '#1e293b', padding: '10px' }}
            />
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Entrepôt concerné
            </label>
            <select 
              className="glass-input" 
              value={entrepotId} 
              onChange={e => setEntrepotId(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            >
              <option value="">Sélectionner un entrepôt (Optionnel)</option>
              {entrepots.map(e => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
          </div>

          <div className="erp-form-group" style={{ gridColumn: 'span 3' }}>
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Notes / Raison de l'ajustement
            </label>
            <textarea 
              rows="2" 
              className="glass-input"
              placeholder="ex: Réinventaire annuel, perte de matériel, casse..." 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            />
          </div>
        </div>

        {/* Lignes de produits */}
        <div className="erp-card p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowRightLeft size={18} className="text-blue-500" /> Produits à Ajuster
            </h3>
            <button 
              type="button" 
              onClick={handleAddLine} 
              className="erp-btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.85rem' }}
            >
              <Plus size={16} /> Ajouter une ligne
            </button>
          </div>

          <table className="erp-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: '50%' }}>Produit</th>
                <th style={{ width: '25%' }} className="text-center">Type d'Ajustement</th>
                <th style={{ width: '15%' }} className="text-right">Quantité</th>
                <th style={{ width: '10%' }} className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((line, idx) => (
                <tr key={idx}>
                  <td>
                    <select 
                      className="glass-input"
                      required
                      value={line.produit_id}
                      onChange={e => handleLineChange(idx, 'produit_id', e.target.value)}
                      style={{ color: '#1e293b', padding: '8px' }}
                    >
                      <option value="">-- Sélectionner un produit --</option>
                      {produits.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nom} (Stock actuel: {p.stock_initial ?? p.quantite_stock ?? 0})
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    <select 
                      className="glass-input"
                      value={line.type}
                      onChange={e => handleLineChange(idx, 'type', e.target.value)}
                      style={{
                        color: line.type === 'add' ? '#166534' : '#991b1b',
                        fontWeight: 700,
                        padding: '8px',
                        background: line.type === 'add' ? '#dcfce7' : '#fee2e2'
                      }}
                    >
                      <option value="add">➕ Addition (Augmenter Stock)</option>
                      <option value="sub">➖ Soustraction (Réduire Stock)</option>
                    </select>
                  </td>
                  <td className="text-right">
                    <input 
                      type="number" 
                      min="1" 
                      className="glass-input"
                      required
                      value={line.quantite}
                      onChange={e => handleLineChange(idx, 'quantite', parseInt(e.target.value) || 1)}
                      style={{ color: '#1e293b', textAlign: 'right', padding: '8px' }}
                    />
                  </td>
                  <td className="text-center">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveLine(idx)}
                      disabled={lignes.length === 1}
                      style={{ background: 'none', border: 'none', color: lignes.length === 1 ? '#cbd5e1' : '#ef4444', cursor: lignes.length === 1 ? 'default' : 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </form>
    </div>
  );
}
