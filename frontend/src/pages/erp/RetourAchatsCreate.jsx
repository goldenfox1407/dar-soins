import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, X, RotateCcw, AlertTriangle, Building, Package, ShoppingCart, Info } from 'lucide-react';
import api from '../../services/api';

export default function RetourAchatsCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAchatId = searchParams.get('achat_id');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [achats, setAchats] = useState([]);
  const [selectedAchatId, setSelectedAchatId] = useState(preselectedAchatId || '');
  const [selectedAchat, setSelectedAchat] = useState(null);

  const [reference, setReference] = useState('');
  const [statut, setStatut] = useState('Termine');
  const [notes, setNotes] = useState('');
  const [lignes, setLignes] = useState([]);

  useEffect(() => {
    fetchAchats();
  }, []);

  const fetchAchats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/achats');
      const fetchedAchats = res.data?.data || res.data || [];
      setAchats(fetchedAchats);

      const targetId = preselectedAchatId || (fetchedAchats.length > 0 ? fetchedAchats[0].id : '');
      if (targetId) {
        setSelectedAchatId(targetId);
        loadAchatDetails(targetId);
      }
    } catch (err) {
      console.error('Erreur chargement des achats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAchatDetails = async (achatId) => {
    try {
      const res = await api.get(`/achats/${achatId}`);
      const a = res.data?.data || res.data;
      setSelectedAchat(a);

      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randNum = Math.floor(1000 + Math.random() * 9000);
      setReference(`RT-ACH-${todayStr}-${randNum}`);

      if (a.lignes && a.lignes.length > 0) {
        setLignes(a.lignes.map(l => ({
          produit_id: l.produit_id,
          nom: l.produit?.nom || `Produit #${l.produit_id}`,
          cout_unitaire: Number(l.cout_unitaire || l.prix_unitaire || 0),
          quantite_achetee: Number(l.quantite || 1),
          quantite_retournee: 0,
        })));
      } else {
        setLignes([]);
      }
    } catch (err) {
      console.error('Erreur chargement détails achat:', err);
    }
  };

  const handleAchatChange = (e) => {
    const id = e.target.value;
    setSelectedAchatId(id);
    if (id) {
      loadAchatDetails(id);
    } else {
      setSelectedAchat(null);
      setLignes([]);
    }
  };

  const handleQtyChange = (produit_id, val) => {
    const qty = parseInt(val, 10) || 0;
    setLignes(lignes.map(l => {
      if (l.produit_id === produit_id) {
        const clamped = Math.max(0, Math.min(l.quantite_achetee, qty));
        return { ...l, quantite_retournee: clamped };
      }
      return l;
    }));
  };

  const calculateSubtotal = (ligne) => {
    return (ligne.cout_unitaire || 0) * (ligne.quantite_retournee || 0);
  };

  const grandTotal = lignes.reduce((sum, l) => sum + calculateSubtotal(l), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedAchatId || !selectedAchat) {
      alert("Veuillez sélectionner un achat d'origine.");
      return;
    }

    const activeLignes = lignes.filter(l => l.quantite_retournee > 0);
    if (activeLignes.length === 0) {
      alert("Veuillez spécifier une quantité à retourner pour au moins un produit.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        reference,
        achat_id: selectedAchat.id,
        fournisseur_id: selectedAchat.fournisseur_id,
        entrepot_id: selectedAchat.entrepot_id,
        statut,
        montant_total: grandTotal,
        notes,
        lignes: activeLignes.map(l => ({
          produit_id: l.produit_id,
          quantite: l.quantite_retournee,
          cout_unitaire: l.cout_unitaire,
          sous_total: calculateSubtotal(l)
        }))
      };

      await api.post('/retour-achats', payload);
      navigate('/gestionnaire/retours/achats');
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur lors de la création du retour d'achat.";
      alert(msg);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Nouveau Retour d'Achat</h1>
          <p className="erp-page-subtitle">Sélectionnez une commande d'achat fournisseur et définissez les quantités retournées avec réajustement des stocks.</p>
        </div>
        <div className="erp-page-actions">
          <button onClick={() => navigate('/gestionnaire/retours/achats')} className="erp-btn-secondary">
            <X size={16} /> Annuler
          </button>
          <button onClick={handleSubmit} disabled={submitting || lignes.length === 0} className="erp-btn-primary">
            <Save size={16} /> {submitting ? 'Enregistrement...' : 'Valider le Retour d\'Achat'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Source Achat Selection */}
        <div className="erp-card p-6" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '20px' }}>
          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Commande d'Achat d'Origine *
            </label>
            <select 
              className="glass-input" 
              required
              value={selectedAchatId} 
              onChange={handleAchatChange}
              style={{ color: '#1e293b', background: '#FFFFFF', padding: '10px', width: '100%', fontSize: '0.9rem' }}
            >
              <option value="">-- Sélectionner un achat fournisseur --</option>
              {achats.map(a => {
                const four = a.fournisseur?.nom ? ` — ${a.fournisseur.nom}` : '';
                const total = a.montant_total ? ` (${Number(a.montant_total).toFixed(2)} MAD)` : '';
                return <option key={a.id} value={a.id}>{a.reference || `Achat #${a.id}`}{four}{total}</option>;
              })}
            </select>
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Référence du Retour
            </label>
            <input 
              type="text" 
              className="glass-input"
              value={reference} 
              onChange={e => setReference(e.target.value)}
              placeholder="Ex: RT-ACH-2026..."
              style={{ color: '#1e293b', background: '#FFFFFF', padding: '10px' }}
            />
          </div>

          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
              Statut du Retour *
            </label>
            <select 
              className="glass-input" 
              value={statut} 
              onChange={e => setStatut(e.target.value)}
              style={{ color: '#1e293b', background: '#FFFFFF', padding: '10px' }}
            >
              <option value="Termine">Terminé (Déduire du stock immédiatement)</option>
              <option value="En attente">En Attente (Validation logistique requise)</option>
            </select>
          </div>
        </div>

        {/* Selected Achat Metadata */}
        {selectedAchat && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Fournisseur Associé :</span>
              <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                {selectedAchat.fournisseur?.nom || 'Fournisseur Inconnu'}
              </p>
              {selectedAchat.fournisseur?.telephone && <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>Tél: {selectedAchat.fournisseur.telephone}</p>}
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Entrepôt Source :</span>
              <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '1rem' }}>
                {selectedAchat.entrepot?.nom || 'Entrepôt Principal'}
              </p>
              {selectedAchat.entrepot?.localisation && <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>Lieu: {selectedAchat.entrepot.localisation}</p>}
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="erp-card p-6">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} className="text-blue-600" /> Articles Achetés & Quantités à Retourner
          </h2>

          {lignes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              <Info size={28} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
              {selectedAchatId ? "Aucun article trouvé dans cette commande d'achat." : "Veuillez d'abord sélectionner une commande d'achat ci-dessus."}
            </div>
          ) : (
            <div className="erp-table-container">
              <table className="erp-table">
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th>Désignation de l'Article</th>
                    <th style={{ textAlign: 'right' }}>Coût Unitaire</th>
                    <th style={{ textAlign: 'center' }}>Quantité Achetée</th>
                    <th style={{ textAlign: 'center', width: '180px' }}>Quantité Retournée</th>
                    <th style={{ textAlign: 'right' }}>Sous-Total Remboursable</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne) => {
                    const subtotal = calculateSubtotal(ligne);
                    return (
                      <tr key={ligne.produit_id}>
                        <td style={{ fontWeight: 600, color: '#1e293b' }}>
                          {ligne.nom}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {ligne.cout_unitaire.toFixed(2)} MAD
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 600 }}>
                          <span style={{ background: '#e2e8f0', padding: '3px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>
                            {ligne.quantite_achetee}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="number" 
                            min="0"
                            max={ligne.quantite_achetee}
                            value={ligne.quantite_retournee}
                            onChange={e => handleQtyChange(ligne.produit_id, e.target.value)}
                            className="glass-input"
                            style={{ width: '100px', textAlign: 'center', fontWeight: 700, padding: '6px', color: ligne.quantite_retournee > 0 ? '#dc2626' : '#1e293b' }}
                          />
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: subtotal > 0 ? '#16a34a' : '#94a3b8' }}>
                          {subtotal.toFixed(2)} MAD
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Motif / Notes */}
        <div className="erp-card p-6">
          <div className="erp-form-group">
            <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px' }}>
              Motif & Justification du Retour
            </label>
            <textarea 
              className="glass-input"
              rows="3"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ex: Marchandises endommagées lors de la livraison, non conformes à la fiche technique, etc."
              style={{ color: '#1e293b', background: '#FFFFFF', padding: '10px' }}
            />
          </div>
        </div>

        {/* Grand Total Footer Card */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', border: '2px solid #86efac', padding: '20px 24px', borderRadius: '14px' }}>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
              VALEUR TOTALE DES PRODUITS RETOURNÉS
            </span>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
              {lignes.filter(l => l.quantite_retournee > 0).length} article(s) sélectionné(s) pour retour
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#15803d' }}>
              {grandTotal.toFixed(2)} MAD
            </span>
          </div>
        </div>

      </form>
    </div>
  );
}
