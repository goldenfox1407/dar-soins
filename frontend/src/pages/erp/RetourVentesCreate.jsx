import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Plus, Trash2, RotateCcw } from 'lucide-react';
import api from '../../services/api';

export default function RetourVentesCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [produits, setProduits] = useState([]);

  const [clientId, setClientId] = useState('');
  const [entrepotId, setEntrepotId] = useState('');
  const [statut, setStatut] = useState('complete');
  const [notes, setNotes] = useState('');

  const [lignes, setLignes] = useState([
    { produit_id: '', quantite: 1, prix_unitaire: 0 }
  ]);

  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      const [cliRes, entRes, prodRes] = await Promise.all([
        api.get('/clients'),
        api.get('/entrepots'),
        api.get('/produits')
      ]);
      setClients(cliRes.data?.data || cliRes.data || []);
      const fetchedEntrepots = entRes.data?.data || entRes.data || [];
      setEntrepots(fetchedEntrepots);
      setProduits(prodRes.data?.data || prodRes.data || []);

      if (fetchedEntrepots.length > 0) {
        setEntrepotId(fetchedEntrepots[0].id);
      }
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const handleAddLine = () => {
    setLignes([...lignes, { produit_id: '', quantite: 1, prix_unitaire: 0 }]);
  };

  const handleRemoveLine = (index) => {
    if (lignes.length > 1) {
      setLignes(lignes.filter((_, i) => i !== index));
    }
  };

  const handleProductSelect = (index, produitId) => {
    const updated = [...lignes];
    updated[index].produit_id = produitId;
    
    const prod = produits.find(p => String(p.id) === String(produitId));
    if (prod) {
      updated[index].prix_unitaire = prod.prix_client || 0;
    }
    setLignes(updated);
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lignes];
    updated[index][field] = value;
    setLignes(updated);
  };

  const calculateTotal = () => {
    return lignes.reduce((sum, line) => sum + ((line.quantite || 0) * (line.prix_unitaire || 0)), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validLines = lignes.filter(l => l.produit_id && l.quantite > 0);
    if (validLines.length === 0) {
      alert("Veuillez ajouter au moins un produit valide.");
      return;
    }

    setLoading(true);
    try {
      await api.post('/retour-ventes', {
        client_id: clientId || null,
        entrepot_id: entrepotId || null,
        statut,
        notes,
        lignes: validLines
      });
      navigate('/gestionnaire/retours/ventes');
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur lors de l'enregistrement du retour de vente";
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
          <h1 className="erp-page-title">Créer un Retour de Vente</h1>
          <p className="erp-page-subtitle">Enregistrez un retour de produits vendus et créditez la fiche client.</p>
        </div>
        <div className="erp-page-actions">
          <button onClick={() => navigate('/gestionnaire/retours/ventes')} className="erp-btn-secondary">
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
              Client
            </label>
            <select 
              className="glass-input" 
              value={clientId} 
              onChange={e => setClientId(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            >
              <option value="">-- Client Général / Passage --</option>
              {clients.map(c => {
                const name = c.user ? `${c.user.prenom || ''} ${c.user.nom || ''}`.trim() : `Client #${c.id}`;
                return <option key={c.id} value={c.id}>{name}</option>;
              })}
            </select>
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Entrepôt de Réintégration
            </label>
            <select 
              className="glass-input" 
              value={entrepotId} 
              onChange={e => setEntrepotId(e.target.value)}
              style={{ color: '#1e293b', padding: '10px' }}
            >
              <option value="">Sélectionner un entrepôt</option>
              {entrepots.map(e => (
                <option key={e.id} value={e.id}>{e.nom}</option>
              ))}
            </select>
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Statut du Retour *
            </label>
            <select 
              className="glass-input" 
              required
              value={statut} 
              onChange={e => setStatut(e.target.value)}
              style={{ color: '#1e293b', padding: '10px', fontWeight: 600 }}
            >
              <option value="complete">Complété / Remboursé (Stock incrémenté)</option>
              <option value="en_attente">En attente de réception</option>
              <option value="annule">Annulé</option>
            </select>
          </div>

          <div className="erp-form-group" style={{ gridColumn: 'span 3' }}>
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Motif du Retour / Remarques
            </label>
            <textarea 
              rows="2" 
              className="glass-input"
              placeholder="ex: Produit non utilisé, erreur de commande client..." 
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
              <RotateCcw size={18} className="text-blue-500" /> Articles à Retourner
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
                <th style={{ width: '45%' }}>Produit</th>
                <th style={{ width: '15%' }} className="text-center">Quantité</th>
                <th style={{ width: '20%' }} className="text-right">Prix Unitaire (MAD)</th>
                <th style={{ width: '15%' }} className="text-right">Sous-total</th>
                <th style={{ width: '5%' }} className="text-center">Action</th>
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
                      onChange={e => handleProductSelect(idx, e.target.value)}
                      style={{ color: '#1e293b', padding: '8px' }}
                    >
                      <option value="">-- Sélectionner un produit --</option>
                      {produits.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.nom} (Prix: {p.prix_client} MAD)
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    <input 
                      type="number" 
                      min="1" 
                      className="glass-input"
                      required
                      value={line.quantite}
                      onChange={e => handleLineChange(idx, 'quantite', parseInt(e.target.value) || 1)}
                      style={{ color: '#1e293b', textAlign: 'center', padding: '8px' }}
                    />
                  </td>
                  <td className="text-right">
                    <input 
                      type="number" 
                      step="0.01"
                      min="0" 
                      className="glass-input"
                      required
                      value={line.prix_unitaire}
                      onChange={e => handleLineChange(idx, 'prix_unitaire', parseFloat(e.target.value) || 0)}
                      style={{ color: '#1e293b', textAlign: 'right', padding: '8px' }}
                    />
                  </td>
                  <td className="text-right font-bold text-emerald-600">
                    {((line.quantite || 0) * (line.prix_unitaire || 0)).toFixed(2)} MAD
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
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right font-bold" style={{ paddingTop: '16px', fontSize: '1rem' }}>
                  Total à Rembourser :
                </td>
                <td className="text-right font-bold text-emerald-600" style={{ paddingTop: '16px', fontSize: '1.2rem' }}>
                  {calculateTotal().toFixed(2)} MAD
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>

      </form>
    </div>
  );
}
