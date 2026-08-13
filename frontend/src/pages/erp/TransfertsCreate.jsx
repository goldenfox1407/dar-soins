import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

export default function TransfertsCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [entrepots, setEntrepots] = useState([]);
  const [produits, setProduits] = useState([]);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [entrepotSourceId, setEntrepotSourceId] = useState('');
  const [entrepotDestinationId, setEntrepotDestinationId] = useState('');
  const [statut, setStatut] = useState('complete');
  const [notes, setNotes] = useState('');

  const [lignes, setLignes] = useState([
    { produit_id: '', quantite: 1 }
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
      const fetchedEntrepots = entRes.data?.data || entRes.data || [];
      setEntrepots(fetchedEntrepots);
      setProduits(prodRes.data?.data || prodRes.data || []);

      if (fetchedEntrepots.length > 0) {
        setEntrepotSourceId(fetchedEntrepots[0].id);
        if (fetchedEntrepots.length > 1) {
          setEntrepotDestinationId(fetchedEntrepots[1].id);
        }
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const handleAddLine = () => {
    setLignes([...lignes, { produit_id: '', quantite: 1 }]);
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

    if (entrepotSourceId && entrepotDestinationId && entrepotSourceId === entrepotDestinationId) {
      alert("L'entrepôt de destination doit être différent de l'entrepôt source.");
      return;
    }

    const validLines = lignes.filter(l => l.produit_id && l.quantite > 0);
    if (validLines.length === 0) {
      alert("Veuillez ajouter au moins un produit valide.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/transferts', {
        date,
        entrepot_source_id: entrepotSourceId || null,
        entrepot_destination_id: entrepotDestinationId || null,
        statut,
        notes,
        lignes: validLines
      });
      navigate('/gestionnaire/transferts');
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de l'enregistrement du transfert";
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
          <h1 className="erp-page-title">Nouveau Transfert de Stock</h1>
          <p className="erp-page-subtitle">Transférez des produits d'un entrepôt source vers un entrepôt destination.</p>
        </div>
        <div className="erp-page-actions">
          <button onClick={() => navigate('/gestionnaire/transferts')} className="erp-btn-secondary">
            <X size={16} /> Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading} className="erp-btn-primary">
            <Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Informations Générales */}
        <div className="erp-card p-6" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Date du transfert *
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
              Entrepôt Source *
            </label>
            <select 
              className="glass-input" 
              required
              value={entrepotSourceId} 
              onChange={e => setEntrepotSourceId(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            >
              <option value="">Sélectionner source</option>
              {entrepots.map(e => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Entrepôt Destination *
            </label>
            <select 
              className="glass-input" 
              required
              value={entrepotDestinationId} 
              onChange={e => setEntrepotDestinationId(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            >
              <option value="">Sélectionner destination</option>
              {entrepots.map(e => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Statut du Transfert *
            </label>
            <select 
              className="glass-input" 
              required
              value={statut} 
              onChange={e => setStatut(e.target.value)}
              style={{ color: '#1e293b', padding: '10px', fontWeight: 600 }}
            >
              <option value="complete">Complété (Effectué)</option>
              <option value="en_attente">En attente (Expédié)</option>
              <option value="annule">Annulé</option>
            </select>
          </div>

          <div className="erp-form-group" style={{ gridColumn: 'span 4' }}>
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Notes / Remarques du transfert
            </label>
            <textarea 
              rows="2" 
              className="glass-input"
              placeholder="ex: Réapprovisionnement d'urgence pour la garde de nuit..." 
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
              <ArrowRight size={18} className="text-blue-500" /> Produits à Transférer
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
                <th style={{ width: '70%' }}>Produit</th>
                <th style={{ width: '20%' }} className="text-right">Quantité Transférée</th>
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
                          {p.nom} (Stock global: {p.stock_initial ?? p.quantite_stock ?? 0})
                        </option>
                      ))}
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
